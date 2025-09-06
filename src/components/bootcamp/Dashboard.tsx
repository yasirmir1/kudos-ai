import React, { useState, useEffect } from 'react';
import { Brain, Target, Shield, Award, TrendingUp, AlertCircle, Loader2, BarChart3 } from 'lucide-react';
import { WeeklyProgressChart } from './WeeklyProgressChart';
import { WeeklyTestPerformanceCard } from './WeeklyTestPerformanceCard';
import { MockTestPerformanceCard } from './MockTestPerformanceCard';
import { LearningJourneyCard } from './LearningJourneyCard';
import { UpcomingWeeks } from './UpcomingWeeks';
import { ReviewMistakesModal } from './ReviewMistakesModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import { BootcampAPI } from '../../lib/bootcamp-api';
import { supabase } from '@/integrations/supabase/client';
interface User {
  name: string;
  level: string;
  streakDays: number;
  totalPoints: number;
  accuracy: number;
  questionsToday: number;
  weeklyGoal?: number;
}
interface DashboardProps {
  user: User;
  setCurrentView: (view: string) => void;
  onStartLearning: (week: number) => void;
}
interface QuickStat {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
}
interface RecentTopic {
  name: string;
  accuracy: number;
  questions: number;
  status: 'improving' | 'stable' | 'needs-work';
}
export const Dashboard: React.FC<DashboardProps> = ({
  user,
  setCurrentView,
  onStartLearning
}) => {
  const {
    user: authUser
  } = useAuth();
  const [recentTopics, setRecentTopics] = useState<RecentTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewMistakesOpen, setReviewMistakesOpen] = useState(false);
  const [reviewMistakesTab, setReviewMistakesTab] = useState<'practice' | 'mock_test'>('practice');

  // Sample data for Weekly Test Performance
  const weeklyTestData = {
    activeWeeks: 2,
    averageScore: 28,
    bestWeek: 35,
    weekStreak: 0,
    recentWeeks: [{
      weekNumber: 2,
      dateRange: 'Aug 3 - Aug 9',
      correct: 26,
      total: 75,
      accuracy: 35,
      status: 'Needs Improvement' as const
    }, {
      weekNumber: 1,
      dateRange: 'Aug 2 - Aug 8',
      correct: 9,
      total: 42,
      accuracy: 21,
      status: 'Needs Improvement' as const
    }]
  };

  // Sample data for Mock Test Performance
  const mockTestData = {
    testsCompleted: 3,
    averageScore: 42,
    bestScore: 58,
    averageTime: '45m',
    recentTests: [{
      testNumber: 3,
      date: 'Aug 9, 2024',
      score: 58,
      totalQuestions: 50,
      correctAnswers: 29,
      timeSpent: '42m',
      status: 'Good' as const
    }, {
      testNumber: 2,
      date: 'Aug 5, 2024',
      score: 34,
      totalQuestions: 50,
      correctAnswers: 17,
      timeSpent: '38m',
      status: 'Needs Improvement' as const
    }]
  };
  useEffect(() => {
    if (authUser) {
      loadProgressData();
    }
  }, [authUser]);

  // Auto-refresh data every 30 seconds to catch new session updates
  useEffect(() => {
    if (!authUser) return;
    const interval = setInterval(() => {
      loadProgressData();
    }, 30000);
    return () => clearInterval(interval);
  }, [authUser]);
  const loadProgressData = async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const studentProfile = await BootcampAPI.getStudentProfile(authUser.id);
      if (studentProfile) {
        const [progress, topics] = await Promise.all([BootcampAPI.getStudentProgress(studentProfile.student_id), supabase.from('bootcamp_topics').select('id, name').order('topic_order')]);

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
        supabase.from('bootcamp_student_responses').select(`
              is_correct,
              bootcamp_questions!inner(topic_id)
            `).eq('student_id', studentProfile.student_id),
        // Mock test answers  
        supabase.from('bootcamp_mock_test_answers').select(`
              is_correct,
              bootcamp_mock_test_sessions!inner(student_id),
              mock_test_questions!inner(topic)
            `).eq('bootcamp_mock_test_sessions.student_id', studentProfile.student_id)]);

        // Calculate topic performance from both sources
        const topicStats = new Map<string, {
          correct: number;
          total: number;
        }>();

        // Process regular responses
        responseCounts.data?.forEach((response: any) => {
          const topicId = response.bootcamp_questions.topic_id;
          const current = topicStats.get(topicId) || {
            correct: 0,
            total: 0
          };
          current.total++;
          if (response.is_correct) current.correct++;
          topicStats.set(topicId, current);
        });

        // Process mock test answers
        mockTestCounts.data?.forEach((answer: any) => {
          const topicName = answer.mock_test_questions.topic;
          // Find topic ID by name
          const topicId = Array.from(topicNameMap.entries()).find(([_, name]) => name.toLowerCase().includes(topicName.toLowerCase()))?.[0];
          if (topicId) {
            const current = topicStats.get(topicId) || {
              correct: 0,
              total: 0
            };
            current.total++;
            if (answer.is_correct) current.correct++;
            topicStats.set(topicId, current);
          }
        });

        // Recent topics for the other card
        const topicsData: RecentTopic[] = progress.map((p: any) => ({
          name: topicNameMap.get(p.topic_id) || p.topic_id,
          accuracy: Math.round(p.accuracy_percentage || 0),
          questions: topicStats.get(p.topic_id)?.total || 0,
          status: (p.accuracy_percentage >= 80 ? 'improving' : p.accuracy_percentage >= 70 ? 'stable' : 'needs-work') as 'improving' | 'stable' | 'needs-work'
        })).slice(0, 3);
        setRecentTopics(topicsData);
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };
  const quickStats: QuickStat[] = [{
    label: 'Questions Today',
    value: user.questionsToday.toString(),
    icon: Brain,
    color: 'primary'
  }, {
    label: 'Accuracy',
    value: `${user.accuracy}%`,
    icon: Target,
    color: 'success'
  }, {
    label: 'Current Level',
    value: user.level,
    icon: Shield,
    color: 'secondary'
  }, {
    label: 'Weekly Goal',
    value: `${user.weeklyGoal || 85}%`,
    icon: Award,
    color: 'warning'
  }];
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'text-primary';
      case 'success':
        return 'text-success';
      case 'secondary':
        return 'text-secondary-foreground';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-primary';
    }
  };
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-success';
    if (accuracy >= 70) return 'text-warning';
    return 'text-destructive';
  };
  return <div className="space-y-6">
      {/* Welcome Section */}
      

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => <div key={stat.label} className="bg-card border border-border rounded-lg p-6 flex items-center justify-between shadow-card" style={{
        background: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
        color: 'hsl(var(--card-foreground))',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        zIndex: 1
      }}>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
            </div>
            <div className={`rounded-full p-3 ${stat.color === 'primary' ? 'bg-blue-100' : stat.color === 'success' ? 'bg-green-100' : stat.color === 'secondary' ? 'bg-purple-100' : stat.color === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
              <stat.icon className={`h-8 w-8 ${stat.color === 'primary' ? 'text-blue-600' : stat.color === 'success' ? 'text-green-600' : stat.color === 'secondary' ? 'text-purple-600' : stat.color === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
            </div>
          </div>)}
      </div>

      {/* Learning Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LearningJourneyCard currentWeek={1} hasStarted={false} onStartLearning={onStartLearning} />
        <UpcomingWeeks />
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyTestPerformanceCard {...weeklyTestData} onStartWeeklyChallenge={() => setCurrentView('practice')} onReviewMistakes={() => {
        setReviewMistakesTab('practice');
        setReviewMistakesOpen(true);
      }} />
        <MockTestPerformanceCard {...mockTestData} onStartMockTest={() => setCurrentView('mocktest')} onReviewMistakes={() => {
        setReviewMistakesTab('mock_test');
        setReviewMistakesOpen(true);
      }} />
      </div>

      {/* Review Mistakes Modal */}
      <ReviewMistakesModal open={reviewMistakesOpen} onOpenChange={setReviewMistakesOpen} initialTab={reviewMistakesTab} />
    </div>;
};