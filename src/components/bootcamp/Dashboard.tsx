import React, { useState, useEffect } from 'react';
import { Brain, Target, Shield, Award, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { WeeklyProgressChart } from './WeeklyProgressChart';
import { WeeklyTestPerformanceCard } from './WeeklyTestPerformanceCard';
import { MockTestPerformanceCard } from './MockTestPerformanceCard';
import { LearningJourneyCard } from './LearningJourneyCard';
import { ReviewMistakesModal } from './ReviewMistakesModal';
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
    recentWeeks: [
      {
        weekNumber: 2,
        dateRange: 'Aug 3 - Aug 9',
        correct: 26,
        total: 75,
        accuracy: 35,
        status: 'Needs Improvement' as const
      },
      {
        weekNumber: 1,
        dateRange: 'Aug 2 - Aug 8',
        correct: 9,
        total: 42,
        accuracy: 21,
        status: 'Needs Improvement' as const
      }
    ]
  };

  // Sample data for Mock Test Performance
  const mockTestData = {
    testsCompleted: 3,
    averageScore: 42,
    bestScore: 58,
    averageTime: '45m',
    recentTests: [
      {
        testNumber: 3,
        date: 'Aug 9, 2024',
        score: 58,
        totalQuestions: 50,
        correctAnswers: 29,
        timeSpent: '42m',
        status: 'Good' as const
      },
      {
        testNumber: 2,
        date: 'Aug 5, 2024',
        score: 34,
        totalQuestions: 50,
        correctAnswers: 17,
        timeSpent: '38m',
        status: 'Needs Improvement' as const
      }
    ]
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
        const [progress, topics] = await Promise.all([
          BootcampAPI.getStudentProgress(studentProfile.student_id), 
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
        const topicStats = new Map<string, { correct: number; total: number }>();

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
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome back, {user.name}! 🎯
            </h1>
            <p className="text-muted-foreground">You're making great progress. Keep up the momentum!</p>
          </div>
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => <div key={index} className="bg-card rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${stat.color}/10 ${getColorClasses(stat.color)}`}>
                {stat.label}
              </span>
              <stat.icon className={`h-8 w-8 ${getColorClasses(stat.color)}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>)}
      </div>

      {/* Learning Journey */}
      <LearningJourneyCard 
        currentWeek={1} 
        hasStarted={false} 
        onStartLearning={onStartLearning} 
      />

      {/* Top Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <WeeklyTestPerformanceCard 
          {...weeklyTestData} 
          onStartWeeklyChallenge={() => setCurrentView('practice')} 
          onReviewMistakes={() => {
            setReviewMistakesTab('practice');
            setReviewMistakesOpen(true);
          }}
        />
        <MockTestPerformanceCard 
          {...mockTestData} 
          onStartMockTest={() => setCurrentView('mocktest')} 
          onReviewMistakes={() => {
            setReviewMistakesTab('mock_test');
            setReviewMistakesOpen(true);
          }}
        />
      </div>



      <WeeklyProgressChart />

      {/* Review Mistakes Modal */}
      <ReviewMistakesModal 
        open={reviewMistakesOpen}
        onOpenChange={setReviewMistakesOpen}
        initialTab={reviewMistakesTab}
      />
    </div>;
};