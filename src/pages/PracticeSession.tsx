import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Brain } from 'lucide-react';
import type { Tables, Json } from '@/integrations/supabase/types';
import {
  loadPracticeSession,
  savePracticeSession,
  type PracticeAnswer,
  type PracticeSessionState,
} from '@/lib/practiceSessionStorage';
import { TestInterface, type TestAnswer } from '@/components/test/TestInterface';

type TestLibrary = Tables<'test_library'>;
type TestQuestion = Tables<'test_questions'>;

export default function PracticeSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PracticeSessionState | null>(null);
  const [test, setTest] = useState<TestLibrary | null>(null);
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
      navigate('/candidate', { replace: true });
      return;
    }

    const local = loadPracticeSession(sessionId);
    if (!local) {
      navigate('/candidate', { replace: true });
      return;
    }

    if (local.status === 'completed') {
      navigate(`/candidate/results/${sessionId}`, { replace: true });
      return;
    }

    try {
      // Hydrate local session
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

      // Ensure a backend session exists for this practice run (RLS requires it)
      const { error: ensureSessionError } = await supabase
        .from('test_sessions')
        .upsert(
          {
            id: sessionId,
            test_id: hydrated.testId,
            session_type: 'practice',
            status: 'in_progress',
            candidate_id: null,
            start_time: new Date().toISOString(),
            current_question_index: hydrated.currentIndex || 0,
            time_remaining_seconds: remaining,
            answers: (Array.isArray(hydrated.answers) ? hydrated.answers : []) as unknown as Json,
            proctoring_enabled: false,
            proctoring_consent_given: false,
          },
          { onConflict: 'id' },
        );

      if (ensureSessionError) throw ensureSessionError;

      // Fetch test
      const { data: testData, error: testError } = await supabase
        .from('test_library')
        .select('*')
        .eq('id', hydrated.testId)
        .single();

      if (testError) throw testError;
      setTest(testData);

      // Fetch questions via junction table
      const { data: linksData, error: linksError } = await supabase
        .from('test_question_links')
        .select(`
          order_number,
          question:test_questions(*)
        `)
        .eq('test_id', hydrated.testId)
        .order('order_number', { ascending: true });

      if (linksError) throw linksError;
      
      const questionsData = (linksData || [])
        .map(link => link.question)
        .filter((q): q is TestQuestion => q !== null);
      setQuestions(questionsData || []);
    } catch (err) {
      console.error('Error loading session:', err);
      toast({
        title: 'Error',
        description: 'Failed to load practice test',
        variant: 'destructive',
      });
      navigate('/candidate', { replace: true });
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
    // Calculate score
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

    // Persist completion locally
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
    }
    
    navigate(`/candidate/results/${sessionId}`, { replace: true });
  };

  const handleExit = () => {
    navigate('/candidate', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Brain className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading practice test...</p>
        </div>
      </div>
    );
  }

  return (
    <TestInterface
      mode="practice"
      testName={test?.name}
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
