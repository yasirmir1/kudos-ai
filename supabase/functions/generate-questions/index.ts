import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to get topic prefix and year level mapping
const getTopicPrefix = (topic: string, age_group?: string): string => {
  // Year prefix based on age group
  let yearPrefix = '';
  if (age_group === 'year 2-3') {
    yearPrefix = 'Y2'; // Will also generate Y3 variants
  } else if (age_group === 'year 4-5') {
    yearPrefix = 'Y4'; // Will also generate Y5 variants
  } else if (age_group === '11+') {
    yearPrefix = 'Y6';
  } else {
    yearPrefix = 'Y4'; // default
  }
  
  // Topic abbreviations based on your curriculum structure
  if (topic === 'Number - Number and Place Value') return yearPrefix + 'NPV';
  if (topic === 'Number - Addition and Subtraction') return yearPrefix + 'ASM';
  if (topic === 'Number - Multiplication and Division') return yearPrefix + 'MD';
  if (topic === 'Number - Fractions') return yearPrefix + 'FR';
  if (topic === 'Number - Fractions (including decimals)') return yearPrefix + 'FR';
  if (topic === 'Measurement') return yearPrefix + 'ME';
  if (topic === 'Geometry - Properties of Shapes') return yearPrefix + 'GS';
  if (topic === 'Geometry - Position and Direction') return yearPrefix + 'PD';
  if (topic === 'Statistics') return yearPrefix + 'ST';
  if (topic === 'Algebra') return yearPrefix + 'ALG';
  if (topic === 'Ratio and Proportion') return yearPrefix + 'RP';
  if (topic === 'Probability') return yearPrefix + 'PR';
  
  // Fallback for any other topics
  return yearPrefix + 'GEN';
};

