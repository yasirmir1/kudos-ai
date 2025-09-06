import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, Calendar, Brain, Lightbulb, BarChart3, Filter, TrendingUp, PieChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { InteractiveInsights } from '@/components/InteractiveInsights';
import { MisconceptionPatternAnalysis } from '@/components/report/MisconceptionPatternAnalysis';
import { SkillRadarChart } from '@/components/bootcamp/SkillRadarChart';
import { useAgeGroup } from '@/contexts/AgeGroupContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface StudiedTopic {
  topic: string;
  subtopics: string[];
  total_questions: number;
  first_attempted: string;
  last_attempted: string;
  accuracy: number;
}

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

export default function Report() {
  const { user } = useAuth();
  const { selectedAgeGroup } = useAgeGroup();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'insights' | 'analytics'>('analytics');
  const [topics, setTopics] = useState<StudiedTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['mastered', 'learning', 'needs-work']));
  
  // Analytics state
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadStudiedTopics();
      loadMisconceptionInsights();
    }
  }, [user]);

  useEffect(() => {
    if (user && currentView === 'analytics') {
      loadAnalyticsData();
    }
  }, [user, selectedAgeGroup, currentView]);

  const loadStudiedTopics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('student_answers')
        .select('topic, subtopic, is_correct, answered_at')
        .eq('student_id', user?.id);

      if (error) throw error;

      // Group by topic and calculate statistics
      const topicMap = new Map<string, any>();
      
      data?.forEach((answer) => {
        if (!topicMap.has(answer.topic)) {
          topicMap.set(answer.topic, {
            topic: answer.topic,
            subtopics: new Set(),
            total_questions: 0,
            correct_answers: 0,
            first_attempted: answer.answered_at,
            last_attempted: answer.answered_at,
          });
        }
        
        const topicData = topicMap.get(answer.topic);
        topicData.subtopics.add(answer.subtopic);
        topicData.total_questions++;
        if (answer.is_correct) topicData.correct_answers++;
        
        // Update date ranges
        if (new Date(answer.answered_at) < new Date(topicData.first_attempted)) {
          topicData.first_attempted = answer.answered_at;
        }
        if (new Date(answer.answered_at) > new Date(topicData.last_attempted)) {
          topicData.last_attempted = answer.answered_at;
        }
      });

      // Convert to array and calculate accuracy
      const studiedTopics: StudiedTopic[] = Array.from(topicMap.values()).map((topic) => ({
        ...topic,
        subtopics: Array.from(topic.subtopics),
        accuracy: topic.correct_answers / topic.total_questions,
      })).sort((a, b) => new Date(b.last_attempted).getTime() - new Date(a.last_attempted).getTime());

      setTopics(studiedTopics);
    } catch (error) {
      console.error('Error loading studied topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMisconceptionInsights = async () => {
    if (!user) return;
    
    setIsLoadingExplanation(true);
    try {
      const { data, error } = await supabase.functions.invoke('explain-misconceptions', {
        body: { student_id: user.id }
      });

      if (error) throw error;

      setExplanation(data.explanation);
      setShowExplanation(true);
    } catch (error) {
      console.error('Error getting explanation:', error);
      setShowExplanation(false);
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  // Analytics loading function from Analytics page
  const loadAnalyticsData = async () => {
    setAnalyticsLoading(true);
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
      setAnalyticsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 0.8) return <Badge className="bg-green-100 text-green-800">Mastered</Badge>;
    if (accuracy >= 0.6) return <Badge className="bg-blue-100 text-blue-800">Learning</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Work</Badge>;
  };

  const getAccuracyCategory = (accuracy: number): string => {
    if (accuracy >= 0.8) return 'mastered';
    if (accuracy >= 0.6) return 'learning';
    return 'needs-work';
  };

  const toggleFilter = (filter: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setActiveFilters(newFilters);
  };

  const filteredTopics = topics.filter(topic => 
    activeFilters.has(getAccuracyCategory(topic.accuracy))
  );

  const handleRefreshInsights = async () => {
    await loadMisconceptionInsights();
    toast({
      title: "Insights Refreshed",
      description: "Your learning insights have been updated!",
    });
  };

  const getFilterButtonVariant = (filter: string) => {
    return activeFilters.has(filter) ? 'default' : 'outline';
  };

  const getFilterButtonClass = (filter: string) => {
    return activeFilters.has(filter) 
      ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' 
      : '';
  };

  const getFilterCount = (filter: string) => {
    return topics.filter(topic => getAccuracyCategory(topic.accuracy) === filter).length;
  };

  // Analytics utility functions
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

  const getTopicAccuracyData = () => {
    return performanceData.map(topic => {
      let shortName = topic.topic
        .replace(/\band\b/gi, '&')
        .replace(/\bof\b/gi, '')
        .replace(/\bthe\b/gi, '')
        .trim();
      
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

  return (
    <div>
      <div className="container mx-auto p-6">
        {/* Toggle between Insights and Analytics - Centered Above Title */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={currentView === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('analytics')}
              className={currentView === 'analytics' ? '' : 'text-muted-foreground'}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant={currentView === 'insights' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('insights')}
              className={currentView === 'insights' ? '' : 'text-muted-foreground'}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Insights
            </Button>
          </div>
        </div>


        {currentView === 'insights' ? (
          <div className="space-y-6">
            {/* Misconception Pattern Analysis - Full Width */}
            <MisconceptionPatternAnalysis studentId={user?.id || null} />
            
          </div>
        ) : (
          // Analytics View
          <>
            {analyticsLoading ? (
              <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-8 w-8 mx-auto animate-pulse text-primary" />
                  <p className="text-muted-foreground">Loading analytics...</p>
                </div>
              </div>
            ) : (
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

                {/* Skills Radar Chart - Full Width */}
                <SkillRadarChart />

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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}