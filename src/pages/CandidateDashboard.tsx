import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CandidateBundleModal } from '@/components/CandidateBundleModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  Shapes,
  ShoppingCart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [invitations, setInvitations] = useState<TestInvitation[]>([]);
  const [testHistory, setTestHistory] = useState<TestHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPaidAccess, setHasPaidAccess] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  
  const [chartMode, setChartMode] = useState<'mock' | 'learning'>('mock');

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
    
    // Check for payment success redirect
    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId) {
      // Verify the payment and activate premium access
      const verifyPayment = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { session_id: sessionId },
          });
          
          if (error) throw error;
          
          if (data?.success) {
            toast.success('Payment successful! Your premium access is now active.');
            setHasPaidAccess(true);
            // Refetch data to show updated state
            fetchData();
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error('Failed to verify payment. Please contact support.');
        }
        
        // Clear the query params
        setSearchParams({});
      };
      
      verifyPayment();
    } else if (paymentStatus === 'cancelled') {
      toast.info('Payment was cancelled.');
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, searchParams]);

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
        
        // Check if user has paid access by checking test_bundles
        // A paid candidate will have a bundle record
        const { data: bundleData, error: bundleError } = await supabase
          .from('test_bundles')
          .select('id')
          .limit(1);
        
        if (!bundleError && bundleData && bundleData.length > 0) {
          setHasPaidAccess(true);
        } else {
          // Also check user metadata for paid status (legacy check)
          const isPaid = user.user_metadata?.has_premium_access === true;
          setHasPaidAccess(isPaid);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // handlePurchaseBundle removed - now handled by CandidateBundleModal

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
        correct: null as number | null,
        total: null as number | null,
      });
    }
    return days;
  };

  const hasMockTests = testHistory.some(e => e.test_type === 'mock');
  const hasLearningTests = testHistory.some(e => e.test_type === 'learning');
  const showToggle = hasMockTests && hasLearningTests;

  // Map test history to the 10-day chart, filtered by chartMode
  const chartData = (() => {
    const days = getLast10Days();
    const filteredHistory = testHistory.filter(entry => entry.test_type === chartMode);
    filteredHistory.forEach(entry => {
      const entryDate = new Date(entry.completed_at).toISOString().split('T')[0];
      const dayIndex = days.findIndex(d => d.fullDate === entryDate);
      if (dayIndex !== -1) {
        days[dayIndex].score = Math.round((entry.score / entry.total_questions) * 100);
        days[dayIndex].correct = entry.score;
        days[dayIndex].total = entry.total_questions;
      }
    });
    return days;
  })();

  // Calculate category averages from test history
  const totalTests = testHistory.length;
  const avgScore = totalTests > 0 
    ? Math.round(testHistory.reduce((sum, t) => sum + (t.score / t.total_questions) * 100, 0) / totalTests)
    : 0;

  // Calculate improvement from first test
  const firstTestScore = testHistory.length > 0 
    ? Math.round((testHistory[testHistory.length - 1].score / testHistory[testHistory.length - 1].total_questions) * 100)
    : null;
  const scoreImprovement = firstTestScore !== null && totalTests > 1
    ? avgScore - firstTestScore
    : null;

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
                      <Link to={`/invite/${invitation.invitation_token}`}>
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Score Over Time
                  </CardTitle>
                  <CardDescription>Score trends across your practice sessions</CardDescription>
                </div>
                {showToggle && (
                <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                  <button
                    onClick={() => setChartMode('mock')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      chartMode === 'mock'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Zap className="h-3 w-3 inline mr-1" />
                    Mock
                  </button>
                  <button
                    onClick={() => setChartMode('learning')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      chartMode === 'learning'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <BookOpen className="h-3 w-3 inline mr-1" />
                    Learning
                  </button>
                </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="hsl(var(--border))" 
                      strokeOpacity={0.3}
                      horizontal={true}
                      vertical={true}
                    />
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
                      formatter={(value: number, _name: string, props: any) => {
                        const { payload } = props;
                        if (payload.correct !== null && payload.total !== null) {
                          return [`${value}% (${payload.correct}/${payload.total})`, 'Score'];
                        }
                        return [`${value}%`, 'Score'];
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#f97316"
                      strokeWidth={2}
                      fill="url(#scoreGradient)"
                      dot={{ fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                      connectNulls={false}
                    />
                  </AreaChart>
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
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{avgScore}%</span>
                  {scoreImprovement !== null && (
                    <span className={`text-xs font-medium ${scoreImprovement >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {scoreImprovement >= 0 ? '+' : ''}{scoreImprovement}%
                    </span>
                  )}
                </div>
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
        <CardTitle className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          Practice
        </CardTitle>
        <TooltipProvider>
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 mb-8">
            {/* First Card - Mock Test (paid) or Practice Test (free) */}
            {hasPaidAccess ? (
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
            ) : (
              <Card className="card-elevated hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Play className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Practice Test</CardTitle>
                      <CardDescription>Try a free sample assessment</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li>• 50 questions</li>
                    <li>• 15 minute countdown</li>
                    <li>• See how you score</li>
                  </ul>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Button className="w-full" asChild>
                        <Link to="/practice">
                          <Play className="h-4 w-4 mr-2" />
                          Take Practice Test
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Take a free practice test to see what the CCAT is like</p>
                    </TooltipContent>
                  </UITooltip>
                </CardContent>
              </Card>
            )}

            {/* OR Divider */}
            <div className="hidden md:flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-full w-px bg-border" />
                <span className="text-muted-foreground font-medium text-sm px-2 py-1 rounded-full bg-muted">OR</span>
                <div className="h-full w-px bg-border" />
              </div>
            </div>

            {/* Second Card - Learning Mode (paid) or Purchase Bundle (free) */}
            {hasPaidAccess ? (
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
                          <BookOpen className="h-4 w-4 mr-2" />
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
            ) : (
              <Card className="card-elevated hover:shadow-lg transition-shadow border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <ShoppingCart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Unlock Premium Access</CardTitle>
                      <CardDescription>Get unlimited practice tests</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                    <li>• Unlimited mock tests</li>
                    <li>• Learning mode with explanations</li>
                    <li>• Track your progress over time</li>
                  </ul>
                  <Button 
                    variant="outline"
                    className="w-full" 
                    onClick={() => setShowCheckoutDialog(true)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Purchase Bundle – €14
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TooltipProvider>

      </main>

      <CandidateBundleModal open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog} />
    </div>
  );
}
