import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient as createAdminClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BasicInvitationEmailRequest {
  candidateEmail: string;
  candidateName: string;
  testName: string;
  inviterName: string;
  inviterEmail: string;
  companyName: string;
  invitationToken: string;
  expiresAt: string;
  baseUrl: string;
}

// Input validation function
function validateInput(data: BasicInvitationEmailRequest): string | null {
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Validate email formats
  if (!data.candidateEmail || !emailRegex.test(data.candidateEmail)) {
    return 'Invalid candidate email format';
  }
  if (!data.inviterEmail || !emailRegex.test(data.inviterEmail)) {
    return 'Invalid inviter email format';
  }

  // Block "+" in emails
  if (data.candidateEmail.includes('+') || data.inviterEmail.includes('+')) {
    return 'Email addresses with "+" are not allowed';
  }
  
  // Length validation for names (2-100 characters)
  if (!data.candidateName || data.candidateName.length < 2 || data.candidateName.length > 100) {
    return 'Candidate name must be 2-100 characters';
  }
  if (!data.inviterName || data.inviterName.length < 2 || data.inviterName.length > 100) {
    return 'Inviter name must be 2-100 characters';
  }
  
  // Company name validation (2-200 characters)
  if (!data.companyName || data.companyName.length < 2 || data.companyName.length > 200) {
    return 'Company name must be 2-200 characters';
  }
  
  // Test name validation
  if (!data.testName || data.testName.length < 1 || data.testName.length > 200) {
    return 'Test name must be 1-200 characters';
  }
  
  // Token validation
  if (!data.invitationToken || data.invitationToken.length < 16) {
    return 'Invalid invitation token';
  }
  
  // Base URL validation
  if (!data.baseUrl) {
    return 'Base URL is required';
  }
  
  // Check for suspicious patterns (HTML/script injection)
  const suspiciousPatterns = /<script|<iframe|javascript:|on\w+=/i;
  if (suspiciousPatterns.test(data.candidateName) || 
      suspiciousPatterns.test(data.inviterName) || 
      suspiciousPatterns.test(data.companyName)) {
    return 'Invalid characters detected in input';
  }
  
  return null;
}

