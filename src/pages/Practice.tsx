import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Gift,
  Crown
} from 'lucide-react';
import candidateHeroBg from '@/assets/candidate-hero-bg.png';

export default function Practice() {
  const benefits = [
    {
      icon: Target,
      title: 'Realistic Questions',
      description: 'Practice with questions that mirror the actual CCAT format and difficulty.',
    },
    {
      icon: Clock,
      title: 'Timed Experience',
      description: 'Get comfortable with the 15-minute time pressure before your real test.',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'See your scores improve over time with detailed performance analytics.',
    },
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Review explanations for every question to understand your mistakes.',
    },
  ];

  const bundles = [
    {
      name: 'Free Practice',
      price: '$0',
      description: 'Try before you buy',
      tests: 1,
      features: [
        '1 full-length practice test',
        'Timed test experience',
        'Basic score report',
        'Question explanations',
      ],
      cta: 'Start Free Test',
      variant: 'outline' as const,
      popular: false,
      icon: Gift,
      href: '/candidate/start',
    },
    {
      name: 'Starter Pack',
      price: '$19',
      description: 'Perfect for focused prep',
      tests: 5,
      features: [
        '5 full-length practice tests',
        'Detailed score analytics',
        'Category breakdowns',
        'Performance tracking',
        '30-day access',
      ],
      cta: 'Get Starter Pack',
      variant: 'default' as const,
      popular: false,
      icon: Brain,
      href: '/auth/employer', // Paid bundles go to employer signup
    },
    {
      name: 'Pro Bundle',
      price: '$39',
      description: 'Most popular choice',
      tests: 15,
      features: [
        '15 full-length practice tests',
        'Advanced analytics dashboard',
        'Percentile comparisons',
        'Weakness identification',
        'Study recommendations',
        '90-day access',
      ],
      cta: 'Get Pro Bundle',
      variant: 'hero' as const,
      popular: true,
      icon: Crown,
      href: '/auth/employer', // Paid bundles go to employer signup
    },
  ];

  const testimonials = [
    {
      quote: "The practice tests were spot-on. I felt completely prepared for my actual CCAT.",
      author: "Sarah M.",
      role: "Software Engineer",
      improvement: "+12 percentile points"
    },
    {
      quote: "After 5 practice tests, I went from 60th to 85th percentile. Worth every penny.",
      author: "James L.",
      role: "Marketing Manager",
      improvement: "+25 percentile points"
    },
    {
      quote: "The explanations helped me understand my weak areas and improve quickly.",
      author: "Emily R.",
      role: "Financial Analyst",
      improvement: "+18 percentile points"
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section - Full Screen with Background Image */}
      <section className="relative min-h-screen flex flex-col pt-16">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${candidateHeroBg})` }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-foreground/50" />
        
        {/* Main Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Join 10,000+ candidates who improved their scores</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Ace your CCAT with
              <span className="block mt-2 text-gradient-hero">practice that works</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Prepare for your cognitive aptitude test with realistic practice exams. 
              Build confidence, improve speed, and maximize your score.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" asChild className="group">
                <Link to="/candidate/start">
                  Start Free Practice Test
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="bg-white/10 border-white/20 text-primary-foreground hover:bg-white/20">
                <a href="#bundles">View All Bundles</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why practice with us?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our practice tests are designed to give you the most realistic 
              preparation experience possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="group p-6 rounded-xl card-elevated card-hover text-center"
              >
                <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="bundles" className="py-20 lg:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose your practice plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with a free test, or unlock more practice with our bundles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {bundles.map((bundle, index) => (
              <Card 
                key={index} 
                className={`relative card-elevated card-hover ${
                  bundle.popular ? 'border-primary shadow-lg shadow-primary/10 scale-105' : ''
                }`}
              >
                {bundle.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-4 mx-auto">
                    <bundle.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{bundle.name}</CardTitle>
                  <CardDescription>{bundle.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{bundle.price}</span>
                    {bundle.tests > 1 && (
                      <span className="text-muted-foreground ml-2">
                        / {bundle.tests} tests
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {bundle.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={bundle.variant} 
                    className="w-full mt-6" 
                    asChild
                  >
                    <Link to={bundle.href}>
                      {bundle.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real results from real candidates
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how practice made a difference for others.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-elevated">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                      {testimonial.improvement}
                    </Badge>
                  </div>
                  <blockquote className="text-muted-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-hero">
        <div className="container text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to boost your score?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Start with a free practice test and see where you stand.
          </p>
          <Button variant="accent" asChild className="group">
            <Link to="/candidate/start">
              Take Free Practice Test
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
