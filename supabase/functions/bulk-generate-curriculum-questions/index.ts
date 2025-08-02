import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get API keys
const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting bulk curriculum question generation...');
    
    if (!deepseekApiKey) {
      console.error('DEEPSEEK_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ 
          error: 'DEEPSEEK_API_KEY not configured. Please add it to your Supabase Edge Function secrets.' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const requestBody = await req.json();
    const { topicIds, questionsPerSubtopic = 1, examBoards = ['GL', 'CEM'] } = requestBody;

    console.log('Request parameters:', { topicIds, questionsPerSubtopic, examBoards });

    if (!topicIds || topicIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No topics selected. Please select at least one topic to generate questions for.' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch topics and subtopics using the unified view
    const { data: topics, error: topicsError } = await supabase
      .from('bootcamp_topics_with_subtopics')
      .select('*')
      .in('topic_id', topicIds || [])
      .order('topic_order');

    if (topicsError) throw topicsError;

    // Fetch misconceptions catalog
    const { data: misconceptions, error: miscError } = await supabase
      .from('bootcamp_misconceptions_catalog')
      .select('*');

    if (miscError) throw miscError;

    // Fetch existing questions for context
    const { data: existingQuestions, error: questionsError } = await supabase
      .from('bootcamp_questions')
      .select('question_text, topic_id, difficulty, bootcamp_answer_options(*)')
      .limit(20);

    if (questionsError) throw questionsError;

    console.log(`Generating questions for ${topics.length} topics`);

    const results = [];

    for (const topic of topics) {
      console.log(`Processing topic: ${topic.topic_name} with ${topic.subtopics?.length || 0} subtopics`);

      for (const examBoard of examBoards) {
        // Generate questions to cover ALL subtopics in this topic
        const subtopicsInTopic = topic.subtopics || [];
        const totalQuestionsForTopic = subtopicsInTopic.length * questionsPerSubtopic;

        console.log(`Generating ${totalQuestionsForTopic} questions for ${subtopicsInTopic.length} subtopics (${questionsPerSubtopic} per subtopic)`);

        const prompt = createQuestionGenerationPrompt(
          topic, 
          misconceptions, 
          existingQuestions,
          totalQuestionsForTopic,
          examBoard,
          subtopicsInTopic,
          questionsPerSubtopic
        );

        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'You are an expert 11+ mathematics question writer specializing in diagnostic assessment. You create comprehensive question banks that cover ALL subtopics systematically.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 6000,
          }),
        });

        if (!response.ok) {
          throw new Error(`Deepseek API error: ${response.statusText}`);
        }

        const data = await response.json();
        const generatedContent = data.choices[0].message.content;

        // Parse the generated questions
        const questions = parseGeneratedQuestions(generatedContent, topic.topic_id, examBoard);

        // Insert questions into database
        for (const question of questions) {
          const insertedQuestions = await insertQuestionWithOptions(question);
          results.push({
            topic: topic.topic_name,
            examBoard,
            questionId: insertedQuestions.question_id,
            success: true
          });
        }
      }
    }

    console.log(`Successfully generated ${results.length} questions`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${results.length} questions`,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in bulk-generate-curriculum-questions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function createQuestionGenerationPrompt(topic: any, misconceptions: any[], existingQuestions: any[], totalQuestionsForTopic: number, examBoard: string, subtopicsInTopic: any[], questionsPerSubtopic: number): string {
  const subtopicsList = subtopicsInTopic.map((s: any) => `${s.id}: ${s.name}`).join('\n  ') || 'No subtopics defined';
  const misconceptionCodes = misconceptions.slice(0, 20).map(m => `${m.misconception_id}: ${m.description}`).join('\n');
  
  const existingExamples = existingQuestions
    .filter((q: any) => q.topic_id === topic.topic_id)
    .slice(0, 3)
    .map((q: any) => `"${q.question_text}" (${q.difficulty})`)
    .join('\n');

  const examBoardStyle = examBoard === 'GL' 
    ? 'GL Assessment style (more structured, clear mathematical language, step-by-step reasoning)'
    : 'CEM style (more abstract reasoning, problem-solving focus, less structured approach)';

  return `Generate ${totalQuestionsForTopic} mathematics questions for 11+ students on the topic "${topic.topic_name}" (${topic.difficulty} level).

CRITICAL REQUIREMENT: You MUST cover ALL ${subtopicsInTopic.length} subtopics listed below. Distribute questions evenly across subtopics (exactly ${questionsPerSubtopic} questions per subtopic).

TOPIC DETAILS:
- Main Topic: ${topic.topic_name}
- Difficulty: ${topic.difficulty}
- Learning Objectives: ${topic.topic_skills?.join(', ') || 'General understanding'}

ALL SUBTOPICS TO COVER (MANDATORY):
  ${subtopicsList}

EXAM BOARD STYLE: ${examBoardStyle}

EXISTING QUESTION EXAMPLES:
${existingExamples || 'No existing examples'}

MISCONCEPTION CODES TO USE:
${misconceptionCodes}

REQUIREMENTS:
1. Create exactly ${totalQuestionsForTopic} multiple-choice questions suitable for 11+ level
2. ENSURE each of the ${subtopicsInTopic.length} subtopics is represented with exactly ${questionsPerSubtopic} question(s)
3. Each question must have 4 answer options (A, B, C, D)
4. One correct answer and three diagnostic distractors
5. Each incorrect option MUST map to a specific misconception from the codes above
6. Include clear diagnostic feedback for each option
7. Questions should be appropriate for ${examBoard} examination style
8. SPECIFY which subtopic each question targets using the subtopic ID from the list above

RESPONSE FORMAT (JSON):
{
  "questions": [
    {
      "question_text": "Clear, age-appropriate question text",
      "difficulty": "${topic.difficulty}",
      "cognitive_level": "recall|application|analysis|synthesis",
      "question_category": "arithmetic|reasoning|mixed",
      "marks": 1,
      "time_seconds": 60,
      "exam_board": "${examBoard}",
      "subtopic_id": "SPECIFIC SUBTOPIC ID FROM LIST ABOVE",
      "subtopic_name": "SPECIFIC SUBTOPIC NAME FROM LIST ABOVE", 
      "options": [
        {
          "option_letter": "A",
          "answer_value": "Correct answer",
          "is_correct": true,
          "diagnostic_feedback": "Well done! You correctly..."
        },
        {
          "option_letter": "B",
          "answer_value": "Incorrect answer 1",
          "is_correct": false,
          "misconception_code": "PV1",
          "diagnostic_feedback": "This suggests confusion with place value positioning..."
        },
        {
          "option_letter": "C",
          "answer_value": "Incorrect answer 2",
          "is_correct": false,
          "misconception_code": "OP1",
          "diagnostic_feedback": "This indicates difficulty with inverse operations..."
        },
        {
          "option_letter": "D",
          "answer_value": "Incorrect answer 3",
          "is_correct": false,
          "misconception_code": "FR1",
          "diagnostic_feedback": "This shows a misconception about fraction operations..."
        }
      ]
    }
  ]
}

CRITICAL: Generate questions systematically across ALL subtopics. Do not skip any subtopic. Ensure comprehensive coverage of the entire topic through its constituent subtopics.`;
}

function parseGeneratedQuestions(content: string, topicId: string, examBoard: string): any[] {
  try {
    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const questions = parsed.questions || [];

    return questions.map((q: any) => ({
      ...q,
      topic_id: topicId,
      question_id: generateQuestionId(topicId, examBoard),
      exam_boards: [examBoard],
      module_id: topicId.substring(0, 4) // Extract module from topic ID
    }));

  } catch (error) {
    console.error('Error parsing generated questions:', error);
    console.log('Raw content:', content);
    return [];
  }
}

function generateQuestionId(topicId: string, examBoard: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const board = examBoard.toLowerCase();
  return `${topicId}_${board}_${timestamp}`;
}

async function insertQuestionWithOptions(questionData: any): Promise<any> {
  try {
    // Insert the main question
    const { data: question, error: questionError } = await supabase
      .from('bootcamp_questions')
      .insert({
        question_id: questionData.question_id,
        module_id: questionData.module_id,
        topic_id: questionData.topic_id,
        subtopic_id: questionData.subtopic_id || questionData.subtopic || null,
        question_category: questionData.question_category || 'mixed',
        cognitive_level: questionData.cognitive_level || 'application',
        difficulty: questionData.difficulty,
        question_text: questionData.question_text,
        marks: questionData.marks || 1,
        time_seconds: questionData.time_seconds || 60,
        exam_boards: questionData.exam_boards || [],
        question_type: 'multiple_choice'
      })
      .select()
      .single();

    if (questionError) throw questionError;

    // Insert answer options
    if (questionData.options && questionData.options.length > 0) {
      const options = questionData.options.map((option: any) => ({
        question_id: questionData.question_id,
        option_letter: option.option_letter,
        answer_value: option.answer_value,
        is_correct: option.is_correct,
        misconception_code: option.misconception_code || null,
        diagnostic_feedback: option.diagnostic_feedback
      }));

      const { error: optionsError } = await supabase
        .from('bootcamp_answer_options')
        .insert(options);

      if (optionsError) throw optionsError;
    }

    return question;
  } catch (error) {
    console.error('Error inserting question:', error);
    throw error;
  }
}