import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Sparkles
} from 'lucide-react';
import authBg from '@/assets/auth-bg.png';

interface TestOption {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  category: string;
}

const sendTestSchema = z.object({
  // Inviter info
  inviterName: z.string().min(2, 'Your name must be at least 2 characters'),
  inviterEmail: z.string().email('Please enter a valid email address'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  // Candidate info
  candidateEmail: z.string().email('Please enter a valid candidate email'),
  candidateName: z.string().min(2, 'Candidate name must be at least 2 characters'),
  testId: z.string().min(1, 'Please select a test'),
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
  const [tests, setTests] = useState<TestOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState<{ token: string; name: string } | null>(null);

  const form = useForm<SendTestFormData>({
    resolver: zodResolver(sendTestSchema),
    defaultValues: {
      inviterName: '',
      inviterEmail: '',
      companyName: '',
      candidateEmail: '',
      candidateName: '',
      testId: '',
    },
  });

  // Watch form values for live preview
  const watchedValues = form.watch();
  const selectedTest = tests.find(t => t.id === watchedValues.testId);

  useEffect(() => {
    fetchTests();
  }, []);

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

    try {
      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry for basic tests

      const selectedTestData = tests.find(t => t.id === data.testId);

      // Create invitation (anonymous - no organization_id, no invited_by)
      const { error: insertError } = await supabase
        .from('test_invitations')
        .insert({
          organization_id: null,
          test_id: data.testId,
          candidate_email: data.candidateEmail.toLowerCase().trim(),
          candidate_name: data.candidateName.trim(),
          invited_by: null,
          invitation_token: token,
          expires_at: expiresAt.toISOString(),
          inviter_name: data.inviterName.trim(),
          inviter_email: data.inviterEmail.toLowerCase().trim(),
          company_name: data.companyName.trim(),
          test_type: 'basic',
        });

      if (insertError) throw insertError;

      // Send email via public edge function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-basic-test-invitation', {
          body: {
            candidateEmail: data.candidateEmail.toLowerCase().trim(),
            candidateName: data.candidateName.trim(),
            testName: selectedTestData?.name || 'Assessment',
            inviterName: data.inviterName.trim(),
            inviterEmail: data.inviterEmail.toLowerCase().trim(),
            companyName: data.companyName.trim(),
            invitationToken: token,
            expiresAt: expiresAt.toISOString(),
            baseUrl: window.location.origin,
          },
        });

        if (emailError) {
          console.error('Failed to send email:', emailError);
          toast.warning('Invitation created, but email could not be sent. Please share the link manually.');
        } else {
          toast.success('Invitation sent!', {
            description: `Email sent to ${data.candidateName}`,
          });
        }
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
        toast.warning('Invitation created, but email could not be sent. Please share the link manually.');
      }

      // Show the invitation link
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
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-foreground/70" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 w-full">
          <div className="text-center mb-8">
            <p className="text-primary-foreground/80 text-sm uppercase tracking-wider mb-2">Email Preview</p>
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
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Free to use • No account required
            </div>
            <h1 className="text-3xl font-bold mb-2">Send a Cognitive Assessment</h1>
            <p className="text-muted-foreground">
              Invite a candidate to take an assessment. Results will be emailed to you.
            </p>
          </div>

          {/* Success State - Show Link */}
          {createdInvitation ? (
            <Card className="card-elevated border-success/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  Invitation Sent!
                </CardTitle>
                <CardDescription>
                  We've emailed {createdInvitation.name} with a link to take the test.
                  You can also share this link directly:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Invitation Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={`${window.location.origin}/test/${createdInvitation.token}`}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/test/${createdInvitation.token}`);
                        toast.success('Link copied to clipboard!');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <p className="flex items-center gap-2 mb-2">
                    <LinkIcon className="h-4 w-4" />
                    The candidate can use this link to take the test—no account required.
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    You'll receive an email with the results once they complete it.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setCreatedInvitation(null);
                      form.reset();
                    }} 
                    className="flex-1"
                  >
                    Send Another Test
                  </Button>
                  <Button variant="default" onClick={() => navigate('/employer')} className="flex-1">
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="card-elevated">
              <CardContent className="pt-6">
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Your Information Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-muted-foreground uppercase tracking-wide">Your Information</h3>
                    
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
                          className="pl-10"
                          {...form.register('inviterEmail')}
                        />
                      </div>
                      {form.formState.errors.inviterEmail && (
                        <p className="text-sm text-destructive">{form.formState.errors.inviterEmail.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Results will be sent to this email</p>
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
                    <h3 className="font-semibold text-muted-foreground uppercase tracking-wide">Candidate Information</h3>
                    
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
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Select Assessment</h3>
                    
                    <div className="space-y-2">
                      {loading ? (
                        <div className="flex items-center gap-2 p-3 border rounded-lg">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-muted-foreground">Loading tests...</span>
                        </div>
                      ) : (
                        <Select
                          value={form.watch('testId')}
                          onValueChange={(value) => form.setValue('testId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an assessment" />
                          </SelectTrigger>
                          <SelectContent>
                            {tests.map((test) => (
                              <SelectItem key={test.id} value={test.id}>
                                <div className="flex items-center gap-2">
                                  <Brain className="h-4 w-4 text-primary" />
                                  <span>{test.name}</span>
                                  <span className="text-muted-foreground">({test.duration_minutes} min)</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {form.formState.errors.testId && (
                        <p className="text-sm text-destructive">{form.formState.errors.testId.message}</p>
                      )}
                    </div>

                    {/* Selected Test Details */}
                    {selectedTest && (
                      <div className="p-4 rounded-lg bg-muted/50 border animate-fade-in">
                        <h4 className="font-medium mb-1">{selectedTest.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{selectedTest.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-primary">Duration: {selectedTest.duration_minutes} min</span>
                          <span className="capitalize">Category: {selectedTest.category}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="space-y-4">
                    <Button type="submit" variant="hero" disabled={sending} className="w-full">
                      {sending ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-3 w-3" />
                          Send Test Invitation
                        </>
                      )}
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                      Want to see what candidates experience?{' '}
                      <a 
                        href="/practice"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Try the test yourself
                      </a>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Info Note */}
          {!createdInvitation && (
            <p className="text-sm text-muted-foreground mt-6 text-center">
              The candidate will receive this exact email with a link to complete the assessment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
