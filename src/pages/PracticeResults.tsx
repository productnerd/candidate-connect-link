import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Trophy, 
  Clock, 
  Target,
  Home,
  RotateCcw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type TestResult = Tables<'test_results'>;
type TestLibrary = Tables<'test_library'>;

export default function PracticeResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TestResult | null>(null);
  const [test, setTest] = useState<TestLibrary | null>(null);

  useEffect(() => {
    loadResults();
  }, [sessionId]);

  const loadResults = async () => {
    if (!sessionId) {
      navigate('/dashboard');
      return;
    }

    try {
      // Fetch result by session ID
      const { data: resultData, error: resultError } = await supabase
        .from('test_results')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (resultError) throw resultError;
      
      if (!resultData) {
        navigate('/dashboard');
        return;
      }

      setResult(resultData);

      // Fetch test details
      const { data: testData, error: testError } = await supabase
        .from('test_library')
        .select('*')
        .eq('id', resultData.test_id)
        .single();

      if (testError) throw testError;
      setTest(testData);

    } catch (err) {
      console.error('Error loading results:', err);
      navigate('/dashboard');
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

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent!';
    if (percentage >= 80) return 'Great Job!';
    if (percentage >= 70) return 'Good Work!';
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

  if (!result || !test) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Practice Complete!</h1>
          <p className="text-muted-foreground">{test.name}</p>
        </div>

        {/* Score Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.percentage)}`}>
                {result.percentage}%
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {getScoreLabel(result.percentage)}
              </Badge>
            </div>

            <Progress 
              value={result.percentage} 
              className="h-4 mb-6" 
            />

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-success mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-2xl font-bold">{result.score}</span>
                </div>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-destructive mb-1">
                  <XCircle className="h-4 w-4" />
                  <span className="text-2xl font-bold">{test.question_count - result.score}</span>
                </div>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-2xl font-bold">{formatTime(result.time_taken_seconds || 0)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Time Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Questions Attempted</span>
                <span className="font-medium">{test.question_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Accuracy Rate</span>
                <span className="font-medium">{result.percentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg. Time per Question</span>
                <span className="font-medium">
                  {formatTime(Math.round((result.time_taken_seconds || 0) / test.question_count))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1" size="lg" asChild>
            <Link to="/practice/start">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Another Practice Test
            </Link>
          </Button>
          <Button variant="outline" className="flex-1" size="lg" asChild>
            <Link to="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
