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

interface Module {
  module_id: string;
  module_name: string;
  description: string;
  weeks_allocated: number;
  module_order: number;
}

interface Topic {
  topic_id: string;
  topic_name: string;
  module_id: string;
  difficulty_level: string;
  estimated_questions: number;
  topic_order: number;
}

interface Subtopic {
  subtopic_id: string;
  subtopic_name: string;
  topic_id: string;
  learning_objectives: string[];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  useEffect(() => {
    loadLearningContent();
  }, []);

  const loadLearningContent = async () => {
    try {
      setLoading(true);
      
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('bootcamp_enhanced_modules')
        .select('*')
        .order('module_order');

      if (modulesError) throw modulesError;

      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('bootcamp_enhanced_topics')
        .select('*')
        .order('topic_order');

      if (topicsError) throw topicsError;

      // Fetch subtopics
      const { data: subtopicsData, error: subtopicsError } = await supabase
        .from('bootcamp_enhanced_subtopics')
        .select('*');

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
      
      if (modulesData && modulesData.length > 0) {
        setSelectedModule(modulesData[0].module_id);
      }
    } catch (err) {
      console.error('Error loading learning content:', err);
      setError('Failed to load learning content');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Learning Center</h1>
        <p className="text-muted-foreground">Navigate through your curriculum and master each concept step by step</p>
      </div>

      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules">Learning Modules</TabsTrigger>
          <TabsTrigger value="topics">All Topics</TabsTrigger>
          <TabsTrigger value="curriculum">Sample Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Module List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Choose a Module</h3>
              {modules.map((module) => (
                <Card 
                  key={module.module_id}
                  className={`cursor-pointer transition-colors ${
                    selectedModule === module.module_id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedModule(module.module_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{module.module_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {module.weeks_allocated} weeks
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
                    const module = modules.find(m => m.module_id === selectedModule);
                    const moduleTopics = getTopicsForModule(selectedModule);
                    
                    return (
                      <>
                        <Card>
                          <CardHeader>
                            <CardTitle>{module?.module_name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">{module?.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{module?.weeks_allocated} weeks</span>
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
                            const topicSubtopics = getSubtopicsForTopic(topic.topic_id);
                            return (
                              <Card key={topic.topic_id}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium">{topic.topic_name}</h5>
                                    <Badge className={getDifficultyColor(topic.difficulty_level)}>
                                      {topic.difficulty_level}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{topic.estimated_questions} questions</span>
                                    <span>{topicSubtopics.length} subtopics</span>
                                  </div>
                                  {topicSubtopics.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                      {topicSubtopics.slice(0, 3).map((subtopic) => (
                                        <div key={subtopic.subtopic_id} className="text-xs bg-muted rounded px-2 py-1 inline-block mr-2">
                                          {subtopic.subtopic_name}
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
              const topicSubtopics = getSubtopicsForTopic(topic.topic_id);
              const module = modules.find(m => m.module_id === topic.module_id);
              
              return (
                <Card key={topic.topic_id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{topic.topic_name}</CardTitle>
                      <Badge className={getDifficultyColor(topic.difficulty_level)}>
                        {topic.difficulty_level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Module: {module?.module_name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{topic.estimated_questions} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{topicSubtopics.length} subtopics</span>
                        </div>
                      </div>
                      
                      {topicSubtopics.length > 0 && (
                        <div>
                          <h6 className="text-sm font-medium mb-2">Learning Objectives:</h6>
                          <div className="space-y-1">
                            {topicSubtopics.slice(0, 2).map((subtopic) => (
                              <div key={subtopic.subtopic_id}>
                                <div className="text-sm font-medium">{subtopic.subtopic_name}</div>
                                {subtopic.learning_objectives && subtopic.learning_objectives.length > 0 && (
                                  <ul className="text-xs text-muted-foreground ml-2">
                                    {subtopic.learning_objectives.slice(0, 2).map((objective, idx) => (
                                      <li key={idx}>• {objective}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <Button className="w-full" size="sm">
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
    </div>
  );
};