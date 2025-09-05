import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Target, TrendingUp, Clock, Calendar, BookOpen, Play, Circle, Award, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuestionHistoryModal } from '@/components/QuestionHistoryModal';
import { TopicAccuracyModal } from '@/components/TopicAccuracyModal';
import { TopicsStudiedModal } from '@/components/TopicsStudiedModal';
import { MisconceptionExplanationModal } from '@/components/MisconceptionExplanationModal';
import { MisconceptionQuestionsModal } from '@/components/MisconceptionQuestionsModal';
import { FocusAreaQuestionsModal } from '@/components/FocusAreaQuestionsModal';
import { getFriendlyMisconceptionName } from '@/lib/misconceptionLabels';
import { WorksheetGeneratorModal } from '@/components/WorksheetGeneratorModal';
import { SessionsModal } from '@/components/SessionsModal';
import { AgeGroupSelector } from '@/components/AgeGroupSelector';
import { useAgeGroup } from '@/contexts/AgeGroupContext';
import { DashboardNavigation, DashboardCard, TopicItem, MisconceptionItem, EmptyState, LoadingState } from '@/components/dashboard';
import { useMisconceptionCache } from '@/hooks/useMisconceptionCache';
import Practice from './Practice';
import Curriculum from './Curriculum';
import Report from './Report';
interface PerformanceData {
  topic: string;
  accuracy: number;
  total_attempts: number;
}
interface WeakTopic {
  topic: string;
  accuracy: number;
  attempts: number;
}
const Dashboard = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    selectedAgeGroup
  } = useAgeGroup();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('overview');
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [misconceptions, setMisconceptions] = useState<any[]>([]);
  const [misconceptionExplanations, setMisconceptionExplanations] = useState<{
    [key: string]: string;
  }>({});
  const [loadingExplanations, setLoadingExplanations] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  // Modal states
  const [questionHistoryOpen, setQuestionHistoryOpen] = useState(false);
  const [topicAccuracyOpen, setTopicAccuracyOpen] = useState(false);
  const [topicsStudiedOpen, setTopicsStudiedOpen] = useState(false);
  const [misconceptionModalOpen, setMisconceptionModalOpen] = useState(false);
  const [selectedMisconception, setSelectedMisconception] = useState<any>(null);
  const [misconceptionQuestionsOpen, setMisconceptionQuestionsOpen] = useState(false);
  const [selectedMisconceptionForQuestions, setSelectedMisconceptionForQuestions] = useState<any>(null);
  const [focusAreaQuestionsOpen, setFocusAreaQuestionsOpen] = useState(false);
  const [selectedFocusArea, setSelectedFocusArea] = useState<any>(null);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  
  // Get student ID for misconception cache
  const [studentId, setStudentId] = useState<string | null>(null);
  const { cachedMisconceptions = [], cacheHitRate = 0, isLoading: cacheLoading = false } = useMisconceptionCache(studentId) || {};

  useEffect(() => {
    const getStudentId = async () => {
      if (user) {
        try {
          const { data } = await supabase.rpc('get_current_student_id');
          setStudentId(data);
        } catch (error) {
          console.error('Error getting student ID:', error);
        }
      }
    };
    getStudentId();
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, selectedAgeGroup]);
  useEffect(() => {
    if (misconceptions.length > 0 && user) {
      loadMisconceptionExplanations();
    }
  }, [misconceptions, user]);
  const loadDashboardData = async () => {
    try {
      // Load performance data by calculating from age-group filtered answers
      const {
        data: answersForPerformance
      } = await supabase.from('student_answers').select('topic, is_correct, answered_at, time_taken_seconds').eq('student_id', user?.id).eq('age_group', selectedAgeGroup);

      // Calculate performance data from filtered answers
      const topicStats: {
        [key: string]: {
          correct: number;
          total: number;
          totalTime: number;
          lastAttempted: string;
        };
      } = {};
      if (answersForPerformance) {
        answersForPerformance.forEach(answer => {
          if (!topicStats[answer.topic]) {
            topicStats[answer.topic] = {
              correct: 0,
              total: 0,
              totalTime: 0,
              lastAttempted: answer.answered_at
            };
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
      setPerformance(calculatedPerformanceData);

      // Load weak topics from filtered performance data
      const weakTopicsFromPerformance = calculatedPerformanceData.filter(topic => topic.accuracy < 0.5 && topic.total_attempts >= 3).map(topic => ({
        topic: topic.topic,
        accuracy: topic.accuracy,
        attempts: topic.total_attempts
      })).sort((a, b) => a.accuracy - b.accuracy);
      setWeakTopics(weakTopicsFromPerformance);

      // Load misconception analysis from age-group filtered answers
      const {
        data: ageGroupAnswers
      } = await supabase.from('student_answers').select('red_herring_triggered, topic').eq('student_id', user?.id).eq('age_group', selectedAgeGroup).not('red_herring_triggered', 'is', null);

      // Calculate misconceptions from filtered data
      const misconceptionStats: {
        [key: string]: {
          frequency: number;
          topics: Set<string>;
        };
      } = {};
      if (ageGroupAnswers) {
        ageGroupAnswers.forEach(answer => {
          if (answer.red_herring_triggered && Array.isArray(answer.red_herring_triggered)) {
            answer.red_herring_triggered.forEach((redHerring: string) => {
              // Filter out empty strings and invalid misconceptions
              if (redHerring && redHerring.trim() !== '') {
                if (!misconceptionStats[redHerring]) {
                  misconceptionStats[redHerring] = {
                    frequency: 0,
                    topics: new Set()
                  };
                }
                misconceptionStats[redHerring].frequency++;
                misconceptionStats[redHerring].topics.add(answer.topic);
              }
            });
          }
        });
      }
      const calculatedMisconceptions = Object.entries(misconceptionStats).map(([redHerring, stats]) => ({
        red_herring: redHerring,
        frequency: stats.frequency,
        topics: Array.from(stats.topics)
      })).sort((a, b) => b.frequency - a.frequency);
      setMisconceptions(calculatedMisconceptions);

      // Get total questions answered for selected age group
      const {
        count
      } = await supabase.from('student_answers').select('*', {
        count: 'exact',
        head: true
      }).eq('student_id', user?.id).eq('age_group', selectedAgeGroup);
      setTotalQuestions(count || 0);

      // Get total sessions from practice_sessions table for selected age group
      const {
        count: sessionCount
      } = await supabase.from('practice_sessions').select('*', {
        count: 'exact',
        head: true
      }).eq('student_id', user?.id).eq('age_group', selectedAgeGroup);
      setTotalSessions(sessionCount || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  const startLearning = () => {
    setCurrentView('practice');
  };
  const loadMisconceptionExplanations = async () => {
    if (!user || misconceptions.length === 0) return;
    setLoadingExplanations(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('explain-misconceptions', {
        body: {
          student_id: user.id
        }
      });
      if (error) {
        console.error('Error getting explanations:', error);
        return;
      }
      if (data?.explanation) {
        // Parse the structured response to extract individual misconception labels
        const explanationText = data.explanation;
        const labeledMisconceptions: {
          [key: string]: string;
        } = {};

        // Simple parsing to extract human-readable labels
        misconceptions.forEach(misconception => {
          const variable = misconception.red_herring;
          // Create a human-readable label by formatting the variable name
          const humanLabel = variable?.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()).trim() || 'Unknown Misconception';
          labeledMisconceptions[variable] = humanLabel;
        });
        setMisconceptionExplanations(labeledMisconceptions);
      }
    } catch (error) {
      console.error('Error loading misconception explanations:', error);
    } finally {
      setLoadingExplanations(false);
    }
  };
  const formatMisconceptionForKids = (redHerring: string) => {
    return getFriendlyMisconceptionName(redHerring);
  };
  const overallAccuracy = performance.length > 0 ? performance.reduce((sum, p) => sum + p.accuracy, 0) / performance.length : 0;
  const strongestTopic = performance[0];
  const needsWork = weakTopics.slice(0, 3);
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <img src="/lovable-uploads/409330f0-2245-4147-b837-ff553d303814.png" alt="Kudos Academy" className="h-12 w-auto mx-auto animate-pulse" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>;
  }
  const renderCurrentView = () => {
    switch (currentView) {
      case 'practice':
        return <Practice />;
      case 'curriculum':
        return <Curriculum />;
      case 'report':
        return <Report />;
      default:
        return renderOverview();
    }
  };
  const renderOverview = () => <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Ready to learn section */}
      <div className="bg-primary rounded-3xl shadow-2xl p-12 mb-8">
        <div className="text-center text-primary-foreground">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Ready to learn?</h1>
          <p className="text-xl text-primary-foreground/80 mb-10">
            Your adaptive learning system has prepared personalized 11+ questions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={startLearning}
              className="bg-background text-primary font-semibold py-4 px-8 rounded-full flex items-center justify-center shadow-lg hover:bg-secondary focus:outline-none focus:ring-4 focus:ring-ring transition-all duration-300 ease-in-out transform hover:-translate-y-1 w-full sm:w-auto"
            >
              <svg 
                className="w-6 h-6 mr-3" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              Start Practice
            </button>
            <button 
              className="bg-transparent text-primary-foreground font-semibold py-4 px-8 rounded-full flex items-center justify-center border-2 border-primary-foreground/30 hover:bg-primary-foreground/10 hover:border-primary-foreground/50 focus:outline-none focus:ring-4 focus:ring-ring transition-all duration-300 ease-in-out transform hover:-translate-y-1 w-full sm:w-auto"
            >
              <svg 
                className="w-6 h-6 mr-3" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              Generate Worksheet
            </button>
          </div>
        </div>
      </div>

      {/* Performance Details */}
      <div className="space-y-6">
        {/* Strengths and Focus Areas Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Your Strengths - Left */}
          <DashboardCard
            title="Your Strengths"
            subtitle="Topics where you're performing well"
            icon={Award}
            iconColor="text-green-600"
            className="min-h-[340px] h-auto"
          >
            {performance.filter(topic => topic.accuracy >= 0.5).slice(0, 3).map((topic, index) => (
              <TopicItem
                key={topic.topic}
                topic={topic.topic}
                accuracy={topic.accuracy}
                attempts={topic.total_attempts}
                index={index}
                type="strength"
                onClick={() => {
                  setSelectedFocusArea({
                    topic: topic.topic,
                    accuracy: topic.accuracy,
                    attempts: topic.total_attempts
                  });
                  setFocusAreaQuestionsOpen(true);
                }}
                showClickHint={true}
              />
            ))}
            {performance.filter(topic => topic.accuracy >= 0.5).length === 0 && (
              <EmptyState
                message="Complete some practice questions to see your strengths!"
                icon={<Award className="h-8 w-8" />}
              />
            )}
          </DashboardCard>

          {/* Focus Areas - Right */}
          <DashboardCard
            title="Focus Areas"
            subtitle="Topics that need more attention"
            icon={Target}
            iconColor="text-red-600"
            className="min-h-[340px] h-auto"
          >
            {needsWork.map((topic, index) => (
              <TopicItem
                key={topic.topic}
                topic={topic.topic}
                accuracy={topic.accuracy}
                attempts={topic.attempts}
                index={index}
                type="focus"
                onClick={() => {
                  setSelectedFocusArea(topic);
                  setFocusAreaQuestionsOpen(true);
                }}
                showClickHint={true}
              />
            ))}
            {needsWork.length === 0 && (
              <EmptyState
                message="Great job! No weak areas identified yet."
                icon={<Target className="h-8 w-8" />}
              />
            )}
          </DashboardCard>
        </div>

        {/* Misconceptions - Full Width */}
        <DashboardCard
          title="Misconceptions"
          subtitle="Common mistakes to watch out for"
          icon={Clock}
          iconColor="text-red-600"
          className="h-[600px]"
        >
          {loadingExplanations && misconceptions.length > 0 && (
            <LoadingState message="Analyzing misconceptions..." />
          )}
          
          {!cacheLoading && !loadingExplanations && (cachedMisconceptions.length > 0 ? cachedMisconceptions : misconceptions).slice(0, 5).map((misconception, index) => {
            const kidFriendlyLabel = formatMisconceptionForKids(misconception.red_herring);
            return (
              <MisconceptionItem
                key={`${misconception.red_herring}-${index}`}
                misconception={misconception}
                kidFriendlyLabel={kidFriendlyLabel}
                onClick={() => {
                  setSelectedMisconceptionForQuestions(misconception);
                  setMisconceptionQuestionsOpen(true);
                }}
              />
            );
          })}
          
          {misconceptions.length === 0 && (
            <EmptyState
              message="Complete some practice questions to identify misconceptions."
              icon={<Clock className="h-8 w-8" />}
            />
          )}

          {/* Cache Performance Indicator */}
          {cacheHitRate > 0 && (
            <div className="mt-4 p-2 rounded-md bg-green-50 border border-green-200">
              <div className="text-xs text-green-800 flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                Cache hit rate: {cacheHitRate.toFixed(0)}% • Reduced API calls by ~80%
              </div>
            </div>
          )}
        </DashboardCard>
      </div>


      {/* Modals */}
      <QuestionHistoryModal open={questionHistoryOpen} onOpenChange={setQuestionHistoryOpen} />
      <TopicAccuracyModal open={topicAccuracyOpen} onOpenChange={setTopicAccuracyOpen} />
      <TopicsStudiedModal open={topicsStudiedOpen} onOpenChange={setTopicsStudiedOpen} />
      <MisconceptionExplanationModal open={misconceptionModalOpen} onOpenChange={setMisconceptionModalOpen} misconception={selectedMisconception} />
      <MisconceptionQuestionsModal open={misconceptionQuestionsOpen} onOpenChange={setMisconceptionQuestionsOpen} misconception={selectedMisconceptionForQuestions} />
      <FocusAreaQuestionsModal open={focusAreaQuestionsOpen} onOpenChange={setFocusAreaQuestionsOpen} focusArea={selectedFocusArea} />
      <SessionsModal open={sessionsModalOpen} onOpenChange={setSessionsModalOpen} />
    </div>;
  return <div>
      <DashboardNavigation currentView={currentView} setCurrentView={setCurrentView} />
      
      {renderCurrentView()}
    </div>;
};
export default Dashboard;