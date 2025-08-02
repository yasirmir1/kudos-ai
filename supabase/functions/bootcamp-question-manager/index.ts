import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuestionImportData {
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action, data, studentId, questionCount } = await req.json()

    switch (action) {
      case 'import_questions':
        return await importQuestions(supabaseClient, data)
      
      case 'get_adaptive_questions':
        return await getAdaptiveQuestions(supabaseClient, studentId, questionCount)
      
      case 'submit_response':
        return await submitResponse(supabaseClient, data)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function importQuestions(supabaseClient: any, questions: QuestionImportData[]) {
  try {
    for (const q of questions) {
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
        })

      if (questionError) {
        console.error('Question insert error:', questionError)
        continue
      }

      // Insert answer options
      const options = [
        { letter: 'A', value: q.option_a, misconception: q.a_misconception, feedback: q.a_feedback },
        { letter: 'B', value: q.option_b, misconception: q.b_misconception, feedback: q.b_feedback },
        { letter: 'C', value: q.option_c, misconception: q.c_misconception, feedback: q.c_feedback },
        { letter: 'D', value: q.option_d, misconception: q.d_misconception, feedback: q.d_feedback }
      ]

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
          })

        if (optionError) {
          console.error('Option insert error:', optionError)
        }
      }

      // Insert misconceptions if they don't exist
      const misconceptions = [q.a_misconception, q.b_misconception, q.c_misconception, q.d_misconception]
        .filter(m => m && m !== 'correct')
        .map(m => m.split('-')[0]) // Extract misconception code before dash

      for (const miscCode of [...new Set(misconceptions)]) {
        await supabaseClient
          .from('bootcamp_enhanced_misconceptions')
          .upsert({
            misconception_code: miscCode,
            misconception_type: getMisconceptionType(miscCode),
            description: getMisconceptionDescription(miscCode),
            diagnostic_indicators: [],
            remediation_pathway_id: null
          })
      }
    }

    return new Response(
      JSON.stringify({ success: true, imported: questions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    throw new Error(`Import failed: ${error.message}`)
  }
}

async function getAdaptiveQuestions(supabaseClient: any, studentId: string, questionCount: number = 10) {
  try {
    // First check if student has enough history for adaptive questions
    const { data: responseHistory, error: historyError } = await supabaseClient
      .from('bootcamp_student_responses')
      .select('response_id')
      .eq('student_id', studentId)

    if (historyError) {
      console.error('Error checking history:', historyError)
    }

    const hasEnoughHistory = responseHistory && responseHistory.length >= 10

    let questions;
    let questionsError;

    if (!hasEnoughHistory) {
      // For new students: get foundation/easy questions
      console.log('New student detected, providing foundation questions')
      
      const { data: foundationQuestions, error: foundationError } = await supabaseClient
        .from('bootcamp_questions')
        .select(`
          question_id,
          module_id,
          topic_id,
          subtopic_id,
          question_category,
          cognitive_level,
          difficulty,
          question_type,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_answer,
          explanation,
          marks,
          time_seconds,
          prerequisite_skills,
          exam_boards,
          created_at
        `)
        .eq('difficulty', 'foundation')
        .order('question_id')
        .limit(questionCount)

      questions = foundationQuestions
      questionsError = foundationError

      // Add selection reason for foundation questions
      if (questions) {
        questions = questions.map((q: any) => ({
          ...q,
          selection_reason: 'Foundation question for new student',
          priority: 1
        }))
      }

    } else {
      // For experienced students: use adaptive algorithm
      console.log('Experienced student detected, using adaptive algorithm')
      
      const { data: adaptiveData, error: adaptiveError } = await supabaseClient
        .rpc('bootcamp_generate_adaptive_practice_set', {
          p_student_id: studentId,
          p_question_count: questionCount
        })

      if (adaptiveError || !adaptiveData || adaptiveData.length === 0) {
        console.error('Adaptive algorithm failed, falling back to foundation questions:', adaptiveError)
        
        // Fallback to foundation questions if adaptive fails
        const { data: fallbackQuestions, error: fallbackError } = await supabaseClient
          .from('bootcamp_questions')
          .select(`
            question_id,
            module_id,
            topic_id,
            subtopic_id,
            question_category,
            cognitive_level,
            difficulty,
            question_type,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            explanation,
            marks,
            time_seconds,
            prerequisite_skills,
            exam_boards,
            created_at
          `)
          .in('difficulty', ['foundation', 'intermediate'])
          .order('difficulty')
          .limit(questionCount)

        questions = fallbackQuestions?.map((q: any) => ({
          ...q,
          selection_reason: 'Fallback question',
          priority: 2
        }))
        questionsError = fallbackError
      } else {
        // Get full question details for adaptive selection
        const questionIds = adaptiveData.map((item: any) => item.question_id)
        
        const { data: adaptiveQuestions, error: adaptiveQuestionsError } = await supabaseClient
          .from('bootcamp_questions')
          .select(`
            question_id,
            module_id,
            topic_id,
            subtopic_id,
            question_category,
            cognitive_level,
            difficulty,
            question_type,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            explanation,
            marks,
            time_seconds,
            prerequisite_skills,
            exam_boards,
            created_at
          `)
          .in('question_id', questionIds)

        if (adaptiveQuestionsError) {
          throw adaptiveQuestionsError
        }

        // Combine with reasoning from adaptive algorithm
        questions = adaptiveQuestions?.map((q: any) => {
          const reasoning = adaptiveData.find((item: any) => item.question_id === q.question_id)
          return {
            ...q,
            selection_reason: reasoning?.reason || 'Adaptive selection',
            priority: reasoning?.priority || 3
          }
        })
        questionsError = null
      }
    }

    if (questionsError) {
      throw questionsError
    }

    if (!questions || questions.length === 0) {
      throw new Error('No questions available')
    }

    console.log(`Returning ${questions.length} questions for student ${studentId}`)

    return new Response(
      JSON.stringify({ 
        questions: questions,
        strategy: hasEnoughHistory ? 'adaptive' : 'foundation',
        student_response_count: responseHistory?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in getAdaptiveQuestions:', error)
    throw new Error(`Failed to get adaptive questions: ${error.message}`)
  }
}

async function submitResponse(supabaseClient: any, responseData: any) {
  try {
    const {
      student_id,
      question_id,
      selected_answer,
      time_taken_seconds,
      confidence_rating,
      session_id
    } = responseData

    // Get the question details
    const { data: question, error: questionError } = await supabaseClient
      .from('bootcamp_questions')
      .select('*')
      .eq('question_id', question_id)
      .single()

    if (questionError) throw questionError

    // Determine correctness based on stored answer
    const isCorrect = selected_answer === question.correct_answer

    // Insert the response
    const { data: response, error: responseError } = await supabaseClient
      .from('bootcamp_student_responses')
      .insert({
        student_id,
        question_id,
        selected_answer,
        is_correct: isCorrect,
        time_taken: time_taken_seconds,
        misconception_detected: null, // Will be determined later
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (responseError) throw responseError

    return new Response(
      JSON.stringify({
        success: true,
        is_correct: isCorrect,
        feedback: question.explanation,
        correct_answer: question.correct_answer
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    throw new Error(`Failed to submit response: ${error.message}`)
  }
}

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
  }
  return types[code.substring(0, 2)] || 'General'
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
  }
  return descriptions[code] || `Misconception type: ${code}`
}