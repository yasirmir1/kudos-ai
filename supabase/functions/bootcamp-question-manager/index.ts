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
    // Call the adaptive question generation function
    const { data, error } = await supabaseClient
      .rpc('bootcamp_generate_adaptive_practice_set', {
        p_student_id: studentId,
        p_question_count: questionCount
      })

    if (error) throw error

    // Get full question details
    const questionIds = data.map((item: any) => item.question_id)
    
    const { data: questions, error: questionsError } = await supabaseClient
      .from('bootcamp_enhanced_questions')
      .select(`
        *,
        bootcamp_enhanced_answer_options (*)
      `)
      .in('question_id', questionIds)

    if (questionsError) throw questionsError

    // Combine with reasoning
    const questionsWithReasoning = questions.map((q: any) => {
      const reasoning = data.find((item: any) => item.question_id === q.question_id)
      return {
        ...q,
        selection_reason: reasoning?.reason,
        priority: reasoning?.priority
      }
    })

    return new Response(
      JSON.stringify({ questions: questionsWithReasoning }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
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

    // Get the question and answer details
    const { data: question, error: questionError } = await supabaseClient
      .from('bootcamp_enhanced_questions')
      .select(`
        *,
        bootcamp_enhanced_answer_options (*)
      `)
      .eq('question_id', question_id)
      .single()

    if (questionError) throw questionError

    // Find the selected option
    const selectedOption = question.bootcamp_enhanced_answer_options
      .find((opt: any) => opt.option_letter === selected_answer)

    if (!selectedOption) throw new Error('Invalid answer option')

    // Insert the response
    const { data: response, error: responseError } = await supabaseClient
      .from('bootcamp_enhanced_student_responses')
      .insert({
        student_id,
        question_id,
        session_id,
        selected_answer,
        is_correct: selectedOption.is_correct,
        time_taken_seconds,
        misconception_detected: selectedOption.misconception_code,
        confidence_rating,
        attempt_number: 1
      })
      .select()
      .single()

    if (responseError) throw responseError

    // Update student progress and skills if needed
    if (!selectedOption.is_correct && selectedOption.misconception_code) {
      await supabaseClient
        .rpc('bootcamp_update_student_misconceptions', {
          p_student_id: student_id,
          p_response_id: response.response_id
        })
    }

    // Update progress for the topic
    await supabaseClient
      .rpc('bootcamp_update_student_progress', {
        p_student_id: student_id,
        p_topic_id: question.topic_id
      })

    return new Response(
      JSON.stringify({
        success: true,
        is_correct: selectedOption.is_correct,
        feedback: selectedOption.diagnostic_feedback,
        misconception: selectedOption.misconception_code,
        correct_answer: question.bootcamp_enhanced_answer_options
          .find((opt: any) => opt.is_correct)?.option_letter
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