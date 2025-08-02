import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { StructuredLearningModal } from './StructuredLearningModal';
import { 
  BookOpen, 
  Target, 
  Brain, 
  ArrowRight, 
  CheckCircle,
  Lightbulb,
  ClipboardList,
  Play,
  GraduationCap
} from 'lucide-react';

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

interface CurriculumContent {
  id: string;
  topic_id: string;
  stage_type: string;
  title: string;
  description: string;
  content: any;
  stage_order: number;
  estimated_time_minutes: number;
}

interface TopicLearningModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onStartPractice?: (topicId: string) => void;
}

export function TopicLearningModal({ topic, isOpen, onClose, onStartPractice }: TopicLearningModalProps) {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [sampleQuestions, setSampleQuestions] = useState<CurriculumItem[]>([]);
  const [curriculumContent, setCurriculumContent] = useState<CurriculumContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showStructuredLearning, setShowStructuredLearning] = useState(false);

  useEffect(() => {
    if (topic && isOpen) {
      loadTopicContent();
    }
  }, [topic, isOpen]);

  const loadTopicContent = async () => {
    if (!topic) return;
    
    setLoading(true);
    try {
      // Fetch curriculum content for this topic
      const { data: contentData, error: contentError } = await supabase
        .from('bootcamp_curriculum_content')
        .select('*')
        .eq('topic_id', topic.id)
        .order('stage_order');

      if (contentError) throw contentError;

      // Fetch subtopics for this topic
      const { data: subtopicsData, error: subtopicsError } = await supabase
        .from('bootcamp_subtopics')
        .select('*')
        .eq('topic_id', topic.id)
        .order('subtopic_order');

      if (subtopicsError) throw subtopicsError;

      // Fetch sample questions from curriculum that match this topic
      const { data: curriculumData, error: curriculumError } = await supabase
        .from('curriculum')
        .select('question_id, topic, subtopic, example_question, difficulty, pedagogical_notes')
        .ilike('topic', `%${topic.name}%`)
        .limit(10);

      if (curriculumError) throw curriculumError;

      setCurriculumContent(contentData || []);
      setSubtopics(subtopicsData || []);
      setSampleQuestions(curriculumData || []);
    } catch (error) {
      console.error('Error loading topic content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'foundation': case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getLearningContent = () => {
    if (curriculumContent.length === 0) {
      return {
        overview: `Comprehensive learning materials for ${topic.name} are being prepared. This topic will help you develop essential mathematical skills and understanding.`,
        keySkills: topic.skills || [],
        learningObjectives: [],
        tips: []
      };
    }

    // Extract content from curriculum data
    const overview = curriculumContent.find(c => c.stage_type === 'introduction')?.description || 
                    curriculumContent.find(c => c.title)?.description ||
                    `Learn ${topic.name} with structured lessons, practice exercises, and real-world applications.`;
    
    const skills = curriculumContent
      .filter(c => c.stage_type === 'concept' || c.content?.skills)
      .flatMap(c => c.content?.skills || [])
      .filter(Boolean);

    const objectives = curriculumContent
      .filter(c => c.content?.objectives || c.content?.learningObjectives)
      .flatMap(c => c.content?.objectives || c.content?.learningObjectives || [])
      .filter(Boolean);

    const tips = curriculumContent
      .filter(c => c.content?.tips || c.content?.hints)
      .flatMap(c => c.content?.tips || c.content?.hints || [])
      .filter(Boolean);

    return {
      overview,
      keySkills: skills.length > 0 ? skills : topic.skills || [],
      learningObjectives: objectives,
      tips
    };
  };

  if (!topic) return null;

  const learningContent = getLearningContent();

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-primary" />
            Learning: {topic.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Topic Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Topic Overview
                </CardTitle>
                <Badge className={getDifficultyColor(topic.difficulty)}>
                  {topic.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {learningContent.overview}
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="skills" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="skills">Key Skills</TabsTrigger>
              <TabsTrigger value="objectives">Learning Goals</TabsTrigger>
              <TabsTrigger value="subtopics">Breakdown</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="skills" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Essential Skills You'll Master
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learningContent.keySkills.map((skill, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="objectives" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningContent.learningObjectives.map((objective, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm">{objective}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subtopics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Topic Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subtopics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {subtopics.map((subtopic, index) => (
                        <div key={subtopic.id} className="flex items-center gap-3 p-3 bg-background border rounded-lg">
                          <div className="bg-secondary text-secondary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium">{subtopic.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Detailed subtopics will be available soon.</p>
                      <p className="text-sm">Focus on the core skills and objectives for now.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Sample Questions & Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sampleQuestions.length > 0 ? (
                    <div className="space-y-4">
                      {sampleQuestions.slice(0, 3).map((question) => (
                        <div key={question.question_id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{question.subtopic}</Badge>
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                          </div>
                          <p className="font-medium mb-2">{question.example_question}</p>
                          {question.pedagogical_notes && (
                            <div className="bg-muted p-3 rounded text-sm">
                              <strong>Teaching Tip:</strong> {question.pedagogical_notes}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Study Tips
                        </h4>
                        <div className="space-y-2">
                          {learningContent.tips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Sample questions will be generated based on your learning progress.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => setShowStructuredLearning(true)}
              size="lg"
              className="flex-1"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Start Learning Journey
            </Button>
            <Button
              onClick={() => onStartPractice?.(topic.id)}
              variant="outline"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              Quick Practice
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              size="lg"
            >
              Study Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Structured Learning Modal */}
    <StructuredLearningModal
      topic={topic}
      isOpen={showStructuredLearning}
      onClose={() => setShowStructuredLearning(false)}
      onComplete={() => {
        setShowStructuredLearning(false);
        onStartPractice?.(topic.id);
      }}
    />
    </>
  );
}