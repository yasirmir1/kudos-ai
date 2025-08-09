import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT-PUBLIC] ${step}${detailsStr}`);
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
    logStep("Stripe key verified");

    const { email, planId, trial = false } = await req.json();
    
    if (!email || !planId) {
      throw new Error("Email and planId are required");
    }

    logStep("Request data validated", { email, planId, trial });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists, if not create one
    let customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Define plan pricing
    const planPricing: Record<string, string> = {
      "pass_monthly": "price_1RsWc6PE5mUXGgJ8wY9F8AJN",
      "pass_annual": "price_1RsWc6PE5mUXGgJ8RL9nJOgZ", 
      "pass_plus_monthly": "price_1RsWeuPE5mUXGgJ8TBgTmjS3",
      "pass_plus_annual": "price_1RsWeuPE5mUXGgJ8mI0HZQXR"
    };

    const priceId = planPricing[planId];
    if (!priceId) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    logStep("Price ID resolved", { planId, priceId });

    const origin = req.headers.get("origin") || "https://a0d30717-dd82-4a84-923f-7334f035b238.lovableproject.com";

    // Create checkout session
    const sessionParams: any = {
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/pricing?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
    };

    // Add trial if requested
    if (trial) {
      sessionParams.subscription_data = {
        trial_period_days: 7,
      };
      logStep("Trial period added", { trialDays: 7 });
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(
      JSON.stringify({ url: session.url }),
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