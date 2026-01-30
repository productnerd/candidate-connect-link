import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { Brain } from 'lucide-react';

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-pattern relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold">CCAT Platform</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Hire smarter with<br />
              <span className="text-gradient-hero">cognitive assessments</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              The CCAT (Criteria Cognitive Aptitude Test) helps you identify top candidates 
              by measuring problem-solving abilities, learning capacity, and critical thinking skills.
            </p>
            
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm text-primary-foreground/70">Questions</div>
              </div>
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold">15min</div>
                <div className="text-sm text-primary-foreground/70">Duration</div>
              </div>
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm text-primary-foreground/70">Accuracy</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-primary-foreground/60">
            © 2026 CCAT Platform. All rights reserved.
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-40 w-48 h-48 rounded-full bg-accent/10 blur-3xl"></div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-primary">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CCAT Platform</span>
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
