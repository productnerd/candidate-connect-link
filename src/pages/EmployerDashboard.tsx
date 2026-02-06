import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CandidateBundleModal } from '@/components/CandidateBundleModal';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalInvitations: number;
  pendingInvitations: number;
  completedTests: number;
  testsRemaining: number;
}

const ITEMS_PER_PAGE = 5;

export default function EmployerDashboard() {
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
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'started':
        return <Badge className="bg-warning text-warning-foreground"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">Total Invitations</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalInvitations}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats.pendingInvitations}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.completedTests}</div>
              <p className="text-xs text-muted-foreground mt-1">Tests finished</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">Tests Remaining</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.testsRemaining}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="h-auto py-1 px-2 text-xs"
                  onClick={() => setShowBundleModal(true)}
                >
                  Purchase more
                </Button>
              </p>
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
                {/* Search bar - only show if more than one page of results */}
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
                    const scorePercent = result ? Math.round((result.score / questionCount) * 100) : null;
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
                                <p className="font-bold text-sm">{scorePercent}%</p>
                                <p className="text-xs text-muted-foreground">{result.score}/{questionCount}</p>
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
      </main>

      <CandidateBundleModal open={showBundleModal} onOpenChange={setShowBundleModal} />
    </div>
  );
}
