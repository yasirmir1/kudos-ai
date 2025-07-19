import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to get topic prefix for question IDs
const getTopicPrefix = (topic: string, age_group?: string): string => {
  // Add 11P prefix for 11+ age group to maintain consistency
  const basePrefix = age_group === '11+' ? '11P' : '';
  
  if (topic.toLowerCase().includes('algebra')) return basePrefix + 'ALG';
  if (topic.toLowerCase().includes('number') && topic.toLowerCase().includes('place')) return basePrefix + 'NPV';
  if (topic.toLowerCase().includes('number') && (topic.toLowerCase().includes('addition') || topic.toLowerCase().includes('subtraction'))) return basePrefix + 'NAS';
  if (topic.toLowerCase().includes('number') && (topic.toLowerCase().includes('multiplication') || topic.toLowerCase().includes('division'))) return basePrefix + 'NMD';
  if (topic.toLowerCase().includes('number') && topic.toLowerCase().includes('fraction')) return basePrefix + 'NFR';
  if (topic.toLowerCase().includes('number') && topic.toLowerCase().includes('decimal')) return basePrefix + 'NDC';
  if (topic.toLowerCase().includes('number') && topic.toLowerCase().includes('percent')) return basePrefix + 'NPC';
  if (topic.toLowerCase().includes('number') && topic.toLowerCase().includes('ratio')) return basePrefix + 'NRT';
  if (topic.toLowerCase().includes('number')) return basePrefix + 'NUM';
  if (topic.toLowerCase().includes('geometry')) return basePrefix + 'GEO';
  if (topic.toLowerCase().includes('measure')) return basePrefix + 'MEA';
  if (topic.toLowerCase().includes('statistic')) return basePrefix + 'STA';
  if (topic.toLowerCase().includes('probability')) return basePrefix + 'PRB';
  return basePrefix + 'GEN';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!OPENAI_API_KEY && !PERPLEXITY_API_KEY) {
      throw new Error('No AI API keys available');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { topic, subtopic, difficulty, count = 5, age_group, saveToDatabase = false } = await req.json();

    if (!topic || !subtopic || !difficulty) {
      throw new Error('Topic, subtopic, and difficulty are required');
    }

    console.log(`Generating ${count} questions for ${topic} - ${subtopic} (${difficulty}) for age group: ${age_group}`);

    // Get existing questions as examples for the AI (filtered by age group if provided)
    let exampleQuery = supabase
      .from('curriculum')
      .select('*')
      .eq('topic', topic)
      .eq('difficulty', difficulty);
    
    if (age_group) {
      exampleQuery = exampleQuery.eq('age_group', age_group);
    }
    
    const { data: examples, error: exampleError } = await exampleQuery.limit(3);

    if (exampleError) {
      console.error('Error fetching examples:', exampleError);
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const prompt = `You are an expert educational content creator. Generate ${count} high-quality multiple choice questions for mathematics education.

TOPIC: ${topic}
SUBTOPIC: ${subtopic}  
DIFFICULTY: ${difficulty}

REQUIREMENTS:
1. Follow the EXACT JSON structure shown in the examples
2. Generate realistic red herrings (common wrong answers)
3. Include pedagogical explanations
4. Make questions age-appropriate for the difficulty level
5. Ensure mathematical accuracy

${examples && examples.length > 0 ? `
EXAMPLE STRUCTURE (use this exact format):
${JSON.stringify(examples[0], null, 2)}

MORE EXAMPLES:
${examples.slice(1).map(ex => JSON.stringify(ex, null, 2)).join('\n\n')}
` : ''}

Generate ${count} questions as a JSON array. Each question should have:
- question_id: unique identifier (use format: "${getTopicPrefix(topic, age_group)}" + 3-digit number like "ALG001", "NUM001", etc.)
- topic: "${topic}"
- subtopic: "${subtopic}"
- example_question: clear, well-written question
- question_type: "multiple_choice"
- options: array of 4 answer choices
- correct_answer: one of the options (exact match)
- difficulty: "${difficulty}"
- red_herring_tag: array of misconception tags (e.g., ["PlaceValue_DigitValueConfusion"])
- red_herring_explanation: why wrong answers are tempting
- pedagogical_notes: teaching tips

RESPOND WITH ONLY THE JSON ARRAY, NO OTHER TEXT.`;

          let apiResponse;
          let apiUsed = '';

          // Try GPT-4.1 first (best for structured generation)
          if (OPENAI_API_KEY) {
            try {
              console.log('Using OpenAI GPT-4.1 for question generation...');
              
              apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                      content: 'You are an expert educational content creator specializing in mathematics curriculum development. You generate high-quality, pedagogically sound questions with realistic misconceptions.'
                    },
                    {
                      role: 'user',
                      content: prompt
                    }
                  ],
                  max_tokens: 4000,
                  temperature: 0.7,
                  response_format: { type: "json_object" }
                }),
              });
              
              if (apiResponse.ok) {
                apiUsed = 'openai';
              } else {
                throw new Error(`OpenAI API error: ${apiResponse.status}`);
              }
            } catch (openaiError) {
              console.log('OpenAI failed, trying Perplexity...', openaiError.message);
            }
          }

          // Fallback to Perplexity
          if (!apiResponse?.ok && PERPLEXITY_API_KEY) {
            try {
              console.log('Using Perplexity as fallback...');
              
              apiResponse = await fetch('https://api.perplexity.ai/chat/completions', {
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
                      content: 'You are an expert educational content creator. Generate structured JSON responses for educational questions.'
                    },
                    {
                      role: 'user',
                      content: prompt
                    }
                  ],
                  max_tokens: 4000,
                  temperature: 0.7
                }),
              });
              
              if (apiResponse.ok) {
                apiUsed = 'perplexity';
              }
            } catch (perplexityError) {
              console.error('Both APIs failed:', perplexityError.message);
              throw new Error('All AI services unavailable');
            }
          }

          if (!apiResponse?.ok) {
            throw new Error('Failed to generate questions with any AI service');
          }

          const data = await apiResponse.json();
          let generatedContent = '';
          
          if (apiUsed === 'openai') {
            generatedContent = data.choices[0].message.content;
          } else {
            generatedContent = data.choices[0].message.content;
          }

          console.log('Generated content:', generatedContent);

          // Parse and validate the generated questions
          let questions;
          try {
            // Clean the response and try to parse JSON
            const cleanContent = generatedContent.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleanContent);
            questions = Array.isArray(parsed) ? parsed : parsed.questions || [parsed];
          } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            throw new Error('AI generated invalid JSON format');
          }

          // Validate and stream each question
          for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            
            // Validate required fields
            const requiredFields = ['question_id', 'topic', 'subtopic', 'example_question', 'options', 'correct_answer', 'difficulty'];
            const missingFields = requiredFields.filter(field => !question[field]);
            
            if (missingFields.length > 0) {
              console.error(`Question ${i + 1} missing fields:`, missingFields);
              continue;
            }

            // Validate that correct_answer is in options
            if (!question.options.includes(question.correct_answer)) {
              console.error(`Question ${i + 1}: correct_answer not in options`);
              continue;
            }

            // Generate standardized question ID using database function
            const { data: idResult } = await supabase
              .rpc('generate_question_id', { topic_name: topic });
            
            if (idResult) {
              question.question_id = idResult;
            } else {
              // Fallback ID generation
              const topicPrefix = getTopicPrefix(topic, age_group);
              const timestamp = Date.now().toString().slice(-3);
              question.question_id = `${topicPrefix}${timestamp}`;
            }

            // Stream the validated question
            const questionData = {
              type: 'question',
              data: question,
              index: i + 1,
              total: questions.length,
              apiUsed
            };

            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(questionData)}\n\n`));

            // Save to database if requested
            if (saveToDatabase) {
              try {
                // Check for duplicates before inserting
                const { data: existing } = await supabase
                  .from('curriculum')
                  .select('question_id')
                  .eq('question_id', question.question_id)
                  .single();
                
                if (existing) {
                  // Generate a new ID if duplicate found
                  const timestamp = Date.now().toString().slice(-3);
                  question.question_id = `${getTopicPrefix(topic, age_group)}${timestamp}`;
                }

                // Add age group to question if provided
                if (age_group) {
                  question.age_group = age_group;
                }

                const { error: insertError } = await supabase
                  .from('curriculum')
                  .insert(question);

                if (insertError) {
                  console.error('Database save error:', insertError);
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                    type: 'error',
                    message: `Failed to save question ${i + 1}: ${insertError.message}`
                  })}\n\n`));
                } else {
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                    type: 'saved',
                    questionId: question.question_id,
                    index: i + 1
                  })}\n\n`));
                }
              } catch (saveError) {
                console.error('Save exception:', saveError);
              }
            }

            // Add small delay between questions for better UX
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Send completion message
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'complete',
            totalGenerated: questions.length,
            apiUsed,
            saved: saveToDatabase
          })}\n\n`));

        } catch (error) {
          console.error('Generation error:', error);
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'error',
            message: error.message
          })}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in generate-questions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});