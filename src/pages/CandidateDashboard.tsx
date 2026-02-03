import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  ClipboardList, 
  Trophy, 
  Clock, 
  Play,
  BookOpen,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  TrendingUp,
  Brain,
  MessageSquare,
  Shapes
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TestInvitation {
  id: string;
  test_id: string;
  candidate_email: string;
  candidate_name: string | null;
  status: string;
  invitation_token: string;
  expires_at: string;
  created_at: string;
  test_library: {
    name: string;
    description: string | null;
    duration_minutes: number;
  } | null;
}

interface TestHistoryEntry {
  id: string;
  test_type: string;
  score: number;
  total_questions: number;
  time_taken_seconds: number | null;
  completed_at: string;
  category_scores: unknown;
}

export default function CandidateDashboard() {
  const { profile, user } = useAuth();
  const [invitations, setInvitations] = useState<TestInvitation[]>([]);
  const [testHistory, setTestHistory] = useState<TestHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile]);

  const fetchData = async () => {
    try {
      // Fetch invitations if email available
      if (profile?.email) {
        const { data: invData, error: invError } = await supabase
          .from('test_invitations')
          .select('*, test_library(name, description, duration_minutes)')
          .eq('candidate_email', profile.email)
          .order('created_at', { ascending: false });

        if (!invError) {
          setInvitations((invData as TestInvitation[]) || []);
        }
      }

      // Fetch test history
      if (user) {
        const { data: historyData, error: historyError } = await supabase
          .from('candidate_test_history')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(20);

        if (!historyError) {
          setTestHistory(historyData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired && status === 'pending') {
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>;
    }

    switch (status) {
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'started':
        return <Badge className="bg-primary text-primary-foreground"><Play className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingTests = invitations.filter(i => i.status === 'pending' && new Date(i.expires_at) > new Date());

  // Generate 10-day x-axis labels (last 10 days)
  const getLast10Days = () => {
    const days = [];
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        score: null as number | null,
      });
    }
    return days;
  };

  // Map test history to the 10-day chart
  const chartData = (() => {
    const days = getLast10Days();
    testHistory.forEach(entry => {
      const entryDate = new Date(entry.completed_at).toISOString().split('T')[0];
      const dayIndex = days.findIndex(d => d.fullDate === entryDate);
      if (dayIndex !== -1) {
        // Use the latest score for that day (or average if needed)
        days[dayIndex].score = Math.round((entry.score / entry.total_questions) * 100);
      }
    });
    return days;
  })();

  // Calculate category averages from test history
  const totalTests = testHistory.length;
  const avgScore = totalTests > 0 
    ? Math.round(testHistory.reduce((sum, t) => sum + (t.score / t.total_questions) * 100, 0) / totalTests)
    : 0;

  // Calculate category accuracy
  const categoryStats = {
    math_logic: { correct: 0, total: 0 },
    verbal_reasoning: { correct: 0, total: 0 },
    spatial_reasoning: { correct: 0, total: 0 },
  };

  testHistory.forEach(entry => {
    const scores = entry.category_scores;
    if (scores && typeof scores === 'object' && !Array.isArray(scores)) {
      Object.entries(scores as Record<string, unknown>).forEach(([category, data]) => {
        if (categoryStats[category as keyof typeof categoryStats] && data && typeof data === 'object') {
          const typedData = data as { correct?: number; total?: number };
          categoryStats[category as keyof typeof categoryStats].correct += typedData.correct || 0;
          categoryStats[category as keyof typeof categoryStats].total += typedData.total || 0;
        }
      });
    }
  });

  const getCategoryAccuracy = (category: keyof typeof categoryStats) => {
    const stats = categoryStats[category];
    if (stats.total === 0) return '--';
    return `${Math.round((stats.correct / stats.total) * 100)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container pt-24 pb-8">
        {/* Header with Pending Assessments */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || 'Candidate'}!</h1>
            <p className="text-muted-foreground">Your practice hub for unlimited test preparation</p>
          </div>
          
          {/* Pending Assessments - Right aligned */}
          {pendingTests.length > 0 && (
            <Card className="card-elevated border-warning/50 min-w-[280px]">
              <CardHeader className="py-3 px-4">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-warning" />
                  {pendingTests.length} Pending Assessment{pendingTests.length > 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  {pendingTests.map((invitation) => (
                    <Button key={invitation.id} variant="outline" size="sm" asChild>
                      <Link to={`/test/${invitation.invitation_token}`}>
                        <Play className="h-3 w-3 mr-1" />
                        {invitation.test_library?.name || 'Assessment'}
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Score Chart */}
          <Card className="card-elevated md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Score Over Time
              </CardTitle>
              <CardDescription>Score trends across your practice sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      domain={[0, 100]}
                      label={{ value: 'CCAT Score', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))', fontSize: 11 } }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [`${value}%`, 'Score']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Progress Stats (renamed from Quick Stats, styled like Your Progress) */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Progress
              </CardTitle>
              <CardDescription>Your overall performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Tests Completed</span>
                </div>
                <span className="font-bold text-lg">{totalTests}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Average Score</span>
                </div>
                <span className="font-bold text-lg">{avgScore}%</span>
              </div>
              
              {/* Category Accuracy Section */}
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-3">Category Accuracy</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Badge variant="outline" className="text-xs mb-2">
                      <Brain className="h-3 w-3 mr-1" />Math
                    </Badge>
                    <p className="font-bold text-lg">{getCategoryAccuracy('math_logic')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Badge variant="outline" className="text-xs mb-2">
                      <MessageSquare className="h-3 w-3 mr-1" />Verbal
                    </Badge>
                    <p className="font-bold text-lg">{getCategoryAccuracy('verbal_reasoning')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Badge variant="outline" className="text-xs mb-2">
                      <Shapes className="h-3 w-3 mr-1" />Spatial
                    </Badge>
                    <p className="font-bold text-lg">{getCategoryAccuracy('spatial_reasoning')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Practice Actions */}
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Practice
        </h2>
        <TooltipProvider>
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 mb-8">
            {/* Mock Test Card */}
            <Card className="card-elevated hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Mock Test</CardTitle>
                    <CardDescription>Timed practice with premium questions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• 50 questions</li>
                  <li>• 15 minute countdown</li>
                  <li>• Answers revealed at the end</li>
                </ul>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button className="w-full" asChild>
                      <Link to="/candidate/mock">
                        <Zap className="h-4 w-4 mr-2" />
                        Start
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>We'll generate a random test from a bank of 100s of questions</p>
                  </TooltipContent>
                </UITooltip>
              </CardContent>
            </Card>

            {/* OR Divider */}
            <div className="hidden md:flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-full w-px bg-border" />
                <span className="text-muted-foreground font-medium text-sm px-2 py-1 rounded-full bg-muted">OR</span>
                <div className="h-full w-px bg-border" />
              </div>
            </div>

            {/* Learning Mode Test Card */}
            <Card className="card-elevated hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Learning Mode Test</CardTitle>
                    <CardDescription>Practice at your own pace</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• 50 questions</li>
                  <li>• No time pressure</li>
                  <li>• Instant feedback after each answer</li>
                </ul>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button className="w-full" asChild>
                      <Link to="/candidate/learn">
                        <Zap className="h-4 w-4 mr-2" />
                        Start
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>We'll generate a random test from a bank of 100s of questions</p>
                  </TooltipContent>
                </UITooltip>
              </CardContent>
            </Card>
          </div>
        </TooltipProvider>

        {/* Recent Tests */}
        {testHistory.length > 0 && (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Recent Practice Sessions</CardTitle>
              <CardDescription>Your latest test attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testHistory.slice(0, 5).map((entry) => (
                  <div 
                    key={entry.id} 
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        entry.test_type === 'mock' 
                          ? 'bg-primary/10' 
                          : 'bg-primary/10'
                      }`}>
                        {entry.test_type === 'mock' ? (
                          <Zap className="h-4 w-4 text-primary" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {entry.test_type === 'mock' ? 'Mock Test' : 'Learning Mode Test'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        (entry.score / entry.total_questions) >= 0.8 
                          ? 'text-success' 
                          : (entry.score / entry.total_questions) >= 0.6 
                            ? 'text-warning' 
                            : 'text-destructive'
                      }`}>
                        {Math.round((entry.score / entry.total_questions) * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.score}/{entry.total_questions}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
