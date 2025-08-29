import React, { useState, useEffect } from 'react';
import { 
  Star, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  BookOpen,
  Trophy,
  Heart
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KudosScoreCard } from './KudosScoreCard';
import { useAuth } from '../../hooks/useAuth';
import { useBootcampData } from '../../hooks/useBootcampData';
import { BootcampAPI } from '../../lib/bootcamp-api';
import { supabase } from '@/integrations/supabase/client';

interface ParentInsight {
  type: 'strength' | 'concern' | 'suggestion';
  title: string;
  description: string;
  action?: string;
  icon: React.ComponentType<any>;
}

interface TopicProgress {
  name: string;
  accuracy: number;
  attempts: number;
  trend: 'improving' | 'stable' | 'declining';
}

export const ProgressView: React.FC = () => {
  const { user } = useAuth();
  const { student, stats, isLoading } = useBootcampData();
  const [insights, setInsights] = useState<ParentInsight[]>([]);
  const [topTopics, setTopTopics] = useState<TopicProgress[]>([]);
  const [strugglingTopics, setStrugglingTopics] = useState<TopicProgress[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState({ 
    questionsThisWeek: 0, 
    accuracyThisWeek: 0,
    timeSpentMinutes: 0 
  });

  useEffect(() => {
    if (user && student && stats) {
      loadParentDashboardData();
    }
  }, [user, student, stats]);

  const loadParentDashboardData = async () => {
    if (!user || !student) return;
    
    try {
      // Get detailed topic performance
      const [topicResponses, weeklyData] = await Promise.all([
        // Topic performance
        supabase
          .from('bootcamp_student_responses')
          .select(`
            is_correct,
            responded_at,
            bootcamp_questions!inner(topic_id)
          `)
          .eq('student_id', student.student_id),
        
        // Weekly activity (last 7 days)
        supabase
          .from('bootcamp_student_responses')
          .select('is_correct, time_taken, responded_at')
          .eq('student_id', student.student_id)
          .gte('responded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Get topic names
      const { data: topics } = await supabase
        .from('bootcamp_topics')
        .select('id, name')
        .order('topic_order');

      const topicNameMap = new Map();
      topics?.forEach((topic: any) => {
        topicNameMap.set(topic.id, topic.name);
      });

      // Process topic performance
      const topicStats = new Map<string, { correct: number; total: number; recent: boolean[] }>();
      
      topicResponses.data?.forEach((response: any) => {
        const topicId = response.bootcamp_questions.topic_id;
        const isRecent = new Date(response.responded_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        
        if (!topicStats.has(topicId)) {
          topicStats.set(topicId, { correct: 0, total: 0, recent: [] });
        }
        
        const stats = topicStats.get(topicId)!;
        stats.total++;
        if (response.is_correct) stats.correct++;
        if (isRecent) stats.recent.push(response.is_correct);
      });

      // Convert to topic progress with trends
      const topicProgressData: TopicProgress[] = Array.from(topicStats.entries())
        .map(([topicId, stats]) => {
          const name = topicNameMap.get(topicId) || topicId;
          const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
          
          // Calculate trend from recent attempts
          let trend: 'improving' | 'stable' | 'declining' = 'stable';
          if (stats.recent.length >= 3) {
            const recentAccuracy = stats.recent.filter(Boolean).length / stats.recent.length;
            const overallAccuracy = stats.correct / stats.total;
            
            if (recentAccuracy > overallAccuracy + 0.1) trend = 'improving';
            else if (recentAccuracy < overallAccuracy - 0.1) trend = 'declining';
          }
          
          return { name, accuracy, attempts: stats.total, trend };
        })
        .filter(topic => topic.attempts >= 3); // Only topics with meaningful data

      // Sort topics
      const sortedTopics = [...topicProgressData].sort((a, b) => b.accuracy - a.accuracy);
      setTopTopics(sortedTopics.slice(0, 3));
      setStrugglingTopics(sortedTopics.filter(t => t.accuracy < 70).slice(0, 3));

      // Calculate weekly activity
      const weeklyQuestions = weeklyData.data?.length || 0;
      const weeklyCorrect = weeklyData.data?.filter(r => r.is_correct).length || 0;
      const weeklyAccuracy = weeklyQuestions > 0 ? Math.round((weeklyCorrect / weeklyQuestions) * 100) : 0;
      const timeSpentMinutes = weeklyData.data?.reduce((sum, r) => sum + (r.time_taken || 0), 0) / 60 || 0;

      setWeeklyActivity({
        questionsThisWeek: weeklyQuestions,
        accuracyThisWeek: weeklyAccuracy,
        timeSpentMinutes: Math.round(timeSpentMinutes)
      });

      // Generate parent insights
      generateParentInsights(stats, topicProgressData, weeklyActivity);

    } catch (error) {
      console.error('Error loading parent dashboard data:', error);
    }
  };

  const generateParentInsights = (
    stats: any, 
    topicData: TopicProgress[], 
    weekly: typeof weeklyActivity
  ) => {
    const newInsights: ParentInsight[] = [];

    // Strengths
    if (stats.accuracy >= 85) {
      newInsights.push({
        type: 'strength',
        title: 'Excellent Understanding',
        description: `Your child shows strong mastery with ${stats.accuracy}% overall accuracy.`,
        action: 'Consider introducing more challenging topics.',
        icon: Star
      });
    }

    if (stats.streakDays >= 5) {
      newInsights.push({
        type: 'strength', 
        title: 'Consistent Practice',
        description: `Great habit! ${stats.streakDays} days of regular practice.`,
        action: 'Keep encouraging this routine.',
        icon: Trophy
      });
    }

    // Concerns
    if (weekly.questionsThisWeek < 10) {
      newInsights.push({
        type: 'concern',
        title: 'Low Practice Activity',
        description: `Only ${weekly.questionsThisWeek} questions this week.`,
        action: 'Try setting a daily 15-minute practice goal.',
        icon: AlertTriangle
      });
    }

    const strugglingCount = topicData.filter(t => t.accuracy < 60).length;
    if (strugglingCount >= 2) {
      newInsights.push({
        type: 'concern',
        title: 'Multiple Weak Areas',
        description: `Struggling with ${strugglingCount} topic areas.`,
        action: 'Focus on one topic at a time for better results.',
        icon: AlertTriangle
      });
    }

    // Suggestions
    if (weekly.timeSpentMinutes < 60) {
      newInsights.push({
        type: 'suggestion',
        title: 'Increase Practice Time',
        description: `${weekly.timeSpentMinutes} minutes practiced this week.`,
        action: 'Aim for 15-20 minutes daily for optimal progress.',
        icon: Clock
      });
    }

    const improvingTopics = topicData.filter(t => t.trend === 'improving').length;
    if (improvingTopics > 0) {
      newInsights.push({
        type: 'strength',
        title: 'Improving Performance',
        description: `Shows improvement in ${improvingTopics} topic areas.`,
        action: 'Celebrate this progress!',
        icon: TrendingUp
      });
    }

    setInsights(newInsights);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Learning Progress</h1>
        <p className="text-muted-foreground">
          A simple view of your child's math journey
        </p>
      </div>

      {/* Kudos Score - Featured prominently */}
      <KudosScoreCard />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">{stats.totalQuestions}</div>
          <div className="text-sm text-muted-foreground">Questions Completed</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Target className="h-6 w-6 mx-auto mb-2 text-success" />
          <div className="text-2xl font-bold text-foreground">{stats.accuracy}%</div>
          <div className="text-sm text-muted-foreground">Overall Accuracy</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Heart className="h-6 w-6 mx-auto mb-2 text-warning" />
          <div className="text-2xl font-bold text-foreground">{weeklyActivity.questionsThisWeek}</div>
          <div className="text-sm text-muted-foreground">This Week</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold text-foreground">{weeklyActivity.timeSpentMinutes}m</div>
          <div className="text-sm text-muted-foreground">Time Practiced</div>
        </Card>
      </div>

      {/* Parent Insights */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Key Insights
        </h2>
        <div className="space-y-4">
          {insights.length > 0 ? insights.map((insight, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'strength' ? 'border-success bg-success/5' :
                insight.type === 'concern' ? 'border-destructive bg-destructive/5' :
                'border-primary bg-primary/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <insight.icon className={`h-5 w-5 mt-0.5 ${
                  insight.type === 'strength' ? 'text-success' :
                  insight.type === 'concern' ? 'text-destructive' :
                  'text-primary'
                }`} />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  {insight.action && (
                    <p className="text-sm font-medium mt-2 text-foreground">
                      💡 {insight.action}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <p className="text-center text-muted-foreground py-4">
              Complete more practice sessions to see personalized insights!
            </p>
          )}
        </div>
      </Card>

      {/* Topic Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Strong Areas
          </h3>
          <div className="space-y-3">
            {topTopics.length > 0 ? topTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-success/5 rounded-lg">
                <div>
                  <div className="font-medium text-foreground">{topic.name}</div>
                  <div className="text-sm text-muted-foreground">{topic.attempts} questions</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-success">{topic.accuracy}%</div>
                  {topic.trend === 'improving' && (
                    <TrendingUp className="h-4 w-4 text-success ml-auto" />
                  )}
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">
                Keep practicing to identify strong areas!
              </p>
            )}
          </div>
        </Card>

        {/* Areas for Growth */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Growth Areas
          </h3>
          <div className="space-y-3">
            {strugglingTopics.length > 0 ? strugglingTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-warning/5 rounded-lg">
                <div>
                  <div className="font-medium text-foreground">{topic.name}</div>
                  <div className="text-sm text-muted-foreground">{topic.attempts} questions</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-warning">{topic.accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Needs practice</div>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">
                Great! No major weak areas identified.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-4">Help Your Child Progress</h3>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="default">
            Start Practice Session
          </Button>
          <Button variant="outline">
            Review Mistakes
          </Button>
          <Button variant="outline">
            Set Daily Goal
          </Button>
        </div>
      </Card>
    </div>
  );
};