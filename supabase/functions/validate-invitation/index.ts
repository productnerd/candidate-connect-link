import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ValidateInvitationRequest {
  token: string;
}

interface InvitationResponse {
  id: string;
  test_id: string;
  candidate_name: string | null;
  candidate_email: string;
  company_name: string | null;
  company_logo_url: string | null;
  inviter_name: string | null;
  expires_at: string;
  status: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received validate-invitation request");

    const { token }: ValidateInvitationRequest = await req.json();

    // Validate token format
    if (!token || typeof token !== 'string' || token.length < 16) {
      return new Response(
        JSON.stringify({ error: "Invalid invitation token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch invitation by token - only return safe fields
    const { data: invitation, error: invError } = await supabase
      .from('test_invitations')
      .select('id, test_id, candidate_name, candidate_email, company_name, company_logo_url, inviter_name, expires_at, status')
      .eq('invitation_token', token)
      .maybeSingle();

    if (invError) {
      console.error("Error fetching invitation:", invError);
      return new Response(
        JSON.stringify({ error: "Failed to validate invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!invitation) {
      return new Response(
        JSON.stringify({ error: "Invitation not found or has been revoked" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Fetch test details
    const { data: testData, error: testError } = await supabase
      .from('test_library')
      .select('id, name, description, duration_minutes, question_count, category, difficulty_level, requires_proctoring')
      .eq('id', invitation.test_id)
      .single();

    if (testError) {
      console.error("Error fetching test:", testError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch test details" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return safe invitation and test data (no sensitive tokens exposed)
    const response: InvitationResponse = {
      id: invitation.id,
      test_id: invitation.test_id,
      candidate_name: invitation.candidate_name,
      candidate_email: invitation.candidate_email,
      company_name: invitation.company_name,
      company_logo_url: invitation.company_logo_url,
      inviter_name: invitation.inviter_name,
      expires_at: invitation.expires_at,
      status: invitation.status,
    };

    return new Response(
      JSON.stringify({ 
        invitation: response,
        test: testData 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in validate-invitation function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while validating the invitation" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
