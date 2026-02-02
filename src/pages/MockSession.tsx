import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QuestionOptions } from '@/components/test/QuestionOptions';
import { useAuth } from '@/hooks/useAuth';
import { 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Flag,
  ArrowLeft,
  Zap
} from 'lucide-react';
import type { Tables, Json } from '@/integrations/supabase/types';
import {
  loadPracticeSession,
  savePracticeSession,
  type PracticeAnswer,
  type PracticeSessionState,
} from '@/lib/practiceSessionStorage';

type TestQuestion = Tables<'test_questions'>;

export default function MockSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PracticeSessionState | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PracticeAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const autoSubmitRef = useRef<() => void>(() => {});

  useEffect(() => {
    loadSessionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  useEffect(() => {
    if (timeRemaining <= 0 || submitting) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
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
      setCurrentIndex(hydrated.currentIndex || 0);
      setAnswers(Array.isArray(hydrated.answers) ? hydrated.answers : []);
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

  useEffect(() => {
    const interval = setInterval(saveProgress, 30000);
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

    // Pro tip toast for unanswered questions
    const unansweredCount = questions.length - answers.filter(a => a.answer).length;
    if (unansweredCount > 1) {
      toast({
        title: 'PRO TIP',
        description: 'Better pick a random answer instead of leaving questions unanswered.',
        duration: 5000,
      });
    }

    setSubmitting(true);

    try {
      saveProgress();

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

      const timeTaken = 5 * 60 - timeRemaining;

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
            timeTakenSeconds: timeTaken,
            completedAt: new Date().toISOString(),
          },
        };
        setSession(next);
        savePracticeSession(sessionId, next);

        // Save to candidate_test_history
        if (user) {
          await supabase.from('candidate_test_history').insert({
            user_id: user.id,
            session_id: sessionId,
            test_type: 'mock',
            score: correctCount,
            total_questions: questions.length,
            time_taken_seconds: timeTaken,
            category_scores: {},
            completed_at: new Date().toISOString(),
          });
        }
      }

      navigate(`/candidate/mock/results/${sessionId}`, { replace: true });
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

  const isCurrentFlagged = () => getCurrentAnswer()?.flagged || false;

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
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Exit
            </Button>

            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center mt-1">
              <div className="flex items-center gap-1 mb-1">
                <Zap className="h-3 w-3 text-primary" />
                <Badge variant="outline" className="font-mono uppercase text-[10px] tracking-wider">
                  Mock Test
                </Badge>
              </div>
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

            <div className="w-16" /> {/* Spacer for balance */}
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

              <div className="mb-8">
                <p className="text-xl font-medium leading-relaxed">
                  {currentQuestion?.question_text}
                </p>
              </div>

              {currentQuestion?.question_type === 'multiple_choice' && options && (
                <QuestionOptions
                  options={options}
                  selectedAnswer={getCurrentAnswer()?.answer || null}
                  onSelect={handleAnswer}
                  category={(currentQuestion as any).category}
                />
              )}

              {currentQuestion?.question_type === 'true_false' && (
                <QuestionOptions
                  options={['True', 'False']}
                  selectedAnswer={getCurrentAnswer()?.answer || null}
                  onSelect={handleAnswer}
                />
              )}
            </CardContent>
          </Card>

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
