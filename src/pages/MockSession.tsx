import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Zap } from 'lucide-react';
import type { Tables, Json } from '@/integrations/supabase/types';
import {
  loadPracticeSession,
  savePracticeSession,
  type PracticeAnswer,
  type PracticeSessionState,
} from '@/lib/practiceSessionStorage';
import { TestInterface, type TestAnswer } from '@/components/test/TestInterface';

type TestQuestion = Tables<'test_questions'>;

export default function MockSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PracticeSessionState | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialAnswers, setInitialAnswers] = useState<TestAnswer[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);

  useEffect(() => {
    loadSessionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const loadSessionData = async () => {
    if (!sessionId) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const local = loadPracticeSession(sessionId);
    if (!local) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (local.status === 'completed') {
      navigate(`/candidate/mock/results/${sessionId}`, { replace: true });
      return;
    }

    try {
      // Get stored question IDs
      const storedQuestionIds = sessionStorage.getItem(`mock_questions:${sessionId}`);
      if (!storedQuestionIds) {
        navigate('/dashboard', { replace: true });
        return;
      }

      const questionIds: string[] = JSON.parse(storedQuestionIds);

      // Hydrate session
      const startedAtMs = new Date(local.startedAt).getTime();
      const elapsed = Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
      const remaining = Math.max(0, local.durationSeconds - elapsed);

      const hydrated: PracticeSessionState = {
        ...local,
        timeRemaining: remaining,
      };

      setSession(hydrated);
      setTimeRemaining(remaining);
      setInitialIndex(hydrated.currentIndex || 0);
      setInitialAnswers(Array.isArray(hydrated.answers) ? hydrated.answers : []);
      savePracticeSession(sessionId, hydrated);

      // Create backend session for RLS
      await supabase
        .from('test_sessions')
        .upsert({
          id: sessionId,
          test_id: 'ede289ed-48bf-4be9-9aaa-e8f5b1fec47e', // Reference test for RLS
          session_type: 'practice',
          status: 'in_progress',
          candidate_id: null,
          start_time: new Date().toISOString(),
          current_question_index: hydrated.currentIndex || 0,
          time_remaining_seconds: remaining,
          answers: (Array.isArray(hydrated.answers) ? hydrated.answers : []) as unknown as Json,
          proctoring_enabled: false,
        }, { onConflict: 'id' });

      // Fetch questions by IDs
      const { data: questionsData, error: questionsError } = await supabase
        .from('test_questions')
        .select('*')
        .in('id', questionIds);

      if (questionsError) throw questionsError;

      // Sort to match original order
      const sortedQuestions = questionIds
        .map(id => questionsData?.find(q => q.id === id))
        .filter((q): q is TestQuestion => q !== undefined);

      setQuestions(sortedQuestions);
    } catch (err) {
      console.error('Error loading session:', err);
      toast({
        title: 'Error',
        description: 'Failed to load mock test',
        variant: 'destructive',
      });
      navigate('/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProgress = (answers: TestAnswer[], currentIndex: number, timeRemaining: number) => {
    if (!sessionId || !session) return;
    const next: PracticeSessionState = {
      ...session,
      currentIndex,
      timeRemaining,
      answers: answers as PracticeAnswer[],
    };
    setSession(next);
    savePracticeSession(sessionId, next);
  };

  const handleSubmit = async (answers: TestAnswer[], timeTakenSeconds: number) => {
    let correctCount = 0;
    questions.forEach((q) => {
      const answer = answers.find((a) => a.questionId === q.id);
      if (answer && answer.answer === q.correct_answer) {
        correctCount++;
      }
    });

    const percentage = questions.length > 0 
      ? Math.round((correctCount / questions.length) * 100) 
      : 0;

    if (sessionId && session) {
      const next: PracticeSessionState = {
        ...session,
        status: 'completed',
        currentIndex: questions.length - 1,
        timeRemaining: 0,
        answers: answers as PracticeAnswer[],
        result: {
          score: correctCount,
          percentage,
          timeTakenSeconds,
          completedAt: new Date().toISOString(),
        },
      };
      savePracticeSession(sessionId, next);

      // Save to candidate_test_history
      if (user) {
        await supabase.from('candidate_test_history').insert({
          user_id: user.id,
          session_id: sessionId,
          test_type: 'mock',
          score: correctCount,
          total_questions: questions.length,
          time_taken_seconds: timeTakenSeconds,
          category_scores: {},
          completed_at: new Date().toISOString(),
        });
      }
    }

    navigate(`/candidate/mock/results/${sessionId}`, { replace: true });
  };

  const handleExit = () => {
    navigate('/dashboard', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Zap className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading mock test...</p>
        </div>
      </div>
    );
  }

  return (
    <TestInterface
      mode="mock"
      questions={questions}
      initialTimeRemaining={timeRemaining}
      initialAnswers={initialAnswers}
      initialIndex={initialIndex}
      onSubmit={handleSubmit}
      onExit={handleExit}
      onSaveProgress={handleSaveProgress}
      showQuestionNavigator={false}
    />
  );
}
