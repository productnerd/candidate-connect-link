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
  Play,
  Zap
} from 'lucide-react';
import employerHeroBg from '@/assets/employer-hero-bg.png';

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
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Navbar />
      
      {/* Hero Section - Full Screen with Background Image */}
      <section className="relative min-h-screen flex flex-col pt-16">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${employerHeroBg})` }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-foreground/40" />
        
        {/* Main Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center pt-20 pb-32 px-4">
          {/* Badge */}
          <div className="glass-card px-4 py-2 mb-8 flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">AI-Powered Assessment Platform</span>
          </div>
          
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium leading-[1.1] tracking-tight mb-8">
              Bridge the gap{' '}
              <span className="text-gradient-primary">between</span>
              <br />
              <span className="text-gradient-hero">talent</span> and decisions
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Turn disconnected hiring data into actionable insights
              with AI-powered cognitive assessments.
            </p>
            
            {/* CTA Buttons - Send Test and Try Test */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-2xl px-8 h-14 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all" asChild>
                <Link to="/auth/employer">
                  Send Test
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-base glass-button border-0" asChild>
                <Link to="/candidate/start">
                  <Play className="mr-2 h-5 w-5" />
                  Try Test
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom Glass Cards */}
        <div className="absolute bottom-8 left-8 z-20 max-w-sm hidden lg:block">
          <div className="glass-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-display font-semibold">CCATCore<sup className="text-xs text-primary">™</sup></span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              CCAT seamlessly connects your hiring workflow, 
              automating candidate assessment across platforms without the 
              need for complex coding.
            </p>
            
            <div className="flex items-center gap-3">
              <Button size="sm" className="rounded-xl shadow-md shadow-primary/20" asChild>
                <Link to="/auth/employer">Book a Demo</Link>
              </Button>
              <Link 
                to="/candidate" 
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom Right Video Indicator */}
        <div className="absolute bottom-8 right-8 z-20 hidden lg:block">
          <div className="glass-card p-4 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Play className="h-4 w-4 text-primary fill-primary" />
            </div>
            <div>
              <span className="text-sm font-medium block">How it works?</span>
              <span className="text-xs text-muted-foreground">1:35</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="mission" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        
        <div className="container relative z-10">
          <div className="glass-elevated p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-display text-4xl md:text-5xl font-medium text-gradient-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        
        {/* Background orbs */}
        <div className="glass-orb-accent w-[400px] h-[400px] top-1/4 -left-40 animate-pulse-glow" />
        <div className="glass-orb-primary w-[300px] h-[300px] bottom-1/4 -right-20 animate-pulse-glow" style={{ animationDelay: '2s' }} />
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="glass-card inline-flex px-4 py-2 mb-6">
              <span className="text-sm font-medium text-muted-foreground">Features</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium mb-4">
              Everything you need for
              <span className="text-gradient-primary"> better hiring</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides comprehensive tools for employers to assess candidates 
              and for job seekers to prepare for assessments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="glass-card p-8 hover-lift group"
              >
                <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
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
      <section id="how-it-works" className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="glass-card inline-flex px-4 py-2 mb-6">
              <span className="text-sm font-medium text-muted-foreground">Process</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Create Account', description: 'Sign up as an employer and set up your organization in under 2 minutes.' },
              { step: '02', title: 'Send Invitations', description: 'Invite candidates via email with unique test links that you control.' },
              { step: '03', title: 'Review Results', description: 'Get detailed scores and percentile rankings to make informed decisions.' },
            ].map((item, index) => (
              <div key={index} className="glass-elevated p-8 text-center hover-lift">
                <div className="font-mono text-5xl font-light text-gradient-primary mb-4">
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
      <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden">
        {/* Dark glass background */}
        <div className="absolute inset-0 bg-foreground" />
        <div className="absolute inset-0 bg-mesh opacity-30" />
        
        {/* Glowing orbs */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] -top-40 left-1/4 animate-pulse-glow" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-accent/15 blur-[100px] bottom-0 right-1/4 animate-pulse-glow" style={{ animationDelay: '2s' }} />
        
        <div className="container relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium mb-6 text-background">
            Ready to hire smarter?
          </h2>
          <p className="text-lg text-background/70 mb-10 max-w-xl mx-auto">
            Join thousands of companies using CCAT assessments to find top talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-2xl px-8 h-14 bg-background text-foreground hover:bg-background/90 shadow-xl" asChild>
              <Link to="/auth/employer">
                Send Test
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-2xl px-8 h-14 border-background/20 text-background hover:bg-background/10 backdrop-blur-sm" 
              asChild
            >
              <Link to="/candidate/start">
                <Play className="mr-2 h-5 w-5" />
                Try Test
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
