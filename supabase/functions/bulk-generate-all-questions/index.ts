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
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!PERPLEXITY_API_KEY && !OPENAI_API_KEY) {
      throw new Error('No AI API keys available');
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

    console.log(`Found ${uniqueCombinations.length} unique combinations to generate questions for`);

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
              const yearGuidance = getYearLevelGuidance(age_group || 'year 4-5');
              
              const prompt = `You are an expert educational content creator. Generate ${questionsPerCombination} high-quality multiple choice questions for mathematics education that match the EXACT curriculum table schema.

TOPIC: ${topic}
SUBTOPIC: ${subtopic}  
DIFFICULTY: ${difficulty}
AGE GROUP: ${age_group || 'year 4-5'}

YEAR LEVEL PROGRESSION GUIDE:
${Object.entries(yearGuidance.progression).map(([year, description]) => `${year}: ${description}`).join('\n')}

Generate questions across BOTH year levels: ${yearGuidance.yearLevels.join(' and ')}

CRITICAL: Generate JSON that matches the EXACT curriculum table schema:

{
  "question_id": "TEMP_ID",
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
  "red_herring_tag": ["MisconceptionType_SpecificError"],
  "red_herring_explanation": "Explanation of why students might choose wrong answers",
  "pedagogical_notes": "Year X: Brief teaching context and methodology.",
  "year_level": 2,
  "age_group": "${age_group || 'year 4-5'}"
}

CRITICAL REQUIREMENTS:
1. Generate questions for BOTH year levels: ${yearGuidance.yearLevels.join(' and ')}
2. Use appropriate mathematical complexity for each year
3. Include realistic misconceptions specific to each year level
4. pedagogical_notes must start with "Year X:" matching the complexity level

topic: EXACTLY "${topic}"
subtopic: EXACTLY "${subtopic}"
question_type: EXACTLY "Multiple Choice" 
difficulty: EXACTLY "${difficulty}"

Generate ${questionsPerCombination} questions as a JSON array. Ensure mathematical accuracy and year-appropriate progression.

RESPOND WITH ONLY THE JSON ARRAY, NO OTHER TEXT.`;

              let apiResponse;
              let apiUsed = '';

              // Try Perplexity first since user has credits
              if (PERPLEXITY_API_KEY) {
                try {
                  console.log(`Using Perplexity for ${topic} - ${subtopic} (${difficulty})`);
                  
                  apiResponse = await fetch('https://api.perplexity.ai/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      model: 'llama-3.1-sonar-small-128k-online',
                      messages: [
                        {
                          role: 'user',
                          content: prompt
                        }
                      ],
                      max_tokens: 2000,
                      temperature: 0.2,
                      top_p: 0.9,
                      return_images: false,
                      return_related_questions: false,
                      search_recency_filter: "month",
                      presence_penalty: 0,
                      frequency_penalty: 1
                    }),
                  });
                  
                  if (apiResponse.ok) {
                    apiUsed = 'perplexity';
                  } else {
                    const errorText = await apiResponse.text();
                    console.error(`Perplexity API error ${apiResponse.status}:`, errorText);
                    throw new Error(`Perplexity API error: ${apiResponse.status}`);
                  }
                } catch (perplexityError) {
                  console.log('Perplexity failed, trying OpenAI...', perplexityError.message);
                }
              }

              // Fallback to OpenAI if Perplexity fails
              if (!apiResponse?.ok && OPENAI_API_KEY) {
                try {
                  console.log('Using OpenAI as fallback...');
                  
                  apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${OPENAI_API_KEY}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      model: 'gpt-4o-mini',
                      messages: [
                        {
                          role: 'system',
                          content: 'You are an expert educational content creator. Generate only valid JSON arrays for educational questions. Always respond with properly formatted JSON only, no additional text.'
                        },
                        {
                          role: 'user',
                          content: prompt
                        }
                      ],
                      max_tokens: 3000,
                      temperature: 0.3
                    }),
                  });
                  
                  if (apiResponse.ok) {
                    apiUsed = 'openai';
                  }
                } catch (openaiError) {
                  console.error('OpenAI failed:', openaiError.message);
                }
              }

              if (!apiResponse?.ok) {
                throw new Error('All AI services failed');
              }

              const data = await apiResponse.json();
              let generatedContent = data.choices[0].message.content;

              console.log(`Generated content for ${topic} - ${subtopic}:`, generatedContent.substring(0, 200) + '...');

              // Parse and validate the generated questions
              let questions;
              try {
                // Enhanced JSON cleaning
                let cleanContent = generatedContent.trim();
                
                // Remove markdown code blocks
                cleanContent = cleanContent.replace(/```json\n?|\n?```/g, '');
                
                // Remove any leading/trailing text that's not JSON
                const jsonStart = cleanContent.indexOf('[');
                const jsonEnd = cleanContent.lastIndexOf(']');
                
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                  cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
                }
                
                // Fix common JSON issues
                cleanContent = cleanContent
                  .replace(/,\s*}/g, '}')  // Remove trailing commas in objects
                  .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
                  .replace(/'/g, '"')      // Replace single quotes with double quotes
                  .replace(/\n/g, ' ')     // Replace newlines with spaces
                  .replace(/\s+/g, ' ')    // Replace multiple spaces with single space
                  .trim();
                
                const parsed = JSON.parse(cleanContent);
                questions = Array.isArray(parsed) ? parsed : parsed.questions || [parsed];
                
                if (!Array.isArray(questions) || questions.length === 0) {
                  throw new Error('No valid questions found in response');
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
                const requiredFields = ['topic', 'subtopic', 'example_question', 'options', 'correct_answer', 'difficulty'];
                const missingFields = requiredFields.filter(field => !question[field]);
                
                if (missingFields.length > 0) {
                  console.error(`Question ${j + 1} missing fields:`, missingFields);
                  continue;
                }

                // Validate that correct_answer is in options
                if (!question.options.includes(question.correct_answer)) {
                  console.error(`Question ${j + 1}: correct_answer not in options`);
                  continue;
                }

                // Determine year level for this question
                let questionYearLevel = '';
                let numericYearLevel = 4; // default
                
                if (question.pedagogical_notes && question.pedagogical_notes.match(/Year \d/)) {
                  const match = question.pedagogical_notes.match(/Year (\d)/);
                  if (match) {
                    questionYearLevel = `Y${match[1]}`;
                    numericYearLevel = parseInt(match[1]);
                  }
                } else {
                  // Fallback: alternate between year levels
                  const yearGuidance = getYearLevelGuidance(age_group || 'year 4-5');
                  if (yearGuidance.yearLevels.length > 1) {
                    const yearIndex = j < Math.ceil(questions.length/2) ? 0 : 1;
                    const selectedYear = yearGuidance.yearLevels[yearIndex];
                    questionYearLevel = `Y${selectedYear.replace('Year ', '')}`;
                    numericYearLevel = parseInt(selectedYear.replace('Year ', ''));
                  } else {
                    questionYearLevel = getTopicPrefix(topic, age_group).substring(0, 2);
                    numericYearLevel = parseInt(questionYearLevel.substring(1));
                  }
                }
                
                // Generate topic prefix with correct year level
                const topicSuffix = getTopicPrefix(topic, age_group).substring(2);
                const questionPrefix = questionYearLevel + topicSuffix;
                
                // Generate unique question ID
                const timestamp = Date.now().toString().slice(-6);
                const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                question.question_id = `${questionPrefix}${timestamp}${randomSuffix}`;
                
                // Ensure all schema fields are properly formatted
                question.year_level = numericYearLevel;
                question.age_group = age_group || 'year 4-5';
                question.question_type = question.question_type || 'Multiple Choice';
                
                // Handle arrays and nulls properly
                if (!question.red_herring_tag || !Array.isArray(question.red_herring_tag)) {
                  question.red_herring_tag = null;
                }
                if (!question.red_herring_explanation || question.red_herring_explanation.trim() === '') {
                  question.red_herring_explanation = null;
                }
                if (!question.pedagogical_notes || question.pedagogical_notes.trim() === '') {
                  question.pedagogical_notes = null;
                }

                // Save to database
                try {
                  const { error: insertError } = await supabase
                    .from('curriculum')
                    .insert(question);

                  if (insertError) {
                    if (insertError.code === '23505') { // Unique violation
                      // Generate a new ID and retry once
                      const newTimestamp = Date.now().toString().slice(-6);
                      const newRandomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                      question.question_id = `${questionPrefix}${newTimestamp}${newRandomSuffix}`;
                      
                      const { error: retryError } = await supabase
                        .from('curriculum')
                        .insert(question);
                      
                      if (!retryError) {
                        combinationGenerated++;
                        totalGenerated++;
                        console.log(`✓ Question saved after retry: ${question.question_id}`);
                      }
                    }
                  } else {
                    combinationGenerated++;
                    totalGenerated++;
                    console.log(`✓ Question saved: ${question.question_id}`);
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

            // Small delay between combinations to be respectful
            await new Promise(resolve => setTimeout(resolve, 500));
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