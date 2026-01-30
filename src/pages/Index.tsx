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
  Sparkles
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-hero-pattern">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Trusted by 500+ companies worldwide</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Hire top talent with
              <span className="block mt-2 text-gradient-hero">cognitive assessments</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              The CCAT (Criteria Cognitive Aptitude Test) helps you identify candidates 
              with the highest potential by measuring their ability to learn, solve problems, 
              and think critically.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" variant="accent" asChild className="group">
                <Link to="/auth/employer">
                  Start Hiring Smarter
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20">
                <Link to="/practice/demo">Try Practice Test</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
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
                className="group p-6 rounded-xl card-elevated card-hover"
              >
                <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '1', title: 'Create Account', description: 'Sign up as an employer and set up your organization in under 2 minutes.' },
              { step: '2', title: 'Send Invitations', description: 'Invite candidates via email with unique test links that you control.' },
              { step: '3', title: 'Review Results', description: 'Get detailed scores and percentile rankings to make informed decisions.' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-hero">
        <div className="container text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to hire smarter?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of companies using CCAT assessments to find top talent.
          </p>
          <Button size="xl" variant="accent" asChild className="group">
            <Link to="/auth/employer">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
