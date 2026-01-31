import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QuestionOptions } from '@/components/test/QuestionOptions';
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Flag,
  ArrowLeft
} from 'lucide-react';
import type { Tables, Json } from '@/integrations/supabase/types';
import {
  loadPracticeSession,
  savePracticeSession,
  type PracticeAnswer,
  type PracticeSessionState,
} from '@/lib/practiceSessionStorage';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PracticeAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Load local session + fetch test/questions
  useEffect(() => {
    loadSessionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Auto-submit ref to avoid stale closure in timer
  const autoSubmitRef = useRef<() => void>(() => {});

  // Timer with auto-submit
  useEffect(() => {
    if (timeRemaining <= 0 || submitting) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Use ref to call latest handleSubmit
          autoSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitting]);

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
      setCurrentIndex(hydrated.currentIndex || 0);
      setAnswers(Array.isArray(hydrated.answers) ? hydrated.answers : []);
      savePracticeSession(sessionId, hydrated);

      // Ensure a backend session exists for this practice run.
      // RLS for questions requires an in-progress session row for anonymous users.
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
      
      // Extract questions from links and flatten
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

  const saveProgress = useCallback(() => {
    if (!sessionId || !session) return;
    const next: PracticeSessionState = {
      ...session,
      currentIndex,
      timeRemaining,
      answers,
    };
    setSession(next);
    savePracticeSession(sessionId, next);
  }, [answers, currentIndex, session, sessionId, timeRemaining]);

  // Auto-save progress
  useEffect(() => {
    const interval = setInterval(saveProgress, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [saveProgress]);

  const handleAnswer = (answer: string) => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === currentQuestion.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], answer };
        return updated;
      }
      return [...prev, { questionId: currentQuestion.id, answer }];
    });
  };

  const toggleFlag = () => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === currentQuestion.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], flagged: !updated[existing].flagged };
        return updated;
      }
      return [...prev, { questionId: currentQuestion.id, answer: '', flagged: true }];
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      saveProgress();

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
          currentIndex,
          timeRemaining,
          answers,
          result: {
            score: correctCount,
            percentage,
            timeTakenSeconds: (test?.duration_minutes ?? 15) * 60 - timeRemaining,
            completedAt: new Date().toISOString(),
          },
        };
        setSession(next);
        savePracticeSession(sessionId, next);
      }
      navigate(`/candidate/results/${sessionId}`, { replace: true });

    } catch (err) {
      console.error('Error submitting test:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit test. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Keep autoSubmitRef updated with latest handleSubmit
  useEffect(() => {
    autoSubmitRef.current = handleSubmit;
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentAnswer = () => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return null;
    return answers.find((a) => a.questionId === currentQuestion.id);
  };

  const isCurrentFlagged = () => {
    return getCurrentAnswer()?.flagged || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const options = currentQuestion?.options as string[] | null;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = answers.filter((a) => a.answer).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b px-4 py-3">
        <div className="max-w-4xl mx-auto">
          {/* Top row: Exit, Practice Mode + Timer (centered), Submit */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/practice')}
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Exit
            </Button>

            {/* Centered: Practice Mode + Timer stacked */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center mt-1">
              <Badge variant="outline" className="font-mono uppercase text-[10px] tracking-wider mb-1">
                Practice Mode
              </Badge>
              <div className={`font-mono text-lg transition-colors duration-300 ${
                timeRemaining < 10 
                  ? 'text-primary animate-pulse' 
                  : timeRemaining < 60 
                    ? 'text-primary' 
                    : 'text-foreground'
              }`}>
                {formatTime(timeRemaining)}
              </div>
            </div>

            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Submit'}
            </Button>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-2 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-muted-foreground font-mono">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-muted-foreground">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <Button
                  variant={isCurrentFlagged() ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleFlag}
                >
                  <Flag className={`h-4 w-4 mr-1 ${isCurrentFlagged() ? 'fill-current' : ''}`} />
                  {isCurrentFlagged() ? 'Flagged' : 'Flag'}
                </Button>
              </div>

              {/* Question Text */}
              <div className="mb-8">
                <p className="text-xl font-medium leading-relaxed">
                  {currentQuestion?.question_text}
                </p>
              </div>

              {/* Options */}
              {currentQuestion?.question_type === 'multiple_choice' && options && (
                <QuestionOptions
                  options={options}
                  selectedAnswer={getCurrentAnswer()?.answer || null}
                  onSelect={handleAnswer}
                  category={(currentQuestion as any).category}
                />
              )}

              {/* True/False */}
              {currentQuestion?.question_type === 'true_false' && (
                <QuestionOptions
                  options={['True', 'False']}
                  selectedAnswer={getCurrentAnswer()?.answer || null}
                  onSelect={handleAnswer}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {currentIndex > 0 ? (
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            ) : (
              <div /> 
            )}

            <Button
              variant={currentIndex === questions.length - 1 ? 'default' : 'outline'}
              onClick={() => {
                if (currentIndex === questions.length - 1) {
                  handleSubmit();
                } else {
                  setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
                }
              }}
              disabled={submitting}
            >
              {currentIndex === questions.length - 1 ? (
                submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
