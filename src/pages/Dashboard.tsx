import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Target, TrendingUp, Clock, Calendar, BookOpen, Circle, Award } from 'lucide-react';
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
import { AppNavigation } from '@/components/AppNavigation';
import { useAgeGroup } from '@/contexts/AgeGroupContext';
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
    navigate('/practice');
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
    return redHerring
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim() + ' 🤯';
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
  return <div className="min-h-screen bg-background">
      <AppNavigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-8">
          <h1 className="text-4xl font-bold text-foreground">Ready to learn?</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your personalized learning journey continues with questions tailored just for you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={startLearning} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
              <BookOpen className="mr-2 h-5 w-5" />
              Start Practice
            </Button>
            <WorksheetGeneratorModal />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-sm" onClick={() => setQuestionHistoryOpen(true)}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <Target className="h-4 w-4" />
                <span>Questions</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{totalQuestions}</div>
              <p className="text-sm text-muted-foreground">completed</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-sm" onClick={() => setTopicAccuracyOpen(true)}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                <span>Accuracy</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{Math.round(overallAccuracy * 100)}%</div>
              <div className="w-full bg-muted h-2 rounded-full mt-2">
                <div 
                  className="bg-foreground h-2 rounded-full transition-all"
                  style={{ width: `${overallAccuracy * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-sm" onClick={() => setTopicsStudiedOpen(true)}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <BookOpen className="h-4 w-4" />
                <span>Topics</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{performance.length}</div>
              <p className="text-sm text-muted-foreground">studied</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-sm" onClick={() => setSessionsModalOpen(true)}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span>Sessions</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{totalSessions}</div>
              <p className="text-sm text-muted-foreground">practice sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Your Strengths */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Award className="h-5 w-5 text-green-500" />
              <h2 className="text-xl font-semibold">Your Strengths</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Topics where you're doing great</p>
            <div className="space-y-3">
              {performance.filter(topic => topic.accuracy >= 0.5).slice(0, 3).map((topic, index) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-green-700">{index + 1}</span>
                    </div>
                    <span className="font-medium text-foreground">{topic.topic}</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">{Math.round(topic.accuracy * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Target className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-semibold">Focus Areas</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Topics to work on next</p>
            <div className="space-y-3">
              {needsWork.slice(0, 3).map((topic, index) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-red-700">{index + 1}</span>
                    </div>
                    <span className="font-medium text-foreground">{topic.topic}</span>
                  </div>
                  <span className="text-sm text-red-600">{topic.attempts} attempts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Notes */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold">Learning Notes</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Things to remember</p>
            <div className="space-y-3">
              {misconceptions.slice(0, 3).map((misconception, index) => (
                <div key={misconception.red_herring} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="font-medium text-foreground">
                      {formatMisconceptionForKids(misconception.red_herring).replace(/[🔢🤔🍕✖️🔍⬅️📐➖📍0️⃣⬇️🔄📊📝🔄✖️➗🍰🔍📐📏🎲📊🤯]/g, '').trim()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-4">
                    {misconception.red_herring === 'Ratio and Proportion' ? 'Watch out for operation mix-ups' :
                     misconception.red_herring === 'Algebra' ? 'Remember the order of operations' :
                     misconception.red_herring === 'Place Value' ? 'Great improvement!' : 
                     'Keep practicing!'}
                  </p>
                </div>
              ))}
            </div>
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
    </div>
  </div>;
};

export default Dashboard;