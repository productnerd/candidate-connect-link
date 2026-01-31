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

  // Prepare chart data
  const chartData = testHistory
    .slice()
    .reverse()
    .slice(-10) // Last 10 tests
    .map(entry => ({
      date: new Date(entry.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round((entry.score / entry.total_questions) * 100),
      type: entry.test_type,
    }));

  // Calculate category averages (mock data for now since we don't have detailed category tracking yet)
  const totalTests = testHistory.length;
  const avgScore = totalTests > 0 
    ? Math.round(testHistory.reduce((sum, t) => sum + (t.score / t.total_questions) * 100, 0) / totalTests)
    : 0;

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || 'Candidate'}!</h1>
          <p className="text-muted-foreground">Your practice hub for unlimited test preparation</p>
        </div>

        {/* Pending Tests - Compact */}
        {pendingTests.length > 0 && (
          <Card className="card-elevated mb-6 border-warning/50">
            <CardHeader className="py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-warning" />
                {pendingTests.length} Pending Assessment{pendingTests.length > 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
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

        {/* Progress Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Score Chart */}
          <Card className="card-elevated md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Your Progress
              </CardTitle>
              <CardDescription>Score trends across your practice sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
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
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Complete your first practice test to see your progress!</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
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
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Category Focus</p>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">
                    <Brain className="h-3 w-3 mr-1" />Math
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />Verbal
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Shapes className="h-3 w-3 mr-1" />Spatial
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Practice Actions */}
        <h2 className="text-xl font-semibold mb-4">Start Practicing</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
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
                <li>• 5 random premium questions</li>
                <li>• 5 minutes time limit</li>
                <li>• Simulates real test conditions</li>
              </ul>
              <Button className="w-full" asChild>
                <Link to="/candidate/mock">
                  <Zap className="h-4 w-4 mr-2" />
                  Start Mock Test
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Learning Mode Card */}
          <Card className="card-elevated hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-success/10">
                  <BookOpen className="h-6 w-6 text-success" />
                </div>
                <div>
                  <CardTitle>Learning Mode</CardTitle>
                  <CardDescription>Practice at your own pace</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• No time pressure</li>
                <li>• Instant feedback after each answer</li>
                <li>• Detailed explanations provided</li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/candidate/learn">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Start Learning
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

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
                          : 'bg-success/10'
                      }`}>
                        {entry.test_type === 'mock' ? (
                          <Zap className="h-4 w-4 text-primary" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-success" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{entry.test_type} Test</p>
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
