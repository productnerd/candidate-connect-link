import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, Brain, AlertCircle, CheckCircle, ArrowRight, ExternalLink, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import { formatDistanceToNow, differenceInDays, differenceInHours } from 'date-fns';

type TestInvitation = Tables<'test_invitations'>;
type TestLibrary = Tables<'test_library'>;

export default function TakeTest() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<TestInvitation | null>(null);
  const [test, setTest] = useState<TestLibrary | null>(null);
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
      // Fetch invitation by token
      const { data: invitationData, error: invError } = await supabase
        .from('test_invitations')
        .select('*')
        .eq('invitation_token', token)
        .maybeSingle();

      if (invError) throw invError;

      if (!invitationData) {
        setError('Invitation not found or has been revoked');
        setLoading(false);
        return;
      }

      // Check expiration
      if (new Date(invitationData.expires_at) < new Date()) {
        setError('This invitation has expired');
        setLoading(false);
        return;
      }

      // Check if already completed
      if (invitationData.status === 'completed') {
        setError('You have already completed this test');
        setLoading(false);
        return;
      }

      setInvitation(invitationData);

      // Fetch test details
      const { data: testData, error: testError } = await supabase
        .from('test_library')
        .select('*')
        .eq('id', invitationData.test_id)
        .single();

      if (testError) throw testError;
      setTest(testData);

    } catch (err) {
      console.error('Error validating invitation:', err);
      setError('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const startTest = async () => {
    if (!invitation || !test) return;

    setStarting(true);
    try {
      // Create a test session
      const { data: session, error: sessionError } = await supabase
        .from('test_sessions')
        .insert({
          test_id: test.id,
          invitation_id: invitation.id,
          candidate_id: null, // Anonymous
          session_type: 'invited',
          status: 'in_progress',
          time_remaining_seconds: test.duration_minutes * 60,
          proctoring_enabled: test.requires_proctoring,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Update invitation status
      await supabase
        .from('test_invitations')
        .update({ 
          status: 'started',
          started_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // Navigate to test interface
      navigate(`/test/${token}/session/${session.id}`);

    } catch (err) {
      console.error('Error starting test:', err);
      toast({
        title: 'Error',
        description: 'Failed to start the test. Please try again.',
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
      return `${daysLeft} days remaining`;
    } else if (hoursLeft > 1) {
      return `${hoursLeft} hours remaining`;
    } else {
      return `Expires ${formatDistanceToNow(expiresAt, { addSuffix: true })}`;
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

          {/* Standard Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold">Instructions</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                This is a timed assessment designed to evaluate your skills. Please read each question carefully 
                before answering. Your responses will be recorded and cannot be changed once submitted.
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
                <span>All questions must be answered before submission</span>
              </li>
            </ul>
          </div>

          {/* Practice Test CTA */}
          <div className="p-4 bg-accent/30 rounded-lg border border-accent/50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Not ready yet?</p>
                <p className="text-xs text-muted-foreground">
                  Try a practice test first to familiarize yourself with the format
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('/practice', '_blank')}
              >
                Practice Test
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
