import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    console.log('Testing Perplexity API key...');
    console.log('API key exists:', !!PERPLEXITY_API_KEY);
    console.log('API key length:', PERPLEXITY_API_KEY?.length || 0);
    console.log('API key starts with:', PERPLEXITY_API_KEY?.substring(0, 10) + '...' || 'No key');

    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not found in environment');
    }

    // Simple test call to Perplexity with correct model name
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
            role: 'user',
            content: 'Say "Hello World" in a friendly way!'
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      }),
    });

    console.log('Perplexity API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error response:', errorText);
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Perplexity API success! Response:', data);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Perplexity API key is working!',
      response: data.choices[0].message.content,
      status: response.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Test failed:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: 'Check edge function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});