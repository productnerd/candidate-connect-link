import { useState, useEffect } from 'react';
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
  ChevronRight, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import type { LearningSessionState } from './StartLearningTest';

type TestQuestion = Tables<'test_questions'>;

export default function LearningSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<LearningSessionState | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string; correct: boolean }[]>([]);

  useEffect(() => {
    loadSessionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const loadSessionData = async () => {
    if (!sessionId) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const stored = sessionStorage.getItem(`learning_session:${sessionId}`);
    if (!stored) {
      navigate('/dashboard', { replace: true });
      return;
    }

    try {
      const parsedSession: LearningSessionState = JSON.parse(stored);
      
      if (parsedSession.status === 'completed') {
        navigate(`/candidate/learn/results/${sessionId}`, { replace: true });
        return;
      }

      setSession(parsedSession);
      setCurrentIndex(parsedSession.currentIndex);
      setAnswers(parsedSession.answers || []);

      // Create backend session for RLS
      await supabase
        .from('test_sessions')
        .upsert({
          id: sessionId,
          test_id: 'ede289ed-48bf-4be9-9aaa-e8f5b1fec47e', // Use firstfreetest as a reference
          session_type: 'practice',
          status: 'in_progress',
          candidate_id: null,
          start_time: new Date().toISOString(),
          proctoring_enabled: false,
        }, { onConflict: 'id' });

      // Fetch questions by IDs
      const { data: questionsData, error: questionsError } = await supabase
        .from('test_questions')
        .select('*')
        .in('id', parsedSession.questionIds);

      if (questionsError) throw questionsError;

      // Sort questions to match the order in questionIds
      const sortedQuestions = parsedSession.questionIds
        .map(id => questionsData?.find(q => q.id === id))
        .filter((q): q is TestQuestion => q !== undefined);

      setQuestions(sortedQuestions);
    } catch (err) {
      console.error('Error loading learning session:', err);
      toast({
        title: 'Error',
        description: 'Failed to load learning session',
        variant: 'destructive',
      });
      navigate('/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const saveSession = (updates: Partial<LearningSessionState>) => {
    if (!sessionId || !session) return;
    const updated = { ...session, ...updates };
    setSession(updated);
    sessionStorage.setItem(`learning_session:${sessionId}`, JSON.stringify(updated));
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    const newAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      correct: isCorrect,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    saveSession({ answers: updatedAnswers });
    setRevealed(true);
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      // Complete the session
      saveSession({ status: 'completed', currentIndex: currentIndex + 1, answers });
      navigate(`/candidate/learn/results/${sessionId}`, { replace: true });
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setRevealed(false);
      saveSession({ currentIndex: nextIndex });
    }
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
  const isCorrect = selectedAnswer === currentQuestion?.correct_answer;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Exit
          </Button>

          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <Badge variant="outline" className="font-mono uppercase text-[10px] tracking-wider">
              Learning Mode Test
            </Badge>
          </div>

          <div className="w-16" /> {/* Spacer for balance */}
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-2 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-end mt-1">
            <span className="text-xs text-muted-foreground font-mono">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
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
                  selectedAnswer={selectedAnswer}
                  onSelect={(answer) => !revealed && setSelectedAnswer(answer)}
                  correctAnswer={revealed ? currentQuestion.correct_answer : undefined}
                  showCorrect={revealed}
                  disabled={revealed}
                  category={(currentQuestion as any).category}
                />
              )}

              {/* True/False */}
              {currentQuestion?.question_type === 'true_false' && (
                <QuestionOptions
                  options={['True', 'False']}
                  selectedAnswer={selectedAnswer}
                  onSelect={(answer) => !revealed && setSelectedAnswer(answer)}
                  correctAnswer={revealed ? currentQuestion.correct_answer : undefined}
                  showCorrect={revealed}
                  disabled={revealed}
                />
              )}

              {/* Feedback */}
              {revealed && (
                <div className={`mt-6 p-4 rounded-lg border ${
                  isCorrect 
                    ? 'bg-success/10 border-success/30' 
                    : 'bg-destructive/10 border-destructive/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className={`font-semibold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  
                  {currentQuestion?.explanation && (
                    <div className="flex items-start gap-2 mt-3 pt-3 border-t border-border/50">
                      <Lightbulb className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="flex justify-end mt-6">
            {!revealed ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {currentIndex === questions.length - 1 ? 'View Results' : 'Next Question'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
