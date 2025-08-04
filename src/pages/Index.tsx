import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, TrendingUp, Brain, BarChart3, Users, Zap, Smartphone, Clock } from 'lucide-react';
import { PricingSection } from '@/components/PricingSection';
const Index = () => {
  const {
    user,
    loading
  } = useAuth();
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
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all animatable elements
    document.querySelectorAll('.fade-on-scroll').forEach(el => {
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <img src="/lovable-uploads/409330f0-2245-4147-b837-ff553d303814.png" alt="Kudos Academy" className="h-8 w-8 mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>;
  }

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Landing page for non-authenticated users
  return <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Fixed Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-card' : 'bg-background/80 backdrop-blur-xl'}`}>
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
            <a href="#pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-sm font-medium text-foreground hover:text-primary transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Success Stories</a>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 shadow-learning hover:shadow-glow transition-all duration-300 hover:scale-105">
              <a href="/auth">Sign Up</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Target className="h-4 w-4" />
            2,487 students achieved their target schools with Kudos
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
              Turn 11+ stress into
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              confident success
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-10">
            Stop wondering if your child is ready. Get instant insights into their strengths, 
            pinpoint exactly where they need help, and watch their confidence soar as they master each topic.
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
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="fade-on-scroll bg-background p-6 rounded-3xl shadow-card border border-border hover:shadow-learning hover:border-primary/20 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
            <svg viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
              {/* Dashboard mockup */}
              <rect width="800" height="500" rx="8" fill="#FBFBFD"></rect>
              
              {/* Header */}
              <rect y="0" width="800" height="60" fill="#667EEA" fillOpacity="0.1"></rect>
              <text x="30" y="38" fontFamily="Arial" fontSize="20" fontWeight="600" fill="#667EEA">Emma's Learning Dashboard</text>
              
              {/* Progress Cards - Only Topic Breakdown and Practice Insights */}
              {/* Topic Breakdown - replacing Geometry tile */}
              <rect x="30" y="90" width="230" height="140" rx="12" fill="#F3F4F6"></rect>
              <text x="50" y="120" fontFamily="Arial" fontSize="16" fontWeight="600" fill="#1D1D1F">Topic Breakdown</text>
              
              {/* Mini progress bars */}
              <rect x="50" y="140" width="120" height="4" rx="2" fill="#E5E5EA"></rect>
              <rect x="50" y="140" width="96" height="4" rx="2" fill="#34C759"></rect>
              <text x="180" y="143" fontFamily="Arial" fontSize="10" fill="#86868B">Fractions 80%</text>
              
              <rect x="50" y="155" width="120" height="4" rx="2" fill="#E5E5EA"></rect>
              <rect x="50" y="155" width="72" height="4" rx="2" fill="#FF9500"></rect>
              <text x="180" y="158" fontFamily="Arial" fontSize="10" fill="#86868B">Geometry 60%</text>
              
              <rect x="50" y="170" width="120" height="4" rx="2" fill="#E5E5EA"></rect>
              <rect x="50" y="170" width="108" height="4" rx="2" fill="#34C759"></rect>
              <text x="180" y="173" fontFamily="Arial" fontSize="10" fill="#86868B">Algebra 90%</text>
              
              <rect x="50" y="185" width="120" height="4" rx="2" fill="#E5E5EA"></rect>
              <rect x="50" y="185" width="84" height="4" rx="2" fill="#0071E3"></rect>
              <text x="180" y="188" fontFamily="Arial" fontSize="10" fill="#86868B">Numbers 70%</text>
              
              {/* Practice Insights - replacing English tile */}
              <rect x="285" y="90" width="230" height="140" rx="12" fill="#F3F4F6"></rect>
              <text x="305" y="120" fontFamily="Arial" fontSize="16" fontWeight="600" fill="#1D1D1F">Practice Insights</text>
              
              {/* Practice stats - improved spacing */}
              <text x="305" y="150" fontFamily="Arial" fontSize="11" fill="#86868B">Accuracy:</text>
              <text x="405" y="150" fontFamily="Arial" fontSize="14" fontWeight="600" fill="#0071E3">85%</text>
              
              <text x="305" y="170" fontFamily="Arial" fontSize="11" fill="#86868B">Time spent:</text>
              <text x="405" y="170" fontFamily="Arial" fontSize="14" fontWeight="600" fill="#0071E3">18 mins</text>
              
              {/* Weekly Progress - Width aligned with Topic Breakdown */}
              <rect x="30" y="260" width="485" height="200" rx="12" fill="#F3F4F6"></rect>
              <text x="50" y="290" fontFamily="Arial" fontSize="18" fontWeight="600" fill="#1D1D1F">Weekly Progress</text>
              
              {/* Line graph aligned with topic breakdown width */}
              <polyline points="80,350 130,340 180,335 230,330 280,325 330,320 380,315" stroke="#667EEA" strokeWidth="3" fill="none"></polyline>
              <circle cx="80" cy="350" r="3" fill="#667EEA"></circle>
              <circle cx="130" cy="340" r="3" fill="#667EEA"></circle>
              <circle cx="180" cy="335" r="3" fill="#667EEA"></circle>
              <circle cx="230" cy="330" r="3" fill="#667EEA"></circle>
              <circle cx="280" cy="325" r="3" fill="#667EEA"></circle>
              <circle cx="330" cy="320" r="3" fill="#667EEA"></circle>
              <circle cx="380" cy="315" r="3" fill="#667EEA"></circle>
              
              {/* Day labels - Mon to Sun */}
              <text x="80" y="410" fontFamily="Arial" fontSize="10" fill="#86868B" textAnchor="middle">Mon</text>
              <text x="130" y="410" fontFamily="Arial" fontSize="10" fill="#86868B" textAnchor="middle">Tue</text>
              <text x="180" y="410" fontFamily="Arial" fontSize="10" fill="#86868B" textAnchor="middle">Wed</text>
              <text x="230" y="410" fontFamily="Arial" fontSize="10" fill="#86868B" textAnchor="middle">Thu</text>
              <text x="280" y="410" fontFamily="Arial" fontSize="10" fill="#86868B" textAnchor="middle">Fri</text>
              <text x="330" y="410" fontFamily="Arial" fontSize="10" fill="#86868B" textAnchor="middle">Sat</text>
              <text x="380" y="410" fontFamily="Arial" fontSize="10" fill="#86868B" textAnchor="middle">Sun</text>
              
              {/* Mathematics Card - Right of Weekly Progress */}
              <rect x="540" y="260" width="230" height="200" rx="12" fill="#34C759" fillOpacity="0.1" className="group-hover:animate-pulse"></rect>
              <text x="560" y="290" fontFamily="Arial" fontSize="16" fill="#86868B">Mathematics</text>
              <text x="560" y="330" fontFamily="Arial" fontSize="28" fontWeight="600" fill="#34C759">87%</text>
              <text x="560" y="360" fontFamily="Arial" fontSize="14" fill="#34C759">↑ 12% this month</text>
            </svg>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-muted/20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">The 11+ reality check</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">Most families are flying blind. Here's why that's risky.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 fade-on-scroll">
            <div className="text-center space-y-4">
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">73%</div>
              <h3 className="text-2xl font-bold">Can't spot the gaps</h3>
              <p className="text-muted-foreground leading-relaxed">Of parents have no idea which specific topics their child struggles with</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">56</div>
              <h3 className="text-2xl font-bold">Wasted on tutoring</h3>
              <p className="text-muted-foreground leading-relaxed">56 11+ curriculum topics, 220 sub topics, keeping track of them is a nightmare</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">1 shot</div>
              <h3 className="text-2xl font-bold">No second chances</h3>
              <p className="text-muted-foreground leading-relaxed">The 11+ happens once. Get it right or wait another year.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features - The 4 Tiles */}
      <section id="features" className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Finally, 11+ prep that actually works</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">Stop guessing. Start knowing. See results in days, not months.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="fade-on-scroll group bg-card p-8 rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-learning hover:-translate-y-1">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-2xl w-fit mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Laser-focused practice</h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                No more random worksheets. Our AI finds exactly what your child doesn't know and gives them targeted practice until they master it.
              </p>
            </div>

            <div className="fade-on-scroll group bg-card p-8 rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-learning hover:-translate-y-1">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-2xl w-fit mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                <Target className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Instant gap detection</h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                Within minutes, see exactly which topics need work. No more wondering if they're ready for fractions or struggling with times tables.
              </p>
            </div>

            <div className="fade-on-scroll group bg-card p-8 rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-learning hover:-translate-y-1">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-2xl w-fit mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Parent peace of mind</h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                Check progress anytime on your phone. Get weekly reports showing exactly how your child is improving and what to focus on next.
              </p>
            </div>

            <div className="fade-on-scroll group bg-card p-8 rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-learning hover:-translate-y-1">
              <div className="p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-2xl w-fit mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Confidence that grows</h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                Watch your child transform from anxious to excited about maths. Our system builds understanding step-by-step, celebrating every win.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How it works (it's surprisingly simple)</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">Three steps to transform your child's 11+ preparation</p>
          </div>
          
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
            step: "1",
            title: "5-minute setup",
            description: "Sign up, add your child, and they take a quick assessment. We instantly know their current level and create their personalized learning plan.",
            icon: Clock
          }, {
            step: "2",
            title: "Daily smart practice", 
            description: "Just 15 minutes daily. Our AI serves up the perfect questions for their level. They practice, we track everything, you see instant progress.",
            icon: Brain
          }, {
            step: "3",
            title: "Watch them succeed",
            description: "Check their dashboard anytime. See confidence grow as gaps disappear. Get weekly insights on exactly how to help them improve.",
            icon: TrendingUp
          }].map((item, index) =>
            <div key={index} className="fade-on-scroll text-center">
              <div className="bg-muted rounded-2xl p-2 text-center h-32 w-32 mx-auto flex items-center justify-center mb-6">
                <item.icon className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">{item.step}. {item.title}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-muted/40">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Real families, real results</h2>
            <p className="text-xl md:text-2xl text-muted-foreground">Stories from parents who stopped worrying and started celebrating</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
            quote: "I finally understood why Oliver kept getting fraction questions wrong. It wasn't the maths - he didn't understand the notation! Within two weeks of targeted practice, he'd completely mastered fractions.",
            author: "Sarah Mitchell",
            role: "Mother of Year 5 student",
            result: "Fractions: 45% → 95% in 2 weeks"
          }, {
            quote: "The dashboard is brilliant. I can check Aisha's progress during lunch break at work. No more Sunday afternoons spent marking worksheets! I actually know what's happening with her learning now.",
            author: "James Chen", 
            role: "Father of twins, Year 6",
            result: "Saved 4 hours weekly, twins both improved 30%"
          }, {
            quote: "Emma got into our first choice grammar school! Kudos showed us she was brilliant at problem-solving but needed help with calculation speed. We knew exactly what to focus on in the final months.",
            author: "Priya Patel",
            role: "Grammar school success story",
            result: "Achieved top 10% in 11+ exam"
          }].map((testimonial, index) => <div key={index} className="fade-on-scroll bg-card p-8 rounded-2xl relative shadow-card hover:shadow-learning transition-all duration-300">
                <div className="text-6xl text-primary opacity-20 absolute top-4 left-6">"</div>
                <p className="text-lg leading-relaxed mb-6 relative z-10">{testimonial.quote}</p>
                <div className="space-y-2">
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-sm font-medium text-success">{testimonial.result}</div>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-r from-primary via-primary-glow to-primary text-primary-foreground text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to stop worrying and start celebrating?</h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90">Join thousands of parents who've transformed their child's 11+ journey.</p>
          <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 font-semibold px-12 py-6 text-xl shadow-learning hover:shadow-glow transition-all duration-300 hover:scale-105">
            <a href="/auth">Sign Up Free</a>
          </Button>
          <p className="text-sm mt-6 opacity-80">No credit card required • Instant access • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-16 px-6">
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
    </div>;
};
export default Index;