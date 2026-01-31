import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface StartTestRequest {
  token: string;
  invitationId: string;
  testId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received start-invited-test request");

    const { token, invitationId, testId }: StartTestRequest = await req.json();

    // Validate inputs
    if (!token || typeof token !== 'string' || token.length < 16) {
      return new Response(
        JSON.stringify({ error: "Invalid invitation token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!invitationId || !testId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the token matches the invitation
    const { data: invitation, error: invError } = await supabase
      .from('test_invitations')
      .select('id, test_id, expires_at, status')
      .eq('invitation_token', token)
      .eq('id', invitationId)
      .maybeSingle();

    if (invError || !invitation) {
      console.error("Invalid token/invitation combination");
      return new Response(
        JSON.stringify({ error: "Invalid invitation" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify test_id matches
    if (invitation.test_id !== testId) {
      return new Response(
        JSON.stringify({ error: "Test ID mismatch" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "This invitation has expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already completed
    if (invitation.status === 'completed') {
      return new Response(
        JSON.stringify({ error: "This test has already been completed" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch test details for duration
    const { data: test, error: testError } = await supabase
      .from('test_library')
      .select('duration_minutes, requires_proctoring')
      .eq('id', testId)
      .single();

    if (testError || !test) {
      console.error("Error fetching test:", testError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch test details" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a test session
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .insert({
        test_id: testId,
        invitation_id: invitationId,
        candidate_id: null, // Anonymous
        session_type: 'invited',
        status: 'in_progress',
        time_remaining_seconds: test.duration_minutes * 60,
        proctoring_enabled: test.requires_proctoring,
      })
      .select('id')
      .single();

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      return new Response(
        JSON.stringify({ error: "Failed to create test session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('test_invitations')
      .update({ 
        status: 'started',
        started_at: new Date().toISOString()
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error("Error updating invitation:", updateError);
      // Don't fail - session was created successfully
    }

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        success: true 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in start-invited-test function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while starting the test" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
