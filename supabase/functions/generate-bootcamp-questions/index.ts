import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topicId, difficulty, questionCount = 20, batchId } = await req.json();
    
    console.log(`Generating ${questionCount} questions for topic: ${topicId}, difficulty: ${difficulty}`);

    // Get comprehensive context for question generation
    const [topicResult, existingQuestions, misconceptions, curriculumContext] = await Promise.all([
      supabase.from('bootcamp_topics').select('*').eq('id', topicId).single(),
      supabase.from('bootcamp_questions').select('question_text, topic_id').eq('topic_id', topicId).limit(10),
      supabase.from('bootcamp_misconceptions_catalog').select('*'),
      supabase.from('curriculum').select('*').contains('topic', topicId).limit(5)
    ]);

    const topicData = topicResult.data;
    const { data: existingQs } = existingQuestions;
    const { data: miscCatalog } = misconceptions;
    const { data: curriculumSamples } = curriculumContext;

    // Build comprehensive system prompt with database schemas and context
    const systemPrompt = `You are an expert 11+ assessment question generator specializing in UK mathematics curriculum for GL Assessments and CEM exams.

COMPREHENSIVE CONTEXT:
Topic: ${topicData?.name || topicId}
Difficulty: ${difficulty}
Learning Objectives: ${topicData?.skills?.join(', ') || 'Standard curriculum objectives'}
Prerequisites: Basic arithmetic

EXISTING CURRICULUM SAMPLES:
${curriculumSamples?.map(c => `- ${c.subtopic}: ${c.example_question.substring(0, 100)}...`).join('\n') || 'No samples available'}

MISCONCEPTION CATALOG TO INCLUDE:
${miscCatalog?.map(m => `- ${m.misconception_id}: ${m.description} (Category: ${m.category})`).join('\n') || 'Standard misconceptions'}

DATABASE SCHEMA REQUIREMENTS:
Return questions that match this EXACT schema:
{
  "question_id": "string (format: ${topicId.substring(0, 3).toUpperCase()}001-999)",
  "question_text": "string (age-appropriate for 8-11 year olds)",
  "option_a": "string",
  "option_b": "string", 
  "option_c": "string",
  "option_d": "string",
  "correct_answer": "string (A, B, C, or D)",
  "explanation": "string (detailed pedagogical explanation)",
  "prerequisite_skills": ["array of required skills"],
  "time_seconds": "number (30-180 based on difficulty)",
  "misconception_a": "string or null (misconception code if applicable)",
  "misconception_b": "string or null",
  "misconception_c": "string or null", 
  "misconception_d": "string or null"
}

QUALITY STANDARDS FOR 11+ EXAMS:
1. Simulate real GL Assessment and CEM exam styles
2. Include 2-3 red herring options based on common student errors
3. Ensure one obviously incorrect option and one challenging distractor
4. Use age-appropriate language and real-world contexts
5. Include varied question formats (calculations, word problems, visual reasoning)
6. Link misconceptions to specific wrong answers for performance analysis

MISCONCEPTION INTEGRATION:
- Use misconception codes from catalog: ${miscCatalog?.map(m => m.misconception_id).join(', ') || 'Common codes'}
- Only incorrect answers should have misconception codes
- Correct answer should have misconception: null
- Each misconception should represent a specific error type for analysis

AVOID DUPLICATION:
Do not replicate these existing questions:
${existingQs?.map(q => `- ${q.question_text.substring(0, 50)}...`).join('\n') || 'No existing questions'}

Generate exactly ${questionCount} unique, high-quality questions. Return ONLY a valid JSON array.`;

    // Use OpenAI for comprehensive question generation
    console.log('Generating questions with OpenAI using comprehensive context...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Generate ${questionCount} mathematics questions for "${topicData?.name || topicId}" at ${difficulty} level. Focus on:
            1. 11+ exam authenticity 
            2. Robust misconception tracking for performance analysis
            3. Age-appropriate contexts and language
            4. Comprehensive coverage of the topic area
            5. Linking questions to database schema for seamless integration`
          }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    const aiResult = await openAIResponse.json();
    let generatedQuestions;

    try {
      const content = aiResult.choices[0].message.content;
      console.log('Parsing AI-generated content...');
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in AI response');
      }
      
      generatedQuestions = JSON.parse(jsonMatch[0]);
      console.log(`Successfully parsed ${generatedQuestions.length} questions from AI`);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI Response content:', aiResult.choices[0].message.content);
      throw new Error(`Invalid JSON response from AI: ${parseError.message}`);
    }

    // Transform and insert questions into database
    console.log(`Transforming and inserting ${generatedQuestions.length} questions into database...`);
    
    const questionsToInsert = generatedQuestions.map((q: any, index: number) => ({
      question_id: q.question_id || `${topicId.substring(0, 3).toUpperCase()}${String(Date.now()).slice(-3)}${String(index).padStart(2, '0')}`,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      difficulty: difficulty,
      topic_id: topicId,
      explanation: q.explanation,
      time_seconds: q.time_seconds || (difficulty === 'foundation' ? 60 : difficulty === 'intermediate' ? 90 : 120),
      prerequisite_skills: q.prerequisite_skills || [],
      exam_boards: ['GL_Assessment', 'CEM'],
      question_type: 'multiple_choice',
      cognitive_level: difficulty === 'foundation' ? 'understand' : difficulty === 'intermediate' ? 'apply' : 'analyze',
      question_category: 'standard',
      marks: 1
    }));

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('bootcamp_questions')
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error('Database insertion error:', insertError);
      throw new Error(`Failed to insert questions: ${insertError.message}`);
    }

    // Generate answer options with misconception tracking
    const answerOptions = [];
    for (let i = 0; i < generatedQuestions.length; i++) {
      const question = generatedQuestions[i];
      const insertedQuestion = insertedQuestions[i];
      
      const options = [
        { letter: 'A', value: question.option_a, misconception: question.misconception_a },
        { letter: 'B', value: question.option_b, misconception: question.misconception_b },
        { letter: 'C', value: question.option_c, misconception: question.misconception_c },
        { letter: 'D', value: question.option_d, misconception: question.misconception_d }
      ];

      for (const option of options) {
        answerOptions.push({
          question_id: insertedQuestion.question_id,
          option_letter: option.letter,
          answer_value: option.value,
          is_correct: option.letter === question.correct_answer,
          misconception_code: option.letter === question.correct_answer ? null : option.misconception,
          error_category: option.letter === question.correct_answer ? null : 'conceptual_error',
          diagnostic_feedback: option.letter === question.correct_answer 
            ? `Correct! ${question.explanation}`
            : `This represents a common misconception. ${question.explanation}`
        });
      }
    }

    // Insert answer options
    const { error: answerError } = await supabase
      .from('bootcamp_answer_options')
      .insert(answerOptions);

    if (answerError) {
      console.error('Answer options insertion error:', answerError);
      // Continue anyway - questions are more important than options
    }

    console.log(`Successfully generated and stored ${insertedQuestions.length} questions with answer analysis`);

    // Store generation metadata for tracking
    if (batchId) {
      await supabase
        .from('bootcamp_question_batches')
        .insert({
          batch_id: batchId,
          topic_id: topicId,
          difficulty: difficulty,
          question_count: insertedQuestions.length,
          generated_at: new Date().toISOString(),
          generation_method: 'ai_enhanced'
        })
        .single();
    }

    console.log(`Import completed. Generated and imported ${generatedQuestions.length} questions.`);

    return new Response(
      JSON.stringify({ 
        success: true,
        generated: generatedQuestions.length,
        questions: generatedQuestions,
        message: `Successfully generated and imported ${generatedQuestions.length} questions for ${topicId} at ${difficulty} level`
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