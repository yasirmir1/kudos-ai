import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key is required. Please set up your Perplexity API key.');
    }

    const { question, student_answer, correct_answer, misconception, topic } = await req.json();

    if (!question || !student_answer || !correct_answer) {
      throw new Error('Missing required fields');
    }

    console.log('Generating kid-friendly explanation for question mistake');

    const prompt = `You're a super friendly teacher talking to an 8-year-old who made a mistake in math. Be encouraging and help them understand what went wrong!

🧮 **Question:** ${question}
❌ **Their answer:** ${student_answer}
✅ **Correct answer:** ${correct_answer}
🤯 **Mistake pattern:** ${misconception}
📚 **Topic:** ${topic}

Help them understand their mistake using this format:

🤔 **What you might have been thinking:** [Guess gently what they tried to do - use "you might have thought" or "you may have tried"]

💡 **Why this happens:** [Simple reason - "lots of kids think this way when they're learning!"]

🎯 **Here's the trick for next time:** [Fun, easy way to get it right with a simple example they can remember]

Rules:
- Talk directly to them using "you" 
- Use words a 2nd grader knows
- Be super encouraging and fun
- Use emojis to make it friendly
- Keep each section short (2-3 sentences max)
- Make them feel smart, not bad about the mistake
- Give them a simple trick or tip they can use next time
- Use comparisons to toys, games, or things kids love when helpful`;

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
            model: 'sonar',
            messages: [
              {
                role: 'system',
                content: 'You are a super friendly, patient teacher who loves helping kids learn math. You explain things like you\'re talking to your little brother or sister. You make kids feel smart and excited about learning! You always use simple words and fun examples.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 500,
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
                content: 'You are a super friendly, patient teacher who loves helping kids learn math. You explain things like you\'re talking to your little brother or sister. You make kids feel smart and excited about learning! You always use simple words and fun examples.'
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

    console.log(`Generated explanation successfully using ${apiUsed}`);

    return new Response(JSON.stringify({ 
      explanation,
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