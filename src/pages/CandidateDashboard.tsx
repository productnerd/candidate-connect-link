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
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

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

export default function CandidateDashboard() {
  const { profile } = useAuth();
  const [invitations, setInvitations] = useState<TestInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.email) {
      fetchInvitations();
    } else {
      setLoading(false);
    }
  }, [profile]);

  const fetchInvitations = async () => {
    if (!profile?.email) return;

    try {
      const { data, error } = await supabase
        .from('test_invitations')
        .select('*, test_library(name, description, duration_minutes)')
        .eq('candidate_email', profile.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations((data as TestInvitation[]) || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
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
  const completedTests = invitations.filter(i => i.status === 'completed');

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.full_name || 'Candidate'}!</p>
        </div>

        {/* Pending Tests */}
        {pendingTests.length > 0 && (
          <Card className="card-elevated mb-8 border-warning/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Tests Awaiting Completion
              </CardTitle>
              <CardDescription>Complete these assessments before they expire</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTests.map((invitation) => (
                  <div 
                    key={invitation.id} 
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{invitation.test_library?.name || 'Assessment'}</p>
                      <p className="text-sm text-muted-foreground">
                        {invitation.test_library?.duration_minutes} minutes • 
                        Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="hero" asChild>
                      <Link to={`/test/${invitation.invitation_token}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Test
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Invitations */}
        <Card className="card-elevated">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Tests</CardTitle>
              <CardDescription>Your complete test history</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tests yet</h3>
                <p className="text-muted-foreground mb-4">
                  You'll see test invitations here when employers send them to you
                </p>
                <Button variant="outline" asChild>
                  <Link to="/practice/start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Try Practice Tests
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div 
                    key={invitation.id} 
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{invitation.test_library?.name || 'Assessment'}</p>
                      <p className="text-sm text-muted-foreground">
                        Received: {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(invitation.status, invitation.expires_at)}
                      {invitation.status === 'pending' && new Date(invitation.expires_at) > new Date() && (
                        <Button variant="hero" size="sm" asChild>
                          <Link to={`/test/${invitation.invitation_token}`}>Start</Link>
                        </Button>
                      )}
                      {invitation.status === 'completed' && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/my-results/${invitation.id}`}>View Results</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
