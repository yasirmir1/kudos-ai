import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify the webhook signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response("Webhook signature verification failed", { status: 400 });
    }

    logStep("Event received", { type: event.type, id: event.id });

    // Create Supabase client with service role for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription, supabase);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, supabase);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook handler", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleTrialWillEnd(subscription: Stripe.Subscription, supabase: any) {
  logStep("Handling trial will end", { subscriptionId: subscription.id });
  
  // Get customer email
  const customer = subscription.customer as string;
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
  const customerData = await stripe.customers.retrieve(customer);
  
  if ('email' in customerData && customerData.email) {
    logStep("Sending trial reminder email", { email: customerData.email });
    
    // Here you would integrate with your email service (Resend, etc.)
    // For now, we'll just log it and update the database
    
    // Update subscriber with trial ending notification
    await supabase.from("subscribers").update({
      trial_ending_notification_sent: true,
      updated_at: new Date().toISOString()
    }).eq('stripe_customer_id', customer);
    
    logStep("Trial reminder processed", { customerId: customer });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, supabase: any) {
  logStep("Handling subscription created", { subscriptionId: subscription.id });
  
  const customer = subscription.customer as string;
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
  const customerData = await stripe.customers.retrieve(customer);
  
  if ('email' in customerData && customerData.email) {
    await supabase.from("subscribers").upsert({
      email: customerData.email,
      stripe_customer_id: customer,
      subscribed: subscription.status === 'active' || subscription.status === 'trialing',
      subscription_tier: subscription.status === 'trialing' ? 'Trial' : 'Active',
      subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' });
    
    logStep("Subscription created in database", { email: customerData.email });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, supabase: any) {
  logStep("Handling subscription updated", { subscriptionId: subscription.id, status: subscription.status });
  
  const customer = subscription.customer as string;
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
  const customerData = await stripe.customers.retrieve(customer);
  
  if ('email' in customerData && customerData.email) {
    await supabase.from("subscribers").update({
      subscribed: subscription.status === 'active' || subscription.status === 'trialing',
      subscription_tier: subscription.status === 'trialing' ? 'Trial' : 'Active',
      subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }).eq('stripe_customer_id', customer);
    
    logStep("Subscription updated in database", { email: customerData.email, status: subscription.status });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, supabase: any) {
  logStep("Handling payment failed", { invoiceId: invoice.id });
  
  const customer = invoice.customer as string;
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
  const customerData = await stripe.customers.retrieve(customer);
  
  if ('email' in customerData && customerData.email) {
    await supabase.from("subscribers").update({
      subscribed: false,
      subscription_tier: 'Past Due',
      updated_at: new Date().toISOString()
    }).eq('stripe_customer_id', customer);
    
    logStep("Payment failure processed", { email: customerData.email });
  }
}