import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Target, Award, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBootcampData } from '../../hooks/useBootcampData';
import { supabase } from '@/integrations/supabase/client';

interface MockTestSession {
  session_id: string;
  total_questions: number;
  questions_correct: number;
  time_spent_seconds: number;
  started_at: string;
  completed_at: string | null;
  status: string;
}

interface MockTestStats {
  totalTests: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  recentTests: MockTestSession[];
}

export const MockTestPerformanceContainer: React.FC = () => {
  const { user } = useAuth();
  const { student, isLoading } = useBootcampData();
  const [mockTestStats, setMockTestStats] = useState<MockTestStats>({
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0,
    recentTests: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && student) {
      loadMockTestData();
    }
  }, [user, student]);

  const loadMockTestData = async () => {
    if (!student?.student_id) return;
    
    setLoading(true);
    try {
      // Fetch mock test sessions
      const { data: sessions, error } = await supabase
        .from('bootcamp_mock_test_sessions')
        .select('*')
        .eq('student_id', student.student_id)
        .order('started_at', { ascending: false });

      if (error) throw error;

      if (sessions) {
        const completedSessions = sessions.filter(s => s.status === 'completed');
        const totalTests = completedSessions.length;
        
        let totalScore = 0;
        let bestScore = 0;
        let totalTimeSpent = 0;

        completedSessions.forEach(session => {
          const score = session.questions_correct > 0 && session.total_questions > 0 
            ? Math.round((session.questions_correct / session.total_questions) * 100)
            : 0;
          
          totalScore += score;
          bestScore = Math.max(bestScore, score);
          totalTimeSpent += session.time_spent_seconds || 0;
        });

        const averageScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;

        setMockTestStats({
          totalTests,
          averageScore,
          bestScore,
          totalTimeSpent,
          recentTests: sessions.slice(0, 5) // Last 5 tests
        });
      }
    } catch (error) {
      console.error('Error loading mock test data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading || loading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading mock test performance...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Mock Test Performance</h2>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-primary">{mockTestStats.totalTests}</p>
          <p className="text-sm text-muted-foreground">Tests Completed</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-success">{mockTestStats.averageScore}%</p>
          <p className="text-sm text-muted-foreground">Average Score</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-warning">{mockTestStats.bestScore}%</p>
          <p className="text-sm text-muted-foreground">Best Score</p>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold text-primary">{formatTime(mockTestStats.totalTimeSpent)}</p>
          <p className="text-sm text-muted-foreground">Total Time</p>
        </div>
      </div>

      {/* Recent Tests */}
      <div>
        <h3 className="text-md font-medium text-foreground mb-4">Recent Tests</h3>
        {mockTestStats.recentTests.length > 0 ? (
          <div className="space-y-3">
            {mockTestStats.recentTests.map((test, index) => {
              const score = test.questions_correct > 0 && test.total_questions > 0 
                ? Math.round((test.questions_correct / test.total_questions) * 100)
                : 0;
              
              return (
                <div key={test.session_id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Test #{mockTestStats.totalTests - index}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(test.started_at)} • {test.questions_correct}/{test.total_questions} correct
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{score}%</p>
                    <p className="text-sm text-muted-foreground">
                      {test.status === 'completed' ? formatTime(test.time_spent_seconds || 0) : 'In Progress'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No mock tests completed yet</p>
            <p className="text-sm text-muted-foreground mt-1">Take your first mock test to see your performance here</p>
          </div>
        )}
      </div>
    </div>
  );
};