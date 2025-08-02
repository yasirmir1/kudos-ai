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

interface TopicLearningModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onStartPractice?: (topicId: string) => void;
}

export function TopicLearningModal({ topic, isOpen, onClose, onStartPractice }: TopicLearningModalProps) {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [sampleQuestions, setSampleQuestions] = useState<CurriculumItem[]>([]);
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

  const generateLearningContent = (topicName: string) => {
    // Generate dynamic learning content based on topic name
    if (topicName.toLowerCase().includes('metric')) {
      return {
        overview: "Metric units form the foundation of scientific measurement. This system uses base-10 relationships, making conversions straightforward through multiplication and division by powers of 10.",
        keySkills: [
          "Understanding metric prefixes (kilo-, centi-, milli-)",
          "Converting between metric units",
          "Applying metric measurements in real-world contexts",
          "Comparing metric and imperial units"
        ],
        learningObjectives: [
          "Master the metric system hierarchy",
          "Perform accurate unit conversions",
          "Solve practical measurement problems",
          "Recognize appropriate units for different contexts"
        ],
        tips: [
          "Remember: King Henry Died By Drinking Chocolate Milk (km, hm, dam, m, dm, cm, mm)",
          "Moving right in the metric ladder means multiplying by 10",
          "Moving left means dividing by 10",
          "Always check if your answer makes sense in context"
        ]
      };
    }
    
    // Default content structure for other topics
    return {
      overview: `${topicName} is a fundamental mathematical concept that builds important problem-solving skills and mathematical understanding.`,
      keySkills: [
        `Understanding core ${topicName.toLowerCase()} concepts`,
        `Applying ${topicName.toLowerCase()} in various contexts`,
        `Problem-solving with ${topicName.toLowerCase()}`,
        `Making connections to real-world applications`
      ],
      learningObjectives: [
        `Master the fundamentals of ${topicName.toLowerCase()}`,
        `Develop fluency in related calculations`,
        `Apply knowledge to solve complex problems`,
        `Build confidence in mathematical reasoning`
      ],
      tips: [
        `Practice regularly to build fluency`,
        `Look for patterns and connections`,
        `Use visual aids when helpful`,
        `Always check your work`
      ]
    };
  };

  if (!topic) return null;

  const learningContent = generateLearningContent(topic.name);

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

          <Tabs defaultValue="concept" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="concept">1. Concept Introduction</TabsTrigger>
              <TabsTrigger value="guided">2. Guided Practice</TabsTrigger>
              <TabsTrigger value="independent">3. Independent Practice</TabsTrigger>
              <TabsTrigger value="assessment">4. Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="concept" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Concept Introduction
                    <Badge className="ml-2 bg-green-100 text-green-800">Complete Step</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 space-y-4">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold">Getting Your Learning Content Ready!</h3>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                      Amazing content for {topic.name} is being prepared just for you!
                    </p>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                      When your teacher adds the lesson content, you'll see fun examples, step-by-step guides, and cool practice problems right here! 🎉
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guided" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Guided Practice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 space-y-4">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold">Getting Your Learning Content Ready!</h3>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                      Amazing content for {topic.name} is being prepared just for you!
                    </p>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                      When your teacher adds the lesson content, you'll see fun examples, step-by-step guides, and cool practice problems right here! 🎉
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="independent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Independent Practice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 space-y-4">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold">Getting Your Learning Content Ready!</h3>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                      Amazing content for {topic.name} is being prepared just for you!
                    </p>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                      When your teacher adds the lesson content, you'll see fun examples, step-by-step guides, and cool practice problems right here! 🎉
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 space-y-4">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold">Getting Your Learning Content Ready!</h3>
                    <p className="text-lg text-muted-foreground max-w-md mx-auto">
                      Amazing content for {topic.name} is being prepared just for you!
                    </p>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                      When your teacher adds the lesson content, you'll see fun examples, step-by-step guides, and cool practice problems right here! 🎉
                    </p>
                  </div>
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