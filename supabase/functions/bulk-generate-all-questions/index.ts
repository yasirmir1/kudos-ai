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
    yearPrefix = 'Y2'; 
  } else if (age_group === 'year 4-5') {
    yearPrefix = 'Y4'; 
  } else if (age_group === '11+') {
    yearPrefix = 'Y6';
  } else {
    yearPrefix = 'Y4'; // default
  }
  
  // Topic abbreviations
  if (topic === 'Number - Number and Place Value') return yearPrefix + 'NPV';
  if (topic === 'Number - Addition and Subtraction') return yearPrefix + 'ASM';
  if (topic === 'Number - Multiplication and Division') return yearPrefix + 'MD';
  if (topic === 'Number - Fractions') return yearPrefix + 'FR';
  if (topic === 'Number - Fractions (including decimals)') return yearPrefix + 'FR';
  if (topic === 'Number - Fractions (including decimals and percentages)') return yearPrefix + 'FR';
  if (topic === 'Measurement') return yearPrefix + 'ME';
  if (topic === 'Geometry - Properties of Shapes') return yearPrefix + 'GS';
  if (topic === 'Geometry - Position and Direction') return yearPrefix + 'PD';
  if (topic === 'Statistics') return yearPrefix + 'ST';
  if (topic === 'Algebra') return yearPrefix + 'ALG';
  if (topic === 'Ratio and Proportion') return yearPrefix + 'RP';
  if (topic === 'Probability') return yearPrefix + 'PR';
  if (topic === 'Geometry') return yearPrefix + 'GEO';
  if (topic === 'Number - Addition, Subtraction, Multiplication and Division') return yearPrefix + 'ASMD';
  
  return yearPrefix + 'GEN';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    
    if (!DEEPSEEK_API_KEY) {
      throw new Error('Deepseek API key not available');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { questionsPerCombination = 5 } = await req.json();

    console.log('Starting bulk generation for all curriculum combinations...');

    // Get all unique combinations from curriculum table
    const { data: combinations, error: combError } = await supabase
      .from('curriculum')
      .select('topic, subtopic, difficulty, age_group')
      .order('topic')
      .order('subtopic')
      .order('difficulty');

    if (combError) {
      throw new Error(`Failed to fetch combinations: ${combError.message}`);
    }

    // Create unique combinations
    const uniqueCombinations: any[] = [];
    const seen = new Set<string>();

    combinations?.forEach((item) => {
      const key = `${item.topic}|${item.subtopic}|${item.difficulty}|${item.age_group}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueCombinations.push(item);
      }
    });

    console.log(`Found ${uniqueCombinations.length} unique combinations`);

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        let successful = 0;
        let failed = 0;
        let totalGenerated = 0;

        try {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'start',
            totalCombinations: uniqueCombinations.length,
            questionsPerCombination
          })}\n\n`));

          // Process each combination
          for (let i = 0; i < uniqueCombinations.length; i++) {
            const combination = uniqueCombinations[i];
            const { topic, subtopic, difficulty, age_group } = combination;
            
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'progress',
              current: i + 1,
              total: uniqueCombinations.length,
              currentCombination: { topic, subtopic, difficulty, age_group }
            })}\n\n`));

            try {
              console.log(`Processing ${i + 1}/${uniqueCombinations.length}: ${topic} - ${subtopic} (${difficulty})`);

              const prompt = `Generate ${questionsPerCombination} mathematics multiple choice questions for:

TOPIC: ${topic}
SUBTOPIC: ${subtopic}  
DIFFICULTY: ${difficulty}
AGE GROUP: ${age_group}

Format as JSON array with this exact structure:
[
  {
    "question_id": "TEMP_ID",
    "topic": "${topic}",
    "subtopic": "${subtopic}",
    "example_question": "Question text here",
    "question_type": "Multiple Choice",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A",
    "difficulty": "${difficulty}",
    "red_herring_tag": null,
    "red_herring_explanation": null,
    "pedagogical_notes": "Brief teaching notes",
    "year_level": 4,
    "age_group": "${age_group}"
  }
]

