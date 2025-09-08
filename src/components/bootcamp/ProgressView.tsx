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
        description: `Your child shows strong mastery with ${stats.accuracy}%