import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Bundle display info
const BUNDLE_INFO: Record<string, { name: string; description: string }> = {
  candidate_unlimited: { 
    name: "Unlimited Practice Tests", 
    description: "Get unlimited access to all practice tests and detailed analytics."
  },
  employer_30: { 
    name: "30 Test Bundle", 
    description: "Send up to 30 cognitive aptitude tests to your candidates."
  },
  employer_100: { 
    name: "100 Test Bundle", 
    description: "Send up to 100 cognitive aptitude tests to your candidates."
  },
  employer_500: { 
    name: "500 Test Bundle", 
    description: "Send up to 500 cognitive aptitude tests to your candidates."
  },
};

interface EmailRequest {
  email: string;
  bundle_type: string;
  signup_url: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, bundle_type, signup_url }: EmailRequest = await req.json();

    if (!email || !bundle_type) {
      throw new Error("Missing required fields: email and bundle_type");
    }

    console.log(`Sending confirmation email to ${email} for bundle ${bundle_type}`);

    const bundleInfo = BUNDLE_INFO[bundle_type] || { 
      name: "Test Bundle", 
      description: "Access to CCAT Platform assessments." 
    };

    const isEmployer = bundle_type.startsWith("employer_");
    const userType = isEmployer ? "employer" : "candidate";

    const emailResponse = await resend.emails.send({
      from: "CCAT Platform <noreply@resend.dev>",
      to: [email],
      subject: `Welcome to CCAT Platform - ${bundleInfo.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to CCAT Platform</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f1eb;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f5f1eb;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #c4a87c 0%, #b09060 100%); border-radius: 16px 16px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🎉 Payment Successful!</h1>
                      <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Thank you for your purchase</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 10px; color: #1a1512; font-size: 22px; font-weight: 600;">${bundleInfo.name}</h2>
                      <p style="margin: 0 0 30px; color: #6b5e4d; font-size: 16px; line-height: 1.6;">${bundleInfo.description}</p>
                      
                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${signup_url}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #c4a87c 0%, #b09060 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                          Complete Your Account
                        </a>
                      </div>
                      
                      <p style="margin: 30px 0 0; color: #6b5e4d; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:
                      </p>
                      <p style="margin: 10px 0 0; word-break: break-all; color: #c4a87c; font-size: 14px;">
                        ${signup_url}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f9f7f4; border-radius: 0 0 16px 16px; text-align: center;">
                      <p style="margin: 0; color: #8b7e6e; font-size: 14px;">
                        © 2026 CCAT Platform. All rights reserved.
                      </p>
                      <p style="margin: 10px 0 0; color: #a89b8b; font-size: 12px;">
                        You received this email because you purchased a bundle on CCAT Platform.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending confirmation email:", error);
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