// Sanitize string to prevent XSS
function sanitizeString(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received send-basic-test-invitation request");

    const requestData: BasicInvitationEmailRequest = await req.json();

    // Server-side input validation
    const validationError = validateInput(requestData);
    if (validationError) {
      console.error("Validation error:", validationError);
      return new Response(
        JSON.stringify({ error: validationError }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      candidateEmail,
      candidateName,
      testName,
      inviterName,
      inviterEmail,
      companyName,
      invitationToken,
      expiresAt,
      baseUrl,
    } = requestData;

    // Initialize Supabase client for rate limit checks
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check daily sender limit (3 tests per day)
    const { data: canSend, error: limitError } = await supabase.rpc('check_sender_daily_limit', {
      sender_email: inviterEmail.toLowerCase().trim()
    });

    if (limitError) {
      console.error("Error checking sender limit:", limitError);
      return new Response(
        JSON.stringify({ error: "Unable to verify sender limits" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!canSend) {
      console.log("Sender daily limit reached:", inviterEmail);
      return new Response(
        JSON.stringify({ error: "Daily limit reached (3 tests per day). Please try again tomorrow." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check per-sender total limit (10 invites per email, regardless of domain)
    const { data: senderCanSend, error: senderTotalError } = await supabase.rpc('check_sender_total_limit', {
      sender_email: inviterEmail.toLowerCase().trim()
    });

    if (senderTotalError) {
      console.error("Error checking sender total limit:", senderTotalError);
      return new Response(
        JSON.stringify({ error: "Unable to verify sender limits" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!senderCanSend) {
      console.log("Sender total limit reached:", inviterEmail);
      return new Response(
        JSON.stringify({ error: "You have reached the maximum number of free invitations (10). Please purchase a bundle to continue sending assessments." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check domain invite limit (10 total per domain for unpaid users)
    const { data: domainCanSend, error: domainError } = await supabase.rpc('check_domain_invite_limit', {
      sender_email: inviterEmail.toLowerCase().trim()
    });

    if (domainError) {
      console.error("Error checking domain limit:", domainError);
      return new Response(
        JSON.stringify({ error: "Unable to verify domain limits" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!domainCanSend) {
      console.log("Domain invite limit reached:", inviterEmail);
      return new Response(
        JSON.stringify({ error: "DOMAIN_LIMIT_REACHED", message: "Your organization has reached the free invite limit (10). Please purchase a bundle to continue sending assessments." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check candidate cooldown (30 days between invites to same candidate from same sender)
    const { data: noCooldown, error: cooldownError } = await supabase.rpc('check_candidate_cooldown', {
      sender_email: inviterEmail.toLowerCase().trim(),
      recipient_email: candidateEmail.toLowerCase().trim()
    });

    if (cooldownError) {
      console.error("Error checking cooldown:", cooldownError);
      return new Response(
        JSON.stringify({ error: "Unable to verify candidate cooldown" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!noCooldown) {
      console.log("Candidate cooldown active:", candidateEmail);
      return new Response(
        JSON.stringify({ error: "This candidate was already invited recently. Please wait 30 days before sending another invitation." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs for HTML email
    const safeCandidateName = sanitizeString(candidateName.trim());
    const safeInviterName = sanitizeString(inviterName.trim());
    const safeCompanyName = sanitizeString(companyName.trim());
    const safeTestName = sanitizeString(testName);

    const testUrl = `${baseUrl}/test/${invitationToken}`;
    const expirationDate = new Date(expiresAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    console.log("Sending invitation email to candidate:", candidateEmail);

    // Send email to candidate
    const candidateEmailResponse = await resend.emails.send({
      from: "Assessments <onboarding@resend.dev>",
      to: [candidateEmail],
      subject: `${safeInviterName} from ${safeCompanyName} invited you to take an assessment`,
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
                Hi ${safeCandidateName},
              </p>
              
              <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                <strong>${safeInviterName}</strong> from <strong>${safeCompanyName}</strong> has invited you to complete an assessment as part of their hiring process.
              </p>
              
              <!-- Test Info Box -->
              <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px;">
                  Assessment
                </p>
                <p style="color: #27272a; font-size: 18px; font-weight: 600; margin: 0;">
                  ${safeTestName}
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

    console.log("Candidate email sent:", candidateEmailResponse);

    // Send confirmation email to the inviter
    const inviterEmailResponse = await resend.emails.send({
      from: "Assessments <onboarding@resend.dev>",
      to: [inviterEmail],
      subject: `Test invitation sent to ${safeCandidateName}`,
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
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
                ✓ Invitation Sent!
              </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 32px;">
              <p style="color: #27272a; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
                Hi ${safeInviterName},
              </p>
              
              <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Your test invitation has been sent successfully. Here are the details:
              </p>
              
              <!-- Details Box -->
              <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <div style="margin-bottom: 12px;">
                  <p style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px;">Candidate</p>
                  <p style="color: #27272a; font-size: 15px; font-weight: 500; margin: 0;">${safeCandidateName}</p>
                </div>
                <div style="margin-bottom: 12px;">
                  <p style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px;">Assessment</p>
                  <p style="color: #27272a; font-size: 15px; font-weight: 500; margin: 0;">${safeTestName}</p>
                </div>
                <div>
                  <p style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px;">Expires</p>
                  <p style="color: #27272a; font-size: 15px; font-weight: 500; margin: 0;">${expirationDate}</p>
                </div>
              </div>
              
              <p style="color: #52525b; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                <strong>What happens next?</strong><br>
                You'll receive another email with the candidate's results once they complete the assessment.
              </p>
              
              <!-- Link fallback -->
              <div style="border-top: 1px solid #e4e4e7; padding-top: 20px; margin-top: 24px;">
                <p style="color: #71717a; font-size: 12px; margin: 0 0 8px;">
                  You can also share this direct link with the candidate:
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

    console.log("Inviter confirmation email sent:", inviterEmailResponse);

    // Initialize admin client for account creation
    const adminClient = createAdminClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get list of existing users
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();

    // Auto-create EMPLOYER account silently (if this is their first invite)
    const existingEmployer = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === inviterEmail.toLowerCase().trim()
    );

    if (!existingEmployer) {
      // Create new employer user with a random password (they'll use magic link to login)
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: newEmployer, error: createEmployerError } = await adminClient.auth.admin.createUser({
        email: inviterEmail.toLowerCase().trim(),
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          full_name: inviterName.trim(),
          role: 'employer',
          company_name: companyName.trim(),
        },
      });

      if (createEmployerError) {
        console.error("Error creating employer account:", createEmployerError);
      } else {
        console.log("Created employer account for:", inviterEmail);

        if (newEmployer?.user) {
          const { error: profileError } = await adminClient
            .from('profiles')
            .insert({
              id: newEmployer.user.id,
              email: inviterEmail.toLowerCase().trim(),
              full_name: inviterName.trim(),
              role: 'employer',
            });

          if (profileError) {
            console.error("Error creating employer profile:", profileError);
          }

          const { error: roleError } = await adminClient
            .from('user_roles')
            .insert({
              user_id: newEmployer.user.id,
              role: 'employer',
            });

          if (roleError) {
            console.error("Error creating employer role:", roleError);
          }
        }
      }
    } else {
      console.log("Employer account already exists:", inviterEmail);
      
      // Check if they have the employer role, if not add it
      const { data: existingRoles } = await adminClient
        .from('user_roles')
        .select('role')
        .eq('user_id', existingEmployer.id);
      
      const hasEmployerRole = existingRoles?.some(r => r.role === 'employer');
      if (!hasEmployerRole) {
        await adminClient.from('user_roles').insert({
          user_id: existingEmployer.id,
          role: 'employer',
        });
        console.log("Added employer role to existing user:", inviterEmail);
      }
    }

    // Auto-create CANDIDATE account silently
    const existingCandidate = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === candidateEmail.toLowerCase().trim()
    );

    if (!existingCandidate) {
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: candidateEmail.toLowerCase().trim(),
        password: randomPassword,
        email_confirm: true,
        user_metadata: {
          full_name: candidateName.trim(),
          invited_by_employer: true,
        },
      });

      if (createError) {
        console.error("Error creating candidate account:", createError);
      } else {
        console.log("Created candidate account for:", candidateEmail);

        if (newUser?.user) {
          const { error: profileError } = await adminClient
            .from('profiles')
            .insert({
              id: newUser.user.id,
              email: candidateEmail.toLowerCase().trim(),
              full_name: candidateName.trim(),
              role: 'candidate',
            });

          if (profileError) {
            console.error("Error creating candidate profile:", profileError);
          }

          const { error: roleError } = await adminClient
            .from('user_roles')
            .insert({
              user_id: newUser.user.id,
              role: 'candidate',
            });

          if (roleError) {
            console.error("Error creating candidate role:", roleError);
          }
        }
      }
    } else {
      console.log("Candidate account already exists:", candidateEmail);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-basic-test-invitation function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