// Function to get year level progression examples
const getYearLevelGuidance = (age_group: string) => {
  if (age_group === 'year 2-3') {
    return {
      yearLevels: ['Year 2', 'Year 3'],
      progression: {
        'Year 2': 'Basic concepts, smaller numbers (up to 100), concrete representations, simple operations',
        'Year 3': 'Extended concepts, larger numbers (up to 1000), more abstract thinking, multi-step problems'
      }
    };
  } else if (age_group === 'year 4-5') {
    return {
      yearLevels: ['Year 4', 'Year 5'],
      progression: {
        'Year 4': 'Intermediate concepts, numbers up to 10,000, written methods, problem solving',
        'Year 5': 'Advanced concepts, larger numbers, complex calculations, real-world applications'
      }
    };
  } else {
    return {
      yearLevels: ['Year 6'],
      progression: {
        'Year 6': '11+ preparation, advanced problem solving, complex multi-step problems'
      }
    };
  }
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
          const yearGuidance = getYearLevelGuidance(age_group || 'year 4-5');
          
          const prompt = `You are an expert educational content creator. Generate ${count} high-quality multiple choice questions for mathematics education that match the exact curriculum structure provided.

TOPIC: ${topic}
SUBTOPIC: ${subtopic}  
DIFFICULTY: ${difficulty}
AGE GROUP: ${age_group || 'year 4-5'}

YEAR LEVEL PROGRESSION GUIDE:
${Object.entries(yearGuidance.progression).map(([year, description]) => `${year}: ${description}`).join('\n')}

Generate questions across BOTH year levels: ${yearGuidance.yearLevels.join(' and ')}

CRITICAL: Follow this EXACT JSON structure from the curriculum:

{
  "question_id": "${getTopicPrefix(topic, age_group)}001",
  "topic": "${topic}",
  "subtopic": "${subtopic}",
  "example_question": "Clear, age-appropriate question text here",
  "question_type": "Multiple Choice",
  "options": [
    "Option A",
    "Option B", 
    "Option C",
    "Option D"
  ],
  "correct_answer": "Option B",
  "difficulty": "${difficulty}",
  "red_herring_tag": ["MisconceptionType_SpecificError"] or null,
  "red_herring_explanation": "Explanation of why students might choose wrong answers" or null,
  "pedagogical_notes": "Year X: Brief teaching context and methodology."
}

${examples && examples.length > 0 ? `
REFERENCE EXAMPLES from your curriculum (FOLLOW THESE PATTERNS EXACTLY):
${JSON.stringify(examples[0], null, 2)}

${examples.slice(1).map(ex => JSON.stringify(ex, null, 2)).join('\n\n')}
` : ''}

CRITICAL REQUIREMENTS:
1. Generate questions for BOTH year levels: ${yearGuidance.yearLevels.join(' and ')}
2. Start question_id with correct prefixes: ${yearGuidance.yearLevels.map(year => getTopicPrefix(topic, age_group).replace(/Y\d/, year.replace('Year ', 'Y'))).join(' and ')}
3. Make ${Math.ceil(count/2)} questions at ${yearGuidance.yearLevels[0]} level and ${Math.floor(count/2)} at ${yearGuidance.yearLevels[1] || yearGuidance.yearLevels[0]} level
4. Use appropriate mathematical complexity for each year
5. Include realistic misconceptions specific to each year level
6. pedagogical_notes must start with "Year X:" matching the complexity level

MATHEMATICAL PROGRESSION EXAMPLES:
${age_group === 'year 2-3' ? `
Year 2: "Count on in steps of 2 from 14. What is the next number: 14, 16, 18, __?" (Numbers to 100)
Year 3: "Count on in 50s from 200. What comes next: 200, 250, 300, __?" (Numbers to 1000)
` : age_group === 'year 4-5' ? `
Year 4: "What is 2,345 + 1,234?" (4-digit addition, written methods)
Year 5: "Calculate 4.56 + 2.78" (Decimal addition, real-world context)
` : `
Year 6: Complex problem solving, 11+ preparation level questions
`}

topic: EXACTLY "${topic}"
subtopic: EXACTLY "${subtopic}"
question_type: EXACTLY "Multiple Choice" 
difficulty: EXACTLY "${difficulty}"

Generate ${count} questions as a JSON array. Ensure mathematical accuracy and year-appropriate progression.

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

            // Determine year level for this question based on pedagogical_notes or position in batch
            let questionYearLevel = '';
            if (question.pedagogical_notes && question.pedagogical_notes.match(/Year \d/)) {
              const match = question.pedagogical_notes.match(/Year (\d)/);
              questionYearLevel = match ? `Y${match[1]}` : getTopicPrefix(topic, age_group).substring(0, 2);
            } else {
              // Fallback: alternate between year levels or use default
              const yearGuidance = getYearLevelGuidance(age_group || 'year 4-5');
              if (yearGuidance.yearLevels.length > 1) {
                questionYearLevel = i < Math.ceil(questions.length/2) ? `Y${yearGuidance.yearLevels[0].replace('Year ', '')}` : `Y${yearGuidance.yearLevels[1].replace('Year ', '')}`;
              } else {
                questionYearLevel = getTopicPrefix(topic, age_group).substring(0, 2);
              }
            }
            
            // Generate topic prefix with correct year level
            const topicSuffix = getTopicPrefix(topic, age_group).substring(2);
            const questionPrefix = questionYearLevel + topicSuffix;
            
            // Get the highest existing number for this specific prefix
            const { data: existingQuestions } = await supabase
              .from('curriculum')
              .select('question_id')
              .like('question_id', `${questionPrefix}%`)
              .order('question_id', { ascending: false })
              .limit(1);
            
            let nextNumber = 1;
            if (existingQuestions && existingQuestions.length > 0) {
              const lastId = existingQuestions[0].question_id;
              const match = lastId.match(/(\d+)$/);
              if (match) {
                nextNumber = parseInt(match[1]) + 1;
              }
            }
            
            // Add the loop index to ensure uniqueness within this batch
            const questionNumber = String(nextNumber + i).padStart(3, '0');
            question.question_id = `${questionPrefix}${questionNumber}`;

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