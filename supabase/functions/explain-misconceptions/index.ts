import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!DEEPSEEK_API_KEY) {
      throw new Error('Deepseek API key is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { student_id } = await req.json();

    if (!student_id) {
      throw new Error('Student ID is required');
    }

    console.log('Fetching misconceptions for student:', student_id);

    // Create a unique reference key for this student's misconceptions
    const referenceKey = `student_${student_id}`;
    
    // First, check if we already have an explanation for this student's misconceptions
    console.log('Checking for existing misconceptions explanation...');
    const { data: existingExplanation, error: fetchError } = await supabase
      .from('ai_explanations')
      .select('explanation')
      .eq('explanation_type', 'misconception')
      .eq('reference_key', referenceKey)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing explanation:', fetchError);
    }

    // Get student misconceptions
    const { data: misconceptions, error: misconceptionsError } = await supabase
      .rpc('get_student_misconceptions', { p_student_id: student_id });

    if (misconceptionsError) {
      console.error('Error fetching misconceptions:', misconceptionsError);
      throw misconceptionsError;
    }

    console.log('Found misconceptions:', misconceptions);

    if (!misconceptions || misconceptions.length === 0) {
      return new Response(JSON.stringify({ 
        explanation: "Great job! You haven't triggered any misconceptions yet. Keep up the excellent work!" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If we have existing explanation and the misconceptions haven't changed significantly, return cached version
    if (existingExplanation) {
      console.log('Found existing misconceptions explanation, returning cached version');
      return new Response(JSON.stringify({ 
        explanation: existingExplanation.explanation,
        misconceptions: misconceptions,
        apiUsed: 'cached'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('No existing explanation found, generating new one...');

    // Get curriculum data for additional context
    const { data: curriculumData, error: curriculumError } = await supabase
      .from('curriculum')
      .select('red_herring_tag, red_herring_explanation, topic, subtopic')
      .not('red_herring_tag', 'is', null);

    if (curriculumError) {
      console.error('Error fetching curriculum:', curriculumError);
      throw curriculumError;
    }

    // Create context for OpenAI
    const misconceptionContext = misconceptions.map(m => {
      const relatedCurriculum = curriculumData?.filter(c => 
        c.red_herring_tag?.includes(m.red_herring)
      ) || [];

      return {
        misconception: m.red_herring,
        frequency: m.frequency,
        topics: m.topics,
        explanations: relatedCurriculum.map(c => c.red_herring_explanation).filter(Boolean)
      };
    });

    const prompt = `Help a student understand their math misconceptions. Be encouraging and respectful - explain clearly without talking down to them.

Here are the mistake patterns they've made:

${JSON.stringify(misconceptionContext, null, 2)}

For EACH misconception, create an engaging explanation using this format:

**[Clear name for this mistake pattern] 🎯**
🤔 **What usually happens:** [Explain what students typically think when making this mistake]
💡 **Why this is tricky:** [Brief reason why this concept trips people up - show it's normal]
🛠️ **How to tackle it:** [Clear, practical strategy to avoid this mistake]
📚 **Shows up in:** [List the topics in clear terms]

Rules:
- Be encouraging but not condescending
- Use clear, accessible language
- Make each section engaging and helpful
- Show that mistakes are normal and part of learning
- Give practical, actionable advice
- Keep it concise but thorough enough to be useful

Make this helpful and engaging!`;

    // Use Deepseek API
    let explanation = '';
    let apiUsed = '';
    
    console.log('Using Deepseek API...');
    
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a knowledgeable math tutor who explains concepts clearly and encouragingly. You help students understand their mistakes with respect and practical guidance. Be engaging and supportive without being condescending.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.8,
        top_p: 0.9
      }),
    });

    if (deepseekResponse.ok) {
      const deepseekData = await deepseekResponse.json();
      explanation = deepseekData.choices[0].message.content;
      apiUsed = 'deepseek';
      console.log('Successfully used Deepseek API');
    } else {
      const errorText = await deepseekResponse.text();
      console.error(`Deepseek API error ${deepseekResponse.status}:`, errorText);
      throw new Error(`Deepseek API error: ${deepseekResponse.status} - ${errorText}`);
    }

    // Fallback to OpenAI if Perplexity failed or no key
    if (!explanation && OPENAI_API_KEY) {
      try {
        console.log('Using OpenAI API as fallback...');
        
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              {
                role: 'system',
                content: 'You are a knowledgeable math tutor who explains concepts clearly and encouragingly. You help students understand their mistakes with respect and practical guidance. Be engaging and supportive without being condescending.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.7
          }),
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          explanation = openaiData.choices[0].message.content;
          apiUsed = 'openai';
          console.log('Successfully used OpenAI API as fallback');
        } else {
          const errorText = await openaiResponse.text();
          console.error('OpenAI API error:', errorText);
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }
      } catch (openaiError) {
        console.error('Both APIs failed:', openaiError.message);
        throw new Error('Both Perplexity and OpenAI APIs failed');
      }
    }

    if (!explanation) {
      throw new Error('No explanation generated from either API');
    }

    // Clean up source citations, references, and unwanted AI prefixes
    const cleanedExplanation = explanation
      .replace(/^Certainly[.,]?\s*/i, '') // Remove "Certainly" at start
      .replace(/^Here's an encouraging and clear explanation.*?--\s*/i, '') // Remove the specific prefix you mentioned
      .replace(/^Here's.*?explanation.*?:\s*/i, '') // Remove other similar prefixes
      .replace(/\[\d+\]/g, '') // Remove [1], [2], etc.
      .replace(/\[.*?\]/g, '') // Remove any other bracketed references
      .replace(/Source:.*$/gm, '') // Remove source lines
      .replace(/References?:.*$/gm, '') // Remove reference lines
      .trim();

    console.log(`Generated explanation successfully using ${apiUsed}`);

    // Store the explanation in the database for future use
    const { error: insertError } = await supabase
      .from('ai_explanations')
      .insert({
        explanation_type: 'misconception',
        reference_key: referenceKey,
        explanation: cleanedExplanation
      });

    if (insertError) {
      console.error('Error storing explanation:', insertError);
      // Don't fail the request if storing fails, just log it
    } else {
      console.log('Successfully stored misconceptions explanation in database');
    }

    return new Response(JSON.stringify({ 
      explanation: cleanedExplanation,
      misconceptions: misconceptionContext,
      apiUsed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in explain-misconceptions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      explanation: "I'm having trouble generating an explanation right now. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});