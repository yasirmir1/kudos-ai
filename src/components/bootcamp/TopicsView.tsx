import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Clock, ChevronRight, Play, Users, CheckCircle, Target } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

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

interface CurriculumItem {
  question_id: string;
  topic: string;
  subtopic: string;
  example_question: string;
  difficulty: string;
  pedagogical_notes: string;
}

interface TopicsViewProps {
  setCurrentView: (view: string) => void;
}

export const TopicsView: React.FC<TopicsViewProps> = ({ setCurrentView }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [modulesRes, topicsRes, subtopicsRes, curriculumRes] = await Promise.all([
        supabase.from('bootcamp_modules').select('*').order('module_order'),
        supabase.from('bootcamp_topics').select('*').order('topic_order'),
        supabase.from('bootcamp_subtopics').select('*').order('subtopic_order'),
        supabase.from('curriculum').select('question_id, topic, subtopic, example_question, difficulty, pedagogical_notes').limit(50)
      ]);

      if (modulesRes.error) throw modulesRes.error;
      if (topicsRes.error) throw topicsRes.error;
      if (subtopicsRes.error) throw subtopicsRes.error;
      if (curriculumRes.error) throw curriculumRes.error;

      setModules(modulesRes.data || []);
      setTopics(topicsRes.data || []);
      setSubtopics(subtopicsRes.data || []);
      setCurriculum(curriculumRes.data || []);
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Failed to load content');
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
    return curriculum.filter(item => 
      item.topic.toLowerCase().includes(topicName.toLowerCase()) ||
      item.subtopic.toLowerCase().includes(topicName.toLowerCase())
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'foundation': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'intermediate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'advanced': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'hard': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const TopicPopover = ({ topic, moduleData }: { topic: Topic; moduleData?: Module }) => {
    const topicSubtopics = getSubtopicsForTopic(topic.id);
    const sampleQuestions = getCurriculumForTopic(topic.name);

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{topic.name}</span>
            <Badge className={getDifficultyColor(topic.difficulty)} variant="outline">
              {topic.difficulty}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Module Info */}
          {moduleData && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Module</h4>
              <p className="font-medium">{moduleData.name}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{moduleData.weeks.length} weeks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>Order: {topic.topic_order}</span>
                </div>
              </div>
            </div>
          )}

          {/* Skills */}
          {topic.skills && topic.skills.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Key Skills ({topic.skills.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {topic.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-background border rounded">
                    <CheckCircle className="h-3 w-3 text-primary" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtopics */}
          {topicSubtopics.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Subtopics ({topicSubtopics.length})
              </h4>
              <div className="space-y-2">
                {topicSubtopics.map((subtopic) => (
                  <div key={subtopic.id} className="flex items-center gap-3 p-3 bg-background border rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {subtopic.subtopic_order}
                    </div>
                    <span className="flex-1">{subtopic.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Questions */}
          {sampleQuestions.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Play className="h-4 w-4" />
                Sample Questions ({sampleQuestions.length})
              </h4>
              <div className="space-y-3">
                {sampleQuestions.slice(0, 3).map((question) => (
                  <div key={question.question_id} className="border rounded-lg p-4 bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getDifficultyColor(question.difficulty)} variant="outline">
                        {question.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{question.subtopic}</span>
                    </div>
                    <p className="text-sm mb-2">{question.example_question}</p>
                    {question.pedagogical_notes && (
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        <span className="font-medium">Teaching note:</span> {question.pedagogical_notes}
                      </p>
                    )}
                  </div>
                ))}
                {sampleQuestions.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{sampleQuestions.length - 3} more questions available
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={() => setCurrentView('practice')} 
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Practicing {topic.name}
          </Button>
        </div>
      </DialogContent>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading topics...</span>
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
        <h1 className="text-2xl font-bold text-foreground mb-2">All Learning Topics</h1>
        <p className="text-muted-foreground">
          Explore {topics.length} topics across {modules.length} modules. Click any topic to see detailed content, subtopics, and sample questions.
        </p>
      </div>

      {modules.map((module) => {
        const moduleTopics = getTopicsForModule(module.id);
        if (moduleTopics.length === 0) return null;

        return (
          <div key={module.id} className="space-y-4">
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border">
              <h2 className="text-xl font-bold mb-2">{module.name}</h2>
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
                  <Target className="h-4 w-4" />
                  <span>Module {module.module_order}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moduleTopics.map((topic) => {
                const topicSubtopics = getSubtopicsForTopic(topic.id);
                const sampleQuestionsCount = getCurriculumForTopic(topic.name).length;

                return (
                  <Dialog key={topic.id}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] group">
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
                            {sampleQuestionsCount > 0 && (
                              <div className="flex items-center gap-1 text-xs">
                                <Play className="h-3 w-3" />
                                <span>{sampleQuestionsCount} sample questions</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <TopicPopover topic={topic} moduleData={module} />
                  </Dialog>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};