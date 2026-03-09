import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Brain } from 'lucide-react';
import { createPracticeSession } from '@/lib/practiceSessionStorage';

export default function StartPracticeTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startPracticeSession();
  }, []);

  const startPracticeSession = async () => {
    try {
      // Check for test slug in URL params, default to ccat-cognitive
      const testSlug = searchParams.get('test') || 'ccat-cognitive';

      // Get the requested practice test
      const { data: test, error: testError } = await supabase
        .from('test_library')
        .select('*')
        .eq('is_active', true)
        .eq('slug', testSlug)
        .maybeSingle();

      if (testError) throw testError;

      // Fallback to ccat-cognitive if requested test not found
      let practiceTest = test;
      if (!practiceTest) {
        const { data: fallbackTest, error: fallbackError } = await supabase
          .from('test_library')
          .select('*')
          .eq('is_active', true)
          .eq('slug', 'ccat-cognitive')
          .maybeSingle();

        if (fallbackError) throw fallbackError;
        practiceTest = fallbackTest;
      }

      if (!practiceTest) {
        setError('No practice tests available');
        return;
      }

      // Create a local practice session (no account required)
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      createPracticeSession({
        id,
        testId: practiceTest.id,
        durationSeconds: (practiceTest.duration_minutes ?? 15) * 60,
      });

      // Navigate directly to fullscreen test session
      navigate(`/candidate/session/${id}`, { replace: true });

    } catch (err) {
      console.error('Error starting practice test:', err);
      setError('Failed to start practice test');
      toast({
        title: 'Error',
        description: 'Failed to start practice test. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => navigate('/candidate')}
            className="text-primary hover:underline"
          >
            Return to Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-primary/10">
          <Brain className="h-12 w-12 text-primary animate-pulse" />
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Starting practice test...</p>
      </div>
    </div>
  );
}
