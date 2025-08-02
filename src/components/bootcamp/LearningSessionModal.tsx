import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, BookOpen, Target, PenTool, ClipboardCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface AssessmentQuestion {
  question: string;
  type: 'numeric_entry' | 'multiple_choice' | 'written_answer';
  options?: string[];
}

interface TopicContent {
  concept_introduction: string;
  complete_step: {
    example: string;
  };
  guided_practice: string[];
  independent_practice: string[];
  assessment: AssessmentQuestion[];
}

interface CurriculumTopic {
  topic_id: string;
  topic_name: string;
  content: TopicContent;
}

interface LearningSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicName: string;
  onComplete: () => void;
  curriculumData?: CurriculumTopic;
}

interface LearningStage {
  id: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  completed: boolean;
}

// Sample curriculum data - you can replace this with dynamic data
const sampleCurriculumData: CurriculumTopic[] = [
  {
    "topic_id": "npv1",
    "topic_name": "Reading and Writing Large Numbers",
    "content": {
      "concept_introduction": "Learn to read and write large numbers up to 10,000,000, understanding place value and how to write numbers in standard and word forms.",
      "complete_step": {
        "example": "The number 5,203,014 is read as five million, two hundred three thousand, fourteen."
      },
      "guided_practice": [
        "Write the following numbers in words: 3,405; 48,219; 1,302,058"
      ],
      "independent_practice": [
        "Write these numbers in numerals: Two thousand, six hundred and five; Forty-five thousand and eighty-nine; One million, three hundred twenty-two thousand, seventeen"
      ],
      "assessment": [
        {
          "question": "What is the value of the 6 in 864,205?",
          "type": "numeric_entry"
        },
        {
          "question": "Circle the number that is written correctly in words:",
          "type": "multiple_choice",
          "options": [
            "Two hundred forty three thousand, ten",
            "Two hundred forty-three thousand and ten",
            "Two hundred and forty three thousand and ten"
          ]
        }
      ]
    }
  }
];

export function LearningSessionModal({ isOpen, onClose, topicName, onComplete, curriculumData }: LearningSessionModalProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [stages, setStages] = useState<LearningStage[]>([
    {
      id: 1,
      title: "Concept Introduction",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Learn the fundamental concepts and theory",
      completed: false
    },
    {
      id: 2,
      title: "Guided Practice",
      icon: <Target className="h-5 w-5" />,
      description: "Practice with step-by-step guidance",
      completed: false
    },
    {
      id: 3,
      title: "Independent Practice",
      icon: <PenTool className="h-5 w-5" />,
      description: "Apply your knowledge independently",
      completed: false
    },
    {
      id: 4,
      title: "Assessment",
      icon: <ClipboardCheck className="h-5 w-5" />,
      description: "Demonstrate your mastery",
      completed: false
    }
  ]);

  const [assessmentAnswers, setAssessmentAnswers] = useState<{[key: number]: string}>({});

  // Use provided curriculum data or fallback to sample data
  const currentTopic = curriculumData || sampleCurriculumData[0];
  const content = currentTopic.content;

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

  const handleAssessmentAnswer = (questionIndex: number, answer: string) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 0: // Concept Introduction
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">📚 Learning Objective</h4>
              <p className="text-blue-800 leading-relaxed">{content.concept_introduction}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-3">💡 Key Example</h4>
              <p className="text-green-800 leading-relaxed font-mono bg-white p-3 rounded border">
                {content.complete_step.example}
              </p>
            </div>
          </div>
        );

      case 1: // Guided Practice
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-lg p-6">
              <h4 className="font-semibold text-orange-900 mb-3">👨‍🏫 Let's Practice Together</h4>
              <p className="text-orange-800 mb-4">Work through these examples step by step:</p>
              
              <div className="space-y-3">
                {content.guided_practice.map((practice, index) => (
                  <div key={index} className="bg-white p-4 rounded border border-orange-200">
                    <p className="font-medium text-orange-900">Exercise {index + 1}:</p>
                    <p className="text-orange-800 mt-2">{practice}</p>
                    <div className="mt-3">
                      <Input 
                        placeholder="Work through this problem..." 
                        className="bg-orange-50 border-orange-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Independent Practice
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-6">
              <h4 className="font-semibold text-purple-900 mb-3">✏️ Your Turn to Practice</h4>
              <p className="text-purple-800 mb-4">Try these problems on your own:</p>
              
              <div className="space-y-3">
                {content.independent_practice.map((practice, index) => (
                  <div key={index} className="bg-white p-4 rounded border border-purple-200">
                    <p className="font-medium text-purple-900">Problem {index + 1}:</p>
                    <p className="text-purple-800 mt-2">{practice}</p>
                    <div className="mt-3">
                      <Textarea 
                        placeholder="Show your work here..." 
                        className="bg-purple-50 border-purple-200"
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Assessment
        return (
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-6">
              <h4 className="font-semibold text-red-900 mb-3">📝 Assessment Time</h4>
              <p className="text-red-800 mb-4">Show what you've learned:</p>
              
              <div className="space-y-4">
                {content.assessment.map((question, index) => (
                  <div key={index} className="bg-white p-4 rounded border border-red-200">
                    <p className="font-medium text-red-900 mb-3">Question {index + 1}:</p>
                    <p className="text-red-800 mb-3">{question.question}</p>
                    
                    {question.type === 'multiple_choice' && question.options && (
                      <RadioGroup 
                        value={assessmentAnswers[index] || ''} 
                        onValueChange={(value) => handleAssessmentAnswer(index, value)}
                      >
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`q${index}_o${optionIndex}`} />
                            <Label htmlFor={`q${index}_o${optionIndex}`} className="text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    
                    {question.type === 'numeric_entry' && (
                      <Input 
                        type="number"
                        placeholder="Enter your answer..." 
                        value={assessmentAnswers[index] || ''}
                        onChange={(e) => handleAssessmentAnswer(index, e.target.value)}
                        className="bg-red-50 border-red-200"
                      />
                    )}
                    
                    {question.type === 'written_answer' && (
                      <Textarea 
                        placeholder="Type your answer..." 
                        value={assessmentAnswers[index] || ''}
                        onChange={(e) => handleAssessmentAnswer(index, e.target.value)}
                        className="bg-red-50 border-red-200"
                        rows={2}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isCurrentStageCompleted = stages[currentStage]?.completed;
  const canProceed = isCurrentStageCompleted || currentStage < completedStages;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Learning Session: {currentTopic.topic_name}
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
              {renderStageContent()}
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