import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, BookOpen, Target, PenTool, ClipboardCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface LearningSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicName: string;
  onComplete: () => void;
}

interface LearningStage {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  content: string;
  completed: boolean;
}

export function LearningSessionModal({ isOpen, onClose, topicName, onComplete }: LearningSessionModalProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [stages, setStages] = useState<LearningStage[]>([
    {
      id: 1,
      title: "Concept Introduction",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Learn the fundamental concepts and theory",
      content: `Welcome to ${topicName}! Let's start with the basic concepts.

In this section, you'll learn:
• Core principles and definitions
• Visual representations and examples
• Real-world applications
• Key terminology

Take your time to understand each concept before moving forward. This foundation will help you succeed in the practice sections.`,
      completed: false
    },
    {
      id: 2,
      title: "Guided Practice",
      icon: <Target className="h-5 w-5" />,
      description: "Practice with step-by-step guidance",
      content: `Now let's practice together! I'll guide you through examples step by step.

In this guided practice, we'll:
• Work through examples together
• Break down complex problems into steps
• Identify common patterns and strategies
• Address frequent mistakes

Follow along and don't hesitate to review any step that needs clarification.`,
      completed: false
    },
    {
      id: 3,
      title: "Independent Practice",
      icon: <PenTool className="h-5 w-5" />,
      description: "Apply your knowledge independently",
      content: `Time to practice on your own! Use what you've learned to solve problems independently.

In this section, you'll:
• Solve problems without step-by-step guidance
• Apply strategies you've learned
• Build confidence in your abilities
• Identify areas that need more practice

Remember, making mistakes is part of learning. Take your time and think through each problem.`,
      completed: false
    },
    {
      id: 4,
      title: "Assessment",
      icon: <ClipboardCheck className="h-5 w-5" />,
      description: "Demonstrate your mastery",
      content: `Final assessment time! Show what you've learned in this topic.

This assessment will:
• Test your understanding of key concepts
• Evaluate your problem-solving skills
• Provide feedback on your progress
• Identify strengths and areas for improvement

Do your best and remember that this helps track your learning progress.`,
      completed: false
    }
  ]);

  const currentStageData = stages[currentStage];
  const progress = ((currentStage + 1) / stages.length) * 100;
  const completedStages = stages.filter(stage => stage.completed).length;

  const handleCompleteStage = () => {
    setStages(prev => prev.map((stage, index) => 
      index === currentStage ? { ...stage, completed: true } : stage
    ));

    if (currentStage < stages.length - 1) {
      setCurrentStage(currentStage + 1);
    } else {
      // All stages completed
      onComplete();
      onClose();
    }
  };

  const handlePreviousStage = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1);
    }
  };

  const handleNextStage = () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage(currentStage + 1);
    }
  };

  const isCurrentStageCompleted = stages[currentStage]?.completed;
  const canProceed = isCurrentStageCompleted || currentStage < completedStages;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Learning Session: {topicName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Session Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Stage {currentStage + 1} of {stages.length}
                  </p>
                </div>
                <Badge variant="secondary">
                  {completedStages} / {stages.length} Completed
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Stage Navigator */}
          <div className="grid grid-cols-4 gap-2">
            {stages.map((stage, index) => (
              <Card 
                key={stage.id}
                className={`cursor-pointer transition-all ${
                  index === currentStage 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : stage.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'opacity-60'
                }`}
                onClick={() => stage.completed || index <= completedStages ? setCurrentStage(index) : null}
              >
                <CardContent className="p-3">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`p-2 rounded-full ${
                      stage.completed 
                        ? 'bg-green-500 text-white' 
                        : index === currentStage 
                          ? 'bg-primary text-white' 
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {stage.completed ? <CheckCircle2 className="h-4 w-4" /> : stage.icon}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{stage.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Current Stage Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    currentStageData.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-primary text-white'
                  }`}>
                    {currentStageData.completed ? <CheckCircle2 className="h-5 w-5" /> : currentStageData.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{currentStageData.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{currentStageData.description}</p>
                  </div>
                </div>
                {currentStageData.completed && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="bg-muted/50 rounded-lg p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {currentStageData.content}
                  </pre>
                </div>
              </div>

              {/* Interactive Learning Area */}
              <div className="mt-6 p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                <p className="text-center text-muted-foreground">
                  Interactive learning content will be displayed here based on the specific module and stage.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline"
              onClick={handlePreviousStage}
              disabled={currentStage === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {!isCurrentStageCompleted && (
                <Button onClick={handleCompleteStage}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Stage
                </Button>
              )}
              
              {isCurrentStageCompleted && currentStage < stages.length - 1 && (
                <Button onClick={handleNextStage}>
                  Next Stage
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}

              {currentStage === stages.length - 1 && isCurrentStageCompleted && (
                <Button onClick={() => { onComplete(); onClose(); }} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Complete Learning Session
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}