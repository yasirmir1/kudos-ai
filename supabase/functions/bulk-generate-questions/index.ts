import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { questionsPerType = 100 } = await req.json();

    console.log('Starting bulk question generation...');

    // Get all unique topic/subtopic/difficulty combinations
    const { data: combinations, error: combinationsError } = await supabaseClient
      .from('curriculum')
      .select('topic, subtopic, difficulty')
      .limit(1000);

    if (combinationsError) {
      throw new Error(`Failed to fetch combinations: ${combinationsError.message}`);
    }

    // Get unique combinations
    const uniqueCombinations = Array.from(
      new Set(
        combinations?.map(c => `${c.topic}|${c.subtopic}|${c.difficulty}`)
      )
    ).map(combo => {
      const [topic, subtopic, difficulty] = combo.split('|');
      return { topic, subtopic, difficulty };
    });

    console.log(`Found ${uniqueCombinations.length} unique combinations`);

    const generationResults = [];

    // Generate questions for each combination
    for (const combination of uniqueCombinations) {
      try {
        console.log(`Generating ${questionsPerType} questions for ${combination.topic} - ${combination.subtopic} (${combination.difficulty})`);

        // Call the existing generate-questions function
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            topic: combination.topic,
            subtopic: combination.subtopic,
            difficulty: combination.difficulty,
            count: questionsPerType,
            saveToDatabase: true
          }),
        });

        if (response.ok) {
          generationResults.push({
            ...combination,
            status: 'success',
            count: questionsPerType
          });
          console.log(`✓ Generated ${questionsPerType} questions for ${combination.topic} - ${combination.subtopic} (${combination.difficulty})`);
        } else {
          const errorText = await response.text();
          generationResults.push({
            ...combination,
            status: 'error',
            error: errorText
          });
          console.error(`✗ Failed to generate questions for ${combination.topic} - ${combination.subtopic} (${combination.difficulty}): ${errorText}`);
        }

        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        generationResults.push({
          ...combination,
          status: 'error',
          error: error.message
        });
        console.error(`✗ Exception generating questions for ${combination.topic} - ${combination.subtopic} (${combination.difficulty}):`, error);
      }
    }

    const successCount = generationResults.filter(r => r.status === 'success').length;
    const failureCount = generationResults.filter(r => r.status === 'error').length;

    console.log(`Bulk generation complete: ${successCount} successful, ${failureCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      summary: {
        totalCombinations: uniqueCombinations.length,
        successful: successCount,
        failed: failureCount,
        questionsPerType
      },
      results: generationResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bulk-generate-questions function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});