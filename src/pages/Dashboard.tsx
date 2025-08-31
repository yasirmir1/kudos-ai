import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Target, TrendingUp, Clock, Calendar, BookOpen, Play, Circle, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuestionHistoryModal } from '@/components/QuestionHistoryModal';
import { TopicAccuracyModal } from '@/components/TopicAccuracyModal';
import { TopicsStudiedModal } from '@/components/TopicsStudiedModal';
import { MisconceptionExplanationModal } from '@/components/MisconceptionExplanationModal';
import { MisconceptionQuestionsModal } from '@/components/MisconceptionQuestionsModal';
import { FocusAreaQuestionsModal } from '@/components/FocusAreaQuestionsModal';
import { WorksheetGeneratorModal } from '@/components/WorksheetGeneratorModal';
import { SessionsModal } from '@/components/SessionsModal';
import { AgeGroupSelector } from '@/components/AgeGroupSelector';
import { useAgeGroup } from '@/contexts/AgeGroupContext';
import { DashboardNavigation } from '@/components/dashboard';
import Practice from './Practice';
import Curriculum from './Curriculum';
import Analytics from './Analytics';
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
  const getFrequencyColorBadge = (frequency: number) => {
    if (frequency >= 5) {
      return <div title={`Oops! This happened ${frequency} times - let's work on this!`}><Circle className="w-3 h-3 fill-red-500 text-red-500" /></div>;
    } else if (frequency >= 3) {
      return <div title={`This happened ${frequency} times - time to practice!`}><Circle className="w-3 h-3 fill-yellow-500 text-yellow-500" /></div>;
    } else {
      return <div title={`Only ${frequency} time${frequency > 1 ? 's' : ''} - you're learning!`}><Circle className="w-3 h-3 fill-green-500 text-green-500" /></div>;
    }
  };
  const formatMisconceptionForKids = (redHerring: string) => {
    // Handle empty or invalid misconceptions
    if (!redHerring || redHerring.trim() === '') {
      return 'Unknown thinking pattern 🤔';
    }

    // Create more kid-friendly labels for common misconceptions
    const kidFriendlyLabels: {
      [key: string]: string;
    } = {
      'Decimals_IncorrectPlaceValueShift': 'Moving decimal points the wrong way 🔢',
      'Equivalence_PartialRecognition': 'Mixing up equal signs 🤔',
      'Fractions_AddNumeratorsAndDenominators': 'Adding fractions like whole numbers 🍕',
      'Fractions_MultiplyLikeAddition': 'Multiplying fractions like adding ✖️',
      'HCF_PartialFactorization': 'Finding factors but not the biggest one 🔍',
      'NegativeNumbers_IntervalAcrossZero': 'Counting backwards gets tricky ⬅️',
      'OrderOfOperations_ParenthesesIgnored': 'Forgetting about parentheses first 📐',
      'OrderOfOperations_SubtractionBeforeMultiplication': 'Doing subtraction before times ➖',
      'PlaceValue_DigitValueConfusion': 'Mixing up what position means 📍',
      'PlaceValue_OrderingConfusion_ZeroPlacement': 'Zero placement puzzles 0️⃣',
      'Rounding_DownInsteadOfUp': 'Rounding the wrong direction ⬇️',
      'Rounding_IncorrectDirection': 'Getting confused which way to round 🔄',
      'Percentage_IncorrectOperation': 'Getting percentages mixed up 📊',
      'Algebra_IncorrectOperation': 'Mix-ups with algebra steps 🔢',
      'Addition_CarryError': 'Forgetting to carry numbers 📝',
      'Subtraction_BorrowError': 'Mix-ups when borrowing 🔄',
      'Multiplication_TableError': 'Times table mix-ups ✖️',
      'Division_RemainderError': 'Getting remainders wrong ➗',
      'FractionEquivalence_Error': 'Finding equal fractions tricky 🍰',
      'DecimalComparison_Error': 'Comparing decimals wrongly 🔍',
      'GeometryAngle_Error': 'Angle measurements confusing 📐',
      'MeasurementUnit_Error': 'Unit conversion mix-ups 📏',
      'ProbabilityLogic_Error': 'Probability thinking tricky 🎲',
      'DataInterpretation_Error': 'Reading charts confusing 📊'
    };

    // If we have a kid-friendly version, use it
    if (kidFriendlyLabels[redHerring]) {
      return kidFriendlyLabels[redHerring];
    }

    // Fallback: make any other misconception kid-friendly
    return redHerring.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()).trim() + ' 🤯';
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
      case 'analytics':
        return <Analytics />;
      case 'report':
        return <Report />;
      default:
        return renderOverview();
    }
  };
  const renderOverview = () => <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Ready to learn section */}
      <div className="bg-card rounded-lg shadow-sm p-8 text-center mb-8 py-[40px] my-[5px]">
        <h1 className="text-3xl font-bold text-foreground">Ready to learn?</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Your adaptive learning system has prepared personalized {selectedAgeGroup} questions.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button onClick={startLearning} className="flex items-center justify-center bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-primary/90 transition-colors text-base w-full sm:w-auto">
            <Play className="mr-2 h-4 w-4" />
            Start Practice Session
          </Button>
          <WorksheetGeneratorModal />
        </div>
      </div>


      {/* Performance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Your Strengths */}
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <Award className="text-success text-2xl h-6 w-6 mr-3" />
            <h3 className="text-lg font-semibold text-foreground">Your Strengths</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Topics where you're performing well</p>
          <div className="space-y-3">
            {performance.filter(topic => topic.accuracy >= 0.5).slice(0, 5).map((topic, index) => <div key={topic.topic}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-muted-foreground mr-2">#{index + 1}</span>
                    <p className="text-sm text-foreground">{topic.topic}</p>
                  </div>
                  <span className="text-sm font-bold text-success">{Math.round(topic.accuracy * 100)}%</span>
                </div>
                <p className="text-xs text-muted-foreground ml-7 mt-1">{topic.total_attempts} attempts</p>
              </div>)}
            {performance.filter(topic => topic.accuracy >= 0.5).length === 0 && <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Complete some practice questions to see your strengths!</p>
              </div>}
          </div>
        </div>

        {/* Focus Areas */}
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <Target className="text-warning text-2xl h-6 w-6 mr-3" />
            <h3 className="text-lg font-semibold text-foreground">Focus Areas</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Topics that need more attention</p>
          <div className="space-y-3">
            {needsWork.map((topic, index) => <div key={topic.topic} className="cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors" onClick={() => {
            setSelectedFocusArea(topic);
            setFocusAreaQuestionsOpen(true);
          }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-muted-foreground mr-2">#{index + 1}</span>
                    <p className="text-sm text-foreground">{topic.topic}</p>
                  </div>
                  <span className="text-sm font-bold text-destructive">{Math.round(topic.accuracy * 100)}%</span>
                </div>
                <p className="text-xs text-muted-foreground ml-7 mt-1">{topic.attempts} attempts • Click to practice</p>
              </div>)}
            {needsWork.length === 0 && <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Great job! No weak areas identified yet.</p>
              </div>}
          </div>
        </div>

        {/* Misconceptions */}
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <Clock className="text-destructive text-2xl h-6 w-6 mr-3" />
            <h3 className="text-lg font-semibold text-foreground">Misconceptions</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Common mistakes to watch out for</p>
          <div className="space-y-3">
            {loadingExplanations && misconceptions.length > 0 && <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Analyzing misconceptions...</span>
              </div>}
            
            {!loadingExplanations && misconceptions.slice(0, 5).map((misconception, index) => {
            const kidFriendlyLabel = formatMisconceptionForKids(misconception.red_herring);
            return <div key={`${misconception.red_herring}-${index}`} className="p-3 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
              setSelectedMisconceptionForQuestions(misconception);
              setMisconceptionQuestionsOpen(true);
            }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getFrequencyColorBadge(misconception.frequency)}
                      <span className="text-xs text-muted-foreground">
                        {misconception.topics?.join(', ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {kidFriendlyLabel}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Let's see what happened and learn together! 🌟
                  </p>
                </div>;
          })}
            
            {misconceptions.length === 0 && <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Complete some practice questions to identify misconceptions.</p>
              </div>}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-card p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setQuestionHistoryOpen(true)}>
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Total Questions</h3>
            <Target className="text-muted-foreground h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">{totalQuestions}</p>
          <p className="text-xs text-muted-foreground mt-2">Questions completed</p>
        </div>

        <div className="bg-card p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTopicAccuracyOpen(true)}>
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Overall Accuracy</h3>
            <TrendingUp className="text-muted-foreground h-5 w-5" />
          </div>
          <div className="flex items-center mt-2">
            <p className="text-3xl font-bold text-success mr-2">{Math.round(overallAccuracy * 100)}%</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{
              width: `${overallAccuracy * 100}%`
            }} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">By topic</p>
        </div>

        <div className="bg-card p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setTopicsStudiedOpen(true)}>
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Topics Studied</h3>
            <BookOpen className="text-muted-foreground h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">{performance.length}</p>
          <p className="text-xs text-muted-foreground mt-2">Different topics</p>
        </div>

        <div className="bg-card p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSessionsModalOpen(true)}>
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Sessions</h3>
            <Calendar className="text-muted-foreground h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-foreground mt-2">{totalSessions}</p>
          <p className="text-xs text-muted-foreground mt-2">Practice sessions</p>
        </div>
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