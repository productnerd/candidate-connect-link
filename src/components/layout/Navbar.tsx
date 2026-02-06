import * as React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Brain, LogOut, User, LayoutDashboard, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { useDashboardView } from '@/hooks/useDashboardView';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const Navbar = React.forwardRef<HTMLElement, Record<string, never>>((_, ref) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardView = useDashboardView();

  // Determine if we're on the candidate landing page
  const isCandidateLanding = location.pathname === '/candidate';
  // Determine if we're on the employer landing page
  const isEmployerLanding = location.pathname === '/employer' || location.pathname === '/';
  // Determine if we're on the dashboard
  const isDashboard = location.pathname.startsWith('/dashboard');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { label: 'Mission', href: '#mission' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav ref={ref} className="glass-nav">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to={isCandidateLanding ? '/candidate' : '/employer'} className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm transition-all group-hover:bg-primary/20 group-hover:scale-105">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-display font-semibold text-foreground">
            CCAT<sup className="text-xs text-primary">™</sup>
          </span>
        </Link>

        {/* Centered Business/Candidate Toggle - Only on landing pages when not logged in */}
        {!user && (isEmployerLanding || isCandidateLanding) && (
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center glass-card p-1">
              <Link
                to="/employer"
                className={`px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-wider transition-all duration-300 ${
                  isEmployerLanding
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                }`}
              >
                Business
              </Link>
              <Link
                to="/candidate"
                className={`px-4 py-2 rounded-xl text-[10px] font-medium uppercase tracking-wider transition-all duration-300 ${
                  isCandidateLanding
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                }`}
              >
                Candidate
              </Link>
            </div>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {!isDashboard && (
                <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-medium">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-card border-0" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-3">
                    <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary w-fit capitalize">
                      {profile?.role}
                    </span>
                  </div>
                  <DropdownMenuSeparator className="bg-border/50" />
                  {!isDashboard && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer rounded-lg">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {dashboardView?.hasBothRoles && isDashboard && (
                    <DropdownMenuItem
                      onClick={() => dashboardView.setActiveView(v => v === 'employer' ? 'candidate' : 'employer')}
                      className="cursor-pointer rounded-lg"
                    >
                      <ArrowLeftRight className="mr-2 h-4 w-4" />
                      Switch to {dashboardView.activeView === 'employer' ? 'Candidate' : 'Business'} View
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer rounded-lg">
                      <User className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive rounded-lg">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-background/90 hover:text-background transition-colors group"
            >
              Login
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';
