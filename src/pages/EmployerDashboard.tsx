import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { RoleToggleBar } from '@/components/RoleToggleBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployerBundleModal } from '@/components/EmployerBundleModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Package,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalInvitations: number;
  pendingInvitations: number;
  completedTests: number;
  testsRemaining: number;
}

const ITEMS_PER_PAGE = 5;

interface EmployerDashboardProps {
  roleToggle?: {
    activeView: 'employer' | 'candidate';
    setActiveView: Dispatch<SetStateAction<'employer' | 'candidate'>>;
  };
}

export default function EmployerDashboard({ roleToggle }: EmployerDashboardProps) {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvitations: 0,
    pendingInvitations: 0,
    completedTests: 0,
    testsRemaining: 0,
  });
  const [allInvitations, setAllInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (profile?.organization_id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile?.organization_id) return;

    try {
      // Fetch ALL invitations (not limited to 5)
      const { data: invitations, error: invError } = await supabase
        .from('test_invitations')
        .select('*, test_library(name, question_count)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (invError) throw invError;

      // Fetch results for completed invitations
      const { data: results, error: resultsError } = await supabase
        .from('test_results')
        .select('invitation_id, score, session_id')
        .eq('organization_id', profile.organization_id);

      if (resultsError) throw resultsError;

      // Map results by invitation_id
      const resultsByInvitation = new Map();
      results?.forEach(r => {
        resultsByInvitation.set(r.invitation_id, r);
      });

      // Fetch session data to get invitation_token for result links
      const { data: sessions, error: sessionsError } = await supabase
        .from('test_sessions')
        .select('id, invitation_id');

      if (sessionsError) throw sessionsError;

      const sessionsByInvitation = new Map();
      sessions?.forEach(s => {
        if (s.invitation_id) sessionsByInvitation.set(s.invitation_id, s);
      });

      // Enrich invitations with result data
      const enrichedInvitations = invitations?.map(inv => ({
        ...inv,
        result: resultsByInvitation.get(inv.id) || null,
        session: sessionsByInvitation.get(inv.id) || null,
      })) || [];

      // Fetch bundles
      const { data: bundles, error: bundleError } = await supabase
        .from('test_bundles')
        .select('tests_remaining')
        .eq('organization_id', profile.organization_id);

      if (bundleError) throw bundleError;

      const totalRemaining = bundles?.reduce((sum, b) => sum + (b.tests_remaining || 0), 0) || 0;
      const pending = enrichedInvitations.filter(i => i.status === 'pending').length;
      const completed = enrichedInvitations.filter(i => i.status === 'completed').length;

      setStats({
        totalInvitations: enrichedInvitations.length,
        pendingInvitations: pending,
        completedTests: completed,
        testsRemaining: totalRemaining,
      });

      setAllInvitations(enrichedInvitations);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-[10px] uppercase tracking-wider"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'started':
        return <Badge className="bg-warning text-warning-foreground text-[10px] uppercase tracking-wider"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'expired':
        return <Badge variant="destructive" className="text-[10px] uppercase tracking-wider"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{status}</Badge>;
    }
  };

  // Filtered and paginated invitations
  const filteredInvitations = useMemo(() => {
    if (!searchQuery.trim()) return allInvitations;
    const q = searchQuery.toLowerCase();
    return allInvitations.filter(inv =>
      (inv.candidate_name || '').toLowerCase().includes(q) ||
      (inv.candidate_email || '').toLowerCase().includes(q) ||
      (inv.test_library?.name || '').toLowerCase().includes(q)
    );
  }, [allInvitations, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredInvitations.length / ITEMS_PER_PAGE));
  const paginatedInvitations = filteredInvitations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
      {roleToggle && <RoleToggleBar activeView={roleToggle.activeView} setActiveView={roleToggle.setActiveView} />}
      <main className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Employer Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name || 'User'}!</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/invite">
              <Send className="h-4 w-4 mr-2" />
              Send Invitation
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-3 w-3 mr-1" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium text-muted-foreground">Invitations Sent</CardTitle>
                  <Send className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold font-display">{stats.totalInvitations}/{stats.totalInvitations + stats.testsRemaining}</div>
                  <div className="mt-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-auto py-1 px-3 text-xs"
                      onClick={() => setShowBundleModal(true)}
                    >
                      Purchase more
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium text-muted-foreground">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold font-display text-warning">{stats.pendingInvitations}</div>
                  
                </CardContent>
              </Card>

              <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium text-muted-foreground">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold font-display text-success">{stats.completedTests}</div>
                  
                </CardContent>
              </Card>
            </div>

            {/* Recent Invitations */}
            <Card className="card-elevated">
              <CardHeader>
                <div>
                  <CardTitle>Recent Invitations</CardTitle>
                  <CardDescription>Latest test invitations sent to candidates</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {allInvitations.length === 0 ? (
                  <div className="text-center py-12">
                    <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No invitations yet</h3>
                    <p className="text-muted-foreground mb-4">Send your first test invitation to a candidate</p>
                    <Button asChild>
                      <Link to="/invite">
                        <Plus className="h-4 w-4 mr-2" />
                        Send Invitation
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Search bar */}
                    {allInvitations.length > ITEMS_PER_PAGE && (
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name, email, or test..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      {paginatedInvitations.map((invitation) => {
                        const isCompleted = invitation.status === 'completed';
                        const result = invitation.result;
                        const questionCount = invitation.test_library?.question_count || 50;
                        const scorePercent = result ? Math.min(100, Math.round((result.score / questionCount) * 100)) : null;
                        const resultsUrl = invitation.session 
                          ? `/invite/${invitation.invitation_token}/results/${invitation.session.id}`
                          : null;

                        return (
                          <div 
                            key={invitation.id} 
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{invitation.candidate_name || invitation.candidate_email}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {invitation.test_library?.name || 'Assessment'} • {new Date(invitation.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              {isCompleted && result ? (
                                <>
                                  <div className="text-right">
                                    <p className={`font-bold font-display text-sm ${
                                      scorePercent! >= 90 ? 'text-emerald-500' :
                                      scorePercent! >= 80 ? 'text-green-600' :
                                      scorePercent! >= 70 ? 'text-lime-500' :
                                      scorePercent! >= 40 ? 'text-orange-500' :
                                      'text-orange-300'
                                    }`}>{scorePercent}%</p>
                                    <p className="text-xs text-muted-foreground">{Math.min(result.score, questionCount)}/{questionCount}</p>
                                  </div>
                                  {resultsUrl && (
                                    <Button variant="ghost" size="sm" asChild>
                                      <a href={resultsUrl} target="_blank" rel="noopener noreferrer">
                                        View Results
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                      </a>
                                    </Button>
                                  )}
                                </>
                              ) : (
                                getStatusBadge(invitation.status)
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages} ({filteredInvitations.length} results)
                        </p>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={currentPage <= 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab invitations={allInvitations} stats={stats} />
          </TabsContent>
        </Tabs>
      </main>

      <EmployerBundleModal open={showBundleModal} onOpenChange={setShowBundleModal} />
    </div>
  );
}

// Analytics sub-component
function AnalyticsTab({ invitations, stats }: { invitations: any[]; stats: DashboardStats }) {
  const completedInvitations = invitations.filter(i => i.status === 'completed' && i.result);

  // Score distribution data
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 },
    ];
    completedInvitations.forEach(inv => {
      const questionCount = inv.test_library?.question_count || 50;
      const pct = Math.min(100, Math.round((inv.result.score / questionCount) * 100));
      if (pct <= 20) buckets[0].count++;
      else if (pct <= 40) buckets[1].count++;
      else if (pct <= 60) buckets[2].count++;
      else if (pct <= 80) buckets[3].count++;
      else buckets[4].count++;
    });
    return buckets;
  }, [completedInvitations]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    const pending = invitations.filter(i => i.status === 'pending').length;
    const started = invitations.filter(i => i.status === 'started').length;
    const completed = invitations.filter(i => i.status === 'completed').length;
    const expired = invitations.filter(i => i.status === 'expired').length;
    return [
      { name: 'Pending', value: pending, color: 'hsl(38, 92%, 50%)' },
      { name: 'In Progress', value: started, color: 'hsl(11, 90%, 62%)' },
      { name: 'Completed', value: completed, color: 'hsl(160, 84%, 39%)' },
      { name: 'Expired', value: expired, color: 'hsl(0, 72%, 51%)' },
    ].filter(d => d.value > 0);
  }, [invitations]);

  // Average score
  const avgScore = useMemo(() => {
    if (completedInvitations.length === 0) return null;
    const total = completedInvitations.reduce((sum, inv) => {
      const questionCount = inv.test_library?.question_count || 50;
      return sum + Math.min(100, Math.round((inv.result.score / questionCount) * 100));
    }, 0);
    return Math.round(total / completedInvitations.length);
  }, [completedInvitations]);

  // Completion rate
  const completionRate = invitations.length > 0
    ? Math.round((stats.completedTests / invitations.length) * 100)
    : 0;

  if (invitations.length === 0) {
    return (
      <Card className="card-elevated">
        <CardContent className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No data yet</h3>
          <p className="text-muted-foreground">Analytics will appear once you start sending invitations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Avg. Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-display text-primary">{avgScore !== null ? `${avgScore}%` : '—'}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all completed tests</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-display">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.completedTests} of {invitations.length} invitations</p>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium text-muted-foreground">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-display">{invitations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base">Score Distribution</CardTitle>
            <CardDescription>How candidates performed</CardDescription>
          </CardHeader>
          <CardContent>
            {completedInvitations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No completed tests yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="count" stroke="#f97316" fill="url(#scoreGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base">Invitation Status</CardTitle>
            <CardDescription>Current status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {statusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
