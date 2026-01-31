import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle, Clock, Target, Trophy, ArrowRight, Home } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type TestResult = Tables<'test_results'>;
type TestLibrary = Tables<'test_library'>;

// Calculate percentile dynamically
const calculatePercentile = async (testId: string, userScore: number): Promise<number> => {
  const { count: totalResults } = await supabase
    .from('test_results')
    .select('*', { count: 'exact', head: true })
    .eq('test_id', testId);
    
  const { count: belowScore } = await supabase
    .from('test_results')
    .select('*', { count: 'exact', head: true })
    .eq('test_id', testId)
    .lt('score', userScore);
    
  if (!totalResults || totalResults === 0) return 50; // Default to 50th percentile
  return Math.round(((belowScore || 0) / totalResults) * 100);
};

interface QuestionBreakdown {
  questionId: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
}

export default function TestResults() {
  const { token, sessionId } = useParams<{ token: string; sessionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TestResult | null>(null);
  const [test, setTest] = useState<TestLibrary | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [calculatedPercentage, setCalculatedPercentage] = useState<number>(0);

  useEffect(() => {
    loadResults();
  }, [sessionId]);

  const loadResults = async () => {
    if (!sessionId) return;

    try {
      const { data: resultData, error: resultError } = await supabase
        .from('test_results')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (resultError) throw resultError;
      if (!resultData) {
        // Results not yet available, might still be processing
        setLoading(false);
        return;
      }

      setResult(resultData);

      const { data: testData, error: testError } = await supabase
        .from('test_library')
        .select('*')
        .eq('id', resultData.test_id)
        .single();

      if (testError) throw testError;
      setTest(testData);

      // Calculate percentage from raw score
      const breakdown = resultData.question_breakdown as unknown as QuestionBreakdown[] || [];
      const totalQuestions = breakdown.length || testData.question_count || 1;
      const percentage = Math.round((resultData.score / totalQuestions) * 100);
      setCalculatedPercentage(percentage);

      // Calculate percentile dynamically
      const pct = await calculatePercentile(resultData.test_id, resultData.score);
      setPercentile(pct);

    } catch (err) {
      console.error('Error loading results:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent', variant: 'default' as const };
    if (percentage >= 80) return { label: 'Great', variant: 'default' as const };
    if (percentage >= 70) return { label: 'Good', variant: 'secondary' as const };
    if (percentage >= 60) return { label: 'Fair', variant: 'secondary' as const };
    return { label: 'Needs Improvement', variant: 'destructive' as const };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Results Not Available</CardTitle>
            <CardDescription>
              Your test results are being processed. Please check back shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => loadResults()}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const breakdown = result.question_breakdown as unknown as QuestionBreakdown[] || [];
  const correctCount = breakdown.filter(q => q.isCorrect).length;
  const totalQuestions = breakdown.length || test?.question_count || 0;
  const scoreBadge = getScoreBadge(calculatedPercentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Test Complete!</h1>
            <p className="text-muted-foreground">
              Here's how you performed on {test?.name}
            </p>
          </div>

          {/* Score Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 text-center">
              <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
                {scoreBadge.label}
              </Badge>
              <p className="text-7xl font-bold mb-2">
                {result.score}/{totalQuestions}
              </p>
              <p className="text-primary-foreground/80">
                Raw Score • {calculatedPercentage}% accuracy
                {percentile !== null && ` • ${percentile}th percentile`}
              </p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold">{correctCount}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <XCircle className="h-5 w-5 mx-auto mb-2 text-destructive" />
                  <p className="text-2xl font-bold">{totalQuestions - correctCount}</p>
                  <p className="text-xs text-muted-foreground">Incorrect</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    {result.time_taken_seconds ? formatTime(result.time_taken_seconds) : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Time Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accuracy</span>
                  <span className="font-medium">{calculatedPercentage}%</span>
                </div>
                <Progress value={calculatedPercentage} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completion</span>
                  <span className="font-medium">100%</span>
                </div>
                <Progress value={100} className="bg-muted" />
              </div>

              {result.time_taken_seconds && test && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Time Efficiency</span>
                    <span className="font-medium">
                      {Math.round((result.time_taken_seconds / (test.duration_minutes * 60)) * 100)}% of allotted time
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, (result.time_taken_seconds / (test.duration_minutes * 60)) * 100)} 
                    className="bg-muted"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Question Summary */}
          {breakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Summary</CardTitle>
                <CardDescription>
                  Review your answers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-2">
                  {breakdown.map((q, idx) => (
                    <div
                      key={q.questionId}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${
                        q.isCorrect
                          ? 'bg-success/20 text-success'
                          : 'bg-destructive/20 text-destructive'
                      }`}
                      title={q.isCorrect ? 'Correct' : 'Incorrect'}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-success/20"></div>
                    Correct
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-destructive/20"></div>
                    Incorrect
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Want to improve your score?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Practice makes perfect. Try more tests to improve your cognitive aptitude skills.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link to="/candidate">
                        Practice More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/">
                        <Home className="mr-2 h-4 w-4" />
                        Go Home
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
