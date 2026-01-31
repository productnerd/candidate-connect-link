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

      const selectedTest = tests.find(t => t.id === data.testId);

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
            testName: selectedTest?.name || 'Assessment',
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

  const selectedTest = tests.find(t => t.id === form.watch('testId'));

  return (
    <div className="min-h-screen bg-background">
      
      <main className="container py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Free to use • No account required
          </div>
          <h1 className="text-3xl font-bold mb-2">Send a Cognitive Assessment</h1>
          <p className="text-muted-foreground">
            Invite a candidate to take an assessment. Results will be emailed to you when they complete it.
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
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Your Information</h3>
                  
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
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Candidate Information</h3>
                  
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
                <div className="space-y-3">
                  <Button type="submit" variant="hero" disabled={sending} className="w-full h-12">
                    {sending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Test Invitation
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/practice')}
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    Try a Practice Test Yourself
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Info Note */}
        {!createdInvitation && (
          <p className="text-sm text-muted-foreground mt-6 text-center">
            By sending a test, you agree to our Terms of Service and Privacy Policy.
          </p>
        )}
      </main>
    </div>
  );
}
