import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Users, ChevronRight, Play, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { LearningExperience } from './LearningExperience';
import { TopicLearningModal } from './TopicLearningModal';
import { WeeklyLearningModal } from './WeeklyLearningModal';
import { QuickPracticeModal } from './QuickPracticeModal';
import { useBootcampData } from '@/hooks/useBootcampData';
import { Target } from 'lucide-react';
interface Module {
  id: string;
  name: string;
  curriculum_id: string;
  weeks: number[];
  module_order: number;
}
interface Topic {
  id: string;
  name: string;
  module_id: string;
  difficulty: string;
  skills: string[];
  topic_order: number;
}
interface Subtopic {
  id: number;
  name: string;
  topic_id: string;
  subtopic_order: number;
}
interface WeeklyPlan {
  week: number;
  title: string;
  topics: string[];
  module: string;
  difficulty: string;
  focus: string;
}
interface CurriculumItem {
  question_id: string;
  topic: string;
  subtopic: string;
  example_question: string;
  difficulty: string;
  pedagogical_notes: string;
}
export const LearnView: React.FC = () => {
  const { student, progress } = useBootcampData();
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>([]);
  const [weekProgress, setWeekProgress] = useState<Record<number, number>>({});
  const [startedWeeks, setStartedWeeks] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showLearningExperience, setShowLearningExperience] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [showQuickPractice, setShowQuickPractice] = useState(false);
  const [practiceSelectedTopic, setPracticeSelectedTopic] = useState<Topic | null>(null);
  const [selectedWeekPlan, setSelectedWeekPlan] = useState<WeeklyPlan | null>(null);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  useEffect(() => {
    loadLearningContent();
  }, []);

  useEffect(() => {
    if (progress.length > 0 && weeklyPlan.length > 0 && topics.length > 0) {
      calculateWeekProgress();
    }
  }, [progress, weeklyPlan, topics]);

  const calculateWeekProgress = () => {
    const weekProgressMap: Record<number, number> = {};
    
    weeklyPlan.forEach(week => {
      const weekTopics = topics.filter(topic => 
        week.topics.some(weekTopic => 
          topic.name.toLowerCase().includes(weekTopic.toLowerCase()) ||
          weekTopic.toLowerCase().includes(topic.name.toLowerCase())
        )
      );
      
      if (weekTopics.length > 0) {
        const completedTopics = weekTopics.filter(topic => {
          const topicProgress = progress.find(p => p.topic_id === topic.id);
          return topicProgress && (topicProgress.status === 'mastered' || topicProgress.status === 'completed');
        });
        
        weekProgressMap[week.week] = (completedTopics.length / weekTopics.length) * 100;
      } else {
        weekProgressMap[week.week] = 0;
      }
    });
    
    setWeekProgress(weekProgressMap);
  };

  const getCurrentWeek = (): number => {
    // Find the first week that isn't 100% complete
    for (let week = 1; week <= 52; week++) {
      const progress = weekProgress[week] || 0;
      if (progress < 100) {
        return week;
      }
    }
    return 52; // All weeks completed
  };

  const getWeekStatus = (weekNumber: number) => {
    const progress = weekProgress[weekNumber] || 0;
    const currentWeek = getCurrentWeek();
    const isStarted = startedWeeks.has(weekNumber);
    
    if (progress >= 100) {
      return 'completed';
    } else if (isStarted) {
      return 'started';
    } else if (weekNumber === currentWeek) {
      return 'current';
    } else if (weekNumber < currentWeek) {
      return 'available';
    } else {
      return 'locked';
    }
  };

  const getWeekCardStyle = (weekNumber: number) => {
    const status = getWeekStatus(weekNumber);
    
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50 shadow-green-100';
      case 'started':
        return 'border-yellow-500 bg-yellow-50 shadow-yellow-100';
      case 'current':
        return 'border-blue-500 bg-blue-50 shadow-blue-100 ring-2 ring-blue-200';
      case 'available':
        return 'opacity-70 hover:opacity-100';
      case 'locked':
        return 'opacity-40 hover:opacity-100';
      default:
        return '';
    }
  };

  const getWeekButtonText = (week: WeeklyPlan) => {
    const status = getWeekStatus(week.week);
    
    if (status === 'completed') {
      return 'Complete';
    } else if (status === 'started') {
      return 'Continue Learning';
    } else if (status === 'current') {
      return week.week <= 36 ? 'Start Learning' : week.week <= 46 ? 'Practice' : week.week <= 50 ? 'Review' : 'Final Prep';
    } else {
      return week.week <= 36 ? 'Start Learning' : week.week <= 46 ? 'Practice' : week.week <= 50 ? 'Review' : 'Final Prep';
    }
  };

  const getWeekButtonStyle = (weekNumber: number) => {
    const status = getWeekStatus(weekNumber);
    
    switch (status) {
      case 'completed':
        return 'bg-green-600 hover:bg-green-700 text-white border-green-600';
      case 'started':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600';
      case 'current':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      default:
        return 'variant-outline';
    }
  };
  const loadLearningContent = async () => {
    try {
      setLoading(true);

      // Fetch modules
      const {
        data: modulesData,
        error: modulesError
      } = await supabase.from('bootcamp_modules').select('*').order('module_order');
      if (modulesError) throw modulesError;

      // Fetch topics
      const {
        data: topicsData,
        error: topicsError
      } = await supabase.from('bootcamp_topics').select('*').order('topic_order');
      if (topicsError) throw topicsError;

      // Fetch subtopics
      const {
        data: subtopicsData,
        error: subtopicsError
      } = await supabase.from('bootcamp_subtopics').select('*').order('subtopic_order');
      if (subtopicsError) throw subtopicsError;

      // Fetch curriculum for examples
      const {
        data: curriculumData,
        error: curriculumError
      } = await supabase.from('curriculum').select('question_id, topic, subtopic, example_question, difficulty, pedagogical_notes').limit(100);
      if (curriculumError) throw curriculumError;
      setModules(modulesData || []);
      setTopics(topicsData || []);
      setSubtopics(subtopicsData || []);
      setCurriculum(curriculumData || []);

      // Generate 52-week plan
      if (modulesData && topicsData) {
        const plan = generateWeeklyPlan(modulesData, topicsData);
        setWeeklyPlan(plan);
      }
      if (modulesData && modulesData.length > 0) {
        setSelectedModule(modulesData[0].id);
      }
    } catch (err) {
      console.error('Error loading learning content:', err);
      setError('Failed to load learning content');
    } finally {
      setLoading(false);
    }
  };
  const generateWeeklyPlan = (modules: Module[], topics: Topic[]): WeeklyPlan[] => {
    const plan: WeeklyPlan[] = [];

    // Core curriculum weeks (1-36)
    modules.forEach(module => {
      const moduleTopics = topics.filter(t => t.module_id === module.id);
      const weeksInModule = module.weeks.length;
      const topicsPerWeek = Math.ceil(moduleTopics.length / weeksInModule);
      module.weeks.forEach((weekNumber, weekIndex) => {
        const startTopicIndex = weekIndex * topicsPerWeek;
        const endTopicIndex = Math.min(startTopicIndex + topicsPerWeek, moduleTopics.length);
        const weekTopics = moduleTopics.slice(startTopicIndex, endTopicIndex);
        if (weekTopics.length > 0) {
          plan.push({
            week: weekNumber,
            title: `${module.name} - Week ${weekIndex + 1}`,
            topics: weekTopics.map(t => t.name),
            module: module.name,
            difficulty: weekTopics[0]?.difficulty || 'foundation',
            focus: weekTopics.length === 1 ? 'Deep Dive' : 'Multi-Topic'
          });
        }
      });
    });

    // Review and practice weeks (37-52)
    const reviewWeeks = [{
      week: 37,
      title: "Number & Arithmetic Review",
      topics: ["Mental calculations", "Number properties", "Basic operations"],
      module: "Review",
      difficulty: "foundation",
      focus: "Consolidation"
    }, {
      week: 38,
      title: "Fractions & Decimals Practice",
      topics: ["FDP conversions", "Fraction operations", "Decimal calculations"],
      module: "Review",
      difficulty: "intermediate",
      focus: "Application"
    }, {
      week: 39,
      title: "Geometry Foundations",
      topics: ["Shape properties", "Area & perimeter", "Angle work"],
      module: "Review",
      difficulty: "intermediate",
      focus: "Spatial Skills"
    }, {
      week: 40,
      title: "Problem Solving Workshop",
      topics: ["Multi-step problems", "Working backwards", "Logic puzzles"],
      module: "Practice",
      difficulty: "advanced",
      focus: "Strategy"
    }, {
      week: 41,
      title: "Algebra & Patterns",
      topics: ["Simple equations", "Sequences", "Pattern recognition"],
      module: "Review",
      difficulty: "intermediate",
      focus: "Abstract Thinking"
    }, {
      week: 42,
      title: "Data & Statistics",
      topics: ["Charts & graphs", "Averages", "Probability"],
      module: "Review",
      difficulty: "intermediate",
      focus: "Data Analysis"
    }, {
      week: 43,
      title: "Mixed Practice 1",
      topics: ["Cross-topic problems", "Exam-style questions", "Time management"],
      module: "Practice",
      difficulty: "advanced",
      focus: "Integration"
    }, {
      week: 44,
      title: "Measurement & Units",
      topics: ["Metric conversions", "Time problems", "Speed calculations"],
      module: "Review",
      difficulty: "foundation",
      focus: "Real-world Maths"
    }, {
      week: 45,
      title: "Advanced Problem Solving",
      topics: ["Complex word problems", "Multi-step reasoning", "Strategy selection"],
      module: "Practice",
      difficulty: "advanced",
      focus: "Challenge"
    }, {
      week: 46,
      title: "Mixed Practice 2",
      topics: ["Timed practice", "Weak area focus", "Mistake analysis"],
      module: "Practice",
      difficulty: "advanced",
      focus: "Exam Prep"
    }, {
      week: 47,
      title: "Final Review - Foundations",
      topics: ["Core number skills", "Basic geometry", "Essential facts"],
      module: "Final Review",
      difficulty: "foundation",
      focus: "Confidence Building"
    }, {
      week: 48,
      title: "Final Review - Applications",
      topics: ["Problem solving", "Real-world contexts", "Method selection"],
      module: "Final Review",
      difficulty: "intermediate",
      focus: "Application"
    }, {
      week: 49,
      title: "Mock Exam Week 1",
      topics: ["Full practice papers", "Time management", "Exam technique"],
      module: "Assessment",
      difficulty: "advanced",
      focus: "Exam Simulation"
    }, {
      week: 50,
      title: "Targeted Improvement",
      topics: ["Individual weak areas", "Personalized practice", "Confidence building"],
      module: "Personalized",
      difficulty: "mixed",
      focus: "Individual Needs"
    }, {
      week: 51,
      title: "Mock Exam Week 2",
      topics: ["Final practice papers", "Performance review", "Last-minute tips"],
      module: "Assessment",
      difficulty: "advanced",
      focus: "Final Preparation"
    }, {
      week: 52,
      title: "Ready for Success!",
      topics: ["Light review", "Confidence building", "Exam day preparation"],
      module: "Confidence",
      difficulty: "mixed",
      focus: "Readiness"
    }];
    plan.push(...reviewWeeks);
    plan.sort((a, b) => a.week - b.week);
    return plan;
  };
  const getTopicsForModule = (moduleId: string) => {
    return topics.filter(topic => topic.module_id === moduleId);
  };
  const getSubtopicsForTopic = (topicId: string) => {
    return subtopics.filter(subtopic => subtopic.topic_id === topicId);
  };
  const getCurriculumForTopic = (topicName: string) => {
    return curriculum.filter(item => item.topic.toLowerCase().includes(topicName.toLowerCase()));
  };
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'foundation':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTopicCTA = (topicProgress: any) => {
    if (!topicProgress) {
      return {
        text: 'Start Learning',
        variant: 'default' as const,
        icon: Play
      };
    }

    switch (topicProgress.status) {
      case 'mastered':
      case 'completed':
        return {
          text: 'Complete',
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'bg-green-600 hover:bg-green-700 text-white'
        };
      case 'in_progress':
        return {
          text: 'Continue Learning',
          variant: 'default' as const,
          icon: Play
        };
      default:
        return {
          text: 'Start Learning',
          variant: 'default' as const,
          icon: Play
        };
    }
  };
  const handleWeekClick = (week: WeeklyPlan) => {
    // Mark the week as started when user clicks to begin learning
    setStartedWeeks(prev => new Set([...prev, week.week]));
    setSelectedWeekPlan(week);
    setIsWeeklyModalOpen(true);
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsTopicModalOpen(true);
  };
  const handleStartPractice = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      setPracticeSelectedTopic(topic);
      setShowQuickPractice(true);
    }
    setIsTopicModalOpen(false);
  };
  if (loading) {
    return <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading learning content...</span>
        </div>
      </div>;
  }
  if (error) {
    return <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>;
  }
  if (showLearningExperience) {
    return <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Learning Experience</h2>
          <Button variant="outline" onClick={() => setShowLearningExperience(false)}>
            Back to Overview
          </Button>
        </div>
        <LearningExperience onComplete={() => setShowLearningExperience(false)} />
      </div>;
  }
  return <div className="space-y-6">
      {/* Currently Learning Section - First Priority */}
      

      {/* Skill Development Section - Second Priority */}
      

      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Learning Center</h1>
        <p className="text-muted-foreground">Navigate through your curriculum and master each concept step by step</p>
      </div>

      <Tabs defaultValue="plan" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plan">52-Week Plan</TabsTrigger>
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-6">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-2">52-Week Complete Learning Journey</h2>
              <p className="text-muted-foreground mb-4">
                A comprehensive year-long plan covering all mathematical concepts from foundations to advanced problem-solving,
                culminating in complete exam readiness.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="font-semibold text-primary">Weeks 1-36</div>
                  <div className="text-muted-foreground">Core Curriculum</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="font-semibold text-secondary">Weeks 37-46</div>
                  <div className="text-muted-foreground">Review & Practice</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="font-semibold text-accent">Weeks 47-50</div>
                  <div className="text-muted-foreground">Final Review</div>
                </div>
                <div className="bg-background/50 rounded-lg p-3">
                  <div className="font-semibold text-warning">Weeks 51-52</div>
                  <div className="text-muted-foreground">Exam Ready</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeklyPlan.map(week => {
                const weekStatus = getWeekStatus(week.week);
                const cardStyle = getWeekCardStyle(week.week);
                const buttonText = getWeekButtonText(week);
                const buttonStyle = getWeekButtonStyle(week.week);
                const progress = weekProgress[week.week] || 0;
                
                return (
                  <Card 
                    key={week.week} 
                    className={`hover:shadow-md transition-all duration-200 ${cardStyle}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            weekStatus === 'completed' ? 'border-green-500 text-green-700 bg-green-50' :
                            weekStatus === 'started' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                            weekStatus === 'current' ? 'border-blue-500 text-blue-700 bg-blue-50' :
                            'text-xs'
                          }`}
                        >
                          Week {week.week}
                        </Badge>
                        <Badge className={getDifficultyColor(week.difficulty)} variant="secondary">
                          {week.difficulty}
                        </Badge>
                      </div>
                      <CardTitle 
                        className={`text-lg leading-tight ${
                          weekStatus === 'locked' ? 'text-muted-foreground' : ''
                        }`}
                      >
                        {week.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{week.module}</span>
                        <span>•</span>
                        <span>{week.focus}</span>
                      </div>
                      
                      {/* Week Progress Bar */}
                      {progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className={
                              weekStatus === 'completed' ? 'text-green-600' :
                              weekStatus === 'started' ? 'text-yellow-600' :
                              weekStatus === 'current' ? 'text-blue-600' :
                              'text-muted-foreground'
                            }>
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <Progress 
                            value={progress} 
                            className={`h-1.5 ${
                              weekStatus === 'completed' ? '[&>div]:bg-green-500' :
                              weekStatus === 'started' ? '[&>div]:bg-yellow-500' :
                              weekStatus === 'current' ? '[&>div]:bg-blue-500' :
                              ''
                            }`}
                          />
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <h6 className="text-sm font-medium text-muted-foreground">This week covers:</h6>
                        <div className="space-y-1">
                          {week.topics.map((topic, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className={`h-3 w-3 ${
                                weekStatus === 'completed' ? 'text-green-500' :
                                weekStatus === 'started' ? 'text-yellow-500' :
                                weekStatus === 'current' ? 'text-blue-500' :
                                'text-muted-foreground'
                              }`} />
                              <span className={weekStatus === 'locked' ? 'text-muted-foreground' : ''}>
                                {topic}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button 
                        variant={weekStatus === 'completed' || weekStatus === 'current' || weekStatus === 'started' ? undefined : "outline"}
                        size="sm" 
                        className={`w-full mt-4 ${
                          weekStatus === 'completed' ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' :
                          weekStatus === 'started' ? 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600' :
                          weekStatus === 'current' ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' :
                          ''
                        }`}
                        onClick={() => handleWeekClick(week)}
                      >
                        {weekStatus === 'completed' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-2" />
                            Complete
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-2" />
                            {week.week <= 36 ? 'Start Learning' : week.week <= 46 ? 'Practice' : week.week <= 50 ? 'Review' : 'Final Prep'}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          {/* All Learning Topics Section - Moved from TopicsView */}
          <div className="bg-card rounded-xl shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">All Learning Topics</h2>
            <p className="text-muted-foreground">
              Explore {topics.length} topics across {modules.length} modules. Click any topic to see detailed content, subtopics, and sample questions.
            </p>
          </div>

          {/* Your Learning Journey Progress */}
          {progress && progress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Learning Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress: {progress.filter(p => p.status === 'mastered' || p.status === 'completed').length} of {topics.length} topics</span>
                    <span>{Math.round((progress.filter(p => p.status === 'mastered' || p.status === 'completed').length / topics.length) * 100)}% Complete</span>
                  </div>
                  <Progress value={(progress.filter(p => p.status === 'mastered' || p.status === 'completed').length / topics.length) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {modules.map((module) => {
            const moduleTopics = getTopicsForModule(module.id);
            if (moduleTopics.length === 0) return null;

            return (
              <div key={module.id} className="space-y-4">
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border">
                  <h3 className="text-xl font-bold mb-2">{module.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{module.weeks.length} weeks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{moduleTopics.length} topics</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Module {module.module_order}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {moduleTopics.map((topic) => {
                    const topicSubtopics = getSubtopicsForTopic(topic.id);
                    const sampleQuestionsCount = getCurriculumForTopic(topic.name).length;
                    
                    // Get progress for this specific topic
                    const topicProgress = progress.find(p => p.topic_id === topic.id);
                    const progressPercentage = topicProgress ? (topicProgress.mastery_score || 0) * 100 : 0;
                    const statusColor = topicProgress?.status === 'mastered' ? 'text-green-600' : 
                                       topicProgress?.status === 'completed' ? 'text-blue-600' : 
                                       topicProgress?.status === 'in_progress' ? 'text-yellow-600' : 
                                       'text-gray-500';

                    return (
                      <Card 
                        key={topic.id} 
                        className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] group"
                        onClick={() => handleTopicClick(topic)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge className={getDifficultyColor(topic.difficulty)} variant="outline">
                              {topic.difficulty}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                            {topic.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-center justify-between">
                              <span>{topic.skills?.length || 0} skills</span>
                              <span>{topicSubtopics.length} subtopics</span>
                            </div>
                            
                            {/* Topic Progress Bar */}
                            {topicProgress && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className={statusColor}>
                                    {topicProgress.status.replace('_', ' ')}
                                  </span>
                                  <span>{Math.round(progressPercentage)}%</span>
                                </div>
                                <Progress value={progressPercentage} className="h-1.5" />
                              </div>
                            )}
                            
                            {topic.skills && topic.skills.length > 0 && (
                              <div className="text-xs">
                                <div className="font-medium mb-1">Skills:</div>
                                <div className="flex flex-wrap gap-1">
                                  {topic.skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {sampleQuestionsCount > 0 && (
                              <div className="flex items-center gap-1 text-xs">
                                <Play className="h-3 w-3" />
                                <span>{sampleQuestionsCount} sample questions</span>
                              </div>
                            )}
                            
                            {(() => {
                              const cta = getTopicCTA(topicProgress);
                              return (
                                <Button 
                                  className={`w-full ${cta.className || ''}`} 
                                  size="sm" 
                                  variant={cta.variant}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTopicClick(topic);
                                  }}
                                >
                                  <cta.icon className="h-4 w-4 mr-2" />
                                  {cta.text}
                                </Button>
                              );
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>

      </Tabs>

      <TopicLearningModal topic={selectedTopic} isOpen={isTopicModalOpen} onClose={() => setIsTopicModalOpen(false)} onStartPractice={handleStartPractice} />
      
      <QuickPracticeModal 
        topic={practiceSelectedTopic} 
        isOpen={showQuickPractice} 
        onClose={() => {
          setShowQuickPractice(false);
          setPracticeSelectedTopic(null);
        }} 
      />

      <WeeklyLearningModal 
        weekPlan={selectedWeekPlan} 
        isOpen={isWeeklyModalOpen} 
        onClose={() => {
          setIsWeeklyModalOpen(false);
          setSelectedWeekPlan(null);
        }} 
      />
    </div>;
};