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
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key not found');
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

    const prompt = `You are talking to an 8-year-old named Alex who loves video games, toys, and ice cream! Alex needs help with ${topic} math.

SUPER IMPORTANT RULES:
- NO big words like "concept," "interval," "calculate," or "negative result"
- Use words a 2nd grader knows
- Compare everything to fun stuff kids love (games, toys, candy, playgrounds)
- Be excited and encouraging like their favorite fun teacher!
- Use lots of emojis and exclamation points!

Alex's math story:
- They got ${Math.round((focusAreaContext.accuracy || 0) * 100)}% right in ${topic}
- They tried ${focusAreaContext.totalAttempts} questions
- The tricky parts were: ${uniqueSubtopics.join(', ') || 'some number puzzles'}

Write like you're talking directly to Alex:

🌟 **Hey Alex! ${topic} is like...**
[Compare this math topic to something SUPER fun - like a video game level, building with blocks, or sharing pizza slices. Make it exciting!]

😅 **What's been tricky for you:**
[Explain what they're struggling with using simple words and fun examples. Like "When you count backwards past zero, it's like going down slides at the playground - you can go underground!" Instead of saying "negative numbers" say "underground numbers" or "backwards numbers"]

🎮 **Cool tricks to get better:**
[Give 3 fun ways to practice - like games, toys, or activities they can do. Be specific and playful!]

🎯 **Fun challenges to try:**
[Suggest specific games or activities using things kids love]

🏆 **You're already awesome because:**
[Point out something great they're doing, even if they're struggling]

Remember: Talk like you're 8 years old's best friend who happens to love math! NO grown-up words!

Examples of good kid language:
- Instead of "calculate" → "figure out" or "work out"
- Instead of "negative numbers" → "underground numbers" or "backwards numbers" 
- Instead of "interval across zero" → "jumping past the zero line"
- Instead of "concept" → "idea" or "trick"
- Instead of "struggle with" → "find tricky"

Make it FUN and SIMPLE!`;

    console.log('Sending request to Perplexity for focus area explanation...');

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
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
        temperature: 0.8,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', errorText);
      throw new Error(`Perplexity API error: ${response.status}`);
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