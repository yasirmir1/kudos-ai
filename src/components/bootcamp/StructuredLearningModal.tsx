import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Target, ClipboardCheck, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LearningContentLoader } from '@/lib/learningContentLoader';
import { TopicLearningContent, SubtopicLearningContent, ConceptContent, GuidedPracticeContent, IndependentPracticeContent, AssessmentContent } from './types/LearningContent';
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
  icon: React.ComponentType<{
    className?: string;
  }>;
  description: string;
}
interface StructuredLearningModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}
const learningStages: LearningStage[] = [{
  id: 'concept',
  title: 'Learn It!',
  type: 'concept',
  icon: BookOpen,
  description: 'Discover new ideas and understand how they work'
}, {
  id: 'guided',
  title: 'Try Together',
  type: 'guided',
  icon: Users,
  description: 'Work through examples step by step with help'
}, {
  id: 'independent',
  title: 'Do It Yourself',
  type: 'independent',
  icon: Target,
  description: 'Practice on your own to become awesome at it'
}, {
  id: 'assessment',
  title: 'Show What You Know',
  type: 'assessment',
  icon: ClipboardCheck,
  description: 'Prove you\'ve mastered the skill like a champion'
}];
export function StructuredLearningModal({
  topic,
  isOpen,
  onClose,
  onComplete
}: StructuredLearningModalProps) {
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
      const {
        data: subtopicsData,
        error
      } = await supabase.from('bootcamp_subtopics').select('*').eq('topic_id', topic.id).order('subtopic_order');
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
  const progressPercentage = currentStep / totalSteps * 100;
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
    return learningContent.subtopics.find(s => s.subtopicId === currentSubtopic.id.toString() || s.subtopicName === currentSubtopic.name) || null;
  };
  const renderStageContent = () => {
    if (!currentSubtopic || !currentStage) return null;
    const subtopicContent = getCurrentSubtopicContent();
    const stageContent = subtopicContent?.stages[currentStage.type];
    const isCompleted = isStageCompleted(currentSubtopicIndex, currentStageIndex);
    return <div className="space-y-4">
        {/* Stage Header */}
        <div className="text-center space-y-3">
          
          {/* Progress Celebration */}
          {isCompleted && <div className="animate-scale-in">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 rounded-full px-4 py-2 border border-green-200">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Awesome! You completed this step! 🎉</span>
              </div>
            </div>}
        </div>

        {/* Main Content Area */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">
                {currentStage.type === 'concept' ? '📚' : currentStage.type === 'guided' ? '🤝' : currentStage.type === 'independent' ? '💪' : '🏆'}
              </span>
              {currentStage.title}: {currentSubtopic.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStage.type === 'concept' && stageContent && <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💡</span>
                    <h4 className="text-lg font-bold">Cool Things to Learn!</h4>
                  </div>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {stageContent.introduction}
                  </p>
                  
                  <div className="space-y-4">
                    <h5 className="font-semibold text-lg flex items-center gap-2">
                      <span>🎯</span> Key Ideas You'll Master:
                    </h5>
                    <div className="grid gap-3">
                      {(stageContent as ConceptContent).keyPoints?.map((point, index) => <div key={index} className="flex items-start gap-3 bg-white/60 dark:bg-background/60 rounded-lg p-4 border hover:shadow-md transition-all">
                          <div className="bg-green-100 text-green-600 rounded-full p-1 mt-1">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium leading-relaxed">{point}</span>
                        </div>)}
                    </div>
                  </div>
                  
                  {(stageContent as ConceptContent).examples && (stageContent as ConceptContent).examples.length > 0 && <div className="mt-6 space-y-4">
                      <h5 className="font-semibold text-lg flex items-center gap-2">
                        <span>📝</span> Fun Examples:
                      </h5>
                      {(stageContent as ConceptContent).examples.map((example, index) => <div key={index} className="bg-white dark:bg-background border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4 hover:shadow-md transition-all">
                          <h6 className="font-bold mb-2 text-blue-700 dark:text-blue-300">{example.title}</h6>
                          <p className="text-sm text-muted-foreground mb-3">{example.description}</p>
                          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
                            <p className="text-sm font-medium">{example.explanation}</p>
                          </div>
                        </div>)}
                    </div>}

                  {(stageContent as ConceptContent).realWorldApplications && (stageContent as ConceptContent).realWorldApplications.length > 0 && <div className="mt-6">
                      <h5 className="font-semibold text-lg flex items-center gap-2 mb-4">
                        <span>🌟</span> How You'll Use This in Real Life:
                      </h5>
                      <div className="grid gap-3">
                        {(stageContent as ConceptContent).realWorldApplications.map((app, index) => <div key={index} className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
                            <span className="text-lg">✨</span>
                            <span className="text-sm font-medium">{app}</span>
                          </div>)}
                      </div>
                    </div>}
                </div>
              </div>}

            {currentStage.type === 'guided' && stageContent && <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🤝</span>
                    <h4 className="text-lg font-bold">Let's Practice Together!</h4>
                  </div>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {stageContent.introduction}
                  </p>
                  
                  {(stageContent as GuidedPracticeContent).stepByStepExamples?.map((example, index) => <div key={index} className="space-y-4">
                      <div className="bg-white dark:bg-background border-2 border-green-200 dark:border-green-700 rounded-lg p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl">📋</span>
                          <h5 className="text-lg font-bold text-green-700 dark:text-green-300">{example.title}</h5>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 mb-4">
                          <h6 className="font-semibold mb-2 flex items-center gap-2">
                            <span>🎯</span> Problem to Solve:
                          </h6>
                          <p className="text-sm font-medium">{example.problem}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <h6 className="font-semibold flex items-center gap-2">
                            <span>👣</span> Follow These Steps:
                          </h6>
                          {example.steps.map((step, stepIndex) => <div key={stepIndex} className="border-l-4 border-primary pl-4 bg-primary/5 rounded-r-lg p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="default" className="text-xs font-bold">Step {step.stepNumber}</Badge>
                              </div>
                              <p className="text-sm font-bold mb-1">{step.instruction}</p>
                              <p className="text-sm text-muted-foreground mb-1">{step.working}</p>
                              <p className="text-xs text-blue-600 dark:text-blue-400 italic bg-blue-50 dark:bg-blue-950 p-2 rounded">
                                💡 Why: {step.explanation}
                              </p>
                            </div>)}
                        </div>
                        
                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">🎉</span>
                            <h6 className="font-bold text-green-700 dark:text-green-300">Final Answer:</h6>
                          </div>
                          <p className="text-sm font-bold mb-2">{example.finalAnswer}</p>
                          <p className="text-xs text-green-600 dark:text-green-400">{example.explanation}</p>
                        </div>
                      </div>
                    </div>)}
                </div>
              </div>}

            {currentStage.type === 'independent' && stageContent && <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💪</span>
                    <h4 className="text-lg font-bold">You've Got This! Try On Your Own</h4>
                  </div>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {stageContent.introduction}
                  </p>
                  
                  <div className="space-y-4">
                    <h5 className="font-semibold text-lg flex items-center gap-2">
                      <span>🧩</span> Practice Problems:
                    </h5>
                    {(stageContent as IndependentPracticeContent).practiceProblems?.map((problem, index) => <div key={problem.id} className="bg-white dark:bg-background border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-5 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔥</span>
                            <h5 className="font-bold">Challenge {index + 1}</h5>
                          </div>
                          <Badge variant="outline" className={`text-xs font-bold ${problem.difficulty === 'easy' ? 'bg-green-50 text-green-600 border-green-200' : problem.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                            {problem.difficulty === 'easy' ? '😊 Easy' : problem.difficulty === 'medium' ? '🤔 Medium' : '🔥 Hard'}
                          </Badge>
                        </div>
                        
                        <div className="bg-yellow-50 dark:bg-yellow-950 rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium leading-relaxed">{problem.question}</p>
                        </div>
                        
                        {problem.type === 'multiple-choice' && problem.options && <div className="space-y-3">
                            <h6 className="font-semibold text-sm">Choose your answer:</h6>
                            <div className="grid gap-2">
                              {problem.options.map((option, optIndex) => <div key={optIndex} className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                                    {String.fromCharCode(65 + optIndex)}
                                  </div>
                                  <span className="text-sm font-medium">{option}</span>
                                </div>)}
                            </div>
                          </div>}
                      </div>)}
                  </div>

                  {(stageContent as IndependentPracticeContent).selfCheckQuestions && (stageContent as IndependentPracticeContent).selfCheckQuestions.length > 0 && <div className="mt-6 bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h5 className="font-semibold text-lg flex items-center gap-2 mb-4">
                        <span>🤔</span> Quick Self-Check:
                      </h5>
                      <div className="space-y-3">
                        {(stageContent as IndependentPracticeContent).selfCheckQuestions.map((question, index) => <div key={index} className="flex items-start gap-3 bg-white dark:bg-background rounded-lg p-3">
                            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-medium">{question}</span>
                          </div>)}
                      </div>
                    </div>}
                </div>
              </div>}

            {currentStage.type === 'assessment' && stageContent && <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🏆</span>
                    <h4 className="text-lg font-bold">Time to Shine! Show What You Know</h4>
                  </div>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                    {stageContent.introduction}
                  </p>
                  
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">📊</span>
                      <h5 className="font-bold text-lg">Success Goal:</h5>
                    </div>
                    <p className="text-sm font-medium">
                      Get at least <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{(stageContent as AssessmentContent).passingCriteria.minimumScore}%</span> correct! 
                      That means you need <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {Math.ceil((stageContent as AssessmentContent).passingCriteria.totalQuestions * (stageContent as AssessmentContent).passingCriteria.minimumScore / 100)}
                      </span> out of <span className="text-lg font-bold">{(stageContent as AssessmentContent).passingCriteria.totalQuestions}</span> questions right. You can do it! 🌟
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h5 className="font-semibold text-lg flex items-center gap-2">
                      <span>❓</span> Sample Questions:
                    </h5>
                    {(stageContent as AssessmentContent).questions?.slice(0, 2).map((question, index) => <div key={question.id} className="bg-white dark:bg-background border-2 border-purple-200 dark:border-purple-700 rounded-lg p-5 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💎</span>
                            <h5 className="font-bold">Question {index + 1}</h5>
                          </div>
                          <Badge variant="outline" className="text-xs font-bold bg-purple-50 text-purple-600 border-purple-200">
                            {question.points} {question.points > 1 ? 'points' : 'point'} ⭐
                          </Badge>
                        </div>
                        
                        <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium leading-relaxed">{question.question}</p>
                        </div>
                        
                        {question.type === 'multiple-choice' && question.options && <div className="space-y-3">
                            <h6 className="font-semibold text-sm">Pick the best answer:</h6>
                            <div className="grid gap-2">
                              {question.options.map((option, optIndex) => <div key={optIndex} className="flex items-center gap-3 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all cursor-pointer">
                                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {String.fromCharCode(65 + optIndex)}
                                  </div>
                                  <span className="text-sm font-medium">{option}</span>
                                </div>)}
                            </div>
                          </div>}
                      </div>)}
                  </div>
                </div>
              </div>}

            {/* Fallback content if no structured content is available */}
            {!stageContent && <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 border-2 border-dashed border-muted-foreground/20">
                  <div className="text-center space-y-3">
                    <div className="text-4xl">📚</div>
                    <h4 className="text-lg font-bold">Getting Your Learning Content Ready!</h4>
                    <p className="text-muted-foreground text-lg">
                      Amazing content for <span className="font-semibold text-primary">{currentSubtopic.name}</span> is being prepared just for you!
                    </p>
                    <div className="bg-white dark:bg-background border-2 border-primary/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        When your teacher adds the lesson content, you'll see fun examples, step-by-step guides, and cool practice problems right here! 🎉
                      </p>
                    </div>
                  </div>
                </div>
              </div>}

            {/* Action Button */}
            <div className="flex justify-center pt-4">
              <Button onClick={handleStageComplete} className={`px-6 py-3 font-semibold transition-colors ${isCompleted ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`} disabled={isCompleted} size="lg">
                {isCompleted ? <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Awesome! You Did It! 🎉
                  </> : <>
                    <span className="mr-2">
                      {currentStage.type === 'concept' ? '🎓' : currentStage.type === 'guided' ? '🤝' : currentStage.type === 'independent' ? '💪' : '🏆'}
                    </span>
                    I Finished {currentStage.title}!
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>;
  };
  if (!topic) return null;
  
  console.log('StructuredLearningModal render:', { 
    isOpen, 
    topic: topic?.name, 
    currentSubtopic: currentSubtopic?.name,
    currentStage: currentStage?.title,
    loading 
  });

  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-[90vw] max-h-[85vh] overflow-y-auto relative bg-background border shadow-lg">
        {/* Topic Badge - Top Right */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-muted rounded-full px-4 py-2 border z-10">
          <span className="text-lg">🎯</span>
          <span className="font-medium">{currentSubtopic?.name}</span>
        </div>
        
        <DialogHeader className="pb-3 pr-40">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-primary rounded-lg text-primary-foreground">
              <currentStage.icon className="h-6 w-6" />
            </div>
            <div className="text-left">
              <div className="text-xl font-bold">{currentStage.title}</div>
              <div className="text-sm text-muted-foreground font-normal">{currentStage.description}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <Card className="border shadow-sm">
            <CardContent className="pt-4">
              <div className="space-y-4">
                {/* Subtopic Navigation - Like a Fun Journey Map */}
                <div className="space-y-3">
                  <h6 className="font-semibold flex items-center gap-2">
                    <span>🗺️</span> Your Learning Adventure:
                  </h6>
                  <div className="flex flex-wrap gap-3">
                    {subtopics.map((subtopic, index) => <div key={subtopic.id} className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all ${index === currentSubtopicIndex ? 'bg-primary text-primary-foreground border-primary shadow-lg transform scale-105' : index < currentSubtopicIndex ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400'}`}>
                          <span className="text-sm">
                            {index < currentSubtopicIndex ? '✅' : index === currentSubtopicIndex ? '🎯' : '⭐'}
                          </span>
                          <span className="text-xs font-medium">{subtopic.name}</span>
                        </div>
                        {index < subtopics.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </div>)}
                  </div>
                </div>

                {/* Stage Navigation - Like Game Levels */}
                <div className="space-y-3">
                  <h6 className="font-semibold flex items-center gap-2">
                    <span>🎮</span> Current Level Progress:
                  </h6>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {learningStages.map((stage, index) => {
                    const StageIcon = stage.icon;
                    const isCompleted = isStageCompleted(currentSubtopicIndex, index);
                    const isCurrent = index === currentStageIndex;
                    return <div key={stage.id} className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${isCurrent ? 'bg-primary text-primary-foreground border-primary shadow-md' : isCompleted ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300' : 'bg-muted border-muted-foreground/20 text-muted-foreground'}`}>
                          {isCompleted && <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                              <CheckCircle className="h-4 w-4" />
                            </div>}
                          <StageIcon className="h-6 w-6" />
                          <span className="font-medium text-center leading-tight">{stage.title}</span>
                          <span className="text-xs opacity-80 text-center">{stage.description}</span>
                        </div>;
                  })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          {loading ? <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading learning content...</p>
              </div>
            </div> : renderStageContent()}

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={handlePrevious} disabled={currentSubtopicIndex === 0 && currentStageIndex === 0} size="lg" className="font-semibold">
              <ChevronLeft className="h-5 w-5 mr-2" />
              Go Back
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} size="lg" className="font-semibold">
                <Pause className="h-4 w-4 mr-2" />
                Take a Break
              </Button>
              
              {currentStep < totalSteps && <Button onClick={handleNext} disabled={!canProceed()} variant={canProceed() ? "default" : "outline"} size="lg" className="font-semibold">
                  What's Next?
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>}
              
              {currentStep === totalSteps && <Button onClick={onComplete} size="lg" className="bg-green-500 hover:bg-green-600 text-white font-bold">
                  <span className="mr-2">🎉</span>
                  I'm a Champion!
                  <CheckCircle className="h-5 w-5 ml-2" />
                </Button>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}