import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, TrendingUp, Brain } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center backdrop-blur-sm bg-background/80 rounded-2xl px-6 py-4 border shadow-card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-primary to-primary-glow rounded-xl shadow-lg">
              <img src="/lovable-uploads/409330f0-2245-4147-b837-ff553d303814.png" alt="Kudos Academy" className="h-8 w-8" />
            </div>
            <span className="font-bold text-xl text-foreground">Kudos</span>
          </div>
          <Button asChild className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold px-6 shadow-learning hover:shadow-glow transition-all duration-300">
            <a href="/auth">Get Started</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-12 max-w-5xl mx-auto">
          {/* Hero Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Brain className="h-4 w-4" />
              AI-Powered Learning Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                Ace Your 11+ Exam
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                with Smart Learning
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our adaptive AI system personalizes your learning journey, focusing on your weak areas 
              and building confidence through intelligent question selection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold px-8 py-4 text-lg shadow-learning hover:shadow-glow transition-all duration-300">
                <a href="/auth">Start Learning Free</a>
              </Button>
              <Button size="lg" variant="outline" className="font-semibold px-8 py-4 text-lg border-2 hover:bg-accent/50 transition-all duration-300">
                Learn More
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <div className="group text-center space-y-6 p-8 rounded-2xl bg-gradient-to-br from-background to-muted/30 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-card">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">Adaptive Learning</h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI-powered system that adapts to your learning pace and focuses on areas that need improvement.
                </p>
              </div>
            </div>

            <div className="group text-center space-y-6 p-8 rounded-2xl bg-gradient-to-br from-background to-muted/30 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-card">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">Targeted Practice</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Questions specifically chosen to address your weak topics and reinforce your strengths.
                </p>
              </div>
            </div>

            <div className="group text-center space-y-6 p-8 rounded-2xl bg-gradient-to-br from-background to-muted/30 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-card">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary-glow/10 rounded-2xl w-fit mx-auto group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">Progress Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Detailed analytics and insights to monitor your improvement and exam readiness.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-24 p-8 rounded-2xl bg-gradient-to-r from-primary/5 via-primary-glow/5 to-primary/5 border border-primary/10">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Ready to get started?</h2>
              <p className="text-muted-foreground text-lg">Join thousands of students already improving their 11+ exam scores</p>
              <Button asChild className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground font-semibold px-8 py-3 shadow-learning hover:shadow-glow transition-all duration-300">
                <a href="/auth">Start Your Free Trial</a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
