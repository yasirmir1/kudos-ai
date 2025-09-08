import React, { useState, useEffect } from 'react';
import { 
  Star, TrendingUp, AlertTriangle, CheckCircle, Clock, Target, 
  BookOpen, Trophy, Heart, BarChart3, Loader2, Award, Zap 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { KudosScoreCard } from './KudosScoreCard';
import { PerformanceChart } from './PerformanceChart';
import { MockTestPerformanceContainer } from './MockTestPerformanceContainer';
import { WeeklyTestPerformanceContainer } from './WeeklyTestPerformanceContainer';
import { SkillDevelopmentCard } from './SkillDevelopmentCard';
import { EnhancedProgressInsights } from './EnhancedProgressInsights';
import { useAuth } from '../../hooks/useAuth';
import { useBootcampData } from '../../hooks/useBootcampData';
import { useKudosScore } from '../../hooks/useKudosScore';
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

interface Skill {
  name: string;
  level: number;
  trend: 'up' | 'down' | 'stable';
}

interface Achievement {
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  date: string;
}

export const ProgressView: React.FC = () => {
  const { user } = useAuth();
  const { student, stats, progress, isLoading } = useBootcampData();
  const { kudosData } = useKudosScore();
  
  const [insights, setInsights] = useState<ParentInsight[]>([]);
  const [topTopics, setTopTopics] = useState<TopicProgress[]>([]);
  const [strugglingTopics, setStrugglingTopics] = useState<TopicProgress[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState({
    questionsThisWeek: 0,
    accuracyThisWeek: 0,
    timeSpentMinutes: 0
  });

  // Detailed view data
  const [skillsData, setSkillsData] = useState<Skill[]>([]);
  const [skillDevelopmentData, setSkillDevelopmentData] = useState<{
    skill: string;
    accuracy: number;
  }[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (user && student && stats) {
      loadParentDashboardData();
      loadDetailedProgressData();
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
      const topicStats = new Map<string, {
        correct: number;
        total: number;
        recent: boolean[];
      }>();
      
      topicResponses.data?.forEach((response: any) => {
        const topicId = response.bootcamp_questions.topic_id;
        const isRecent = new Date(response.responded_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        
        if (!topicStats.has(topicId)) {
          topicStats.set(topicId, {
            correct: 0,
            total: 0,
            recent: []
          });
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
          const accuracy = stats.total > 0 ? Math.round(stats.correct / stats.total * 100) : 0;
          
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
      const weeklyAccuracy = weeklyQuestions > 0 ? Math.round(weeklyCorrect / weeklyQuestions * 100) : 0;
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

  const loadDetailedProgressData = async () => {
    if (!user) return;
    
    try {
      const studentProfile = await BootcampAPI.getStudentProfile(user.id);
      if (studentProfile) {
        const [progress, summary, topics] = await Promise.all([
          BootcampAPI.getStudentProgress(studentProfile.student_id),
          BootcampAPI.getStudentPerformanceSummary(studentProfile.student_id),
          supabase.from('bootcamp_topics').select('id, name').order('topic_order')
        ]);

        // Create topic name mapping
        const topicNameMap = new Map();
        if (topics.data) {
          topics.data.forEach((topic: any) => {
            topicNameMap.set(topic.id, topic.name);
          });
        }

        // Get topic performance data from both sources
        const [responseCounts, mockTestCounts] = await Promise.all([
          // Regular practice responses
          supabase
            .from('bootcamp_student_responses')
            .select(`
              is_correct,
              bootcamp_questions!inner(topic_id)
            `)
            .eq('student_id', studentProfile.student_id),
          // Mock test answers  
          supabase
            .from('bootcamp_mock_test_answers')
            .select(`
              is_correct,
              bootcamp_mock_test_sessions!inner(student_id),
              mock_test_questions!inner(topic)
            `)
            .eq('bootcamp_mock_test_sessions.student_id', studentProfile.student_id)
        ]);

        // Calculate topic performance from both sources
        const topicStats = new Map<string, {
          correct: number;
          total: number;
        }>();

        // Initialize all topics with 0 stats
        if (topics.data) {
          topics.data.forEach((topic: any) => {
            topicStats.set(topic.id, { correct: 0, total: 0 });
          });
        }

        // Process regular responses
        responseCounts.data?.forEach((response: any) => {
          const topicId = response.bootcamp_questions.topic_id;
          const current = topicStats.get(topicId) || { correct: 0, total: 0 };
          current.total++;
          if (response.is_correct) current.correct++;
          topicStats.set(topicId, current);
        });

        // Process mock test answers
        mockTestCounts.data?.forEach((answer: any) => {
          const topicName = answer.mock_test_questions.topic;
          // Find topic ID by name
          const topicId = Array.from(topicNameMap.entries())
            .find(([_, name]) => name.toLowerCase().includes(topicName.toLowerCase()))?.[0];
          
          if (topicId) {
            const current = topicStats.get(topicId) || { correct: 0, total: 0 };
            current.total++;
            if (answer.is_correct) current.correct++;
            topicStats.set(topicId, current);
          }
        });

        // Convert to skill development data
        const skillsDataForCard = Array.from(topicStats.entries())
          .filter(([topicId, topicStat]) => topicStat.total > 0)
          .map(([topicId, topicStat]) => ({
            skill: topicNameMap.get(topicId) || topicId,
            accuracy: Math.round(topicStat.correct / topicStat.total * 100)
          }))
          .filter(skill => skill.skill)
          .sort((a, b) => a.accuracy - b.accuracy);

        setSkillDevelopmentData(skillsDataForCard);

        // Map progress to skills data with proper topic names
        const skills: Skill[] = progress.map((p: any) => ({
          name: topicNameMap.get(p.topic_id) || p.topic_id,
          level: Math.round(p.accuracy_percentage || 0),
          trend: (p.accuracy_percentage >= 80 ? 'up' : 
                  p.accuracy_percentage >= 60 ? 'stable' : 'down') as 'up' | 'down' | 'stable'
        })).slice(0, 5);
        
        setSkillsData(skills);

        // Generate achievements based on performance
        const achievements: Achievement[] = [];
        if (stats.accuracy >= 95) {
          achievements.push({
            name: 'Accuracy Master',
            description: 'Achieve 95% overall accuracy',
            icon: Target,
            date: 'Recently'
          });
        }
        if (stats.totalQuestions >= 100) {
          achievements.push({
            name: 'Question Master',
            description: 'Complete 100+ practice questions',
            icon: Zap,
            date: 'Recently'
          });
        }
        if (stats.streakDays >= 7) {
          achievements.push({
            name: 'Week Warrior',
            description: '7+ days of active practice',
            icon: Award,
            date: 'Recently'
          });
        }
        setRecentAchievements(achievements);
      }
    } catch (error) {
      console.error('Error loading detailed progress data:', error);
    }
  };

  const generateParentInsights = (stats: any, topicData: TopicProgress[], weekly: typeof weeklyActivity) => {
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto bg-transparent">
      {/* Header */}
      <div className="relative px-12 py-6 rounded-3xl shadow-2xl mx-auto max-w-4xl mb-4 bg-gradient-to-r from-[#6366f1] to-[#9333ea]">
        <h1 className="text-2xl font-bold text-white mb-2">Detailed Progress Analytics</h1>
        <p className="text-white/80">Comprehensive view of learning performance</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Kudos Score</h3>
          <p className="text-3xl font-bold text-primary">
            {kudosData?.current_score || 0}
          </p>
          <p className="text-sm text-muted-foreground">Difficulty & speed adjusted performance</p>
        </Card>
        
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Overall Accuracy</h3>
          <p className="text-3xl font-bold text-success">
            {stats.accuracy}%
          </p>
          <p className="text-sm text-muted-foreground">correct answers</p>
        </Card>
        
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Questions Attempted</h3>
          <p className="text-3xl font-bold text-primary">
            {stats.totalQuestions}
          </p>
          <p className="text-sm text-muted-foreground">total questions</p>
        </Card>
      </div>

      {/* Score Trend Over Time */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Score Trend Over Time</h3>
        {kudosData?.trend && kudosData.trend.length > 1 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kudosData.trend.map((score, index) => ({
                session: index + 1,
                score: score,
                date: new Date(Date.now() - (kudosData.trend.length - index - 1) * 24 * 60 * 60 * 1000).toLocaleDateString()
              }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="session" 
                  className="text-xs fill-muted-foreground" 
                  tick={{ fontSize: 10 }} 
                />
                <YAxis 
                  className="text-xs fill-muted-foreground" 
                  tick={{ fontSize: 10 }} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  formatter={value => [value, 'Kudos Score']}
                  labelFormatter={label => `Session ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Complete more sessions to see your progress trend!</p>
          </div>
        )}
      </Card>

      {/* Topics to Work On */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Topics to Work On
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {skillDevelopmentData.length > 0 ? (
            skillDevelopmentData.slice(0, 9).map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{skill.skill}</div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        skill.accuracy >= 50 ? 'bg-foreground' : 'bg-destructive'
                      }`}
                      style={{ width: `${skill.accuracy}%` }}
                    />
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-lg font-bold ${
                    skill.accuracy >= 50 ? 'text-foreground' : 'text-destructive'
                  }`}>
                    {skill.accuracy}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4 col-span-full">
              Complete more practice sessions to see topic progress!
            </p>
          )}
        </div>
      </Card>

      {/* Common Misconceptions Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Common Misconceptions
        </h2>
        <div className="space-y-3">
          {strugglingTopics.length > 0 ? (
            strugglingTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
                <div>
                  <div className="font-medium text-foreground">{topic.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {topic.attempts} attempts • {topic.accuracy}% accuracy
                  </div>
                  {topic.trend === 'declining' && (
                    <div className="text-xs text-warning mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Performance declining
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  Practice
                </Button>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No significant misconceptions detected. Great work!
            </p>
          )}
        </div>
      </Card>

      {/* Mock Test and Weekly Test Performance Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MockTestPerformanceContainer />
        <WeeklyTestPerformanceContainer />
      </div>

      {/* Skill Development */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Skill Development</h2>
        <div className="space-y-4">
          {skillDevelopmentData.length > 0 ? (
            skillDevelopmentData.map((skill, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{skill.skill}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{skill.accuracy}%</span>
                    {skill.accuracy >= 80 && <TrendingUp className="h-3 w-3 text-success" />}
                    {skill.accuracy < 60 && <TrendingUp className="h-3 w-3 text-destructive rotate-180" />}
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      skill.accuracy >= 80 
                        ? 'bg-gradient-to-r from-success to-success/80' 
                        : skill.accuracy >= 60 
                        ? 'bg-gradient-to-r from-warning to-warning/80' 
                        : 'bg-gradient-to-r from-destructive to-destructive/80'
                    }`}
                    style={{ width: `${skill.accuracy}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Start practicing to see your skill development!
            </p>
          )}
        </div>
              </Card>
      </div>
    </div>
  );
};