import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratedQuestion {
  question_id: string;
  module: string;
  topic: string;
  subtopic: string;
  category: 'arithmetic' | 'reasoning' | 'mixed';
  cognitive_level: 'recall' | 'application' | 'analysis' | 'synthesis';
  difficulty: 'foundation' | 'intermediate' | 'advanced';
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  a_misconception: string;
  b_misconception: string;
  c_misconception: string;
  d_misconception: string;
  a_feedback: string;
  b_feedback: string;
  c_feedback: string;
  d_feedback: string;
  skills_tested: string;
  marks: number;
  time_seconds: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { topic, difficulty, count = 5 } = await req.json();

    // Generate questions using DeepSeek API
    const prompt = `Generate ${count} mathematics questions for ${topic} at ${difficulty} level. 

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question_id": "unique_id_here",
    "module": "NUMBER",
    "topic": "${topic}",
    "subtopic": "relevant_subtopic",
    "category": "arithmetic",
    "cognitive_level": "application",
    "difficulty": "${difficulty}",
    "question_text": "Question text here",
    "option_a": "Option A text",
    "option_b": "Option B text", 
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_answer": "A",
    "a_misconception": "PV1",
    "b_misconception": "correct",
    "c_misconception": "CE1", 
    "d_misconception": "FR3",
    "a_feedback": "Feedback for option A",
    "b_feedback": "Correct! Well done.",
    "c_feedback": "Feedback for option C",
    "d_feedback": "Feedback for option D",
    "skills_tested": "Place Value, Addition",
    "marks": 1,
    "time_seconds": 60
  }
]

Requirements:
- Use realistic misconception codes like PV1, FR3, CE1, OP1, CN1, ME3, PA1, RE2, PE5
- Make questions age-appropriate and curriculum-aligned
- Include detailed feedback for each option
- Generate unique question_ids
- Only the correct answer should have "correct" as misconception
- Ensure all fields are filled appropriately`;

    console.log('Calling DeepSeek API to generate questions...');

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert mathematics education specialist. Generate high-quality, curriculum-aligned questions with proper misconception analysis. Return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API response received');

    let generatedQuestions: GeneratedQuestion[];
    try {
      const content = data.choices[0].message.content;
      console.log('Parsing generated content:', content.substring(0, 200));
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      
      generatedQuestions = JSON.parse(jsonMatch[0]);
      console.log(`Successfully parsed ${generatedQuestions.length} questions`);
    } catch (parseError) {
      console.error('Error parsing generated questions:', parseError);
      throw new Error(`Failed to parse generated questions: ${parseError.message}`);
    }

    // Import questions into database
    console.log('Importing questions into database...');
    
    for (const q of generatedQuestions) {
      try {
        // Insert or update question
        const { error: questionError } = await supabaseClient
          .from('bootcamp_enhanced_questions')
          .upsert({
            question_id: q.question_id,
            module_id: q.module.toUpperCase(),
            topic_id: q.topic,
            subtopic_id: q.subtopic,
            question_category: q.category,
            cognitive_level: q.cognitive_level,
            difficulty: q.difficulty,
            question_type: 'multiple_choice',
            question_text: q.question_text,
            marks: q.marks,
            time_seconds: q.time_seconds,
            prerequisite_skills: q.skills_tested.split(',').map(s => s.trim()),
            exam_boards: ['general'],
            usage_count: 0,
            success_rate: null
          });

        if (questionError) {
          console.error('Question insert error for', q.question_id, ':', questionError);
          continue;
        }

        // Insert answer options
        const options = [
          { letter: 'A', value: q.option_a, misconception: q.a_misconception, feedback: q.a_feedback },
          { letter: 'B', value: q.option_b, misconception: q.b_misconception, feedback: q.b_feedback },
          { letter: 'C', value: q.option_c, misconception: q.c_misconception, feedback: q.c_feedback },
          { letter: 'D', value: q.option_d, misconception: q.d_misconception, feedback: q.d_feedback }
        ];

        for (const option of options) {
          const { error: optionError } = await supabaseClient
            .from('bootcamp_enhanced_answer_options')
            .upsert({
              question_id: q.question_id,
              option_letter: option.letter,
              answer_value: option.value,
              is_correct: option.letter === q.correct_answer,
              misconception_code: option.misconception === 'correct' ? null : option.misconception,
              diagnostic_feedback: option.feedback,
              selection_count: 0
            });

          if (optionError) {
            console.error('Option insert error for', q.question_id, option.letter, ':', optionError);
          }
        }

        // Insert misconceptions if they don't exist
        const misconceptions = [q.a_misconception, q.b_misconception, q.c_misconception, q.d_misconception]
          .filter(m => m && m !== 'correct')
          .map(m => m.split('-')[0]); // Extract misconception code before dash

        for (const miscCode of [...new Set(misconceptions)]) {
          await supabaseClient
            .from('bootcamp_enhanced_misconceptions')
            .upsert({
              misconception_code: miscCode,
              misconception_type: getMisconceptionType(miscCode),
              description: getMisconceptionDescription(miscCode),
              diagnostic_indicators: [],
              remediation_pathway_id: null
            });
        }

        console.log(`Successfully imported question: ${q.question_id}`);
      } catch (importError) {
        console.error(`Failed to import question ${q.question_id}:`, importError);
      }
    }

    console.log(`Import completed. Generated and imported ${generatedQuestions.length} questions.`);

    return new Response(
      JSON.stringify({ 
        success: true,
        generated: generatedQuestions.length,
        questions: generatedQuestions,
        message: `Successfully generated and imported ${generatedQuestions.length} questions for ${topic} at ${difficulty} level`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-bootcamp-questions function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function getMisconceptionType(code: string): string {
  const types: { [key: string]: string } = {
    'PV': 'Place Value',
    'FR': 'Fractions',
    'CE': 'Calculation Error',
    'OP': 'Operations',
    'CN': 'Conceptual',
    'ME': 'Measurement',
    'PA': 'Pattern & Algebra',
    'RE': 'Reasoning',
    'PE': 'Problem Solving'
  };
  return types[code.substring(0, 2)] || 'General';
}

function getMisconceptionDescription(code: string): string {
  const descriptions: { [key: string]: string } = {
    'PV1': 'Place value position confusion',
    'PV3': 'Decimal place value errors',
    'PV4': 'Powers of 10 confusion',
    'FR1': 'Adding denominators when adding fractions',
    'FR3': 'Fraction size comparison errors',
    'CE1': 'Basic calculation errors',
    'CE2': 'Carrying/borrowing errors',
    'CE6': 'Rounding errors',
    'OP1': 'Operation selection or order confusion',
    'CN1': 'Conceptual misunderstanding',
    'CN2': 'Method application errors',
    'CN4': 'Unit confusion',
    'CN5': 'Procedural confusion',
    'ME3': 'Perimeter/area confusion',
    'ME4': 'Unit measurement errors',
    'PA1': 'Pattern recognition errors',
    'PA2': 'Local vs global pattern confusion',
    'RE2': 'Incomplete problem solving',
    'RE4': 'Insufficient information assumption',
    'RE5': 'Sequential operation errors',
    'PE5': 'Estimation errors'
  };
  return descriptions[code] || `Misconception type: ${code}`;
}