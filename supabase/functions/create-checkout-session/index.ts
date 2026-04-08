// Supabase Edge Function: create-checkout-session
// Deploy with: supabase functions deploy create-checkout-session
//
// Required secrets (set via: supabase secrets set KEY=value):
//   STRIPE_SECRET_KEY      — your Stripe secret key (sk_live_... or sk_test_...)
//   STRIPE_PRICE_ID        — Stripe Price ID for the $120/year family plan
//   SITE_URL               — your frontend URL, e.g. https://your-app.com

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, email, plan } = await req.json();

    if (!user_id || !email) {
      return new Response(JSON.stringify({ error: "Missing user_id or email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:5173";
    const priceId = Deno.env.get("STRIPE_PRICE_ID");

    if (!priceId) {
      return new Response(JSON.stringify({ error: "STRIPE_PRICE_ID not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create or retrieve Stripe customer
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    let customer = existingCustomers.data[0];

    if (!customer) {
      customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: user_id },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/profile?checkout=success`,
      cancel_url: `${siteUrl}/profile?checkout=cancelled`,
      subscription_data: {
        metadata: { supabase_user_id: user_id },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Checkout session error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
