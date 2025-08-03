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

      // Fetch data from all response sources in parallel
      const [
        bootcampResponses,
        mockTestAnswers,
        mainAppAnswers,
        learningResults,
        bootcampStudents,
        curriculaData,
        criteriaData
      ] = await Promise.all([
        // Bootcamp responses
        supabase.from('bootcamp_student_responses')
          .select(`
            *,
            bootcamp_students!inner(username, email, user_id)
          `)
          .order('created_at', { ascending: false }),
        
        // Mock test answers
        supabase.from('bootcamp_mock_test_answers')
          .select(`
            *,
            bootcamp_mock_test_sessions!inner(
              student_id,
              bootcamp_students!inner(username, email, user_id)
            )
          `)
          .order('created_at', { ascending: false }),
        
        // Main app student answers
        supabase.from('student_answers')
          .select('*')
          .order('answered_at', { ascending: false }),
        
        // Learning results
        supabase.from('learning_results')
          .select(`
            *,
            bootcamp_students!inner(username, email, user_id)
          `)
          .order('created_at', { ascending: false }),
        
        // Student profiles
        supabase.from('bootcamp_students')
          .select('*'),
        
        // Curricula
        supabase.from('bootcamp_curricula')
          .select('*')
          .order('created_at', { ascending: false }),
        
        // Assessment criteria
        supabase.from('bootcamp_assessment_criteria')
          .select('*')
      ]);

      console.log('📊 Fetched analytics data:', {
        bootcamp: bootcampResponses.data?.length,
        mockTest: mockTestAnswers.data?.length,
        mainApp: mainAppAnswers.data?.length,
        learning: learningResults.data?.length,
        students: bootcampStudents.data?.length
      });

      // Transform and aggregate all response data
      const allResponses = [
        ...(bootcampResponses.data || []).map((r: any) => ({
          student_id: r.student_id,
          source: 'bootcamp',
          student_info: r.bootcamp_students,
          response_date: r.created_at,
          accuracy: r.is_correct ? 100 : 0,
          misconception_detected: r.misconception_detected,
          time_taken: r.time_taken || 0
        })),
        ...(mockTestAnswers.data || []).map((r: any) => ({
          student_id: r.bootcamp_mock_test_sessions?.student_id,
          source: 'mock_test',
          student_info: r.bootcamp_mock_test_sessions?.bootcamp_students,
          response_date: r.created_at,
          accuracy: r.is_correct ? 100 : 0,
          misconception_detected: r.misconception_detected,
          time_taken: r.time_taken_seconds || 0
        })),
        ...(mainAppAnswers.data || []).map((r: any) => ({
          student_id: r.student_id,
          source: 'main_app',
          student_info: { student_id: r.student_id, username: 'Main App User', email: '' },
          response_date: r.answered_at,
          accuracy: r.is_correct ? 100 : 0,
          misconception_detected: r.red_herring_triggered?.[0] || null,
          time_taken: r.time_taken_seconds || 0
        })),
        ...(learningResults.data || []).map((r: any) => ({
          student_id: r.student_id,
          source: 'learning',
          student_info: r.bootcamp_students,
          response_date: r.created_at,
          accuracy: r.is_correct ? 100 : 0,
          misconception_detected: null,
          time_taken: r.time_taken_seconds || 0
        }))
      ];

      // Calculate daily activity
      const dailyActivityMap = new Map<string, {
        date: string;
        students: Set<string>;
        responses: number;
        correct: number;
        totalTime: number;
      }>();

      allResponses.forEach(response => {
        const date = new Date(response.response_date).toISOString().split('T')[0];
        const studentId = response.student_info?.student_id || response.student_id;
        
        if (!dailyActivityMap.has(date)) {
          dailyActivityMap.set(date, {
            date,
            students: new Set(),
            responses: 0,
            correct: 0,
            totalTime: 0
          });
        }
        
        const dayData = dailyActivityMap.get(date)!;
        if (studentId) dayData.students.add(studentId);
        dayData.responses++;
        if (response.accuracy === 100) dayData.correct++;
        if (response.time_taken) dayData.totalTime += response.time_taken;
      });

      const dailyActivityData: DailyActivity[] = Array.from(dailyActivityMap.values())
        .map(day => ({
          activity_date: day.date,
          active_students: day.students.size,
          total_responses: day.responses,
          correct_responses: day.correct,
          daily_accuracy: day.responses > 0 ? (day.correct / day.responses) * 100 : 0,
          unique_questions_attempted: day.responses,
          avg_response_time: day.responses > 0 ? day.totalTime / day.responses : 0
        }))
        .sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
        .slice(0, 30);

      // Calculate misconceptions frequency
      const misconceptionMap = new Map<string, {
        count: number;
        students: Set<string>;
      }>();

      allResponses.forEach(response => {
        if (response.misconception_detected) {
          const studentId = response.student_info?.student_id || response.student_id;
          if (!misconceptionMap.has(response.misconception_detected)) {
            misconceptionMap.set(response.misconception_detected, {
              count: 0,
              students: new Set()
            });
          }
          const miscData = misconceptionMap.get(response.misconception_detected)!;
          miscData.count++;
          if (studentId) miscData.students.add(studentId);
        }
      });

      const misconceptionsData: MisconceptionFrequency[] = Array.from(misconceptionMap.entries())
        .map(([code, data]) => ({
          misconception_code: code,
          misconception_type: code,
          description: `Common error pattern: ${code}`,
          total_occurrences: data.count,
          affected_students: data.students.size,
          remediation_success_rate: 0.7 // Placeholder
        }))
        .sort((a, b) => b.total_occurrences - a.total_occurrences);

      // Calculate student performance
      const studentMap = new Map<string, {
        info: any;
        responses: number;
        correct: number;
        totalTime: number;
        misconceptions: Set<string>;
        activeDays: Set<string>;
      }>();

      allResponses.forEach(response => {
        const studentId = response.student_info?.student_id || response.student_id;
        if (!studentId) return;

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            info: response.student_info,
            responses: 0,
            correct: 0,
            totalTime: 0,
            misconceptions: new Set(),
            activeDays: new Set()
          });
        }

        const studentData = studentMap.get(studentId)!;
        studentData.responses++;
        if (response.accuracy === 100) studentData.correct++;
        if (response.time_taken) studentData.totalTime += response.time_taken;
        if (response.misconception_detected) {
          studentData.misconceptions.add(response.misconception_detected);
        }
        studentData.activeDays.add(new Date(response.response_date).toISOString().split('T')[0]);
      });

      const studentPerformanceData: StudentPerformance[] = Array.from(studentMap.entries())
        .map(([studentId, data]) => ({
          student_id: studentId,
          username: data.info?.username || 'Unknown',
          email: data.info?.email || 'Unknown',
          last_active: new Date().toISOString(),
          total_questions_attempted: data.responses,
          total_correct: data.correct,
          overall_accuracy: data.responses > 0 ? (data.correct / data.responses) * 100 : 0,
          avg_response_time: data.responses > 0 ? data.totalTime / data.responses : 0,
          unique_misconceptions: data.misconceptions.size,
          active_days: data.activeDays.size
        }))
        .sort((a, b) => b.total_questions_attempted - a.total_questions_attempted);

      // Set processed data
      setDailyActivity(dailyActivityData);
      setMisconceptions(misconceptionsData);
      setStudentPerformance(studentPerformanceData);
      setCurricula(curriculaData.data || []);
      setAssessmentCriteria(criteriaData.data || []);

      console.log('✅ Analytics data processed:', {
        dailyActivity: dailyActivityData.length,
        misconceptions: misconceptionsData.length,
        studentPerformance: studentPerformanceData.length,
        curricula: curriculaData.data?.length,
        criteria: criteriaData.data?.length
      });

    } catch (err) {
      console.error('❌ Error loading analytics data:', err);
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
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive performance analysis across all practice components
          </p>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Attempted</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all components</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Misconceptions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMisconceptions}</div>
            <p className="text-xs text-muted-foreground">Identified patterns</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="misconceptions">Misconceptions</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyActivity.length > 0 ? (
                  <div className="space-y-2">
                    {dailyActivity.slice(0, 7).map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{new Date(day.activity_date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{day.active_students} students</span>
                          <Badge variant="secondary">{day.daily_accuracy.toFixed(1)}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No activity data available</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Average Response Time</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Optimal range: 30-60 seconds</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Progress value={stats.avgAccuracy} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{stats.avgAccuracy.toFixed(1)}% accuracy rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="misconceptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Misconceptions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Most frequent learning challenges across all components
              </p>
            </CardHeader>
            <CardContent>
              {misconceptions.length > 0 ? (
                <div className="space-y-4">
                  {misconceptions.slice(0, 10).map((misconception, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{misconception.misconception_type}</h4>
                        <p className="text-sm text-muted-foreground">{misconception.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getMisconceptionSeverity(misconception.total_occurrences, misconception.affected_students).color}>
                          {getMisconceptionSeverity(misconception.total_occurrences, misconception.affected_students).level}
                        </Badge>
                        <span className="text-sm font-medium">{misconception.total_occurrences}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No misconceptions data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {studentPerformance.length > 0 ? (
                <div className="space-y-4">
                  {studentPerformance.slice(0, 10).map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{student.username || student.email}</h4>
                        <p className="text-sm text-muted-foreground">
                          {student.total_questions_attempted} questions • {student.active_days} active days
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getPerformanceLevel(student.overall_accuracy).color}`}>
                          {student.overall_accuracy.toFixed(1)}%
                        </span>
                        <Badge variant="outline">
                          {getPerformanceLevel(student.overall_accuracy).level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No student performance data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="curriculum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Information</CardTitle>
            </CardHeader>
            <CardContent>
              {curricula.length > 0 ? (
                <div className="space-y-4">
                  {curricula.map((curriculum, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{curriculum.name}</h4>
                        <Badge variant="secondary">v{curriculum.version}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="ml-2 font-medium">{curriculum.total_weeks} weeks</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Exam Boards:</span>
                          <span className="ml-2 font-medium">{curriculum.exam_boards.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No curriculum data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};