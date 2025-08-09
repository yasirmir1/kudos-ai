import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-TRIAL-ELIGIBILITY] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    logStep("Checking eligibility for email", { email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No existing customer - eligible for trial");
      return new Response(
        JSON.stringify({ eligible: true, reason: "new_customer" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const customerId = customers.data[0].id;
    logStep("Customer found", { customerId });

    // Check if customer has had any subscriptions (including trials)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100, // Check all subscriptions
    });

    const hasHadTrial = subscriptions.data.some(sub => 
      sub.trial_start !== null || sub.status === 'trialing'
    );

    const hasHadSubscription = subscriptions.data.length > 0;

    logStep("Subscription history checked", { 
      hasHadTrial, 
      hasHadSubscription,
      subscriptionCount: subscriptions.data.length 
    });

    const eligible = !hasHadTrial && !hasHadSubscription;
    const reason = hasHadTrial ? "trial_used" : hasHadSubscription ? "existing_subscriber" : "eligible";

    return new Response(
      JSON.stringify({ 
        eligible, 
        reason,
        hasHadTrial,
        hasHadSubscription 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});