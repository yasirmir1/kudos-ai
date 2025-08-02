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
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showLearningExperience, setShowLearningExperience] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  useEffect(() => {
    loadLearningContent();
  }, []);

  const loadLearningContent = async () => {
    try {
      setLoading(true);
      
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('bootcamp_modules')
        .select('*')
        .order('module_order');

      if (modulesError) throw modulesError;

      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('bootcamp_topics')
        .select('*')
        .order('topic_order');

      if (topicsError) throw topicsError;

      // Fetch subtopics
      const { data: subtopicsData, error: subtopicsError } = await supabase
        .from('bootcamp_subtopics')
        .select('*')
        .order('subtopic_order');

      if (subtopicsError) throw subtopicsError;

      // Fetch curriculum for examples
      const { data: curriculumData, error: curriculumError } = await supabase
        .from('curriculum')
        .select('question_id, topic, subtopic, example_question, difficulty, pedagogical_notes')
        .limit(100);

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
    modules.forEach((module) => {
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
    const reviewWeeks = [
      { week: 37, title: "Number & Arithmetic Review", topics: ["Mental calculations", "Number properties", "Basic operations"], module: "Review", difficulty: "foundation", focus: "Consolidation" },
      { week: 38, title: "Fractions & Decimals Practice", topics: ["FDP conversions", "Fraction operations", "Decimal calculations"], module: "Review", difficulty: "intermediate", focus: "Application" },
      { week: 39, title: "Geometry Foundations", topics: ["Shape properties", "Area & perimeter", "Angle work"], module: "Review", difficulty: "intermediate", focus: "Spatial Skills" },
      { week: 40, title: "Problem Solving Workshop", topics: ["Multi-step problems", "Working backwards", "Logic puzzles"], module: "Practice", difficulty: "advanced", focus: "Strategy" },
      { week: 41, title: "Algebra & Patterns", topics: ["Simple equations", "Sequences", "Pattern recognition"], module: "Review", difficulty: "intermediate", focus: "Abstract Thinking" },
      { week: 42, title: "Data & Statistics", topics: ["Charts & graphs", "Averages", "Probability"], module: "Review", difficulty: "intermediate", focus: "Data Analysis" },
      { week: 43, title: "Mixed Practice 1", topics: ["Cross-topic problems", "Exam-style questions", "Time management"], module: "Practice", difficulty: "advanced", focus: "Integration" },
      { week: 44, title: "Measurement & Units", topics: ["Metric conversions", "Time problems", "Speed calculations"], module: "Review", difficulty: "foundation", focus: "Real-world Maths" },
      { week: 45, title: "Advanced Problem Solving", topics: ["Complex word problems", "Multi-step reasoning", "Strategy selection"], module: "Practice", difficulty: "advanced", focus: "Challenge" },
      { week: 46, title: "Mixed Practice 2", topics: ["Timed practice", "Weak area focus", "Mistake analysis"], module: "Practice", difficulty: "advanced", focus: "Exam Prep" },
      { week: 47, title: "Final Review - Foundations", topics: ["Core number skills", "Basic geometry", "Essential facts"], module: "Final Review", difficulty: "foundation", focus: "Confidence Building" },
      { week: 48, title: "Final Review - Applications", topics: ["Problem solving", "Real-world contexts", "Method selection"], module: "Final Review", difficulty: "intermediate", focus: "Application" },
      { week: 49, title: "Mock Exam Week 1", topics: ["Full practice papers", "Time management", "Exam technique"], module: "Assessment", difficulty: "advanced", focus: "Exam Simulation" },
      { week: 50, title: "Targeted Improvement", topics: ["Individual weak areas", "Personalized practice", "Confidence building"], module: "Personalized", difficulty: "mixed", focus: "Individual Needs" },
      { week: 51, title: "Mock Exam Week 2", topics: ["Final practice papers", "Performance review", "Last-minute tips"], module: "Assessment", difficulty: "advanced", focus: "Final Preparation" },
      { week: 52, title: "Ready for Success!", topics: ["Light review", "Confidence building", "Exam day preparation"], module: "Confidence", difficulty: "mixed", focus: "Readiness" }
    ];
    
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
      case 'foundation': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsTopicModalOpen(true);
  };

  const handleStartPractice = (topicId: string) => {
    setIsTopicModalOpen(false);
    setShowLearningExperience(true);
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
          <Button 
            variant="outline" 
            onClick={() => setShowLearningExperience(false)}
          >
            Back to Overview
          </Button>
        </div>
        <LearningExperience 
          onComplete={() => setShowLearningExperience(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Currently Learning Section - First Priority */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Currently Learning: Data Representation</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Foundation</p>
              <p className="text-sm text-muted-foreground">Skills: graphs, interpretation</p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              In Progress
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Learning Steps</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium">1</div>
                    <span className="font-medium">Concept Introduction</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Complete Step</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-muted-foreground text-white rounded-full flex items-center justify-center text-xs font-medium">2</div>
                    <span className="font-medium">Guided Practice</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-muted-foreground text-white rounded-full flex items-center justify-center text-xs font-medium">3</div>
                    <span className="font-medium">Independent Practice</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-muted-foreground text-white rounded-full flex items-center justify-center text-xs font-medium">4</div>
                    <span className="font-medium">Assessment</span>
                  </div>
                </div>
              </div>
            </div>
            <Button className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Start Learning Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skill Development Section - Second Priority */}
      <Card className="border-l-4 border-l-secondary">
        <CardHeader>
          <CardTitle className="text-xl">Skill Development</CardTitle>
          <p className="text-sm text-muted-foreground">Continue building your mathematical foundation</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Next Topic: Metric Units</span>
              <Badge variant="outline">Ready to Start</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Concept Introduction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                <span>Guided Practice</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                <span>Independent Practice</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                <span>Assessment</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Start Metric Units
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Learning Center</h1>
        <p className="text-muted-foreground">Navigate through your curriculum and master each concept step by step</p>
      </div>

      <Tabs defaultValue="plan" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plan">52-Week Plan</TabsTrigger>
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          <TabsTrigger value="topics">All Topics</TabsTrigger>
          <TabsTrigger value="curriculum">Sample Questions</TabsTrigger>
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
              {weeklyPlan.map((week) => (
                <Card key={week.week} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        Week {week.week}
                      </Badge>
                      <Badge className={getDifficultyColor(week.difficulty)} variant="secondary">
                        {week.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{week.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{week.module}</span>
                      <span>•</span>
                      <span>{week.focus}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <h6 className="text-sm font-medium text-muted-foreground">This week covers:</h6>
                      <div className="space-y-1">
                        {week.topics.map((topic, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-muted-foreground" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      disabled={false} // Placeholder for week unlocking logic
                      onClick={() => setShowLearningExperience(true)}
                    >
                      <Play className="h-3 w-3 mr-2" />
                      {week.week <= 36 ? 'Start Learning' : week.week <= 46 ? 'Practice' : week.week <= 50 ? 'Review' : 'Final Prep'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Module List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Choose a Module</h3>
              {modules.map((module) => (
                <Card 
                  key={module.id}
                  className={`cursor-pointer transition-colors ${
                    selectedModule === module.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedModule(module.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{module.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {module.weeks.length} weeks
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Module Details */}
            <div className="lg:col-span-2">
              {selectedModule && (
                <div className="space-y-4">
                  {(() => {
                    const module = modules.find(m => m.id === selectedModule);
                    const moduleTopics = getTopicsForModule(selectedModule);
                    
                    return (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle>{module?.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">Curriculum: {module?.curriculum_id}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{module?.weeks.length} weeks</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{moduleTopics.length} topics</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="space-y-3">
                          <h4 className="font-medium">Topics in this Module</h4>
                          {moduleTopics.map((topic) => {
                            const topicSubtopics = getSubtopicsForTopic(topic.id);
                            return (
                              <Card key={topic.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium">{topic.name}</h5>
                                    <Badge className={getDifficultyColor(topic.difficulty)}>
                                      {topic.difficulty}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{topic.skills?.length || 0} skills</span>
                                    <span>{topicSubtopics.length} subtopics</span>
                                  </div>
                                  {topicSubtopics.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                      {topicSubtopics.slice(0, 3).map((subtopic) => (
                                        <div key={subtopic.id} className="text-xs bg-muted rounded px-2 py-1 inline-block mr-2">
                                          {subtopic.name}
                                        </div>
                                      ))}
                                      {topicSubtopics.length > 3 && (
                                        <span className="text-xs text-muted-foreground">
                                          +{topicSubtopics.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic) => {
              const topicSubtopics = getSubtopicsForTopic(topic.id);
              const module = modules.find(m => m.id === topic.module_id);
              
              return (
                <Card key={topic.id} className="cursor-pointer hover:shadow-md transition-all" onClick={() => handleTopicClick(topic)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{topic.name}</CardTitle>
                      <Badge className={getDifficultyColor(topic.difficulty)}>
                        {topic.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Module: {module?.name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{topic.skills?.length || 0} skills</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{topicSubtopics.length} subtopics</span>
                        </div>
                      </div>
                      
                      {topicSubtopics.length > 0 && (
                        <div>
                          <h6 className="text-sm font-medium mb-2">Subtopics:</h6>
                          <div className="space-y-1">
                            {topicSubtopics.slice(0, 2).map((subtopic) => (
                              <div key={subtopic.id}>
                                <div className="text-sm font-medium">{subtopic.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {topic.skills && topic.skills.length > 0 && (
                        <div>
                          <h6 className="text-sm font-medium mb-2">Skills:</h6>
                          <div className="flex flex-wrap gap-1">
                            {topic.skills.slice(0, 3).map((skill, idx) => (
                              <span key={idx} className="text-xs bg-primary/10 text-primary rounded px-2 py-1">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTopicClick(topic);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="curriculum" className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sample Curriculum Questions</h3>
            {curriculum.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {curriculum.slice(0, 20).map((item) => (
                  <Card key={item.question_id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{item.topic}</Badge>
                            <Badge variant="outline">{item.subtopic}</Badge>
                            <Badge className={getDifficultyColor(item.difficulty)}>
                              {item.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-2">{item.example_question}</p>
                          {item.pedagogical_notes && (
                            <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                              <strong>Teaching Note:</strong> {item.pedagogical_notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No curriculum questions available. Generate some questions to populate the learning content.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <TopicLearningModal
        topic={selectedTopic}
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onStartPractice={handleStartPractice}
      />
    </div>
  );
};