Generate ${questionsPerCombination} questions. Respond with ONLY the JSON array.`;

              let apiResponse;
              let apiUsed = '';

              // Use Deepseek API
              console.log(`Using Deepseek for ${topic} - ${subtopic} (${difficulty})`);
              
              apiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'deepseek-chat',
                  messages: [
                    {
                      role: 'system',
                      content: 'You are an educational content creator specializing in mathematics questions for UK curriculum. Generate valid JSON arrays only. Be precise and follow the exact format requested.'
                    },
                    {
                      role: 'user',
                      content: prompt
                    }
                  ],
                  max_tokens: 4000,
                  temperature: 0.2,
                  top_p: 0.9
                }),
              });
              
              if (apiResponse.ok) {
                apiUsed = 'deepseek';
              } else {
                const errorText = await apiResponse.text();
                console.error(`Deepseek API error ${apiResponse.status}:`, errorText);
                throw new Error(`Deepseek API error: ${apiResponse.status} - ${errorText}`);
              }

              const data = await apiResponse.json();
              let generatedContent = data.choices[0].message.content;

              // Parse and validate the generated questions
              let questions;
              try {
                let cleanContent = generatedContent.trim();
                cleanContent = cleanContent.replace(/```json\n?|\n?```/g, '');
                
                const jsonStart = cleanContent.indexOf('[');
                const jsonEnd = cleanContent.lastIndexOf(']');
                
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                  cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
                }
                
                cleanContent = cleanContent
                  .replace(/,\s*}/g, '}')
                  .replace(/,\s*]/g, ']')
                  .replace(/'/g, '"')
                  .replace(/\n/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
                
                const parsed = JSON.parse(cleanContent);
                questions = Array.isArray(parsed) ? parsed : [parsed];
                
                if (!Array.isArray(questions) || questions.length === 0) {
                  throw new Error('No valid questions found');
                }
                
              } catch (parseError) {
                console.error('JSON parsing error:', parseError);
                throw new Error('AI generated invalid JSON format');
              }

              // Process and save each question
              let combinationGenerated = 0;
              for (let j = 0; j < questions.length; j++) {
                const question = questions[j];
                
                // Validate required fields
                if (!question.topic || !question.subtopic || !question.example_question || 
                    !question.options || !question.correct_answer || !question.difficulty) {
                  console.error(`Question ${j + 1} missing required fields`);
                  continue;
                }

                if (!question.options.includes(question.correct_answer)) {
                  console.error(`Question ${j + 1}: correct_answer not in options`);
                  continue;
                }

                // Generate unique question ID
                const questionPrefix = getTopicPrefix(topic, age_group);
                const timestamp = Date.now().toString().slice(-6);
                const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                question.question_id = `${questionPrefix}${timestamp}${randomSuffix}`;
                
                // Set proper schema fields
                question.year_level = age_group === 'year 2-3' ? (j < Math.ceil(questions.length/2) ? 2 : 3) :
                                     age_group === 'year 4-5' ? (j < Math.ceil(questions.length/2) ? 4 : 5) : 6;
                question.age_group = age_group;
                question.question_type = 'Multiple Choice';
                
                // Handle nulls
                if (!question.red_herring_tag) question.red_herring_tag = null;
                if (!question.red_herring_explanation) question.red_herring_explanation = null;
                if (!question.pedagogical_notes) question.pedagogical_notes = null;

                // Save to database
                try {
                  const { error: insertError } = await supabase
                    .from('curriculum')
                    .insert(question);

                  if (insertError) {
                    if (insertError.code === '23505') { // Unique violation
                      // Generate new ID and retry
                      const newTimestamp = Date.now().toString().slice(-6);
                      const newRandomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                      question.question_id = `${questionPrefix}${newTimestamp}${newRandomSuffix}`;
                      
                      const { error: retryError } = await supabase
                        .from('curriculum')
                        .insert(question);
                      
                      if (!retryError) {
                        combinationGenerated++;
                        totalGenerated++;
                      }
                    }
                  } else {
                    combinationGenerated++;
                    totalGenerated++;
                  }
                } catch (saveError) {
                  console.error('Save exception:', saveError);
                }
              }

              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'combination_complete',
                combination: { topic, subtopic, difficulty, age_group },
                generated: combinationGenerated,
                apiUsed
              })}\n\n`));

              successful++;

            } catch (error) {
              console.error(`Error generating for ${topic} - ${subtopic} (${difficulty}):`, error);
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'combination_error',
                combination: { topic, subtopic, difficulty, age_group },
                error: error.message
              })}\n\n`));
              failed++;
            }

            // Small delay between combinations
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          // Send completion message
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'complete',
            totalCombinations: uniqueCombinations.length,
            successful,
            failed,
            totalGenerated
          })}\n\n`));

        } catch (error) {
          console.error('Bulk generation error:', error);
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
    console.error('Error in bulk-generate-all-questions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});