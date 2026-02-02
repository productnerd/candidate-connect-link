import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { QuestionOptions } from '@/components/test/QuestionOptions';
import { Loader2, Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Tables, Json } from '@/integrations/supabase/types';

type TestSession = Tables<'test_sessions'>;
type TestQuestion = Tables<'test_questions'>;
type TestLibrary = Tables<'test_library'>;

interface Answer {
  questionId: string;
  answer: string;
  flagged?: boolean;
}

export default function TestSession() {
  const { token, sessionId } = useParams<{ token: string; sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<TestSession | null>(null);
  const [test, setTest] = useState<TestLibrary | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(Date.now());

  useEffect(() => {
    loadSession();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId]);

  useEffect(() => {
    if (timeRemaining > 0 && !loading) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          
          // Auto-save every 30 seconds
          if (Date.now() - lastSaveRef.current > 30000) {
            saveProgress(prev - 1);
            lastSaveRef.current = Date.now();
          }
          
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [loading, timeRemaining > 0]);

  const loadSession = async () => {
    if (!sessionId) return;

    try {
      // Load session
      const { data: sessionData, error: sessionError } = await supabase
        .from('test_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      
      if (sessionData.status === 'completed') {
        navigate(`/test/${token}/results/${sessionId}`);
        return;
      }

      setSession(sessionData);
      setTimeRemaining(sessionData.time_remaining_seconds || 0);
      setCurrentIndex(sessionData.current_question_index || 0);
      
      // Parse saved answers
      if (sessionData.answers) {
        const savedAnswers = sessionData.answers as unknown as Answer[];
        if (Array.isArray(savedAnswers)) {
          setAnswers(savedAnswers);
        }
      }

      // Load test info
      const { data: testData, error: testError } = await supabase
        .from('test_library')
        .select('*')
        .eq('id', sessionData.test_id)
        .single();

      if (testError) throw testError;
      setTest(testData);

      // Load questions via junction table
      const { data: linksData, error: linksError } = await supabase
        .from('test_question_links')
        .select(`
          order_number,
          question:test_questions(*)
        `)
        .eq('test_id', sessionData.test_id)
        .order('order_number', { ascending: true });

      if (linksError) throw linksError;
      
      // Extract questions from links and flatten
      const questionsData = (linksData || [])
        .map(link => link.question)
        .filter((q): q is TestQuestion => q !== null);
      setQuestions(questionsData);

    } catch (err) {
      console.error('Error loading session:', err);
      toast({
        title: 'Error',
        description: 'Failed to load test session',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (currentTime?: number) => {
    if (!session) return;

    try {
      await supabase
        .from('test_sessions')
        .update({
          answers: answers as unknown as Json,
          current_question_index: currentIndex,
          time_remaining_seconds: currentTime ?? timeRemaining,
        })
        .eq('id', session.id);
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const handleTimeUp = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    await submitTest(true);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], answer };
        return updated;
      }
      return [...prev, { questionId, answer }];
    });
  };

  const toggleFlag = (questionId: string) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], flagged: !updated[existing].flagged };
        return updated;
      }
      return [...prev, { questionId, answer: '', flagged: true }];
    });
  };

  const getCurrentAnswer = (questionId: string) => {
    return answers.find(a => a.questionId === questionId);
  };

  const submitTest = async (timeUp = false) => {
    if (!session || !test || !token) return;

    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      // Calculate score
      let score = 0;
      const questionBreakdown = questions.map(q => {
        const userAnswer = answers.find(a => a.questionId === q.id);
        const isCorrect = userAnswer?.answer === q.correct_answer;
        if (isCorrect) score += (q.points || 1);
        return {
          questionId: q.id,
          userAnswer: userAnswer?.answer || null,
          correctAnswer: q.correct_answer,
          isCorrect,
          points: isCorrect ? (q.points || 1) : 0,
        };
      });

      const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
      const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;

      // Get invitation for candidate email
      const { data: invitation } = await supabase
        .from('test_invitations')
        .select('*')
        .eq('invitation_token', token)
        .single();

      // Create result (raw score only, no percentage stored)
      const { error: resultError } = await supabase
        .from('test_results')
        .insert({
          session_id: session.id,
          test_id: test.id,
          invitation_id: invitation?.id || null,
          organization_id: invitation?.organization_id || null,
          candidate_email: invitation?.candidate_email || 'anonymous',
          score,
          time_taken_seconds: (test.duration_minutes * 60) - timeRemaining,
          question_breakdown: questionBreakdown as unknown as Json,
        });

      if (resultError) throw resultError;

      // Update session status
      await supabase
        .from('test_sessions')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          answers: answers as unknown as Json,
        })
        .eq('id', session.id);

      // Update invitation status
      if (invitation) {
        await supabase
          .from('test_invitations')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', invitation.id);
      }

      navigate(`/test/${token}/results/${session.id}`);

    } catch (err) {
      console.error('Error submitting test:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit test. Please try again.',
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.filter(a => a.answer).length;
  const flaggedCount = answers.filter(a => a.flagged).length;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Progress */}
            <div className="flex items-center gap-4 flex-1">
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{test?.name}</p>
                <p className="text-xs text-muted-foreground">
                  Question {currentIndex + 1} of {questions.length}
                </p>
              </div>
              <Progress value={progress} className="w-32 sm:w-48" />
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeRemaining < 60 ? 'bg-destructive/10 text-destructive' : 
              timeRemaining < 300 ? 'bg-warning/10 text-warning' : 
              'bg-muted'
            }`}>
              <Clock className="h-4 w-4" />
              <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
            </div>

            {/* Spacer for balance */}
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Question */}
      <main className="flex-1 container py-8">
        <div className="max-w-3xl mx-auto">
          {currentQuestion ? (
            <Card>
              <CardContent className="pt-6">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-6">
                  <Badge variant="secondary">
                    Question {currentIndex + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={getCurrentAnswer(currentQuestion.id)?.flagged ? 'text-warning' : ''}
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    {getCurrentAnswer(currentQuestion.id)?.flagged ? 'Flagged' : 'Flag for review'}
                  </Button>
                </div>

                {/* Question Text */}
                <p className="text-lg mb-8">{currentQuestion.question_text}</p>

                {/* Options */}
                {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                  <QuestionOptions
                    options={currentQuestion.options as string[]}
                    selectedAnswer={getCurrentAnswer(currentQuestion.id)?.answer || null}
                    onSelect={(value) => handleAnswer(currentQuestion.id, value)}
                    category={(currentQuestion as any).category}
                  />
                )}

                {currentQuestion.question_type === 'true_false' && (
                  <QuestionOptions
                    options={['True', 'False']}
                    selectedAnswer={getCurrentAnswer(currentQuestion.id)?.answer || null}
                    onSelect={(value) => handleAnswer(currentQuestion.id, value)}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No questions available</p>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{answeredCount} answered</span>
              {flaggedCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-warning">{flaggedCount} flagged</span>
                </>
              )}
            </div>

            <Button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Question Navigator */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium mb-3">Question Navigator</p>
            <div className="flex flex-wrap gap-2">
              {questions.map((q, idx) => {
                const answer = getCurrentAnswer(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      idx === currentIndex
                        ? 'bg-primary text-primary-foreground'
                        : answer?.answer
                        ? 'bg-success/20 text-success'
                        : answer?.flagged
                        ? 'bg-warning/20 text-warning'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Are you sure you want to submit your test?</p>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="flex justify-between">
                    <span>Questions answered:</span>
                    <span className="font-medium">{answeredCount} of {questions.length}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Unanswered:</span>
                    <span className="font-medium">{questions.length - answeredCount}</span>
                  </p>
                  {flaggedCount > 0 && (
                    <p className="flex justify-between text-warning">
                      <span>Flagged for review:</span>
                      <span className="font-medium">{flaggedCount}</span>
                    </p>
                  )}
                </div>
                {questions.length - answeredCount > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg text-warning text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>You have unanswered questions. Unanswered questions will be marked as incorrect.</span>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={() => submitTest()} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Test'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
