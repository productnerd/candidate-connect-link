import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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
                await redirectBasedOnRole(newSession.user.id);
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

        // Session exists, redirect based on role
        await redirectBasedOnRole(session.user.id);
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred. Please try signing in.');
      }
    };

    const redirectBasedOnRole = async (userId: string) => {
      // Fetch user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError);
        // Default to candidate dashboard if profile not found
        navigate('/dashboard/candidate', { replace: true });
        return;
      }

      // Redirect based on role
      if (profile.role === 'employer' || profile.role === 'admin') {
        navigate('/dashboard/employer', { replace: true });
      } else {
        navigate('/dashboard/candidate', { replace: true });
      }
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
