import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Send, 
  BarChart3, 
  Package,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface DashboardStats {
  totalInvitations: number;
  pendingInvitations: number;
  completedTests: number;
  testsRemaining: number;
}

export default function EmployerDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvitations: 0,
    pendingInvitations: 0,
    completedTests: 0,
    testsRemaining: 0,
  });
  const [recentInvitations, setRecentInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Fetch invitations
      const { data: invitations, error: invError } = await supabase
        .from('test_invitations')
        .select('*, test_library(name)')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (invError) throw invError;

      // Fetch bundles
      const { data: bundles, error: bundleError } = await supabase
        .from('test_bundles')
        .select('tests_remaining')
        .eq('organization_id', profile.organization_id);

      if (bundleError) throw bundleError;

      const totalRemaining = bundles?.reduce((sum, b) => sum + (b.tests_remaining || 0), 0) || 0;
      const pending = invitations?.filter(i => i.status === 'pending').length || 0;
      const completed = invitations?.filter(i => i.status === 'completed').length || 0;

      setStats({
        totalInvitations: invitations?.length || 0,
        pendingInvitations: pending,
        completedTests: completed,
        testsRemaining: totalRemaining,
      });

      setRecentInvitations(invitations || []);
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
      case 'completed':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invitations</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalInvitations}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">{stats.pendingInvitations}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{stats.completedTests}</div>
              <p className="text-xs text-muted-foreground mt-1">Tests finished</p>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tests Remaining</CardTitle>
              <Package className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.testsRemaining}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Link to="/bundles" className="text-primary hover:underline">Purchase more</Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invitations */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Invitations</CardTitle>
              <CardDescription>Latest test invitations sent to candidates</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/invitations">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentInvitations.length === 0 ? (
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
              <div className="space-y-4">
                {recentInvitations.map((invitation) => (
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
                      {getStatusBadge(invitation.status)}
                      {invitation.status === 'completed' && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/results/${invitation.id}`}>View Results</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-6 mt-8">
          <Card className="card-elevated card-hover cursor-pointer" onClick={() => {}}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Candidates</h3>
                <p className="text-sm text-muted-foreground">View all candidates</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated card-hover cursor-pointer" onClick={() => {}}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">View Analytics</h3>
                <p className="text-sm text-muted-foreground">Test performance data</p>
              </div>
            </CardContent>
          </Card>

          <Link to="/bundles">
            <Card className="card-elevated card-hover cursor-pointer h-full">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10 text-accent">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Purchase Tests</h3>
                  <p className="text-sm text-muted-foreground">Buy more assessments</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
