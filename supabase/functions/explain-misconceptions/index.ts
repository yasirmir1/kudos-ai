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
    const OPENAI_API_KEY = Deno.env.get('kudos');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found in kudos secret');
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

    const prompt = `You are an expert tutor analyzing student learning patterns. 

Based on the following misconception data, provide a structured response that:
1. First, translate each raw misconception variable into a clear, human-readable label
2. Explain what each misconception means in educational terms
3. Provide specific strategies to overcome each pattern
4. Offer encouraging, growth-focused advice

Format your response as follows:
**Misconception Analysis:**

For each misconception, use this format:
**[Human-readable label for the misconception]**
- **What this means:** [Simple explanation]
- **Why it happens:** [Common reason]
- **How to improve:** [Specific strategy]
- **Topics affected:** [List the topics]

Misconception Data:
${JSON.stringify(misconceptionContext, null, 2)}

Remember to be supportive and focus on learning growth, not mistakes.`;

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are a supportive, expert tutor who specializes in helping students understand and overcome learning misconceptions. Always be encouraging and focus on growth.'
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices[0].message.content;

    console.log('Generated explanation successfully');

    return new Response(JSON.stringify({ 
      explanation,
      misconceptions: misconceptionContext
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