import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  Clock,
  AlertTriangle
} from 'lucide-react';
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
import type { Tables } from '@/integrations/supabase/types';

type TestQuestion = Tables<'test_questions'>;

export interface TestAnswer {
  questionId: string;
  answer: string;
  flagged?: boolean;
}

export interface TestInterfaceProps {
  // Test configuration
  mode: 'practice' | 'mock' | 'invited';
  testName?: string;
  questions: TestQuestion[];
  
  // Timer
  initialTimeRemaining: number;
  
  // State
  initialAnswers?: TestAnswer[];
  initialIndex?: number;
  
  // Callbacks
  onSubmit: (answers: TestAnswer[], timeTakenSeconds: number) => Promise<void>;
  onExit: () => void;
  onSaveProgress?: (answers: TestAnswer[], currentIndex: number, timeRemaining: number) => void;
  
  // Optional: Question navigator (shown for invited tests)
  showQuestionNavigator?: boolean;
}

export function TestInterface({
  mode,
  testName,
  questions,
  initialTimeRemaining,
  initialAnswers = [],
  initialIndex = 0,
  onSubmit,
  onExit,
  onSaveProgress,
  showQuestionNavigator = false,
}: TestInterfaceProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [answers, setAnswers] = useState<TestAnswer[]>(initialAnswers);
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const autoSubmitRef = useRef<() => void>(() => {});
  const startTimeRef = useRef(Date.now());

  // Timer with auto-submit
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

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!onSaveProgress) return;
    
    const interval = setInterval(() => {
      onSaveProgress(answers, currentIndex, timeRemaining);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [answers, currentIndex, timeRemaining, onSaveProgress]);

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
    if (unansweredCount > 1 && !showSubmitDialog) {
      toast({
        title: 'PRO TIP',
        description: 'Unanswered questions are marked as incorrect. Better to guess than leave blank!',
        duration: 5000,
      });
    }

    setSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      await onSubmit(answers, timeTaken);
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

  // Keep autoSubmitRef updated
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

  const currentQuestion = questions[currentIndex];
  const options = currentQuestion?.options as string[] | null;
  const answeredCount = answers.filter((a) => a.answer).length;
  const flaggedCount = answers.filter((a) => a.flagged).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const getModeLabel = () => {
    switch (mode) {
      case 'practice': return 'PRACTICE MODE';
      case 'mock': return 'MOCK TEST';
      case 'invited': return testName || 'CCAT ASSESSMENT';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onExit}
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Exit
            </Button>

            {/* Centered: Mode + Timer */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
              <Badge variant="outline" className="font-mono uppercase text-[10px] tracking-wider mb-2">
                {getModeLabel()}
              </Badge>
              <div className={`flex items-center gap-2 font-mono text-lg transition-colors duration-300 ${
                timeRemaining < 10 
                  ? 'text-destructive animate-pulse' 
                  : timeRemaining < 60 
                    ? 'text-primary' 
                    : 'text-foreground'
              }`}>
                <Clock className="h-4 w-4" />
                {formatTime(timeRemaining)}
              </div>
            </div>

            {/* Submit button for invited tests */}
            {mode === 'invited' && (
              <Button 
                size="sm" 
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitting}
              >
                Submit
              </Button>
            )}
            {mode !== 'invited' && <div className="w-16" />}
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-2 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground font-mono">
              Question {currentIndex + 1} of {questions.length}
            </span>
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
                  title="Flag this question to review later before submitting"
                >
                  <Flag className={`h-4 w-4 mr-1 ${isCurrentFlagged() ? 'fill-current' : ''}`} />
                  {isCurrentFlagged() ? 'Flagged' : 'Flag for Review'}
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

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {flaggedCount > 0 && (
                <span className="text-warning">{flaggedCount} flagged</span>
              )}
            </div>

            <Button
              variant={currentIndex === questions.length - 1 ? 'default' : 'outline'}
              onClick={() => {
                if (currentIndex === questions.length - 1) {
                  if (mode === 'invited') {
                    setShowSubmitDialog(true);
                  } else {
                    handleSubmit();
                  }
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

          {/* Question Navigator (for invited tests) */}
          {showQuestionNavigator && (
            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-3">Question Navigator</p>
              <div className="flex flex-wrap gap-2">
                {questions.map((q, idx) => {
                  const answer = answers.find(a => a.questionId === q.id);
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
          )}
        </div>
      </main>

      {/* Submit Dialog (for invited tests) */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Are you sure you want to submit your test? You cannot change your answers after submission.</p>
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
            <AlertDialogAction onClick={() => handleSubmit()} disabled={submitting}>
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
