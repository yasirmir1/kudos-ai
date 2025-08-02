import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Users,
  TrendingUp,
  BookOpen,
  AlertTriangle,
  Target,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

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
      
      // Fetch daily activity summary
      const { data: activityData, error: activityError } = await supabase
        .from('bootcamp_daily_activity_summary')
        .select('*')
        .order('activity_date', { ascending: false })
        .limit(30);

      if (activityError && activityError.code !== 'PGRST116') {
        console.warn('Daily activity not available:', activityError);
      }

      // Fetch misconception frequency
      const { data: misconceptionData, error: misconceptionError } = await supabase
        .from('bootcamp_misconception_frequency')
        .select('*')
        .order('total_occurrences', { ascending: false });

      if (misconceptionError && misconceptionError.code !== 'PGRST116') {
        console.warn('Misconceptions not available:', misconceptionError);
      }

      // Fetch student performance summary
      const { data: performanceData, error: performanceError } = await supabase
        .from('bootcamp_student_performance_summary')
        .select('*')
        .order('overall_accuracy', { ascending: false });

      if (performanceError && performanceError.code !== 'PGRST116') {
        console.warn('Student performance not available:', performanceError);
      }

      // Fetch curricula
      const { data: curriculaData, error: curriculaError } = await supabase
        .from('bootcamp_curricula')
        .select('*')
        .order('created_at', { ascending: false });

      if (curriculaError && curriculaError.code !== 'PGRST116') {
        console.warn('Curricula not available:', curriculaError);
      }

      // Fetch assessment criteria
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('bootcamp_assessment_criteria')
        .select('*');

      if (criteriaError && criteriaError.code !== 'PGRST116') {
        console.warn('Assessment criteria not available:', criteriaError);
      }

      setDailyActivity(activityData || []);
      setMisconceptions(misconceptionData || []);
      setStudentPerformance(performanceData || []);
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
    const avgAccuracy = studentPerformance.length > 0 
      ? studentPerformance.reduce((sum, student) => sum + student.overall_accuracy, 0) / studentPerformance.length 
      : 0;
    const totalMisconceptions = misconceptions.reduce((sum, m) => sum + m.total_occurrences, 0);
    
    return { totalStudents, totalQuestions, avgAccuracy, totalMisconceptions };
  };

  const getMisconceptionSeverity = (occurrences: number, affectedStudents: number) => {
    if (occurrences >= 50 || affectedStudents >= 10) return { level: 'High', color: 'bg-red-100 text-red-800' };
    if (occurrences >= 20 || affectedStudents >= 5) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Low', color: 'bg-green-100 text-green-800' };
  };

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 80) return { level: 'Excellent', color: 'text-green-600' };
    if (accuracy >= 70) return { level: 'Good', color: 'text-blue-600' };
    if (accuracy >= 60) return { level: 'Average', color: 'text-yellow-600' };
    return { level: 'Needs Support', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const stats = getOverallStats();

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive insights into student performance and learning patterns</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <p className="text-xs text-muted-foreground">Total practice</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgAccuracy)}%</div>
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
            <p className="text-xs text-muted-foreground">Total occurrences</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="activity">Daily Activity</TabsTrigger>
          <TabsTrigger value="students">Student Performance</TabsTrigger>
          <TabsTrigger value="misconceptions">Misconceptions</TabsTrigger>
          <TabsTrigger value="curricula">Curricula</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {dailyActivity.length > 0 ? dailyActivity.map((day) => (
              <Card key={day.activity_date}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{new Date(day.activity_date).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="outline">
                      {day.active_students} students active
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Responses</span>
                      <br />
                      <span className="text-lg font-bold">{day.total_responses}</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Correct</span>
                      <br />
                      <span className="text-lg font-bold">{day.correct_responses}</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Accuracy</span>
                      <br />
                      <span className="text-lg font-bold">{Math.round(day.daily_accuracy)}%</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Questions</span>
                      <br />
                      <span className="text-lg font-bold">{day.unique_questions_attempted}</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Avg Time</span>
                      <br />
                      <span className="text-lg font-bold">{Math.round(day.avg_response_time)}s</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Accuracy</span>
                      <span>{Math.round(day.daily_accuracy)}%</span>
                    </div>
                    <Progress value={day.daily_accuracy} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Activity Data</h3>
                  <p className="text-muted-foreground">Daily activity will appear here once students start practicing.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {studentPerformance.map((student) => {
              const performance = getPerformanceLevel(student.overall_accuracy);
              
              return (
                <Card key={student.student_id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{student.username}</h4>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <Badge className={performance.color} variant="outline">
                        {performance.level}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium text-muted-foreground">Questions</span>
                        <br />
                        <span className="text-lg font-bold">{student.total_questions_attempted}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Correct</span>
                        <br />
                        <span className="text-lg font-bold">{student.total_correct}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Avg Time</span>
                        <br />
                        <span className="text-lg font-bold">{Math.round(student.avg_response_time)}s</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Misconceptions</span>
                        <br />
                        <span className="text-lg font-bold">{student.unique_misconceptions}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Active Days</span>
                        <br />
                        <span className="text-lg font-bold">{student.active_days}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Accuracy</span>
                        <span>{Math.round(student.overall_accuracy)}%</span>
                      </div>
                      <Progress value={student.overall_accuracy} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="misconceptions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {misconceptions.map((misconception) => {
              const severity = getMisconceptionSeverity(misconception.total_occurrences, misconception.affected_students);
              
              return (
                <Card key={misconception.misconception_code}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{misconception.misconception_code}</CardTitle>
                      <Badge className={severity.color}>
                        {severity.level} Priority
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{misconception.misconception_type}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{misconception.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Occurrences:</span>
                        <br />
                        <span className="text-lg font-bold">{misconception.total_occurrences}</span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Students Affected:</span>
                        <br />
                        <span className="text-lg font-bold">{misconception.affected_students}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Remediation Success</span>
                        <span>{Math.round(misconception.remediation_success_rate)}%</span>
                      </div>
                      <Progress value={misconception.remediation_success_rate} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="curricula" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {curricula.map((curriculum) => (
              <Card key={curriculum.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{curriculum.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">Version {curriculum.version}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Duration:</span>
                      <br />
                      <span>{curriculum.total_weeks} weeks</span>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Created:</span>
                      <br />
                      <span>{new Date(curriculum.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Exam Boards:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {curriculum.exam_boards.map((board, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {board}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessmentCriteria.map((criteria, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">Assessment Level {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Mastery Level:</span>
                    <p className="text-sm">{criteria.mastery_level}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Accuracy Range:</span>
                    <p className="text-sm">{criteria.accuracy_range}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Speed Level:</span>
                    <p className="text-sm">{criteria.speed_level}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Confidence Level:</span>
                    <p className="text-sm">{criteria.confidence_level}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};