import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, Brain, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type TestInvitation = Tables<'test_invitations'>;
type TestLibrary = Tables<'test_library'>;

export default function TakeTest() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
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
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              If you believe this is an error, please contact the person who sent you this invitation.
            </p>
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
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{test?.name}</CardTitle>
          <CardDescription className="text-base">
            {test?.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Test Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{test?.duration_minutes}</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Brain className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{test?.question_count}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg col-span-2">
              <Badge variant="secondary" className="mb-2">
                {test?.category}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Difficulty: {test?.difficulty_level}
              </p>
            </div>
          </div>

          {/* Candidate Info */}
          {invitation?.candidate_name && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm text-muted-foreground">
                Welcome, <span className="font-semibold text-foreground">{invitation.candidate_name}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This test was sent to {invitation.candidate_email}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="font-semibold">Before you begin:</h3>
            <ul className="space-y-2">
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
            </ul>
          </div>

          {/* Start Button */}
          <Button 
            className="w-full" 
            size="lg" 
            onClick={startTest}
            disabled={starting}
          >
            {starting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                Begin Test
                <ArrowRight className="ml-2 h-5 w-5" />
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
