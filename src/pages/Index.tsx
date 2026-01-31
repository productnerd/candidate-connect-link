import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { 
  Brain, 
  CheckCircle, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  ArrowRight,
  Sparkles,
  Play
} from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: Brain,
      title: 'Cognitive Aptitude Testing',
      description: 'Measure problem-solving abilities, critical thinking, and learning capacity with our validated CCAT assessments.',
    },
    {
      icon: Shield,
      title: 'Proctoring & Security',
      description: 'Advanced anti-cheating measures including webcam monitoring, fullscreen enforcement, and tab detection.',
    },
    {
      icon: Clock,
      title: 'Quick & Efficient',
      description: '15-minute assessments that accurately predict job performance without lengthy hiring processes.',
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Comprehensive scoring with percentile rankings and category breakdowns for informed decisions.',
    },
    {
      icon: Users,
      title: 'Easy Candidate Management',
      description: 'Send unique test links, track completions, and manage all candidates from one dashboard.',
    },
    {
      icon: Sparkles,
      title: 'Practice Mode',
      description: 'Candidates can prepare with practice tests to perform their best on the real assessment.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Tests Completed' },
    { value: '500+', label: 'Companies Trust Us' },
    { value: '95%', label: 'Accuracy Rate' },
    { value: '15min', label: 'Average Test Time' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      {/* Hero Section - Full Screen */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-primary/5" />
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        
        {/* Main Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center pt-20 pb-32 px-4">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light leading-[1.1] tracking-tight mb-8">
              Bridge the gap{' '}
              <span className="text-primary">between</span>
              <br />
              <span className="text-primary">talent</span> and decisions
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Turn disconnected hiring data into actionable insights
              with AI-powered cognitive assessments.
            </p>
          </div>
        </div>
        
        {/* Bottom Left Info Card */}
        <div className="absolute bottom-8 left-8 z-20 max-w-sm hidden lg:block">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold">CCATCore<sup className="text-xs">™</sup></span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            CCAT seamlessly connects your hiring workflow, 
            automating candidate assessment across platforms without the 
            need for complex coding.
          </p>
          
          <div className="flex items-center gap-4">
            <Button size="sm" className="rounded-full" asChild>
              <Link to="/auth/employer">Book a Demo</Link>
            </Button>
            <Link 
              to="/practice" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
        
        {/* Bottom Right Video Indicator */}
        <div className="absolute bottom-8 right-8 z-20 hidden lg:flex items-center gap-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Play className="h-3 w-3 fill-current" />
            How it works?
            <span className="text-muted-foreground/60">1:35</span>
          </span>
        </div>
        
        {/* Mobile CTA */}
        <div className="lg:hidden relative z-20 px-4 pb-8">
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full rounded-full" asChild>
              <Link to="/auth/employer">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full rounded-full" asChild>
              <Link to="/practice">Try Practice Test</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="mission" className="py-20 bg-card border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-display text-4xl md:text-5xl font-light text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4">
              Everything you need for
              <span className="text-primary"> better hiring</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides comprehensive tools for employers to assess candidates 
              and for job seekers to prepare for assessments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Create Account', description: 'Sign up as an employer and set up your organization in under 2 minutes.' },
              { step: '02', title: 'Send Invitations', description: 'Invite candidates via email with unique test links that you control.' },
              { step: '03', title: 'Review Results', description: 'Get detailed scores and percentile rankings to make informed decisions.' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="font-mono text-5xl font-light text-primary/30 mb-4">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-medium mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-24 lg:py-32 bg-foreground text-background">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light mb-6">
            Ready to hire smarter?
          </h2>
          <p className="text-lg text-background/70 mb-10 max-w-xl mx-auto">
            Join thousands of companies using CCAT assessments to find top talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="rounded-full" asChild>
              <Link to="/auth/employer">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-background/20 text-background hover:bg-background/10" asChild>
              <Link to="/practice">Try Practice Test</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
