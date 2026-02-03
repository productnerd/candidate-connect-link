import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy,
  BookOpen,
  RotateCcw,
  Home,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { LearningSessionState } from './StartLearningTest';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { savePendingScore } from '@/lib/pendingScoreStorage';

export default function LearningResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<LearningSessionState | null>(null);

  useEffect(() => {
    loadSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const loadSession = async () => {
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
      setSession(parsedSession);

      const correctCount = parsedSession.answers.filter(a => a.correct).length;
      const totalQuestions = parsedSession.questionIds.length;

      // Save to candidate_test_history if user is logged in
      if (user) {
        await supabase.from('candidate_test_history').insert({
          user_id: user.id,
          session_id: sessionId,
          test_type: 'learning',
          score: correctCount,
          total_questions: totalQuestions,
          time_taken_seconds: null, // No time tracking for learning mode
          category_scores: {},
          completed_at: new Date().toISOString(),
        });
      } else {
        // Save to localStorage for anonymous users to migrate after signup
        savePendingScore({
          score: correctCount,
          total_questions: totalQuestions,
          time_taken_seconds: 0,
          category_scores: {},
          test_type: 'learning',
          completed_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error loading learning results:', err);
    }
  };

  if (!session) {
    return null;
  }

  const correctCount = session.answers.filter(a => a.correct).length;
  const totalQuestions = session.questionIds.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreMessage = () => {
    if (percentage >= 80) return 'Excellent work!';
    if (percentage >= 60) return 'Good progress!';
    return 'Keep practicing!';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <Badge variant="outline" className="font-mono uppercase text-[10px] tracking-wider">
              Learning Mode Complete
            </Badge>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl pt-12 pb-8">
        {/* Score Card */}
        <Card className="card-elevated mb-8">
          <CardContent className="pt-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Trophy className={`h-10 w-10 ${getScoreColor()}`} />
            </div>
            
            <h1 className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>
              {percentage}%
            </h1>
            
            <p className="text-lg text-muted-foreground mb-2">
              {getScoreMessage()}
            </p>
            
            <p className="text-sm text-muted-foreground">
              You got {correctCount} out of {totalQuestions} questions correct
            </p>

            <div className="mt-6">
              <Progress value={percentage} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Question Summary */}
        <Card className="card-elevated mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Question Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {session.answers.map((answer, index) => (
                <div
                  key={answer.questionId}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                    answer.correct
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {answer.correct ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  Q{index + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button className="w-full" asChild>
            <Link to="/candidate/learn">
              <RotateCcw className="h-4 w-4 mr-2" />
              Practice Again
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full" asChild>
            <Link to="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
