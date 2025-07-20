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

    const { question, student_answer, correct_answer, misconception, topic } = await req.json();

    if (!question || !student_answer || !correct_answer) {
      throw new Error('Missing required fields');
    }

    // Create a unique reference key for this explanation
    const referenceKey = `${question}_${student_answer}_${correct_answer}`;
    
    // First, check if we already have an explanation for this specific mistake
    console.log('Checking for existing explanation...');
    const { data: existingExplanation, error: fetchError } = await supabase
      .from('ai_explanations')
      .select('explanation')
      .eq('explanation_type', 'question_mistake')
      .eq('reference_key', referenceKey)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing explanation:', fetchError);
    }

    if (existingExplanation) {
      console.log('Found existing explanation, returning cached version');
      return new Response(JSON.stringify({ 
        explanation: existingExplanation.explanation,
        apiUsed: 'cached'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('No existing explanation found, generating new one...');

    const prompt = `Help explain a math mistake to a student. Be encouraging but respectful - don't talk down to them.

🧮 Question: ${question}
❌ Their answer: ${student_answer}
✅ Correct answer: ${correct_answer}
🤯 Mistake type: ${misconception}

Create a SHORT, engaging explanation with exactly these 3 parts:

🤔 What happened: [1 sentence - what they likely did or thought]

💡 Why this mistake is common: [1 sentence - why this happens to many students]

🎯 How to get it right: [1 sentence - clear, practical tip]

Rules:
- Use "you" naturally, not like talking to a little kid
- Be encouraging but not condescending
- Use clear, simple language without being babyish
- Keep each part to 1 sentence
- Make it engaging and helpful
- Add a blank line between each section for better readability
- Total: 3-4 sentences max`;

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
            content: 'You are a helpful math tutor who explains concepts clearly and encouragingly. You respect students\' intelligence while keeping explanations accessible. Be engaging and supportive without being condescending.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
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
                content: 'You are a helpful math tutor who explains concepts clearly and encouragingly. You respect students\' intelligence while keeping explanations accessible. Be engaging and supportive without being condescending.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 500,
            temperature: 0.8
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

    // Clean up source citations and references
    const cleanedExplanation = explanation
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
        explanation_type: 'question_mistake',
        reference_key: referenceKey,
        explanation: cleanedExplanation
      });

    if (insertError) {
      console.error('Error storing explanation:', insertError);
      // Don't fail the request if storing fails, just log it
    } else {
      console.log('Successfully stored explanation in database');
    }

    return new Response(JSON.stringify({ 
      explanation: cleanedExplanation,
      apiUsed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in explain-question-mistake function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      explanation: "I'm having trouble creating a fun explanation right now. The basic idea is to learn from this mistake and try a different approach next time!"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});