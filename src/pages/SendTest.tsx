import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Send, 
  Loader2,
  Mail,
  User,
  Building2,
  Brain,
  Copy,
  CheckCircle,
  Link as LinkIcon,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import authBg from '@/assets/auth-bg.png';

interface TestOption {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  category: string;
}

const noPlusEmail = (val: string) => !val.includes('+');

const sendTestSchema = z.object({
  // Inviter info
  inviterName: z.string().min(2, 'Your name must be at least 2 characters'),
  inviterEmail: z.string().email('Please enter a valid email address').refine(noPlusEmail, 'Email addresses with "+" are not allowed'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  // Candidate info
  candidateEmail: z.string().email('Please enter a valid candidate email').refine(noPlusEmail, 'Email addresses with "+" are not allowed'),
  candidateName: z.string().min(2, 'Candidate name must be at least 2 characters'),
  testId: z.string().min(1, 'Please select a test'),
}).refine((data) => data.inviterEmail.toLowerCase().trim() !== data.candidateEmail.toLowerCase().trim(), {
  message: 'Candidate email cannot be the same as your email',
  path: ['candidateEmail'],
});

type SendTestFormData = z.infer<typeof sendTestSchema>;

// Live Email Preview Component
function EmailPreview({ 
  inviterName, 
  companyName, 
  candidateName,
  testName 
}: { 
  inviterName: string; 
  companyName: string; 
  candidateName: string;
  testName: string;
}) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Paper card with texture */}
      <div 
        className="relative bg-[#faf9f7] rounded-lg shadow-2xl overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Paper texture overlay */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Email header */}
        <div className="relative border-b border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">CCAT Platform</p>
              <p className="text-xs text-gray-500">noreply@ccatplatform.com</p>
            </div>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>To: <span className="text-gray-600">{candidateName || 'Candidate Name'}</span></p>
            <p>Subject: <span className="text-gray-600 font-medium">You've been invited to take an assessment</span></p>
          </div>
        </div>

        {/* Email body */}
        <div className="relative p-6 space-y-4">
          <p className="text-gray-800 text-sm">
            Hi <span className="font-semibold">{candidateName || '[Candidate Name]'}</span>,
          </p>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            <span className="font-semibold text-gray-800">{inviterName || '[Your Name]'}</span> from{' '}
            <span className="font-semibold text-gray-800">{companyName || '[Company Name]'}</span> has 
            invited you to complete a cognitive assessment as part of their hiring process.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Assessment</p>
            <p className="font-semibold text-gray-900">{testName || 'Cognitive Aptitude Test'}</p>
            <p className="text-xs text-gray-500 mt-1">Duration: ~15 minutes</p>
          </div>


          <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">
            This invitation expires in 7 days. If you have any questions, please contact{' '}
            {inviterName || 'the hiring manager'} directly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SendTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tests, setTests] = useState<TestOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState<{ token: string; name: string } | null>(null);
  const [domainLimitReached, setDomainLimitReached] = useState(false);
  const [checkingDomainLimit, setCheckingDomainLimit] = useState(false);

  const form = useForm<SendTestFormData>({
    resolver: zodResolver(sendTestSchema),
    defaultValues: {
      inviterName: searchParams.get('name') || '',
      inviterEmail: searchParams.get('email') || '',
      companyName: searchParams.get('company') || '',
      candidateEmail: '',
      candidateName: '',
      testId: '',
    },
  });

  // Watch form values for live preview
  const watchedValues = form.watch();
  const selectedTest = tests.find(t => t.id === watchedValues.testId);

  // Check domain invite limit when email changes
  const checkDomainLimit = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      setDomainLimitReached(false);
      return;
    }

    setCheckingDomainLimit(true);
    try {
      const { data, error } = await supabase.rpc('get_domain_invite_count', {
        sender_email: email.toLowerCase().trim()
      });

      if (error) {
        console.error('Error checking domain limit:', error);
        return;
      }

      setDomainLimitReached(data >= 10);
    } catch (err) {
      console.error('Error checking domain limit:', err);
    } finally {
      setCheckingDomainLimit(false);
    }
  }, []);

  // Debounce email check
  useEffect(() => {
    const email = watchedValues.inviterEmail;
    if (!email) {
      setDomainLimitReached(false);
      return;
    }

    const timer = setTimeout(() => {
      checkDomainLimit(email);
    }, 500);

    return () => clearTimeout(timer);
  }, [watchedValues.inviterEmail, checkDomainLimit]);

  useEffect(() => {
    fetchTests();
  }, []);

  // Auto-set CCAT test when tests load
  useEffect(() => {
    if (tests.length > 0) {
      const ccatTest = tests.find(t => t.name.toLowerCase().includes('ccat'));
      const testId = ccatTest ? ccatTest.id : tests[0].id;
      form.setValue('testId', testId, { shouldValidate: true });
    }
  }, [tests, form]);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('test_library')
        .select('id, name, description, duration_minutes, category')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTests((data as TestOption[]) || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const generateToken = () => {
    return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  };

  const handleSubmit = async (data: SendTestFormData) => {
    setSending(true);
    const inviterEmailNorm = data.inviterEmail.toLowerCase().trim();
    const candidateEmailNorm = data.candidateEmail.toLowerCase().trim();

    try {
      // --- Pre-flight limit checks BEFORE inserting anything ---

      // 1. Same email check (redundant with zod but belt-and-suspenders)
      if (inviterEmailNorm === candidateEmailNorm) {
        toast.error('Candidate email cannot be the same as your email');
        setSending(false);
        return;
      }

      // 2. Check daily limit (3/day)
      const { data: canSendDaily, error: dailyErr } = await supabase.rpc('check_sender_daily_limit', {
        sender_email: inviterEmailNorm,
      });
      if (dailyErr) throw dailyErr;
      if (!canSendDaily) {
        toast.error('Daily limit reached (3 tests per day). Please try again tomorrow.');
        setSending(false);
        return;
      }

      // 3. Check total sender limit (10 total)
      const { data: canSendTotal, error: totalErr } = await supabase.rpc('check_sender_total_limit', {
        sender_email: inviterEmailNorm,
      });
      if (totalErr) throw totalErr;
      if (!canSendTotal) {
        toast.error('You have reached the maximum number of free invitations (10). Please purchase a bundle to continue.');
        setSending(false);
        return;
      }

      // 4. Check domain limit
      const { data: domainOk, error: domainErr } = await supabase.rpc('check_domain_invite_limit', {
        sender_email: inviterEmailNorm,
      });
      if (domainErr) throw domainErr;
      if (!domainOk) {
        toast.error('Your organization has reached the free invite limit (10). Please purchase a bundle to continue.');
        setSending(false);
        return;
      }

      // 5. Check candidate cooldown (30 days)
      const { data: noCooldown, error: cooldownErr } = await supabase.rpc('check_candidate_cooldown', {
        sender_email: inviterEmailNorm,
        recipient_email: candidateEmailNorm,
      });
      if (cooldownErr) throw cooldownErr;
      if (!noCooldown) {
        toast.error('This candidate was already invited recently. Please wait 30 days before sending another invitation.');
        setSending(false);
        return;
      }

      // --- All checks passed, now insert + send email ---
      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const selectedTestData = tests.find(t => t.id === data.testId);

      // Send email via edge function FIRST (before DB insert to avoid race condition)
      const { data: fnData, error: emailError } = await supabase.functions.invoke('send-basic-test-invitation', {
        body: {
          candidateEmail: candidateEmailNorm,
          candidateName: data.candidateName.trim(),
          testName: selectedTestData?.name || 'Assessment',
          inviterName: data.inviterName.trim(),
          inviterEmail: inviterEmailNorm,
          companyName: data.companyName.trim(),
          invitationToken: token,
          expiresAt: expiresAt.toISOString(),
          baseUrl: window.location.origin,
        },
      });

      // Check for edge function errors (rate limits, cooldown, etc.)
      if (emailError) {
        console.error('Edge function error:', emailError);
        const errorMsg = typeof emailError === 'object' && emailError.message
          ? emailError.message
          : typeof fnData === 'object' && fnData?.error
          ? fnData.error
          : String(emailError);

        toast.error(errorMsg || 'Failed to send invitation. Please try again.');
        setSending(false);
        return;
      }

      // Check if response body contains an error
      if (fnData && typeof fnData === 'object' && fnData.error) {
        toast.error(fnData.error);
        setSending(false);
        return;
      }

      // Edge function succeeded, now insert the invitation record
      const { error: insertError } = await supabase
        .from('test_invitations')
        .insert({
          organization_id: null,
          test_id: data.testId,
          candidate_email: candidateEmailNorm,
          candidate_name: data.candidateName.trim(),
          invited_by: null,
          invitation_token: token,
          expires_at: expiresAt.toISOString(),
          inviter_name: data.inviterName.trim(),
          inviter_email: inviterEmailNorm,
          company_name: data.companyName.trim(),
          test_type: 'basic',
        });

      if (insertError) throw insertError;

      // Success screen is sufficient — no toast needed
      setCreatedInvitation({ token, name: data.candidateName });
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      toast.error('Failed to create invitation', {
        description: error.message || 'Please try again',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Background Image with Email Preview */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBg})` }}
      >
        <div className="absolute inset-0 bg-foreground/70" />
        
        {/* Content - hidden on success */}
        {!createdInvitation && (
          <div className="relative z-10 flex flex-col items-center justify-center p-12 w-full">
            <div className="text-center mb-8">
              <p className="text-background/60 text-sm uppercase tracking-wider mb-2">Email Preview</p>
              <h2 className="text-2xl font-bold text-primary-foreground">What your candidate will receive</h2>
            </div>
            
            {/* Live Email Preview */}
            <EmailPreview
              inviterName={watchedValues.inviterName}
              companyName={watchedValues.companyName}
              candidateName={watchedValues.candidateName}
              testName={selectedTest?.name || ''}
            />
          </div>
        )}
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header - hidden on success */}
          {!createdInvitation && (
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Free to use • No account required
              </div>
              <h1 className="text-3xl font-bold mb-2">Send a Cognitive Assessment</h1>
              <p className="text-muted-foreground">
                Results will be emailed to you.
              </p>
            </div>
          )}

          {/* Success State */}
          {createdInvitation ? (
            <Card className="card-elevated border-success/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  Invitation Sent!
                </CardTitle>
                <CardDescription className="space-y-1">
                  <p>We've emailed {createdInvitation.name} with a link to take the test.</p>
                  <p>You'll receive the results via email once they do.</p>
                  <p>The link will expire in a week.</p>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCreatedInvitation(null);
                      form.reset();
                    }} 
                    className="w-full"
                  >
                    Send Another Test
                  </Button>
                  <Button variant="default" onClick={() => navigate('/dashboard')} className="w-full">
                    Dashboard
                  </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Your Information Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-muted-foreground tracking-wide">Your Information</h3>
                    
                    {/* Your Name */}
                    <div className="space-y-2">
                      <Label htmlFor="inviterName">Your Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="inviterName"
                          type="text"
                          placeholder="Jane Smith"
                          className="pl-10"
                          {...form.register('inviterName')}
                        />
                      </div>
                      {form.formState.errors.inviterName && (
                        <p className="text-sm text-destructive">{form.formState.errors.inviterName.message}</p>
                      )}
                    </div>

                    {/* Your Email */}
                    <div className="space-y-2">
                      <Label htmlFor="inviterEmail">Your Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="inviterEmail"
                          type="email"
                          placeholder="you@company.com"
                          className={`pl-10 ${domainLimitReached ? 'border-destructive' : ''}`}
                          {...form.register('inviterEmail')}
                        />
                      </div>
                      {form.formState.errors.inviterEmail && (
                        <p className="text-sm text-destructive">{form.formState.errors.inviterEmail.message}</p>
                      )}
                      {!domainLimitReached && (
                        <p className="text-xs text-muted-foreground">Results will be sent to this email</p>
                      )}
                      
                      {/* Domain Limit Alert */}
                      {domainLimitReached && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Your organization has reached the free invite limit (10 tests). 
                            Please <a href="/auth?tab=signup&role=employer" className="font-medium underline">create an account</a> and purchase a bundle to continue.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="companyName"
                          type="text"
                          placeholder="Acme Inc."
                          className="pl-10"
                          {...form.register('companyName')}
                        />
                      </div>
                      {form.formState.errors.companyName && (
                        <p className="text-sm text-destructive">{form.formState.errors.companyName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Candidate Information Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-muted-foreground tracking-wide">Candidate Information</h3>
                    
                    {/* Candidate Name */}
                    <div className="space-y-2">
                      <Label htmlFor="candidateName">Candidate Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="candidateName"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10"
                          {...form.register('candidateName')}
                        />
                      </div>
                      {form.formState.errors.candidateName && (
                        <p className="text-sm text-destructive">{form.formState.errors.candidateName.message}</p>
                      )}
                    </div>

                    {/* Candidate Email */}
                    <div className="space-y-2">
                      <Label htmlFor="candidateEmail">Candidate Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="candidateEmail"
                          type="email"
                          placeholder="candidate@example.com"
                          className="pl-10"
                          {...form.register('candidateEmail')}
                        />
                      </div>
                      {form.formState.errors.candidateEmail && (
                        <p className="text-sm text-destructive">{form.formState.errors.candidateEmail.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border" />

                  {/* Test Selection */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-muted-foreground tracking-wide">Assessment</h3>
                    
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                      <Brain className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">CCAT</p>
                        <p className="text-sm text-muted-foreground">Cognitive aptitude assessment • 15 min</p>
                      </div>
                    </div>
                    {form.formState.errors.testId && (
                      <p className="text-sm text-destructive">{form.formState.errors.testId.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="space-y-4">
                    <Button 
                      type="submit" 
                      variant="hero" 
                      disabled={sending || domainLimitReached || checkingDomainLimit} 
                      className="w-full"
                    >
                      {checkingDomainLimit ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Checking...
                        </>
                      ) : sending ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Sending...
                        </>
                      ) : domainLimitReached ? (
                        <>
                          <AlertTriangle className="mr-2 h-3 w-3" />
                          Limit Reached
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-3 w-3" />
                          Send Test Invitation
                        </>
                      )}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      Want to try the test?{' '}
                      <a 
                        href="/practice"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Take one here
                      </a>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
