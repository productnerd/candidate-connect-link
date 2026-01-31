import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { createPracticeSession } from '@/lib/practiceSessionStorage';
import { useAuth } from '@/hooks/useAuth';

export default function StartMockTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth/candidate', { replace: true });
      return;
    }
    initMockTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const initMockTest = async () => {
    try {
      // Fetch random premium questions (get more than needed, then shuffle)
      const { data: questions, error: questionsError } = await supabase
        .from('test_questions')
        .select('id')
        .eq('pool', 'premium')
        .limit(20);

      if (questionsError) throw questionsError;

      if (!questions || questions.length < 5) {
        setError('Not enough premium questions available. Please try again later.');
        return;
      }

      // Shuffle and pick 5
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 5);

      // Store the selected question IDs in sessionStorage for mock test
      const sessionId = crypto.randomUUID();
      sessionStorage.setItem(`mock_questions:${sessionId}`, JSON.stringify(selected.map(q => q.id)));

      // Create practice session with 5 minutes duration
      createPracticeSession({
        id: sessionId,
        testId: 'mock', // Special identifier for mock tests
        durationSeconds: 5 * 60, // 5 minutes for 5 questions
      });

      // Navigate to mock session
      navigate(`/candidate/mock/session/${sessionId}`, { replace: true });
    } catch (err) {
      console.error('Error starting mock test:', err);
      setError('Failed to start mock test. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-destructive mb-4">{error}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-primary underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Preparing your mock test...</p>
      </div>
    </div>
  );
}
