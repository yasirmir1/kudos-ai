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
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('kudos');
    
    if (!PERPLEXITY_API_KEY && !OPENAI_API_KEY) {
      throw new Error('No API keys found for explanations');
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

    const prompt = `You are a fun, friendly teacher talking to an 8-year-old who loves video games, toys, and ice cream! They made some mistakes in their math and need gentle help.

Use "you" to talk directly to them and be gentle with language like "you might have thought" or "you may have tried".

Based on their math mistakes, help them understand what might have gone wrong using simple words:

Use this format for EACH mistake pattern:

**[Simple, kid-friendly name for the mistake] 🤯**
🤔 **What might have happened:** [Use "you might have thought" or "you may have tried" - explain gently what they possibly did wrong]
💡 **Why this happens:** [Simple reason - "lots of kids think this way at first!"]
🎯 **Here's what to try instead:** [Easy, fun way to do it correctly with examples]
📚 **Where this shows up:** [List the topics in simple terms]

Rules:
- Talk directly to them using "you"
- Use gentle words like "might have" and "may have"
- Use words a 2nd grader knows
- Make it encouraging and fun
- Use emojis to make it friendly
- Compare to things kids love (toys, games, food)
- Keep explanations short and simple

Mistake Data:
${JSON.stringify(misconceptionContext, null, 2)}

Make this gentle, fun and helpful!`;

    // Try Perplexity first, then fallback to OpenAI
    let explanation = '';
    let apiUsed = '';

    if (PERPLEXITY_API_KEY) {
      try {
        console.log('Trying Perplexity API first...');
        
        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
              {
                role: 'system',
                content: 'You are a fun, patient teacher who loves helping kids learn math. You explain things in simple words that 8-year-olds can understand. You always encourage kids and make learning feel like a fun adventure!'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.8,
            top_p: 0.9,
            return_images: false,
            return_related_questions: false
          }),
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          explanation = perplexityData.choices[0].message.content;
          apiUsed = 'perplexity';
          console.log('Successfully used Perplexity API');
        } else {
          throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
        }
      } catch (perplexityError) {
        console.log('Perplexity failed, trying OpenAI fallback:', perplexityError.message);
      }
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
                content: 'You are a fun, patient teacher who loves helping kids learn math. You explain things in simple words that 8-year-olds can understand. You always encourage kids and make learning feel like a fun adventure!'
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

    console.log(`Generated explanation successfully using ${apiUsed}`);

    return new Response(JSON.stringify({ 
      explanation,
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