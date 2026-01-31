import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Send, 
  Loader2, 
  ArrowLeft,
  Mail,
  User,
  Calendar,
  Brain,
  Copy,
  CheckCircle,
  Link as LinkIcon
} from 'lucide-react';

interface TestOption {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  category: string;
}

const invitationSchema = z.object({
  candidateEmail: z.string().email('Please enter a valid email address'),
  candidateName: z.string().min(2, 'Name must be at least 2 characters'),
  testId: z.string().min(1, 'Please select a test'),
  expiresInDays: z.coerce.number().min(1).max(30),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

export default function SendInvitation() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState<{ token: string; name: string } | null>(null);

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      candidateEmail: '',
      candidateName: '',
      testId: '',
      expiresInDays: 7,
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

  const handleSubmit = async (data: InvitationFormData) => {
    if (!profile?.organization_id) {
      toast.error('Organization not found. Please contact support.');
      return;
    }

    setSending(true);

    try {
      const token = generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);

      const { error } = await supabase
        .from('test_invitations')
        .insert({
          organization_id: profile.organization_id,
          test_id: data.testId,
          candidate_email: data.candidateEmail.toLowerCase().trim(),
          candidate_name: data.candidateName.trim(),
          invited_by: profile.id,
          invitation_token: token,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      // Show the invitation link
      setCreatedInvitation({ token, name: data.candidateName });
      
      toast.success('Invitation created successfully!', {
        description: `Copy the link below to share with ${data.candidateName}`,
      });
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation', {
        description: error.message || 'Please try again',
      });
    } finally {
      setSending(false);
    }
  };

  const selectedTest = tests.find(t => t.id === form.watch('testId'));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Send Test Invitation</h1>
          <p className="text-muted-foreground">Invite a candidate to complete an assessment</p>
        </div>

        {/* Success State - Show Link */}
        {createdInvitation ? (
          <Card className="card-elevated border-success/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                Invitation Created!
              </CardTitle>
              <CardDescription>
                Share this link with {createdInvitation.name} to take the test
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
                  The candidate can use this link to go directly to the test—no account required.
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
                  Create Another
                </Button>
                <Button variant="default" onClick={() => navigate('/dashboard')} className="flex-1">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Invitation Details
            </CardTitle>
            <CardDescription>
              Fill in the candidate's information and select a test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

              {/* Test Selection */}
              <div className="space-y-2">
                <Label htmlFor="testId">Select Assessment</Label>
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
                    <SelectTrigger id="testId">
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

              {/* Expiration */}
              <div className="space-y-2">
                <Label htmlFor="expiresInDays">Invitation Expires In</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select
                    value={form.watch('expiresInDays').toString()}
                    onValueChange={(value) => form.setValue('expiresInDays', parseInt(value))}
                  >
                    <SelectTrigger id="expiresInDays" className="pl-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="hero" disabled={sending} className="flex-1">
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        )}

        {/* Info Note */}
        {!createdInvitation && (
          <p className="text-sm text-muted-foreground mt-6 text-center">
            The candidate will receive a unique link to complete the assessment. 
            You'll be notified when they complete it.
          </p>
        )}
      </main>
    </div>
  );
}
