import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import EmployerDashboard from './EmployerDashboard';
import CandidateDashboard from './CandidateDashboard';

export default function Dashboard() {
  const { user, profile, roles, loading, refreshProfile } = useAuth();
  const location = useLocation();
  
  const hasEmployerRole = roles.includes('employer') || roles.includes('admin');
  const hasCandidateRole = roles.includes('candidate');
  const hasBothRoles = hasEmployerRole && hasCandidateRole;
  
  const [activeView, setActiveView] = useState<'employer' | 'candidate'>('employer');
  
  useEffect(() => {
    if (profile && !hasBothRoles) {
      setActiveView(profile.role === 'candidate' ? 'candidate' : 'employer');
    }
  }, [profile, hasBothRoles]);

  useEffect(() => {
    if (!loading && user && !profile) {
      refreshProfile();
    }
  }, [loading, user, profile, refreshProfile]);

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

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  const showEmployerDashboard = hasBothRoles 
    ? activeView === 'employer' 
    : (profile.role === 'employer' || profile.role === 'admin');

  return (
    <>
      {hasBothRoles && (
        <div className="flex justify-center py-4 bg-muted/30 border-b">
          <div className="flex items-center glass-card p-1 !transform-none hover:!transform-none">
            <button
              onClick={() => setActiveView('employer')}
              className={`px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-wider transition-all duration-300 ${
                activeView === 'employer'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
              }`}
            >
              Business
            </button>
            <button
              onClick={() => setActiveView('candidate')}
              className={`px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-wider transition-all duration-300 ${
                activeView === 'candidate'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
              }`}
            >
              Candidate
            </button>
          </div>
        </div>
      )}
      {showEmployerDashboard ? <EmployerDashboard /> : <CandidateDashboard />}
    </>
  );
}
