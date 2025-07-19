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

    // Analyze the specific mistakes patterns
    const mistakePatterns = incorrectAnswers?.map(answer => ({
      subtopic: answer.subtopic,
      misconceptions: answer.red_herring_triggered || []
    })) || [];

    const prompt = `Help a student understand their performance in ${topic}. Be encouraging and respectful - give practical advice without talking down to them.

Performance Summary:
- Accuracy: ${Math.round((focusAreaContext.accuracy || 0) * 100)}% in ${topic}
- Questions attempted: ${focusAreaContext.totalAttempts}
- Areas needing work: ${uniqueSubtopics.join(', ') || 'various subtopics'}
- Common mistake patterns: ${uniqueMisconceptions.join(', ') || 'mixed patterns'}

Create an engaging explanation with these sections:

🎯 **What's happening in this topic:**
[Brief, encouraging overview of their performance and what this topic covers]

🤔 **Where you might be getting stuck:**
[Analyze their common mistakes without being condescending - explain what typically goes wrong]

🛠️ **Strategies to improve:**
[Give 2-3 practical, actionable strategies specific to their mistake patterns]

📚 **Key concepts to focus on:**
[Highlight the most important concepts for this topic that they should master]

🚀 **Next steps:**
[Suggest specific practice areas or approaches that would help most]

Mistake patterns to address: ${JSON.stringify(mistakePatterns, null, 2)}

Be encouraging, practical, and respectful. Help them understand their mistakes and give clear guidance for improvement.`;

    console.log('Sending request to Perplexity for focus area explanation...');

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
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
            content: 'You are a knowledgeable math tutor who provides insightful analysis and practical guidance. You help students understand their learning patterns with respect and actionable advice. Be encouraging and supportive without being condescending.'
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