import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("Missing session_id");
    }

    console.log("Verifying payment session:", session_id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("CCAT_STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Get customer email
    let customerEmail = session.customer_email;
    
    // If no direct email, try to get from customer object
    if (!customerEmail && session.customer) {
      const customer = await stripe.customers.retrieve(session.customer as string);
      if (customer && !customer.deleted && 'email' in customer) {
        customerEmail = customer.email;
      }
    }

    console.log("Payment verified for:", customerEmail);

    // For candidate bundles, create a test_bundles record to track premium access
    const bundleType = session.metadata?.bundle_type;
    if (bundleType === 'candidate_unlimited' && customerEmail) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Look up the user by email
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        u => u.email?.toLowerCase() === customerEmail.toLowerCase()
      );

      if (existingUser) {
        // Get or create an org for the candidate (they need one for test_bundles)
        // For candidates, we'll create a personal "org" with their user ID
        let orgId: string | null = null;
        
        // Check if user has a profile with org
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', existingUser.id)
          .single();
        
        if (profile?.organization_id) {
          orgId = profile.organization_id;
        } else {
          // Create a personal org for the candidate
          const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({
              name: `${customerEmail}'s Account`,
              slug: `candidate-${existingUser.id}`,
            })
            .select('id')
            .single();
          
          if (!orgError && newOrg) {
            orgId = newOrg.id;
            // Update profile with org
            await supabase
              .from('profiles')
              .update({ organization_id: orgId })
              .eq('id', existingUser.id);
          }
        }

        if (orgId) {
          // Create the bundle record
          const { error: bundleError } = await supabase
            .from('test_bundles')
            .insert({
              organization_id: orgId,
              bundle_type: 'starter', // Using starter as a placeholder for unlimited
              tests_purchased: 9999,
              tests_remaining: 9999,
              amount_paid: 1400, // €14 in cents
              stripe_payment_id: session.id,
            });

          if (bundleError) {
            console.error("Error creating bundle record:", bundleError);
          } else {
            console.log("Created bundle record for candidate:", customerEmail);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        email: customerEmail,
        bundle_type: session.metadata?.bundle_type,
        payment_status: session.payment_status,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});