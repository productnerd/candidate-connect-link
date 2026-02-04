import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, Brain, AlertCircle, CheckCircle, ArrowRight, ExternalLink, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, differenceInDays, differenceInHours } from 'date-fns';

interface InvitationData {
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

interface TestData {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  question_count: number;
  category: string;
  difficulty_level: string | null;
  requires_proctoring: boolean | null;
}

export default function TakeTest() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [test, setTest] = useState<TestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    try {
      // Use edge function to validate invitation (bypasses RLS securely)
      const { data, error: funcError } = await supabase.functions.invoke('validate-invitation', {
        body: { token }
      });

      if (funcError) {
        console.error('Edge function error:', funcError);
        setError('Failed to validate invitation');
        setLoading(false);
        return;
      }

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setInvitation(data.invitation);
      setTest(data.test);

    } catch (err) {
      console.error('Error validating invitation:', err);
      setError('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const startTest = async () => {
    if (!invitation || !test || !token) return;

    setStarting(true);
    try {
      // Use edge function to start test (bypasses RLS securely)
      const { data, error: funcError } = await supabase.functions.invoke('start-invited-test', {
        body: { 
          token,
          invitationId: invitation.id,
          testId: test.id
        }
      });

      if (funcError) {
        throw new Error(funcError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Navigate to test interface
      navigate(`/invite/${token}/session/${data.sessionId}`);

    } catch (err: any) {
      console.error('Error starting test:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to start the test. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setStarting(false);
    }
  };

  const getExpirationText = () => {
    if (!invitation) return '';
    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    const daysLeft = differenceInDays(expiresAt, now);
    const hoursLeft = differenceInHours(expiresAt, now);

    if (daysLeft > 1) {
      return `${daysLeft} DAYS REMAINING`;
    } else if (hoursLeft > 1) {
      return `${hoursLeft} HOURS REMAINING`;
    } else {
      return `EXPIRES ${formatDistanceToNow(expiresAt, { addSuffix: true }).toUpperCase()}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Unable to Access Test</CardTitle>
            <CardDescription>
              {error}. If you believe this is an error, please contact the person who sent you this invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-6">
          {/* Company Branding */}
          {invitation?.company_logo_url ? (
            <div className="mx-auto mb-4">
              <img 
                src={invitation.company_logo_url} 
                alt={invitation.company_name || 'Company logo'} 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : invitation?.company_name ? (
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">
                {invitation.company_name.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          )}

          {/* Welcome Message */}
          <div className="space-y-2">
            {invitation?.company_name && (
              <p className="text-sm text-muted-foreground">
                Assessment by <span className="font-medium text-foreground">{invitation.company_name}</span>
              </p>
            )}
            <CardTitle className="text-2xl">
              Welcome{invitation?.candidate_name ? `, ${invitation.candidate_name}` : ''}!
            </CardTitle>
            {invitation?.inviter_name && (
              <p className="text-sm text-muted-foreground">
                {invitation.inviter_name} has invited you to take this assessment
              </p>
            )}
          </div>

          {/* Expiration Badge */}
          <div className="flex justify-center mt-4">
            <Badge variant="outline" className="gap-1.5">
              <Calendar className="h-3 w-3" />
              {getExpirationText()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Test Info */}
          <div className="p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">{test?.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{test?.description}</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-lg font-bold text-foreground">{test?.duration_minutes}</span>
                </div>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                  <Brain className="h-4 w-4" />
                  <span className="text-lg font-bold text-foreground">{test?.question_count}</span>
                </div>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
              <div>
                <Badge variant="secondary">{test?.category}</Badge>
                <p className="text-xs text-muted-foreground mt-1">{test?.difficulty_level}</p>
              </div>
            </div>
          </div>

          {/* CCAT Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold">Instructions</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                The CCAT (Criteria Cognitive Aptitude Test) is a timed assessment measuring your problem-solving 
                abilities across math, verbal, and spatial reasoning. Read each question carefully and work quickly.
              </p>
            </div>
            <ul className="space-y-2 mt-4">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Ensure you have a stable internet connection</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Find a quiet place free from distractions</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>The timer starts immediately once you begin</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You cannot pause or restart the test once started</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span><strong>Unanswered questions are marked incorrect</strong> — try to answer all questions, even if guessing</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You can navigate back and change answers before submitting</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>You may submit without answering all questions, but once submitted answers cannot be changed</span>
              </li>
            </ul>
          </div>

          {/* Practice Test CTA */}
          <div className="p-4 bg-muted/60 rounded-lg border border-border">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">We highly recommend doing a mock test first</p>
                <p className="text-xs text-muted-foreground">
                  Familiarize yourself with the format and question types before taking the real assessment
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/candidate/start', '_blank')}
              >
                Try Mock Test
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Start Button */}
          <Button 
            className="w-full" 
            variant="hero"
            onClick={startTest}
            disabled={starting}
          >
            {starting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                Begin Test
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By starting this test, you agree to complete it honestly without external assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
