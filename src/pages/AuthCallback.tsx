import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { loadPendingScore, clearPendingScore } from '@/lib/pendingScoreStorage';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const type = searchParams.get('type');
        
        // Get the session from the URL hash (Supabase handles this automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to verify your email. Please try again.');
          return;
        }

        // Handle password recovery flow
        if (type === 'recovery') {
          // User is coming from password reset email
          // Redirect to reset password page
          navigate('/auth/reset-password', { replace: true });
          return;
        }

        if (!session) {
          // No session yet, wait for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
              if (event === 'PASSWORD_RECOVERY') {
                subscription.unsubscribe();
                navigate('/auth/reset-password', { replace: true });
                return;
              }
              if (event === 'SIGNED_IN' && newSession) {
                subscription.unsubscribe();
                await migratePendingScoreAndRedirect(newSession.user.id);
              }
            }
          );

          // Timeout after 10 seconds
          setTimeout(() => {
            subscription.unsubscribe();
            setError('Verification timed out. Please try signing in.');
          }, 10000);
          return;
        }

        // Session exists, migrate pending score and redirect
        await migratePendingScoreAndRedirect(session.user.id);
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred. Please try signing in.');
      }
    };

    const migratePendingScoreAndRedirect = async (userId: string) => {
      // Check for pending practice score from anonymous session
      const pendingScore = loadPendingScore();
      
      if (pendingScore) {
        try {
          // Insert the pending score into candidate_test_history
          const { error: insertError } = await supabase
            .from('candidate_test_history')
            .insert({
              user_id: userId,
              score: pendingScore.score,
              total_questions: pendingScore.total_questions,
              time_taken_seconds: pendingScore.time_taken_seconds || null,
              category_scores: pendingScore.category_scores || {},
              test_type: pendingScore.test_type,
              completed_at: pendingScore.completed_at,
            });

          if (insertError) {
            console.error('Failed to migrate pending score:', insertError);
          } else {
            console.log('Successfully migrated pending practice score');
            // Clear the pending score from localStorage
            clearPendingScore();
          }
        } catch (err) {
          console.error('Error migrating pending score:', err);
        }
      }

      // Fetch user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError);
        // Default to dashboard if profile not found
        navigate('/dashboard', { replace: true });
        return;
      }

      // Always redirect to /dashboard - Dashboard component handles role-based display
      navigate('/dashboard', { replace: true });
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button 
            onClick={() => navigate('/auth/candidate')}
            className="text-primary underline"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    </div>
  );
}
