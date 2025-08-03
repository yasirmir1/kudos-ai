import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Clock, Award, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBootcampData } from '../../hooks/useBootcampData';
import { supabase } from '@/integrations/supabase/client';

interface WeeklySession {
  session_id: string;
  session_start: string;
  session_end: string | null;
  questions_correct: number;
  questions_attempted: number;
  performance_score: number;
  topics_covered: string[];
}

interface WeeklyStats {
  totalWeeks: number;
  averageScore: number;
  bestWeekScore: number;
  currentStreak: number;
  recentWeeks: WeeklySession[];
  topicsProgress: { [key: string]: number };
}

export const WeeklyTestPerformanceContainer: React.FC = () => {
  const { user } = useAuth();
  const { student, isLoading } = useBootcampData();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalWeeks: 0,
    averageScore: 0,
    bestWeekScore: 0,
    currentStreak: 0,
    recentWeeks: [],
    topicsProgress: {}
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && student) {
      loadWeeklyTestData();
    }
  }, [user, student]);

  const loadWeeklyTestData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Get bootcamp student ID first
      const { data: bootcampStudent } = await supabase
        .from('bootcamp_students')
        .select('student_id')
        .eq('user_id', user.id)
        .single();

      if (!bootcampStudent) return;

      // Fetch learning sessions that represent weekly practice/tests
      const { data: sessions, error } = await supabase
        .from('bootcamp_learning_sessions')
        .select('*')
        .eq('student_id', bootcampStudent.student_id)
        .not('session_end', 'is', null)
        .order('session_start', { ascending: false });

      if (error) throw error;

      if (sessions) {
        // Group sessions by week
        const weeklySessionsMap = new Map<string, WeeklySession[]>();
        
        sessions.forEach(session => {
          const weekKey = getWeekKey(new Date(session.session_start));
          if (!weeklySessionsMap.has(weekKey)) {
            weeklySessionsMap.set(weekKey, []);
          }
          weeklySessionsMap.get(weekKey)?.push(session);
        });

        // Calculate weekly aggregates
        const weeklyAggregates: WeeklySession[] = [];
        const topicsProgress: { [key: string]: number } = {};
        
        weeklySessionsMap.forEach((weekSessions, weekKey) => {
          const totalQuestions = weekSessions.reduce((sum, s) => sum + (s.questions_attempted || 0), 0);
          const totalCorrect = weekSessions.reduce((sum, s) => sum + (s.questions_correct || 0), 0);
          const allTopics = weekSessions.flatMap(s => s.topics_covered || []);
          
          // Calculate week performance score
          const weekScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
          
          weeklyAggregates.push({
            session_id: weekKey,
            session_start: weekSessions[0].session_start,
            session_end: weekSessions[weekSessions.length - 1].session_end,
            questions_correct: totalCorrect,
            questions_attempted: totalQuestions,
            performance_score: weekScore,
            topics_covered: [...new Set(allTopics)]
          });

          // Track topics progress
          allTopics.forEach(topic => {
            if (!topicsProgress[topic]) {
              topicsProgress[topic] = 0;
            }
            topicsProgress[topic]++;
          });
        });

        // Sort by date and calculate stats
        weeklyAggregates.sort((a, b) => new Date(b.session_start).getTime() - new Date(a.session_start).getTime());
        
        const totalWeeks = weeklyAggregates.length;
        const totalScore = weeklyAggregates.reduce((sum, week) => sum + week.performance_score, 0);
        const averageScore = totalWeeks > 0 ? Math.round(totalScore / totalWeeks) : 0;
        const bestWeekScore = weeklyAggregates.length > 0 ? Math.max(...weeklyAggregates.map(w => w.performance_score)) : 0;
        
        // Calculate current streak (consecutive weeks with performance > 70%)
        let currentStreak = 0;
        for (const week of weeklyAggregates) {
          if (week.performance_score >= 70) {
            currentStreak++;
          } else {
            break;
          }
        }

        setWeeklyStats({
          totalWeeks,
          averageScore,
          bestWeekScore,
          currentStreak,
          recentWeeks: weeklyAggregates.slice(0, 6), // Last 6 weeks
          topicsProgress
        });
      }
    } catch (error) {
      console.error('Error loading weekly test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekKey = (date: Date): string => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    return startOfWeek.toISOString().split('T')[0];
  };

  const formatWeekRange = (startDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-primary';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getPerformanceLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Improvement';
  };

  if (isLoading || loading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading weekly performance...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Weekly Test Performance</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-primary">{weeklyStats.totalWeeks}</p>
          <p className="text-sm text-muted-foreground">Active Weeks</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-success">{weeklyStats.averageScore}%</p>
          <p className="text-sm text-muted-foreground">Average Score</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-warning">{weeklyStats.bestWeekScore}%</p>
          <p className="text-sm text-muted-foreground">Best Week</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-primary">{weeklyStats.currentStreak}</p>
          <p className="text-sm text-muted-foreground">Week Streak</p>
        </div>
      </div>

      {/* Recent Weeks Performance */}
      <div>
        <h3 className="text-md font-medium text-foreground mb-4">Recent Weeks</h3>
        {weeklyStats.recentWeeks.length > 0 ? (
          <div className="space-y-3">
            {weeklyStats.recentWeeks.map((week, index) => (
              <div key={week.session_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Week {weeklyStats.totalWeeks - index}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatWeekRange(week.session_start)} • {week.questions_correct}/{week.questions_attempted} correct
                    </p>
                    {week.topics_covered.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Topics: {week.topics_covered.slice(0, 2).join(', ')}
                        {week.topics_covered.length > 2 && ` +${week.topics_covered.length - 2} more`}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${getPerformanceColor(week.performance_score)}`}>
                    {week.performance_score}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getPerformanceLabel(week.performance_score)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No weekly activity yet</p>
            <p className="text-sm text-muted-foreground mt-1">Complete practice sessions throughout the week to track your progress</p>
          </div>
        )}
      </div>

      {/* Topics Progress Summary */}
      {Object.keys(weeklyStats.topicsProgress).length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-md font-medium text-foreground mb-4">Topics Covered Recently</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(weeklyStats.topicsProgress)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([topic, count]) => (
                <div key={topic} className="px-3 py-1 bg-primary/10 rounded-full">
                  <span className="text-sm text-primary font-medium">{topic}</span>
                  <span className="text-xs text-muted-foreground ml-1">({count})</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};