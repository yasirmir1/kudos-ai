import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Target, TrendingUp, Clock, Award, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PerformanceData {
  topic: string;
  accuracy: number;
  total_attempts: number;
}

interface WeakTopic {
  topic: string;
  accuracy: number;
  attempts: number;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [misconceptions, setMisconceptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load performance data
      const { data: performanceData } = await supabase
        .from('student_performance')
        .select('*')
        .eq('student_id', user?.id)
        .order('accuracy', { ascending: false });

      if (performanceData) {
        setPerformance(performanceData);
      }

      // Load weak topics
      const { data: weakTopicsData } = await supabase
        .rpc('get_weak_topics', { p_student_id: user?.id });

      if (weakTopicsData) {
        setWeakTopics(weakTopicsData);
      }

      // Load misconception analysis
      const { data: misconceptionsData } = await supabase
        .rpc('get_student_misconceptions', { p_student_id: user?.id });

      if (misconceptionsData) {
        setMisconceptions(misconceptionsData);
      }

      // Get total questions answered
      const { count } = await supabase
        .from('student_answers')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user?.id);

      setTotalQuestions(count || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const startLearning = () => {
    navigate('/practice');
  };

  const overallAccuracy = performance.length > 0 
    ? performance.reduce((sum, p) => sum + p.accuracy, 0) / performance.length 
    : 0;

  const strongestTopic = performance[0];
  const needsWork = weakTopics.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <img src="/lovable-uploads/409330f0-2245-4147-b837-ff553d303814.png" alt="Kudos" className="h-12 w-auto mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <img src="/lovable-uploads/409330f0-2245-4147-b837-ff553d303814.png" alt="Kudos" className="h-8 w-auto" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Kudos</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={() => navigate('/profile')}>
              Profile
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Actions */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to learn?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your adaptive learning system has prepared personalized questions based on your progress
          </p>
          <Button 
            size="lg" 
            onClick={startLearning}
            className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Start Practice Session
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <p className="text-xs text-muted-foreground">Questions completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(overallAccuracy * 100)}%</div>
              <Progress value={overallAccuracy * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Topics Studied</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.length}</div>
              <p className="text-xs text-muted-foreground">Different topics</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Day streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strongest Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-green-500" />
                <span>Your Strengths</span>
              </CardTitle>
              <CardDescription>Topics where you're performing well</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {performance.slice(0, 5).map((topic, index) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">{topic.topic}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {Math.round(topic.accuracy * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {topic.total_attempts} attempts
                    </div>
                  </div>
                </div>
              ))}
              {performance.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Complete some practice questions to see your strengths!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-orange-500" />
                <span>Focus Areas</span>
              </CardTitle>
              <CardDescription>Topics that need more attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {needsWork.map((topic, index) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="destructive" className="text-xs">
                      Priority {index + 1}
                    </Badge>
                    <span className="font-medium">{topic.topic}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-orange-600">
                      {Math.round(topic.accuracy * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {topic.attempts} attempts
                    </div>
                  </div>
                </div>
              ))}
              {needsWork.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Great job! No weak areas identified yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Common Misconceptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>Misconceptions</span>
              </CardTitle>
              <CardDescription>Common mistakes to watch out for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {misconceptions.slice(0, 5).map((misconception, index) => (
                <div key={`${misconception.red_herring}-${index}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {misconception.frequency}x
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {misconception.topics?.join(', ')}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-blue-700">
                    {misconception.red_herring?.replace(/_/g, ' ')}
                  </p>
                </div>
              ))}
              {misconceptions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Complete some practice questions to identify misconceptions.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;