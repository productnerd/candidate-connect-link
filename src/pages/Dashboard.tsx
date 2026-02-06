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

  const roleToggle = hasBothRoles ? { activeView, setActiveView } : undefined;

  return showEmployerDashboard 
    ? <EmployerDashboard roleToggle={roleToggle} /> 
    : <CandidateDashboard roleToggle={roleToggle} />;
}
