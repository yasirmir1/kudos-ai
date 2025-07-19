import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openAIApiKey = Deno.env.get('kudos');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { topic, difficulty, count = 5 } = await req.json();

    console.log('Generating questions for:', { topic, difficulty, count });

    const prompt = `Generate ${count} multiple choice questions for 11+ exam preparation on the topic "${topic}" with difficulty level "${difficulty}".

Each question should:
- Be appropriate for 11+ exam level (ages 10-11)
- Have exactly 4 options (A, B, C, D)
- Include red herring explanations for common misconceptions
- Include pedagogical notes for learning reinforcement

Return a JSON array with this exact structure:
[
  {
    "question_id": "unique_id",
    "topic": "${topic}",
    "subtopic": "specific subtopic",
    "example_question": "the actual question text",
    "question_type": "multiple_choice",
    "options": {
      "A": "option text",
      "B": "option text", 
      "C": "option text",
      "D": "option text"
    },
    "correct_answer": "A",
    "difficulty": "${difficulty}",
    "red_herring_tag": ["misconception1", "misconception2"],
    "red_herring_explanation": "Explanation of why wrong answers are commonly chosen",
    "pedagogical_notes": "Teaching tips and learning reinforcement notes"
  }
]

Make sure the JSON is valid and properly formatted.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in creating 11+ exam questions. Always return valid JSON arrays only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    let questions;
    try {
      const content = data.choices[0].message.content.trim();
      // Remove any markdown code blocks if present
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      questions = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Import questions into curriculum table
    const { error: importError } = await supabase.rpc('import_curriculum_json_skip_duplicates', {
      json_data: questions
    });

    if (importError) {
      console.error('Failed to import questions:', importError);
      throw new Error('Failed to import questions to database');
    }

    console.log(`Successfully generated and imported ${questions.length} questions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        questions,
        message: `Generated ${questions.length} questions for ${topic} (${difficulty})`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});