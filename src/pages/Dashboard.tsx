import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import EmployerDashboard from './EmployerDashboard';
import CandidateDashboard from './CandidateDashboard';

export default function Dashboard() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  // Route to appropriate dashboard based on role
  if (profile.role === 'employer' || profile.role === 'admin') {
    return <EmployerDashboard />;
  }

  return <CandidateDashboard />;
}
