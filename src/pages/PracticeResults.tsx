import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CandidateBundleModal } from '@/components/CandidateBundleModal';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { 
  Loader2, 
  Trophy, 
  Clock, 
  Home,
  RotateCcw,
  CheckCircle,
  XCircle,
  CircleDashed,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  Infinity
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { loadPracticeSession, type PracticeSessionState } from '@/lib/practiceSessionStorage';
import { savePendingScore } from '@/lib/pendingScoreStorage';
import { useAuth } from '@/hooks/useAuth';
import { ResultsRandomBackground } from '@/components/media/ResultsRandomBackground';

type TestLibrary = Tables<'test_library'>;

export default function PracticeResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PracticeSessionState | null>(null);
  const [test, setTest] = useState<TestLibrary | null>(null);
  const [showBundleModal, setShowBundleModal] = useState(false);
  
  const [displayedScore, setDisplayedScore] = useState(0);
  const animationStarted = useRef(false);
  const confettiTriggered = useRef(false);

  useEffect(() => {
    loadResults();
  }, [sessionId]);

  // Score count-up animation (2 seconds)
  useEffect(() => {
    if (session?.result && !animationStarted.current) {
      animationStarted.current = true;
      const targetScore = session.result.percentage;
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing function for smooth deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.round(easeOut * targetScore);
        setDisplayedScore(currentScore);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [session]);

  // Confetti for scores above 90%
  useEffect(() => {
    if (session?.result && session.result.percentage > 90 && !confettiTriggered.current) {
      confettiTriggered.current = true;
      
      const fireConfetti = () => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFF7ED']
        });
      };

      // Fire 3 confetti bursts, 1 second apart
      fireConfetti();
      setTimeout(fireConfetti, 1000);
      setTimeout(fireConfetti, 2000);
    }
  }, [session]);

  const loadResults = async () => {
    if (!sessionId) {
      navigate('/candidate', { replace: true });
      return;
    }

    try {
      const local = loadPracticeSession(sessionId);
      if (!local || !local.result) {
        navigate('/candidate', { replace: true });
        return;
      }

      setSession(local);

      // Fetch test details (public)
      const { data: testData, error: testError } = await supabase
        .from('test_library')
        .select('*')
        .eq('id', local.testId)
        .single();

      if (testError) throw testError;
      setTest(testData);

      // Save score to localStorage for anonymous users
      // This will be migrated to their account after signup
      if (!user && local.result) {
        savePendingScore({
          score: local.result.score,
          total_questions: testData.question_count,
          time_taken_seconds: local.result.timeTakenSeconds || 0,
          category_scores: {},
          test_type: 'practice',
          completed_at: new Date().toISOString(),
        });
      }

    } catch (err) {
      console.error('Error loading results:', err);
      navigate('/candidate', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // checkout handled by CandidateBundleModal

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent!';
    if (percentage >= 80) return 'Great Job!';
    if (percentage >= 70) return 'Good Work';
    if (percentage >= 60) return 'Keep Practicing';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || !session.result || !test) {
    return null;
  }

  const result = session.result;
  const answeredCount = session.answers?.length || 0;
  const incompleteCount = test.question_count - answeredCount;
  const incorrectCount = answeredCount - result.score;
  const completionRate = Math.round((answeredCount / test.question_count) * 100);

  return (
    <div className="relative min-h-screen bg-background py-8 px-4 overflow-hidden">
      <ResultsRandomBackground
        fallbackItems={[
          { kind: 'video', src: '/media/results/mymindloadin.mp4' },
          { kind: 'image', src: '/media/results/mountain.jpg' },
          { kind: 'image', src: '/media/results/house.jpeg' },
          { kind: 'image', src: '/media/results/productnerd-flower-garden.png' },
          { kind: 'image', src: '/media/results/asset.avif' },
        ]}
      />

      <div className="relative z-10 max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Practice Complete!</h1>
          <p className="text-muted-foreground">{test.name}</p>
        </div>

        {/* Score Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="text-[10rem] leading-none font-display font-bold mb-2 text-primary">
                {result.score}
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {getScoreLabel(result.percentage)}
              </Badge>
            </div>

            {/* Segmented Progress Bar - shows correct/incorrect/incomplete proportions */}
            <div className="h-4 mb-6 rounded-full overflow-hidden flex bg-muted">
              {result.score > 0 && (
                <div 
                  className="bg-success h-full transition-all duration-1000" 
                  style={{ width: `${(result.score / test.question_count) * 100}%` }}
                />
              )}
              {incorrectCount > 0 && (
                <div 
                  className="bg-destructive h-full transition-all duration-1000" 
                  style={{ width: `${(incorrectCount / test.question_count) * 100}%` }}
                />
              )}
              {incompleteCount > 0 && (
                <div 
                  className="bg-muted-foreground/30 h-full transition-all duration-1000" 
                  style={{ width: `${(incompleteCount / test.question_count) * 100}%` }}
                />
              )}
            </div>

            {/* Stats Grid - 3 columns */}
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-success mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-2xl font-display">{result.score}</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Correct</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-destructive mb-1">
                  <XCircle className="h-4 w-4" />
                  <span className="text-2xl font-display">{incorrectCount}</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Incorrect</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <CircleDashed className="h-4 w-4" />
                  <span className="text-2xl font-display">{incompleteCount}</span>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Not Completed</p>
              </div>
            </div>

            {/* Time Taken - Full width */}
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-mono">{formatTime(result.timeTakenSeconds || 0)}</span>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Time Taken</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">
              Performance Summary
            </CardTitle>
            <span className="text-2xl font-display font-bold text-primary">{displayedScore}%</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Completion Rate</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg. Time per Question</span>
                <span className="font-medium">
                   {formatTime(Math.round((result.timeTakenSeconds || 0) / test.question_count))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {test.slug === 'firstfreetest' ? (
            <>
              <Button className="w-full" asChild>
                <Link to="/candidate/start?test=secondfreetest">
                  <RotateCcw className="h-3 w-3 mr-2" />
                  Try One More Test
                </Link>
              </Button>
              {user ? (
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/dashboard">
                    <Home className="h-3 w-3 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <Button 
                  variant="secondary"
                  className="w-full"
                  onClick={() => setShowBundleModal(true)}
                >
                  Unlimited Premium Tests €14
                  <Sparkles className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            // secondfreetest or any other - no more free tests available
            <>
              {user ? (
                <Button className="w-full" asChild>
                  <Link to="/dashboard">
                    <Home className="h-3 w-3 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button 
                    className="w-full"
                    onClick={() => setShowBundleModal(true)}
                  >
                    Unlimited Premium Tests €14
                    <Sparkles className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth/candidate">
                      Sign In
                    </Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <CandidateBundleModal open={showBundleModal} onOpenChange={setShowBundleModal} />
    </div>
  );
}
