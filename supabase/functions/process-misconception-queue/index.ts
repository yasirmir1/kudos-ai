import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

    if (!openaiApiKey && !deepseekApiKey) {
      console.log('No AI API keys configured - running in optimization mode only');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Queue processor running in optimization mode' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get pending items from queue (batch process up to 10 items)
    const { data: queueItems, error: queueError } = await supabaseClient
      .from('bootcamp_misconception_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);

    if (queueError) {
      console.error('Error fetching queue items:', queueError);
      throw queueError;
    }

    if (!queueItems || queueItems.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        processed: 0,
        message: 'No items in queue' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${queueItems.length} queue items`);
    let processed = 0;
    let apiCalls = 0;
    let cacheHits = 0;

    // Process each item
    for (const item of queueItems) {
      try {
        // Mark as processing
        await supabaseClient
          .from('bootcamp_misconception_queue')
          .update({ status: 'processing' })
          .eq('id', item.id);

        // Check cache first
        const cacheKey = `${item.student_id}-${item.question_id}-${item.misconception_code}`;
        const { data: cachedResult } = await supabaseClient
          .from('bootcamp_explanation_cache')
          .select('explanation')
          .eq('cache_key', cacheKey)
          .maybeSingle();

        if (cachedResult) {
          console.log('Cache hit for:', cacheKey);
          cacheHits++;
          
          // Mark as completed
          await supabaseClient
            .from('bootcamp_misconception_queue')
            .update({ 
              status: 'completed',
              processed_at: new Date().toISOString()
            })
            .eq('id', item.id);
          
          processed++;
          continue;
        }

        // Generate explanation using AI (only if not cached)
        if (item.misconception_code && (deepseekApiKey || openaiApiKey)) {
          let explanation = '';
          
          try {
            // Try Deepseek first (cheaper)
            if (deepseekApiKey) {
              const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${deepseekApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'deepseek-chat',
                  messages: [
                    {
                      role: 'user',
                      content: `Explain this math misconception to a student: ${item.misconception_code}. 
                               Question: ${item.question_id}
                               Student answered: ${item.student_answer}
                               Correct answer: ${item.correct_answer}
                               
                               Provide a brief, encouraging explanation (max 100 words) that helps the student understand their mistake.`
                    }
                  ],
                  max_tokens: 150,
                  temperature: 0.7
                }),
              });

              if (deepseekResponse.ok) {
                const data = await deepseekResponse.json();
                explanation = data.choices[0]?.message?.content || '';
                apiCalls++;
              }
            }

            // Fallback to OpenAI if Deepseek failed
            if (!explanation && openaiApiKey) {
              const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${openaiApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: [
                    {
                      role: 'user',
                      content: `Explain this math misconception to a student: ${item.misconception_code}. 
                               Question: ${item.question_id}
                               Student answered: ${item.student_answer}
                               Correct answer: ${item.correct_answer}
                               
                               Provide a brief, encouraging explanation (max 100 words) that helps the student understand their mistake.`
                    }
                  ],
                  max_tokens: 150,
                  temperature: 0.7
                }),
              });

              if (openaiResponse.ok) {
                const data = await openaiResponse.json();
                explanation = data.choices[0]?.message?.content || '';
                apiCalls++;
              }
            }

            // Cache the explanation
            if (explanation) {
              await supabaseClient
                .from('bootcamp_explanation_cache')
                .upsert({
                  cache_key: cacheKey,
                  explanation: explanation.trim(),
                  api_source: deepseekApiKey ? 'deepseek' : 'openai',
                  usage_count: 1,
                });
            }

          } catch (apiError) {
            console.error('API call failed:', apiError);
          }
        }

        // Mark as completed
        await supabaseClient
          .from('bootcamp_misconception_queue')
          .update({ 
            status: 'completed',
            processed_at: new Date().toISOString()
          })
          .eq('id', item.id);

        processed++;

      } catch (itemError) {
        console.error(`Error processing item ${item.id}:`, itemError);
        
        // Mark as failed and increment retry count
        await supabaseClient
          .from('bootcamp_misconception_queue')
          .update({ 
            status: 'failed',
            retry_count: item.retry_count + 1
          })
          .eq('id', item.id);
      }
    }

    // Clean up old completed items (older than 7 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);
    
    await supabaseClient
      .from('bootcamp_misconception_queue')
      .delete()
      .eq('status', 'completed')
      .lt('processed_at', cutoffDate.toISOString());

    console.log(`Batch processing complete: ${processed} processed, ${apiCalls} API calls, ${cacheHits} cache hits`);

    return new Response(JSON.stringify({ 
      success: true, 
      processed,
      apiCalls,
      cacheHits,
      optimizationRate: cacheHits > 0 ? Math.round((cacheHits / (apiCalls + cacheHits)) * 100) : 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-misconception-queue function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});