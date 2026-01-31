import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  Zap,
  Package,
  Building2,
  Infinity
} from 'lucide-react';
import employerHeroBg from '@/assets/employer-hero-bg.png';

export default function Index() {
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<number | null>(1); // Default to best value
  const [isLoading, setIsLoading] = useState(false);
  
  const employerBundles = [
    { tests: 30, price: 9, perTest: '€0.30', bundleType: 'employer_30' },
    { tests: 100, price: 29, perTest: '€0.29', popular: true, bundleType: 'employer_100' },
    { tests: 500, price: 79, perTest: '€0.16', bundleType: 'employer_500' },
  ];

  const handleCheckout = async () => {
    if (selectedBundle === null) {
      toast.error('Please select a bundle');
      return;
    }

    setIsLoading(true);
    try {
      const bundle = employerBundles[selectedBundle];
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { bundle_type: bundle.bundleType },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
        setShowBundleModal(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      {/* Hero Section - Full Screen with Video Background */}
      <section className="relative min-h-screen flex flex-col pt-16">
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster={employerHeroBg}
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-foreground/60" />
        
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
            
            <p className="text-lg md:text-xl text-background/90 max-w-2xl mx-auto mb-12">
              Turn disconnected hiring data into actionable insights
              with AI-powered cognitive assessments.
            </p>
            
            {/* CTA - Send Test with secondary button */}
            <div className="flex flex-col items-center justify-center gap-3">
              <Button variant="hero" asChild>
                <Link to="/send-test">
                  Send Test
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                variant="secondary"
                onClick={() => setShowBundleModal(true)}
              >
                <Package className="h-4 w-4" />
                Purchase a Bundle
              </Button>
              <a 
                href="/candidate/start" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-background/60 hover:text-background/90 transition-colors uppercase tracking-wider mt-2"
              >
                or try the test
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Glass Cards - Hidden for now */}
        {/* <div className="absolute bottom-8 left-8 z-20 max-w-sm hidden lg:block">
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
        </div> */}
        
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
          <p className="text-lg text-background/90 mb-10 max-w-xl mx-auto">
            Join thousands of companies using CCAT assessments to find top talent.
          </p>
          <div className="flex flex-col items-center justify-center gap-3">
            <Button variant="secondary" asChild>
              <Link to="/send-test">
                Send Test
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="tertiary"
              onClick={() => setShowBundleModal(true)}
            >
              <Package className="h-4 w-4" />
              Purchase a Bundle
            </Button>
          </div>
        </div>
      </section>

      {/* Employer Bundle Modal */}
      <Dialog open={showBundleModal} onOpenChange={setShowBundleModal}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-transparent border-0 shadow-none">
          {/* Glassmorphic Card */}
          <div className="relative">
            {/* Background Glow Effects */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/30 rounded-3xl blur-2xl opacity-60" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/40 rounded-full blur-3xl" />
            
            {/* Card */}
            <div className="relative bg-card/90 backdrop-blur-xl rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
              {/* Header Gradient */}
              <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent px-6 pt-8 pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Building2 className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold text-center mb-1">
                  Test Bundles
                </h3>
                <p className="text-center text-muted-foreground text-sm">
                  Purchase tests in bulk and save
                </p>
              </div>

              {/* Bundles */}
              <div className="px-6 py-6 space-y-3">
                {employerBundles.map((bundle, index) => (
                  <div 
                    key={index}
                    onClick={() => setSelectedBundle(index)}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${
                      selectedBundle === index
                        ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10 ring-2 ring-primary/30' 
                        : 'bg-muted/30 border-border/50 hover:border-primary/20'
                    }`}
                  >
                    {bundle.popular && (
                      <span className="absolute -top-2 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium uppercase tracking-wider rounded-full">
                        Best Value
                      </span>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedBundle === index ? 'bg-primary/20' : 'bg-muted'
                        }`}>
                          <Package className={`h-5 w-5 ${selectedBundle === index ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-semibold">{bundle.tests} Tests</p>
                          <p className="text-xs text-muted-foreground">{bundle.perTest} per test</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-display font-bold text-primary">€{bundle.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-primary" />
                    Never expires
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-primary" />
                    Full analytics
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-primary" />
                    Team access
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <Button 
                  className="w-full h-12 text-base shadow-lg shadow-primary/20" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isLoading || selectedBundle === null}
                >
                  {isLoading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Continue to Checkout
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Secure checkout • Opens in new tab
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
