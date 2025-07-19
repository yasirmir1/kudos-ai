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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src="/lovable-uploads/409330f0-2245-4147-b837-ff553d303814.png" alt="Kudos Academy" className="h-12 w-12" />
        </div>
        <Button asChild>
          <a href="/auth">Get Started</a>
        </Button>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Ace Your 11+ Exam with 
            <br />
            <span className="text-primary">Smart Learning</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our adaptive AI system personalizes your learning journey, focusing on your weak areas 
            and building confidence through intelligent question selection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-primary-glow">
              <a href="/auth">Start Learning Free</a>
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Adaptive Learning</h3>
              <p className="text-muted-foreground">
                AI-powered system that adapts to your learning pace and focuses on areas that need improvement.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Targeted Practice</h3>
              <p className="text-muted-foreground">
                Questions specifically chosen to address your weak topics and reinforce your strengths.
              </p>
            </div>

            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Detailed analytics and insights to monitor your improvement and exam readiness.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
