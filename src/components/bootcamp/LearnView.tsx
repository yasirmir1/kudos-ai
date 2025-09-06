import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Users, ChevronRight, Play, CheckCircle, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { LearningExperience } from './LearningExperience';
import { TopicLearningModal } from './TopicLearningModal';
import { WeeklyLearningModal } from './WeeklyLearningModal';
import { QuickPracticeModal } from './QuickPracticeModal';
import { PracticePerformanceCard } from './PracticePerformanceCard';
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

interface LearnViewProps {
  selectedWeek?: number | null;
  onWeekChange?: (week: number | null) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ selectedWeek, onWeekChange }) => {
  const { student, progress } = useBootcampData();
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>([]);
  const [weekProgress, setWeekProgress] = useState<Record<number, number>>({});
  const [startedWeeks, setStartedWeeks] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('bootcamp-started-weeks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
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

  // Auto-open weekly modal if selectedWeek is provided
  useEffect(() => {
    if (selectedWeek && weeklyPlan.length > 0 && !isWeeklyModalOpen) {
      const weekPlan = weeklyPlan.find(week => week.week === selectedWeek);
      if (weekPlan) {
        setSelectedWeekPlan(weekPlan);
        setIsWeeklyModalOpen(true);
      }
    }
  }, [selectedWeek, weeklyPlan, isWeeklyModalOpen]);

  const calculateWeekProgress = () => {
    const progressMap: Record<number, number> = {};
    
    weeklyPlan.forEach(week => {
      const weekTopics = week.topics;
      const topicProgresses = weekTopics.map(topicName => {
        const topic = topics.find(t => t.name === topicName);
        if (!topic) return 0;
        
        const topicProgress = progress.find(p => p.topic_id === topic.id);
        return topicProgress ? (topicProgress.mastery_score || 0) * 100 : 0;
      });
      
      const avgProgress = topicProgresses.length > 0 
        ? topicProgresses.reduce((sum, p) => sum + p, 0) / topicProgresses.length 
        : 0;
      
      progressMap[week.week] = avgProgress;
    });
    
    setWeekProgress(progressMap);
  };

  const loadLearningContent = async () => {
    try {
      setLoading(true);
      
        // Load curriculum data from complete JSON
        const curriculumResponse = await import('../../data/complete-curriculum-content.json');
        const curriculumData = curriculumResponse.default;
        
        if (curriculumData) {
          // Transform data to match expected interface
          setTopics(curriculumData.curriculum_topics?.map((topic: any) => ({
            id: topic.id,
            name: topic.topic_name,
            module_id: topic.module_id,
            difficulty: topic.difficulty,
            skills: topic.learning_objectives || [],
            topic_order: topic.topic_order
          })) || []);
        } else {
          setError('Unable to load curriculum data');
        }
    } catch (error) {
      console.error('Error loading learning content:', error);
      setError('Failed to load learning content');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'foundation':
        return 'border-green-200 text-green-700 bg-green-50';
      case 'intermediate':
        return 'border-blue-200 text-blue-700 bg-blue-50';
      case 'advanced':
        return 'border-orange-200 text-orange-700 bg-orange-50';
      case 'mastery':
        return 'border-red-200 text-red-700 bg-red-50';
      default:
        return 'border-gray-200 text-gray-700 bg-gray-50';
    }
  };

  const getTopicsForModule = (moduleId: string) => {
    return topics.filter(topic => topic.module_id === moduleId)
                 .sort((a, b) => a.topic_order - b.topic_order);
  };

  const getSubtopicsForTopic = (topicId: string) => {
    return subtopics.filter(subtopic => subtopic.topic_id === topicId)
                   .sort((a, b) => a.subtopic_order - b.subtopic_order);
  };

  const getCurriculumForTopic = (topicName: string) => {
    return curriculum.filter(item => item.topic === topicName);
  };

  const getWeekStatus = (week: WeeklyPlan) => {
    const currentWeek = 1; // This should be calculated based on actual progress
    const weekNum = week.week;
    const weekProgressValue = weekProgress[weekNum] || 0;
    const hasStarted = startedWeeks.has(weekNum);
    
    if (weekProgressValue >= 80) return 'completed';
    if (hasStarted || weekProgressValue > 0) return 'started';
    if (weekNum === currentWeek) return 'current';
    if (weekNum > currentWeek) return 'locked';
    return 'available';
  };

  const renderWeekCard = (week: WeeklyPlan) => {
    const weekStatus = getWeekStatus(week);
    const progress = weekProgress[week.week] || 0;
    
    let buttonText = 'Start Learning';
    if (weekStatus === 'started') buttonText = 'Continue Learning';
    if (weekStatus === 'current') buttonText = 'Start This Week';
    if (weekStatus === 'locked') buttonText = 'Locked';
    
    return (
      <Card 
        key={week.week}
        className={`transition-all duration-200 hover:shadow-md ${
          weekStatus === 'locked' ? 'opacity-60' : 'cursor-pointer hover:scale-[1.02]'
        } ${
          weekStatus === 'completed' ? 'border-green-200 bg-green-50/50' :
          weekStatus === 'current' ? 'border-blue-200 bg-blue-50/50' :
          weekStatus === 'started' ? 'border-blue-200 bg-blue-50/30' :
          ''
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <Badge 
              variant="outline" 
              className={
                weekStatus === 'completed' ? 'border-green-200 text-green-700 bg-green-50' :
                weekStatus === 'current' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                weekStatus === 'started' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                ''
              }
            >
              Week {week.week}
            </Badge>
            {weekStatus === 'completed' && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </div>
          <CardTitle className="text-base leading-tight">
            {week.title}
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded text-xs">{week.module}</span>
            <span>•</span>
            <span>{week.difficulty}</span>
          </div>
          
          {/* Week Progress Bar */}
          {progress > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className={
                  weekStatus === 'completed' ? 'text-green-600' :
                  weekStatus === 'started' ? 'text-blue-600' :
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
                  weekStatus === 'started' ? '[&>div]:bg-blue-500' :
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
                    weekStatus === 'started' ? 'text-blue-500' :
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
              weekStatus === 'started' ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' :
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
                {buttonText}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const handleWeekClick = (week: WeeklyPlan) => {
    // Mark the week as started when user clicks to begin learning
    const newStartedWeeks = new Set([...startedWeeks, week.week]);
    setStartedWeeks(newStartedWeeks);
    localStorage.setItem('bootcamp-started-weeks', JSON.stringify([...newStartedWeeks]));
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
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading learning content...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (showLearningExperience) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Learning Experience</h2>
          <Button variant="outline" onClick={() => setShowLearningExperience(false)}>
            Back to Overview
          </Button>
        </div>
        <LearningExperience onComplete={() => setShowLearningExperience(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative px-12 py-6 rounded-3xl shadow-2xl mx-auto max-w-4xl mb-4" style={{ 
        background: 'linear-gradient(to right, #6366f1, #9333ea)',
        minHeight: '140px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Learning Center</h1>
              <p className="text-indigo-100 text-sm">Navigate through your curriculum and master each concept step by step</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-12 rounded-3xl mx-auto max-w-4xl bg-white">
        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plan">52-Week Plan</TabsTrigger>
            <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-2">Learning Center Overview</h2>
              <p className="text-muted-foreground">
                Comprehensive learning journey through all mathematical concepts
              </p>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            {/* All Learning Topics Section */}
            <div className="bg-card rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">All Learning Topics</h2>
              <p className="text-muted-foreground">
                Explore {topics.length} topics. Click any topic to see detailed content.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
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
                        <span>{topic.skills?.length || 0} objectives</span>
                        <span>Order: {topic.topic_order}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <TopicLearningModal 
        topic={selectedTopic} 
        isOpen={isTopicModalOpen} 
        onClose={() => setIsTopicModalOpen(false)} 
        onStartPractice={handleStartPractice} 
      />
      
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
          // Clear the selectedWeek when modal is closed
          if (onWeekChange) {
            onWeekChange(null);
          }
        }} 
      />
    </div>
  );
};