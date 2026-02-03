import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy,
  Clock,
  Zap,
  RotateCcw,
  Home
} from 'lucide-react';
import { loadPracticeSession, type PracticeSessionState } from '@/lib/practiceSessionStorage';
import { savePendingScore } from '@/lib/pendingScoreStorage';
import { useAuth } from '@/hooks/useAuth';

export default function MockResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<PracticeSessionState | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/dashboard', { replace: true });
      return;
    }

    const local = loadPracticeSession(sessionId);
    if (!local || !local.result) {
      navigate('/dashboard', { replace: true });
      return;
    }

    setSession(local);

    // Save score to localStorage for anonymous users
    if (!user && local.result) {
      savePendingScore({
        score: local.result.score,
        total_questions: 50, // Mock tests are always 50 questions
        time_taken_seconds: local.result.timeTakenSeconds || 0,
        category_scores: {},
        test_type: 'mock',
        completed_at: new Date().toISOString(),
      });
    }
  }, [sessionId, navigate, user]);

  if (!session || !session.result) {
    return null;
  }

  const { result } = session;
  const percentage = result.percentage;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
            <Zap className="h-4 w-4 text-primary" />
            <Badge variant="outline" className="font-mono uppercase text-[10px] tracking-wider">
              Mock Test Complete
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
              You got {result.score} out of 5 questions correct
            </p>

            <div className="mt-6">
              <Progress value={percentage} className="h-3" />
            </div>

            <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Completed in {formatTime(result.timeTakenSeconds)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button className="w-full" asChild>
            <Link to="/candidate/mock">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Another Mock Test
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
