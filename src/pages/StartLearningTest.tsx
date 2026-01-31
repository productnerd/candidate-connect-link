import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export type LearningSessionState = {
  id: string;
  questionIds: string[];
  currentIndex: number;
  answers: { questionId: string; answer: string; correct: boolean }[];
  status: 'in_progress' | 'completed';
  startedAt: string;
};

export default function StartLearningTest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth/candidate', { replace: true });
      return;
    }
    initLearningTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const initLearningTest = async () => {
    try {
      // Fetch random premium questions
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

      const sessionId = crypto.randomUUID();
      
      // Create learning session state
      const learningSession: LearningSessionState = {
        id: sessionId,
        questionIds: selected.map(q => q.id),
        currentIndex: 0,
        answers: [],
        status: 'in_progress',
        startedAt: new Date().toISOString(),
      };

      sessionStorage.setItem(`learning_session:${sessionId}`, JSON.stringify(learningSession));

      navigate(`/candidate/learn/session/${sessionId}`, { replace: true });
    } catch (err) {
      console.error('Error starting learning test:', err);
      setError('Failed to start learning mode. Please try again.');
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
        <p className="text-muted-foreground">Preparing learning mode...</p>
      </div>
    </div>
  );
}
