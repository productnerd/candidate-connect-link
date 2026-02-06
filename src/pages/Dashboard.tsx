import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Building2, User } from 'lucide-react';
import EmployerDashboard from './EmployerDashboard';
import CandidateDashboard from './CandidateDashboard';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function Dashboard() {
  const { user, profile, roles, loading, refreshProfile } = useAuth();
  const location = useLocation();
  
  // Determine if user has both roles
  const hasEmployerRole = roles.includes('employer') || roles.includes('admin');
  const hasCandidateRole = roles.includes('candidate');
  const hasBothRoles = hasEmployerRole && hasCandidateRole;
  
  // Active view state - default to profile role or employer if both
  const [activeView, setActiveView] = useState<'employer' | 'candidate'>('employer');
  
  // Set initial view based on profile role
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

  // User is authenticated but profile may still be loading/creating.
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

  // Render role toggle for users with both roles
  const RoleToggle = () => {
    if (!hasBothRoles) return null;
    
    return (
      <div className="flex justify-center py-4 bg-muted/30 border-b">
        <ToggleGroup 
          type="single" 
          value={activeView} 
          onValueChange={(value) => value && setActiveView(value as 'employer' | 'candidate')}
          className="bg-background rounded-lg p-1 shadow-sm border"
        >
          <ToggleGroupItem 
            value="employer" 
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-4 py-2 gap-2"
          >
            <Building2 className="h-4 w-4" />
            Employer
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="candidate" 
            className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground px-4 py-2 gap-2"
          >
            <User className="h-4 w-4" />
            Candidate
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  };

  // Determine which dashboard to show
  const showEmployerDashboard = hasBothRoles 
    ? activeView === 'employer' 
    : (profile.role === 'employer' || profile.role === 'admin');

  return (
    <>
      <RoleToggle />
      {showEmployerDashboard ? <EmployerDashboard /> : <CandidateDashboard />}
    </>
  );
}
