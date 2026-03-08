import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Price IDs for different products
const PRICE_IDS = {
  // Candidate unlimited bundle
  candidate_unlimited: "price_1SvinsLTUhE4HGAACkIsHpfJ",
  // Employer bundles
  employer_30: "price_1Svio7LTUhE4HGAAKEtoEmyC",
  employer_100: "price_1SvioMLTUhE4HGAAbC9Lhl6d",
  employer_500: "price_1SvioVLTUhE4HGAAKPZamoy7",
};

// Bundle display names
const BUNDLE_NAMES: Record<string, string> = {
  candidate_unlimited: "Unlimited Practice Tests",
  employer_30: "30 Test Bundle",
  employer_100: "100 Test Bundle",
  employer_500: "500 Test Bundle",
};

// Bundle prices for email
const BUNDLE_PRICES: Record<string, string> = {
  candidate_unlimited: "€14",
  employer_30: "€9",
  employer_100: "€29",
  employer_500: "€79",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { bundle_type } = await req.json();
    
    console.log("Creating checkout session for bundle:", bundle_type);

    // Get the price ID based on bundle type
    const priceId = PRICE_IDS[bundle_type as keyof typeof PRICE_IDS];
    if (!priceId) {
      throw new Error(`Invalid bundle type: ${bundle_type}`);
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Try to get authenticated user (optional - supports guest checkout)
    let userEmail: string | undefined;
    let customerId: string | undefined;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      userEmail = data.user?.email;
      
      if (userEmail) {
        // Check if a Stripe customer record exists for this user
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        }
      }
    }

    // Determine success/cancel URLs based on bundle type
    const origin = req.headers.get("origin") || "https://productnerd.github.io";
    
    const isEmployer = bundle_type.startsWith("employer_");
    
    // Success URL: Employers go to payment-success for signup, Candidates go to dashboard
    const successUrl = isEmployer
      ? `${origin}/payment-success?bundle_type=${bundle_type}&session_id={CHECKOUT_SESSION_ID}`
      : `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    
    const cancelUrl = isEmployer
      ? `${origin}/employer?payment=cancelled`
      : `${origin}/dashboard?payment=cancelled`;

    // Get product metadata for the session
    const bundleDescriptions: Record<string, { name: string; tests?: number }> = {
      candidate_unlimited: { name: "Unlimited Practice Tests" },
      employer_30: { name: "Starter Bundle", tests: 30 },
      employer_100: { name: "Pro Bundle", tests: 100 },
      employer_500: { name: "Enterprise Bundle", tests: 500 },
    };

    const bundleInfo = bundleDescriptions[bundle_type] || { name: "Test Bundle" };

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        bundle_type,
        tests: bundleInfo.tests?.toString() || "unlimited",
      },
      // Enable email collection for guest checkout
      customer_creation: customerId ? undefined : "always",
    });

    console.log("Checkout session created:", session.id);

    // Send confirmation email in the background after successful session creation
    // Note: This is a pre-payment email. For post-payment email, we'd need a webhook
    // But we can send the email with signup link after payment via the success page

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});