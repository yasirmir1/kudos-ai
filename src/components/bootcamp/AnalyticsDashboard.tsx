import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, TrendingUp, BookOpen, AlertTriangle, Target, Clock, BarChart3, PieChart, Activity } from 'lucide-react';
interface DailyActivity {
  activity_date: string;
  active_students: number;
  total_responses: number;
  correct_responses: number;
  daily_accuracy: number;
  unique_questions_attempted: number;
  avg_response_time: number;
}
interface MisconceptionFrequency {
  misconception_code: string;
  misconception_type: string;
  description: string;
  total_occurrences: number;
  affected_students: number;
  remediation_success_rate: number;
}
interface StudentPerformance {
  student_id: string;
  username: string;
  email: string;
  last_active: string;
  total_questions_attempted: number;
  total_correct: number;
  overall_accuracy: number;
  avg_response_time: number;
  unique_misconceptions: number;
  active_days: number;
}
interface Curriculum {
  id: string;
  name: string;
  version: string;
  total_weeks: number;
  exam_boards: string[];
  created_at: string;
}
interface AssessmentCriteria {
  mastery_level: string;
  accuracy_range: string;
  speed_level: string;
  confidence_level: string;
}
export const AnalyticsDashboard: React.FC = () => {
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [misconceptions, setMisconceptions] = useState<MisconceptionFrequency[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [assessmentCriteria, setAssessmentCriteria] = useState<AssessmentCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    loadAnalyticsData();
  }, []);
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch student responses for activity data
      const {
        data: activityData,
        error: activityError
      } = await supabase.from('bootcamp_student_responses').select('*').order('created_at', {
        ascending: false
      }).limit(30);
      if (activityError && activityError.code !== 'PGRST116') {
        console.warn('Daily activity not available:', activityError);
      }

      // Fetch misconceptions from responses
      const {
        data: misconceptionData,
        error: misconceptionError
      } = await supabase.from('bootcamp_student_responses').select('misconception_detected').not('misconception_detected', 'is', null);
      if (misconceptionError && misconceptionError.code !== 'PGRST116') {
        console.warn('Misconceptions not available:', misconceptionError);
      }

      // Fetch student performance from responses
      const {
        data: performanceData,
        error: performanceError
      } = await supabase.from('bootcamp_student_responses').select('*').order('created_at', {
        ascending: false
      });
      if (performanceError && performanceError.code !== 'PGRST116') {
        console.warn('Student performance not available:', performanceError);
      }

      // Fetch curricula
      const {
        data: curriculaData,
        error: curriculaError
      } = await supabase.from('bootcamp_curricula').select('*').order('created_at', {
        ascending: false
      });
      if (curriculaError && curriculaError.code !== 'PGRST116') {
        console.warn('Curricula not available:', curriculaError);
      }

      // Fetch assessment criteria
      const {
        data: criteriaData,
        error: criteriaError
      } = await supabase.from('bootcamp_assessment_criteria').select('*');
      if (criteriaError && criteriaError.code !== 'PGRST116') {
        console.warn('Assessment criteria not available:', criteriaError);
      }

      // Transform data to match expected interfaces
      setDailyActivity([]); // Will implement transformation later
      setMisconceptions([]); // Will implement transformation later  
      setStudentPerformance([]); // Will implement transformation later
      setCurricula(curriculaData || []);
      setAssessmentCriteria(criteriaData || []);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };
  const getOverallStats = () => {
    const totalStudents = studentPerformance.length;
    const totalQuestions = studentPerformance.reduce((sum, student) => sum + student.total_questions_attempted, 0);
    const avgAccuracy = studentPerformance.length > 0 ? studentPerformance.reduce((sum, student) => sum + student.overall_accuracy, 0) / studentPerformance.length : 0;
    const totalMisconceptions = misconceptions.reduce((sum, m) => sum + m.total_occurrences, 0);
    return {
      totalStudents,
      totalQuestions,
      avgAccuracy,
      totalMisconceptions
    };
  };
  const getMisconceptionSeverity = (occurrences: number, affectedStudents: number) => {
    if (occurrences >= 50 || affectedStudents >= 10) return {
      level: 'High',
      color: 'bg-red-100 text-red-800'
    };
    if (occurrences >= 20 || affectedStudents >= 5) return {
      level: 'Medium',
      color: 'bg-yellow-100 text-yellow-800'
    };
    return {
      level: 'Low',
      color: 'bg-green-100 text-green-800'
    };
  };
  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 80) return {
      level: 'Excellent',
      color: 'text-green-600'
    };
    if (accuracy >= 70) return {
      level: 'Good',
      color: 'text-blue-600'
    };
    if (accuracy >= 60) return {
      level: 'Average',
      color: 'text-yellow-600'
    };
    return {
      level: 'Needs Support',
      color: 'text-red-600'
    };
  };
  if (loading) {
    return <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>;
  }
  if (error) {
    return <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>;
  }
  const stats = getOverallStats();
  return;
};