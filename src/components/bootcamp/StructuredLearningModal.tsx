import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Target, 
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LearningContentLoader } from '@/lib/learningContentLoader';
import { 
  TopicLearningContent, 
  SubtopicLearningContent, 
  ConceptContent, 
  GuidedPracticeContent, 
  IndependentPracticeContent, 
  AssessmentContent 
} from './types/LearningContent';

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

interface LearningStage {
  id: string;
  title: string;
  type: 'concept' | 'guided' | 'independent' | 'assessment';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface StructuredLearningModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const learningStages: LearningStage[] = [
  {
    id: 'concept',
    title: 'Concept Introduction',
    type: 'concept',
    icon: BookOpen,
    description: 'Learn the fundamental concepts and theory'
  },
  {
    id: 'guided',
    title: 'Guided Practice',
    type: 'guided',
    icon: Users,
    description: 'Work through examples with step-by-step guidance'
  },
  {
    id: 'independent',
    title: 'Independent Practice',
    type: 'independent',
    icon: Target,
    description: 'Practice on your own to build confidence'
  },
  {
    id: 'assessment',
    title: 'Assessment',
    type: 'assessment',
    icon: ClipboardCheck,
    description: 'Test your understanding of the concepts'
  }
];

export function StructuredLearningModal({ topic, isOpen, onClose, onComplete }: StructuredLearningModalProps) {
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [learningContent, setLearningContent] = useState<TopicLearningContent | null>(null);

  useEffect(() => {
    if (topic && isOpen) {
      loadContent();
      setCurrentSubtopicIndex(0);
      setCurrentStageIndex(0);
      setCompletedStages(new Set());
    }
  }, [topic, isOpen]);

  const loadContent = async () => {
    if (!topic) return;
    
    setLoading(true);
    try {
      // Load subtopics from database
      const { data: subtopicsData, error } = await supabase
        .from('bootcamp_subtopics')
        .select('*')
        .eq('topic_id', topic.id)
        .order('subtopic_order');

      if (error) throw error;
      setSubtopics(subtopicsData || []);

      // Load learning content
      const content = await LearningContentLoader.loadTopicContent(topic.id);
      setLearningContent(content);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentSubtopic = subtopics[currentSubtopicIndex];
  const currentStage = learningStages[currentStageIndex];
  const totalSteps = subtopics.length * learningStages.length;
  const currentStep = currentSubtopicIndex * learningStages.length + currentStageIndex + 1;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleStageComplete = () => {
    const stageKey = `${currentSubtopicIndex}-${currentStageIndex}`;
    setCompletedStages(prev => new Set([...prev, stageKey]));
    
    // Move to next stage or subtopic
    if (currentStageIndex < learningStages.length - 1) {
      setCurrentStageIndex(currentStageIndex + 1);
    } else if (currentSubtopicIndex < subtopics.length - 1) {
      setCurrentSubtopicIndex(currentSubtopicIndex + 1);
      setCurrentStageIndex(0);
    } else {
      // All stages complete
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(currentStageIndex - 1);
    } else if (currentSubtopicIndex > 0) {
      setCurrentSubtopicIndex(currentSubtopicIndex - 1);
      setCurrentStageIndex(learningStages.length - 1);
    }
  };

  const handleNext = () => {
    if (currentStageIndex < learningStages.length - 1) {
      setCurrentStageIndex(currentStageIndex + 1);
    } else if (currentSubtopicIndex < subtopics.length - 1) {
      setCurrentSubtopicIndex(currentSubtopicIndex + 1);
      setCurrentStageIndex(0);
    }
  };

  const isStageCompleted = (subtopicIndex: number, stageIndex: number) => {
    return completedStages.has(`${subtopicIndex}-${stageIndex}`);
  };

  const canProceed = () => {
    const currentStageKey = `${currentSubtopicIndex}-${currentStageIndex}`;
    return completedStages.has(currentStageKey);
  };

  const getCurrentSubtopicContent = (): SubtopicLearningContent | null => {
    if (!learningContent || !currentSubtopic) return null;
    return learningContent.subtopics.find(
      s => s.subtopicId === currentSubtopic.id.toString() || s.subtopicName === currentSubtopic.name
    ) || null;
  };

  const renderStageContent = () => {
    if (!currentSubtopic || !currentStage) return null;

    const subtopicContent = getCurrentSubtopicContent();
    const stageContent = subtopicContent?.stages[currentStage.type];

    return (
      <div className="space-y-6">
        {/* Stage Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <currentStage.icon className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">{currentStage.title}</h3>
          </div>
          <p className="text-muted-foreground">{currentStage.description}</p>
          <Badge variant="outline" className="text-sm">
            {currentSubtopic.name}
          </Badge>
        </div>

        {/* Content Area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {currentStage.title}: {currentSubtopic.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStage.type === 'concept' && stageContent && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Key Concepts</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {stageContent.introduction}
                  </p>
                  <div className="space-y-2">
                    {(stageContent as ConceptContent).keyPoints?.map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{point}</span>
                      </div>
                    ))}
                  </div>
                  
                  {(stageContent as ConceptContent).examples && (stageContent as ConceptContent).examples.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h5 className="font-medium">Examples</h5>
                      {(stageContent as ConceptContent).examples.map((example, index) => (
                        <div key={index} className="bg-background border rounded-lg p-4">
                          <h6 className="font-medium mb-2">{example.title}</h6>
                          <p className="text-sm text-muted-foreground mb-2">{example.description}</p>
                          <p className="text-sm">{example.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {(stageContent as ConceptContent).realWorldApplications && (stageContent as ConceptContent).realWorldApplications.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Real-World Applications</h5>
                      <div className="space-y-1">
                        {(stageContent as ConceptContent).realWorldApplications.map((app, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Target className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                            <span className="text-sm">{app}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStage.type === 'guided' && stageContent && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Step-by-Step Practice</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {stageContent.introduction}
                  </p>
                  
                  {(stageContent as GuidedPracticeContent).stepByStepExamples?.map((example, index) => (
                    <div key={index} className="space-y-3">
                      <div className="bg-background border rounded-lg p-4">
                        <h5 className="font-medium mb-2">{example.title}</h5>
                        <p className="text-sm font-medium mb-3">Problem: {example.problem}</p>
                        
                        <div className="space-y-2">
                          {example.steps.map((step, stepIndex) => (
                            <div key={stepIndex} className="border-l-2 border-primary pl-4">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">Step {step.stepNumber}</Badge>
                              </div>
                              <p className="text-sm font-medium">{step.instruction}</p>
                              <p className="text-sm text-muted-foreground">{step.working}</p>
                              <p className="text-xs text-muted-foreground italic">{step.explanation}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                          <p className="text-sm font-medium">Answer: {example.finalAnswer}</p>
                          <p className="text-xs text-muted-foreground">{example.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStage.type === 'independent' && stageContent && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Practice on Your Own</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {stageContent.introduction}
                  </p>
                  
                  {(stageContent as IndependentPracticeContent).practiceProblems?.map((problem, index) => (
                    <div key={problem.id} className="bg-background border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Problem {index + 1}</h5>
                        <Badge variant="outline" className="text-xs">
                          {problem.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm mb-3">{problem.question}</p>
                      
                      {problem.type === 'multiple-choice' && problem.options && (
                        <div className="space-y-2">
                          {problem.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <div className="w-6 h-6 border rounded flex items-center justify-center text-xs">
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <span className="text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {(stageContent as IndependentPracticeContent).selfCheckQuestions && (stageContent as IndependentPracticeContent).selfCheckQuestions.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Self-Check Questions</h5>
                      <div className="space-y-2">
                        {(stageContent as IndependentPracticeContent).selfCheckQuestions.map((question, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStage.type === 'assessment' && stageContent && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Check Your Understanding</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {stageContent.introduction}
                  </p>
                  
                  <div className="bg-background border rounded-lg p-4 mb-4">
                    <h5 className="font-medium mb-2">Assessment Criteria</h5>
                    <p className="text-sm text-muted-foreground">
                      You need to score at least {(stageContent as AssessmentContent).passingCriteria.minimumScore}% 
                      ({Math.ceil((stageContent as AssessmentContent).passingCriteria.totalQuestions * (stageContent as AssessmentContent).passingCriteria.minimumScore / 100)} out of {(stageContent as AssessmentContent).passingCriteria.totalQuestions} questions correct) to pass.
                    </p>
                  </div>
                  
                  {(stageContent as AssessmentContent).questions?.slice(0, 2).map((question, index) => (
                    <div key={question.id} className="bg-background border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Question {index + 1}</h5>
                        <Badge variant="outline" className="text-xs">
                          {question.points} point{question.points > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <p className="text-sm mb-3">{question.question}</p>
                      
                      {question.type === 'multiple-choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <div className="w-6 h-6 border rounded flex items-center justify-center text-xs">
                                {String.fromCharCode(65 + optIndex)}
                              </div>
                              <span className="text-sm">{option}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback content if no structured content is available */}
            {!stageContent && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 rounded-lg p-6">
                  <h4 className="font-semibold mb-3">{currentStage.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Content for {currentSubtopic.name} {currentStage.title.toLowerCase()} will be loaded from your provided JSON data.
                  </p>
                  <div className="bg-background border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      Structured learning content will appear here once you provide the JSON data.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleStageComplete}
                className="px-8"
                disabled={isStageCompleted(currentSubtopicIndex, currentStageIndex)}
              >
                {isStageCompleted(currentSubtopicIndex, currentStageIndex) ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    Complete {currentStage.title}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!topic) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-primary" />
            Learning: {topic.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress: Step {currentStep} of {totalSteps}</span>
                  <span>{Math.round(progressPercentage)}% Complete</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                
                {/* Subtopic Navigation */}
                <div className="flex flex-wrap gap-2">
                  {subtopics.map((subtopic, index) => (
                    <div key={subtopic.id} className="flex items-center gap-1">
                      <Badge 
                        variant={index === currentSubtopicIndex ? "default" : "outline"}
                        className="text-xs"
                      >
                        {subtopic.name}
                      </Badge>
                      {index < subtopics.length - 1 && (
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Stage Navigation */}
                <div className="grid grid-cols-4 gap-2">
                  {learningStages.map((stage, index) => {
                    const StageIcon = stage.icon;
                    const isCompleted = isStageCompleted(currentSubtopicIndex, index);
                    const isCurrent = index === currentStageIndex;
                    
                    return (
                      <div
                        key={stage.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${
                          isCurrent 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : isCompleted
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800'
                            : 'bg-background border-border'
                        }`}
                      >
                        <StageIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{stage.title}</span>
                        {isCompleted && <CheckCircle className="h-3 w-3 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading learning content...</p>
              </div>
            </div>
          ) : (
            renderStageContent()
          )}

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSubtopicIndex === 0 && currentStageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Exit Learning
              </Button>
              
              {currentStep < totalSteps && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  variant={canProceed() ? "default" : "outline"}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              
              {currentStep === totalSteps && (
                <Button onClick={onComplete}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Learning
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}