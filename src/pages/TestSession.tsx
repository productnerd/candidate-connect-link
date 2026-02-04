import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Brain } from 'lucide-react';
import type { Tables, Json } from '@/integrations/supabase/types';
import { TestInterface, type TestAnswer } from '@/components/test/TestInterface';

type TestSession = Tables<'test_sessions'>;
type TestQuestion = Tables<'test_questions'>;
type TestLibrary = Tables<'test_library'>;

export default function TestSessionPage() {
  const { token, sessionId } = useParams<{ token: string; sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<TestSession | null>(null);
  const [test, setTest] = useState<TestLibrary | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialAnswers, setInitialAnswers] = useState<TestAnswer[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

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
        navigate(`/invite/${token}/results/${sessionId}`);
        return;
      }

      setSession(sessionData);
      setTimeRemaining(sessionData.time_remaining_seconds || 0);
      setInitialIndex(sessionData.current_question_index || 0);
      
      // Parse saved answers
      if (sessionData.answers) {
        const savedAnswers = sessionData.answers as unknown as TestAnswer[];
        if (Array.isArray(savedAnswers)) {
          setInitialAnswers(savedAnswers);
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

  const handleSaveProgress = async (answers: TestAnswer[], currentIndex: number, timeRemaining: number) => {
    if (!session) return;

    try {
      await supabase
        .from('test_sessions')
        .update({
          answers: answers as unknown as Json,
          current_question_index: currentIndex,
          time_remaining_seconds: timeRemaining,
        })
        .eq('id', session.id);
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const handleSubmit = async (answers: TestAnswer[], timeTakenSeconds: number) => {
    if (!session || !test || !token) return;

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

    // Get invitation for candidate email
    const { data: invitation } = await supabase
      .from('test_invitations')
      .select('*')
      .eq('invitation_token', token)
      .single();

    // Create result
    const { error: resultError } = await supabase
      .from('test_results')
      .insert({
        session_id: session.id,
        test_id: test.id,
        invitation_id: invitation?.id || null,
        organization_id: invitation?.organization_id || null,
        candidate_email: invitation?.candidate_email || 'anonymous',
        score,
        time_taken_seconds: timeTakenSeconds,
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

    navigate(`/invite/${token}/results/${session.id}`);
  };

  const handleExit = () => {
    // For invited tests, warn before exit
    if (confirm('Are you sure you want to exit? Your progress will be saved but you may not be able to resume.')) {
      navigate(`/invite/${token}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Brain className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <TestInterface
      mode="invited"
      testName={test?.name || 'CCAT Assessment'}
      questions={questions}
      initialTimeRemaining={timeRemaining}
      initialAnswers={initialAnswers}
      initialIndex={initialIndex}
      onSubmit={handleSubmit}
      onExit={handleExit}
      onSaveProgress={handleSaveProgress}
      showQuestionNavigator={true}
    />
  );
}
