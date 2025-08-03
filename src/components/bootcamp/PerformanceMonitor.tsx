import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, Clock, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PerformanceData {
  accuracy_trend: number[];
  response_times: number[];
  session_length: number;
  misconceptions_identified: number;
  improvement_rate: number;
}

export const PerformanceMonitor: React.FC = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPerformanceData();
    }
  }, [user]);

  const fetchPerformanceData = async () => {
    try {
      // Get student ID
      const { data: studentData } = await supabase
        .from('bootcamp_students')
        .select('student_id')
        .eq('user_id', user?.id)
        .single();

      if (!studentData) return;

      // Fetch recent responses for analysis
      const { data: responses } = await supabase
        .from('bootcamp_student_responses')
        .select('*')
        .eq('student_id', studentData.student_id)
        .order('responded_at', { ascending: false })
        .limit(50);

      if (responses) {
        const accuracyTrend = calculateAccuracyTrend(responses);
        const responseTimes = responses.map(r => r.time_taken);
        const sessionLength = calculateSessionLength(responses);
        const misconceptionsIdentified = responses.filter(r => r.misconception_detected).length;
        const improvementRate = calculateImprovementRate(responses);

        setPerformanceData({
          accuracy_trend: accuracyTrend,
          response_times: responseTimes,
          session_length: sessionLength,
          misconceptions_identified: misconceptionsIdentified,
          improvement_rate: improvementRate
        });
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAccuracyTrend = (responses: any[]) => {
    // Calculate accuracy in groups of 10 questions
    const groups = [];
    for (let i = 0; i < responses.length; i += 10) {
      const group = responses.slice(i, i + 10);
      const accuracy = group.filter(r => r.is_correct).length / group.length;
      groups.push(accuracy * 100);
    }
    return groups.reverse(); // Show oldest first
  };

  const calculateSessionLength = (responses: any[]) => {
    if (responses.length < 2) return 0;
    const first = new Date(responses[responses.length - 1].responded_at);
    const last = new Date(responses[0].responded_at);
    return Math.round((last.getTime() - first.getTime()) / (1000 * 60)); // minutes
  };

  const calculateImprovementRate = (responses: any[]) => {
    if (responses.length < 20) return 0;
    const recent = responses.slice(0, 10);
    const older = responses.slice(10, 20);
    
    const recentAccuracy = recent.filter(r => r.is_correct).length / recent.length;
    const olderAccuracy = older.filter(r => r.is_correct).length / older.length;
    
    return ((recentAccuracy - olderAccuracy) / olderAccuracy) * 100;
  };

  if (loading) {
    return <div className="animate-pulse bg-muted h-32 rounded-lg"></div>;
  }

  if (!performanceData) {
    return null;
  }

  const avgResponseTime = performanceData.response_times.length > 0
    ? Math.round(performanceData.response_times.reduce((a, b) => a + b, 0) / performanceData.response_times.length)
    : 0;

  const currentAccuracy = performanceData.accuracy_trend.length > 0
    ? performanceData.accuracy_trend[performanceData.accuracy_trend.length - 1]
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Current Accuracy</p>
            <p className="text-2xl font-bold">{Math.round(currentAccuracy)}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
            <p className="text-2xl font-bold">{avgResponseTime}s</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className={`h-5 w-5 ${performanceData.improvement_rate >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          <div>
            <p className="text-sm text-muted-foreground">Improvement</p>
            <p className="text-2xl font-bold">
              {performanceData.improvement_rate >= 0 ? '+' : ''}
              {Math.round(performanceData.improvement_rate)}%
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-orange-500" />
          <div>
            <p className="text-sm text-muted-foreground">Session Length</p>
            <p className="text-2xl font-bold">{performanceData.session_length}m</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;