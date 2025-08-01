import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, TrendingUp, Brain, BarChart3, Users } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all animatable elements
    document.querySelectorAll('.fade-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <img src="/lovable-uploads/409330f0-2245-4147-b837-ff553d303814.png" alt="Kudos Academy" className="h-8 w-8 mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Fixed Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-card' 
          : 'bg-background/80 backdrop-blur-xl'
      }`}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-primary to-primary-glow rounded-xl shadow-lg">
              <img src="/lovable-uploads/409330f0-2245-4147-b837-ff553d303814.png" alt="Kudos Academy" className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              Kudos Academy
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Success Stories</a>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 shadow-learning hover:shadow-glow transition-all duration-300 hover:scale-105">
              <a href="/auth">Start Free Trial</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Target className="h-4 w-4" />
            2,487 students passed their 11+ with Kudos
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
              Know exactly where
            </span>
            <br />
            <span className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
              your child stands.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-10">
            Real-time insights into your child's learning. See strengths, identify gaps, 
            track progress. No more guessing. No more marking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg shadow-learning hover:shadow-glow transition-all duration-300 hover:-translate-y-0.5">
              <a href="/auth">
                Start Free Trial
                <span className="ml-2">→</span>
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold px-8 py-4 text-lg border-2 hover:bg-accent/50 transition-all duration-300">
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-background p-6 rounded-3xl shadow-card hover:shadow-learning transition-all duration-500 transform perspective-1000 hover:rotate-x-0 rotate-x-1">
            <svg viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              <rect width="800" height="500" rx="12" fill="hsl(var(--background))" />
              
              {/* Header */}
              <rect y="0" width="800" height="60" fill="hsl(var(--primary) / 0.1)" rx="12" />
              <text x="30" y="38" fontFamily="system-ui" fontSize="20" fontWeight="600" fill="hsl(var(--primary))">Emma's Learning Dashboard</text>
              
              {/* Progress Cards */}
              <rect x="30" y="90" width="230" height="140" rx="16" fill="hsl(var(--success) / 0.1)" />
              <text x="50" y="120" fontFamily="system-ui" fontSize="16" fill="hsl(var(--muted-foreground))">Mathematics</text>
              <text x="50" y="150" fontFamily="system-ui" fontSize="32" fontWeight="700" fill="hsl(var(--success))">87%</text>
              <text x="50" y="180" fontFamily="system-ui" fontSize="14" fill="hsl(var(--success))">↑ 12% this month</text>
              
              <rect x="285" y="90" width="230" height="140" rx="16" fill="hsl(var(--warning) / 0.1)" />
              <text x="305" y="120" fontFamily="system-ui" fontSize="16" fill="hsl(var(--muted-foreground))">Verbal Reasoning</text>
              <text x="305" y="150" fontFamily="system-ui" fontSize="32" fontWeight="700" fill="hsl(var(--warning))">72%</text>
              <text x="305" y="180" fontFamily="system-ui" fontSize="14" fill="hsl(var(--warning))">Focus area</text>
              
              <rect x="540" y="90" width="230" height="140" rx="16" fill="hsl(var(--primary) / 0.1)" />
              <text x="560" y="120" fontFamily="system-ui" fontSize="16" fill="hsl(var(--muted-foreground))">English</text>
              <text x="560" y="150" fontFamily="system-ui" fontSize="32" fontWeight="700" fill="hsl(var(--primary))">91%</text>
              <text x="560" y="180" fontFamily="system-ui" fontSize="14" fill="hsl(var(--primary))">↑ 5% this month</text>
              
              {/* Topic Breakdown */}
              <rect x="30" y="260" width="350" height="200" rx="16" fill="hsl(var(--muted))" />
              <text x="50" y="290" fontFamily="system-ui" fontSize="18" fontWeight="600" fill="hsl(var(--foreground))">Topic Breakdown - Maths</text>
              
              <text x="50" y="325" fontFamily="system-ui" fontSize="14" fill="hsl(var(--muted-foreground))">Fractions</text>
              <rect x="50" y="335" width="280" height="8" rx="4" fill="hsl(var(--border))" />
              <rect x="50" y="335" width="224" height="8" rx="4" fill="hsl(var(--success))" />
              
              <text x="50" y="365" fontFamily="system-ui" fontSize="14" fill="hsl(var(--muted-foreground))">Algebra</text>
              <rect x="50" y="375" width="280" height="8" rx="4" fill="hsl(var(--border))" />
              <rect x="50" y="375" width="252" height="8" rx="4" fill="hsl(var(--success))" />
              
              <text x="50" y="405" fontFamily="system-ui" fontSize="14" fill="hsl(var(--muted-foreground))">Geometry</text>
              <rect x="50" y="415" width="280" height="8" rx="4" fill="hsl(var(--border))" />
              <rect x="50" y="415" width="168" height="8" rx="4" fill="hsl(var(--warning))" />
              
              {/* Activity Graph */}
              <rect x="410" y="260" width="360" height="200" rx="16" fill="hsl(var(--muted))" />
              <text x="430" y="290" fontFamily="system-ui" fontSize="18" fontWeight="600" fill="hsl(var(--foreground))">Weekly Progress</text>
              
              <polyline points="450,400 500,380 550,370 600,340 650,320 700,300 750,280" 
                       stroke="hsl(var(--primary))" strokeWidth="3" fill="none"/>
              {[450, 500, 550, 600, 650, 700, 750].map((x, i) => (
                <circle key={i} cx={x} cy={400 - i * 20} r="4" fill="hsl(var(--primary))" />
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The 11+ Challenge</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">One exam. One chance. Are you prepared?</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 fade-on-scroll">
            <div className="text-center space-y-4">
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">73%</div>
              <h3 className="text-2xl font-bold">Don't know gaps</h3>
              <p className="text-muted-foreground leading-relaxed">Of parents can't identify their child's specific learning gaps</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">4hrs</div>
              <h3 className="text-2xl font-bold">Weekly marking</h3>
              <p className="text-muted-foreground leading-relaxed">Average time parents spend marking worksheets</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">1 year</div>
              <h3 className="text-2xl font-bold">Preparation needed</h3>
              <p className="text-muted-foreground leading-relaxed">Minimum recommended 11+ preparation time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features - The 3 Tiles */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Designed for 11+ success</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">Three powerful features that transform learning</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="fade-on-scroll group bg-card p-8 rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-learning hover:-translate-y-1">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-2xl w-fit mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Adaptive Learning</h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                AI adjusts to your child's level in real-time. Every question is perfectly matched to their ability, 
                ensuring optimal challenge without frustration.
              </p>
            </div>

            <div className="fade-on-scroll group bg-card p-8 rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-learning hover:-translate-y-1">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-2xl w-fit mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                <Target className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Targeted Practice</h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                Focus on exactly what matters. Our system identifies knowledge gaps and provides 
                targeted practice to strengthen weak areas efficiently.
              </p>
            </div>

            <div className="fade-on-scroll group bg-card p-8 rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-learning hover:-translate-y-1">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-2xl w-fit mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Progress Tracking</h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                Crystal-clear visibility into learning progress. See improvements by topic, 
                track readiness, and know exactly where to focus next.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 px-6 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Everything you need</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">Comprehensive tools for 11+ preparation</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="h-10 w-10" />,
                title: "Real-time Dashboard",
                description: "See exactly where your child excels and where they need support. Updated after every question."
              },
              {
                icon: <BookOpen className="h-10 w-10" />,
                title: "Complete Curriculum",
                description: "Covers all 11+ exam types: CEM, GL Assessment, and school-specific formats."
              },
              {
                icon: <Users className="h-10 w-10" />,
                title: "Parent Resources",
                description: "Understand how to help with clear explanations for every topic. No more YouTube University!"
              }
            ].map((feature, index) => (
              <div key={index} className="fade-on-scroll group p-8 rounded-2xl bg-background border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-2xl w-fit mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-center">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">From confusion to confidence in 3 steps</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">See results from day one</p>
          </div>
          
          <div className="space-y-32">
            {[
              {
                step: "1",
                title: "Quick Setup",
                description: "Sign up in 30 seconds. Your child takes a fun 15-minute assessment. Their personalized learning profile is created instantly.",
                highlight: "⚡ 30 seconds"
              },
              {
                step: "2",
                title: "Smart Practice",
                description: "AI selects perfect questions for their level. Real-time feedback shows exactly where they went wrong. Just 15-20 minutes daily.",
                highlight: "🎯 Personalized"
              },
              {
                step: "3",
                title: "Clear Insights",
                description: "Check progress anytime on your phone. See improvements by topic. Know exactly how to help. Watch their confidence grow.",
                highlight: "📱 Always visible"
              }
            ].map((item, index) => (
              <div key={index} className={`fade-on-scroll grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <h3 className="text-3xl md:text-4xl font-bold mb-6">{item.step}. {item.title}</h3>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                <div className={`bg-muted rounded-2xl p-12 text-center text-4xl md:text-5xl font-bold h-80 flex items-center justify-center ${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                  {item.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Join 5,000+ successful parents</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">Real stories from real families</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "I finally understood why Oliver kept getting fraction questions wrong. It wasn't the maths - he didn't understand the notation! Two weeks later, he'd mastered it.",
                author: "Sarah Mitchell",
                role: "Mother of Year 5 student"
              },
              {
                quote: "The dashboard is brilliant. I can check Aisha's progress on my phone during lunch break. No more Sunday marking sessions!",
                author: "James Chen",
                role: "Father of twins, Year 6"
              },
              {
                quote: "Emma passed the 11+ for our first choice school! Kudos showed us she was brilliant at maths but needed help with comprehension. We knew exactly what to focus on.",
                author: "Priya Patel",
                role: "Mother, Grammar school success"
              }
            ].map((testimonial, index) => (
              <div key={index} className="fade-on-scroll bg-card p-8 rounded-2xl relative shadow-card hover:shadow-learning transition-all duration-300">
                <div className="text-6xl text-primary opacity-20 absolute top-4 left-6">"</div>
                <p className="text-lg leading-relaxed mb-6 relative z-10">{testimonial.quote}</p>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-r from-primary via-primary-glow to-primary text-primary-foreground text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">The 11+ won't wait. Neither should you.</h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90">Join thousands of parents who've stopped guessing and started knowing.</p>
          <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 font-semibold px-12 py-6 text-xl shadow-learning hover:shadow-glow transition-all duration-300 hover:scale-105">
            <a href="/auth">Start Your Free Trial</a>
          </Button>
          <p className="text-sm mt-6 opacity-80">No credit card required • Instant access • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Features</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Success Stories</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">11+ Guide</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">About Us</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Our Method</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Blog</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Getting Started</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">FAQs</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Live Chat</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Data Security</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-primary transition-colors">GDPR</a>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              &copy; 2024 Kudos Academy. All rights reserved. • Empowering parents to support their children's success.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
