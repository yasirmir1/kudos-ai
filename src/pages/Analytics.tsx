import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, BarChart3, PieChart, Calendar } from 'lucide-react';
import { useAgeGroup } from '@/contexts/AgeGroupContext';
import { AgeGroupSelector } from '@/components/AgeGroupSelector';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface StudentAnswer {
  id: number;
  question_id: string;
  student_id: string;
  answer_given: string;
  is_correct: boolean;
  answered_at: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  time_taken_seconds: number;
}

interface PerformanceData {
  topic: string;
  accuracy: number;
  total_attempts: number;
}

const Analytics = () => {
  const { user, signOut } = useAuth();
  const { selectedAgeGroup } = useAgeGroup();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    if (user) {
      loadAnalyticsData();
    }
  }, [user, selectedAgeGroup]);

  // Custom tick component for clear readable labels
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const text = payload.value;
    const maxLength = 15;
    
    // Truncate long text with ellipsis
    const displayText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#666"
          fontSize={11}
          fontWeight="500"
        >
          {displayText}
        </text>
      </g>
    );
  };

  const loadAnalyticsData = async () => {
    try {
      // Load all student answers for time-based analytics (filtered by age group)
      const { data: answersData } = await supabase
        .from('student_answers')
        .select('*')
        .eq('student_id', user?.id)
        .eq('age_group', selectedAgeGroup)
        .order('answered_at', { ascending: true });

      if (answersData) {
        setStudentAnswers(answersData);
      }

      // Load performance data by topic (filtered by age group)
      // We need to get performance data by age group by querying student_answers directly
      // since student_performance doesn't have age_group column
      const { data: answersForPerformance } = await supabase
        .from('student_answers')
        .select('topic, is_correct, answered_at, time_taken_seconds')
        .eq('student_id', user?.id)
        .eq('age_group', selectedAgeGroup);

      // Calculate performance data from filtered answers
      const topicStats: { [key: string]: { correct: number; total: number; totalTime: number; lastAttempted: string } } = {};
      
      if (answersForPerformance) {
        answersForPerformance.forEach(answer => {
          if (!topicStats[answer.topic]) {
            topicStats[answer.topic] = { correct: 0, total: 0, totalTime: 0, lastAttempted: answer.answered_at };
          }
          topicStats[answer.topic].total++;
          topicStats[answer.topic].totalTime += answer.time_taken_seconds;
          if (answer.is_correct) {
            topicStats[answer.topic].correct++;
          }
          // Update last attempted if this answer is more recent
          if (new Date(answer.answered_at) > new Date(topicStats[answer.topic].lastAttempted)) {
            topicStats[answer.topic].lastAttempted = answer.answered_at;
          }
        });
      }

      const calculatedPerformanceData = Object.entries(topicStats).map(([topic, stats]) => ({
        topic,
        accuracy: stats.correct / stats.total,
        total_attempts: stats.total,
        correct_answers: stats.correct,
        avg_time_seconds: stats.totalTime / stats.total,
        last_attempted: stats.lastAttempted
      })).sort((a, b) => b.accuracy - a.accuracy);

      setPerformanceData(calculatedPerformanceData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Process accuracy over time data
  const getAccuracyOverTime = () => {
    const dailyData: { [key: string]: { correct: number; total: number } } = {};
    
    studentAnswers.forEach(answer => {
      const date = new Date(answer.answered_at).toLocaleDateString();
      if (!dailyData[date]) {
        dailyData[date] = { correct: 0, total: 0 };
      }
      dailyData[date].total++;
      if (answer.is_correct) {
        dailyData[date].correct++;
      }
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        accuracy: Math.round((data.correct / data.total) * 100),
        questions: data.total
      }))
      .slice(-30); // Last 30 days
  };

  // Process accuracy by topic for pie chart
  const getTopicAccuracyData = () => {
    return performanceData.map(topic => {
      // Shorten topic names and replace "and" with "&"
      let shortName = topic.topic
        .replace(/\band\b/gi, '&')
        .replace(/\bof\b/gi, '')
        .replace(/\bthe\b/gi, '')
        .trim();
      
      // If still too long, truncate to 20 characters
      if (shortName.length > 20) {
        shortName = shortName.substring(0, 17) + '...';
      }
      
      return {
        name: shortName,
        accuracy: Math.round(topic.accuracy * 100),
        attempts: topic.total_attempts
      };
    });
  };

  // Process difficulty distribution
  const getDifficultyData = () => {
    const difficultyStats: { [key: string]: { correct: number; total: number } } = {};
    
    studentAnswers.forEach(answer => {
      if (!difficultyStats[answer.difficulty]) {
        difficultyStats[answer.difficulty] = { correct: 0, total: 0 };
      }
      difficultyStats[answer.difficulty].total++;
      if (answer.is_correct) {
        difficultyStats[answer.difficulty].correct++;
      }
    });

    return Object.entries(difficultyStats).map(([difficulty, data]) => ({
      difficulty,
      accuracy: Math.round((data.correct / data.total) * 100),
      total: data.total
    }));
  };

  // Process response time data
  const getResponseTimeData = () => {
    const timeData: { [key: string]: number[] } = {};
    
    studentAnswers.forEach(answer => {
      if (!timeData[answer.difficulty]) {
        timeData[answer.difficulty] = [];
      }
      timeData[answer.difficulty].push(answer.time_taken_seconds);
    });

    return Object.entries(timeData).map(([difficulty, times]) => ({
      difficulty,
      avgTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      count: times.length
    }));
  };

  const accuracyOverTime = getAccuracyOverTime();
  const topicAccuracy = getTopicAccuracyData();
  const difficultyData = getDifficultyData();
  const responseTimeData = getResponseTimeData();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <BarChart3 className="h-8 w-8 mx-auto animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Performance Analytics</h1>
              <p className="text-sm text-muted-foreground">{selectedAgeGroup} - {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex space-x-2">
              <Button variant="ghost" onClick={() => navigate('/profile')}>
                Profile
              </Button>
            </div>
            <AgeGroupSelector />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentAnswers.length}</div>
                <p className="text-xs text-muted-foreground">Questions answered</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {studentAnswers.length > 0 
                    ? Math.round((studentAnswers.filter(a => a.is_correct).length / studentAnswers.length) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Correct answers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Topics Studied</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.length}</div>
                <p className="text-xs text-muted-foreground">Different topics</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {studentAnswers.length > 0
                    ? Math.round(studentAnswers.reduce((acc, a) => acc + a.time_taken_seconds, 0) / studentAnswers.length)
                    : 0}s
                </div>
                <p className="text-xs text-muted-foreground">Per question</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Accuracy Over Time</CardTitle>
                <CardDescription>Daily accuracy percentage for the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart 
                    data={accuracyOverTime}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 11, fill: '#666' }}
                      axisLine={{ stroke: '#d0d0d0' }}
                      tickLine={{ stroke: '#d0d0d0' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 11, fill: '#666' }}
                      axisLine={{ stroke: '#d0d0d0' }}
                      tickLine={{ stroke: '#d0d0d0' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any, name: string) => [`${value}%`, 'Accuracy']}
                      labelFormatter={(label: string) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Accuracy %" 
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#1e40af', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Topic Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Topic</CardTitle>
                <CardDescription>Accuracy percentage for each topic studied</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={topicAccuracy} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={11}
                      tick={{ fontSize: 11, fill: '#666' }}
                      axisLine={{ stroke: '#d0d0d0' }}
                      tickLine={{ stroke: '#d0d0d0' }}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      axisLine={{ stroke: '#d0d0d0' }}
                      tickLine={{ stroke: '#d0d0d0' }}
                      tick={{ fontSize: 11, fill: '#666' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: any, name: string) => [`${value}%`, 'Accuracy']}
                      labelFormatter={(label: string) => `Topic: ${label}`}
                    />
                    <Bar 
                      dataKey="accuracy" 
                      fill="#3b82f6" 
                      name="Accuracy %" 
                      radius={[4, 4, 0, 0]}
                      stroke="#1e40af"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Difficulty Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance by Difficulty</CardTitle>
                <CardDescription>How you perform across different difficulty levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={difficultyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="difficulty" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#ffc658" name="Accuracy %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Response Time by Difficulty */}
            <Card>
              <CardHeader>
                <CardTitle>Average Response Time</CardTitle>
                <CardDescription>Time taken per question by difficulty level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="difficulty" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgTime" fill="#ff7c7c" name="Avg Time (seconds)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Topic Accuracy Pie Chart */}
          {topicAccuracy.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Topic Accuracy Distribution</CardTitle>
                <CardDescription>Visual breakdown of your performance across all topics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsPieChart>
                    <Pie
                      data={topicAccuracy}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, accuracy }) => `${name}: ${accuracy}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="accuracy"
                    >
                      {topicAccuracy.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;