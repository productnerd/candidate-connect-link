import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Loader2, 
  Trophy, 
  Clock, 
  Target,
  Home,
  RotateCcw,
  CheckCircle,
  XCircle,
  CircleDashed,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  Infinity,
  X
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { loadPracticeSession, type PracticeSessionState } from '@/lib/practiceSessionStorage';
import { useAuth } from '@/hooks/useAuth';

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

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 px-4">
      <div className="max-w-xl mx-auto">
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
              <div className={`text-[10rem] leading-none font-display font-bold mb-2 ${getScoreColor(result.percentage)}`}>
                {result.score}
              </div>
              <p className="text-muted-foreground mb-2">
                {displayedScore}% accuracy
              </p>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {getScoreLabel(result.percentage)}
              </Badge>
            </div>

            <Progress 
              value={displayedScore} 
              className="h-4 mb-6" 
            />

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
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Questions Attempted</span>
                <span className="font-medium">{answeredCount} / {test.question_count}</span>
              </div>
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
              variant="outline" 
              className="w-full"
              onClick={() => setShowBundleModal(true)}
            >
              <Sparkles className="h-3 w-3 mr-2" />
              Buy Unlimited Tests
            </Button>
          )}
        </div>
      </div>

      {/* Unlimited Bundle Modal */}
      <Dialog open={showBundleModal} onOpenChange={setShowBundleModal}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-0 shadow-none">
          {/* Glassmorphic Card */}
          <div className="relative">
            {/* Background Glow Effects */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/30 rounded-3xl blur-2xl opacity-60" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/40 rounded-full blur-3xl" />
            
            {/* Card */}
            <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
              {/* Close Button */}
              <button 
                onClick={() => setShowBundleModal(false)}
                className="absolute top-4 right-4 z-10 p-1 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header Gradient */}
              <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent px-6 pt-8 pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Infinity className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold text-center mb-1">
                  Unlimited Bundle
                </h3>
                <p className="text-center text-muted-foreground text-sm">
                  Unlock your full potential
                </p>
              </div>

              {/* Price */}
              <div className="px-6 py-4 text-center border-b border-border/50">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-display font-bold text-primary">€14</span>
                  <span className="text-muted-foreground">/lifetime</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">One-time payment, forever access</p>
              </div>

              {/* Features */}
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Infinity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Unlimited Practice Tests</p>
                    <p className="text-xs text-muted-foreground">Take as many tests as you need</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Detailed Analytics</p>
                    <p className="text-xs text-muted-foreground">Track your progress over time</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">All Question Categories</p>
                    <p className="text-xs text-muted-foreground">Cognitive, personality, skills & more</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Priority Support</p>
                    <p className="text-xs text-muted-foreground">Get help when you need it</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <Button className="w-full h-12 text-base shadow-lg shadow-primary/20" size="lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get Unlimited Access
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Secure checkout • Instant access
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
