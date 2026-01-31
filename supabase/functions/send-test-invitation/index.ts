import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface InvitationEmailRequest {
  candidateEmail: string;
  candidateName: string;
  testName: string;
  inviterName: string;
  companyName: string;
  invitationToken: string;
  expiresAt: string;
  baseUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received send-test-invitation request");

    // Verify JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Token verification failed:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated:", claimsData.claims.sub);

    const {
      candidateEmail,
      candidateName,
      testName,
      inviterName,
      companyName,
      invitationToken,
      expiresAt,
      baseUrl,
    }: InvitationEmailRequest = await req.json();

    // Validate required fields
    if (!candidateEmail || !candidateName || !testName || !invitationToken || !baseUrl) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const testUrl = `${baseUrl}/test/${invitationToken}`;
    const expirationDate = new Date(expiresAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    console.log("Sending email to:", candidateEmail);

    const emailResponse = await resend.emails.send({
      from: "Assessments <onboarding@resend.dev>",
      to: [candidateEmail],
      subject: `${inviterName || "A recruiter"} invited you to take an assessment`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
                You're Invited!
              </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <p style="color: #27272a; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Hi ${candidateName},
              </p>
              
              <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                ${inviterName ? `<strong>${inviterName}</strong>` : "A recruiter"}${companyName ? ` from <strong>${companyName}</strong>` : ""} has invited you to complete an assessment as part of their hiring process.
              </p>
              
              <!-- Test Info Box -->
              <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px;">
                  Assessment
                </p>
                <p style="color: #27272a; font-size: 18px; font-weight: 600; margin: 0;">
                  ${testName}
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${testUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Start Assessment
                </a>
              </div>
              
              <p style="color: #71717a; font-size: 13px; text-align: center; margin: 0 0 16px;">
                This invitation expires on <strong>${expirationDate}</strong>
              </p>
              
              <!-- Link fallback -->
              <div style="border-top: 1px solid #e4e4e7; padding-top: 20px; margin-top: 24px;">
                <p style="color: #71717a; font-size: 12px; margin: 0 0 8px;">
                  If the button doesn't work, copy and paste this link:
                </p>
                <p style="color: #6366f1; font-size: 12px; word-break: break-all; margin: 0;">
                  ${testUrl}
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #fafafa; padding: 20px 32px; border-top: 1px solid #e4e4e7;">
              <p style="color: #a1a1aa; font-size: 12px; text-align: center; margin: 0;">
                This is an automated message. Please do not reply directly to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-test-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
