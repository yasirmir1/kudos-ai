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

    const { student_id, topic } = await req.json();

    if (!student_id || !topic) {
      throw new Error('Student ID and topic are required');
    }

    console.log('Generating explanation for focus area:', topic, 'for student:', student_id);

    // Get student performance data for this topic
    const { data: performanceData, error: performanceError } = await supabase
      .from('student_performance')
      .select('*')
      .eq('student_id', student_id)
      .eq('topic', topic)
      .single();

    if (performanceError) {
      console.error('Error fetching performance data:', performanceError);
      throw performanceError;
    }

    // Get recent incorrect answers for this topic
    const { data: incorrectAnswers, error: answersError } = await supabase
      .from('student_answers')
      .select(`
        question_id,
        answer_given,
        subtopic,
        red_herring_triggered,
        answered_at
      `)
      .eq('student_id', student_id)
      .eq('topic', topic)
      .eq('is_correct', false)
      .order('answered_at', { ascending: false })
      .limit(5);

    if (answersError) {
      console.error('Error fetching incorrect answers:', answersError);
      throw answersError;
    }

    // Get curriculum data for context
    const { data: curriculumData, error: curriculumError } = await supabase
      .from('curriculum')
      .select('subtopic, difficulty, red_herring_explanation, pedagogical_notes')
      .eq('topic', topic);

    if (curriculumError) {
      console.error('Error fetching curriculum data:', curriculumError);
      throw curriculumError;
    }

    // Analyze the subtopics where student is struggling
    const strugglingSubtopics = incorrectAnswers?.map(answer => answer.subtopic).filter(Boolean) || [];
    const uniqueSubtopics = [...new Set(strugglingSubtopics)];

    // Get common misconceptions for this topic
    const commonMisconceptions = incorrectAnswers?.flatMap(answer => answer.red_herring_triggered || []).filter(Boolean) || [];
    const uniqueMisconceptions = [...new Set(commonMisconceptions)];

    const focusAreaContext = {
      topic,
      accuracy: performanceData?.accuracy || 0,
      totalAttempts: performanceData?.total_attempts || 0,
      strugglingSubtopics: uniqueSubtopics,
      commonMisconceptions: uniqueMisconceptions,
      recentErrors: incorrectAnswers?.length || 0
    };

    const prompt = `You are a super friendly math teacher talking to an 8-year-old student who needs help with ${topic}.

The student is having trouble with this topic and needs encouragement and simple explanations to help them improve.

Here's what's happening:
- Their accuracy in ${topic} is ${Math.round((focusAreaContext.accuracy || 0) * 100)}%
- They've tried ${focusAreaContext.totalAttempts} questions
- They're struggling with: ${uniqueSubtopics.join(', ') || 'various parts of this topic'}
- Recent mistakes: ${focusAreaContext.recentErrors} wrong answers

Create a fun, encouraging explanation that:

🌟 **Why ${topic} is Awesome**
[Explain why this topic is cool and useful in real life, using examples an 8-year-old loves - like games, toys, or snacks]

🤔 **What's Been Tricky**
[Explain in simple words what parts have been hard, without making them feel bad]

💡 **Super Easy Tips to Get Better**
[Give 3-4 simple, fun ways to practice and improve. Use comparisons to things kids know well]

🎯 **Fun Practice Ideas**
[Suggest specific, playful ways to practice this topic]

🏆 **You're Already Amazing Because...**
[Point out something positive about their learning journey]

Remember:
- Use words an 8-year-old knows
- Be super encouraging and positive
- Make it fun with emojis
- Compare math to fun things like games, toys, or treats
- Keep it short and exciting!`;

    console.log('Sending request to OpenAI for focus area explanation...');

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
            content: 'You are the most encouraging, fun math teacher ever! You love helping kids learn and always make them feel confident and excited about math. You explain everything like you\'re talking to your favorite 8-year-old student.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices[0].message.content;

    console.log('Generated focus area explanation successfully');

    return new Response(JSON.stringify({ 
      explanation,
      focusAreaData: focusAreaContext
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in explain-focus-areas function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      explanation: "I'm having trouble creating an explanation right now, but don't worry - you're doing great! Keep practicing and try again later! 🌟"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});