import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Brain, 
  AlertTriangle, 
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { useMisconceptionDetection } from '@/hooks/useMisconceptionDetection';
import { useBootcampDatabase, BootcampQuestion } from '@/hooks/useBootcampDatabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnhancedQuestionInterfaceProps {
  question: BootcampQuestion;
  onAnswer: (response: QuestionResponse) => void;
  questionNumber: number;
  totalQuestions: number;
  showConfidenceRating?: boolean;
  showContextualHints?: boolean;
}

interface QuestionResponse {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  confidence: number;
  misconception?: string;
  feedback: string;
}

interface MisconceptionIntervention {
  intervention_type: string;
  intervention_data: any;
  remediation_strategy: string;
}

export const EnhancedQuestionInterface: React.FC<EnhancedQuestionInterfaceProps> = ({
  question,
  onAnswer,
  questionNumber,
  totalQuestions,
  showConfidenceRating = true,
  showContextualHints = true
}) => {
  const { student } = useBootcampDatabase();
  
  // Question state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [confidence, setConfidence] = useState([0.7]); // Default confidence: 70%
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  
  // Enhanced feedback state
  const [misconceptionDetails, setMisconceptionDetails] = useState<MisconceptionIntervention | null>(null);
  const [showWorkedExample, setShowWorkedExample] = useState(false);
  const [adaptiveHint, setAdaptiveHint] = useState<string | null>(null);
  
  // Initialize misconception detection hook
  const { detectMisconception, isDetecting } = useMisconceptionDetection();

  // Timer
  useEffect(() => {
    if (!isAnswered) {
      const timer = setInterval(() => setTimeSpent(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isAnswered]);

  const handleAnswerSelect = (optionLetter: string) => {
    if (selectedAnswer || isAnswered) return;
    setSelectedAnswer(optionLetter);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !student) return;

    setIsAnswered(true);
    setShowFeedback(true);

    const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);
    
    // Use optimized misconception detection with local rules and caching
    const isCorrect = selectedAnswer === question.correct_answer;
    let misconception = '';
    let misconceptionSeverity = 'low';
    let cachedExplanation: string | undefined;
    
    if (!isCorrect) {
      try {
        // Use optimized detection with caching
        const detectionResult = await detectMisconception(
          student.student_id,
          question.question_id,
          selectedAnswer,
          question.correct_answer
        );
        
        misconception = detectionResult.misconceptionCode || '';
        cachedExplanation = detectionResult.explanation;
        
        // Determine severity based on confidence and frequency
        if (confidence[0] > 0.8) {
          misconceptionSeverity = 'high'; // High confidence but wrong = serious misconception
        } else if (confidence[0] > 0.5) {
          misconceptionSeverity = 'medium';
        }

        // Set intervention details if misconception detected
        if (misconception) {
          setMisconceptionDetails({
            intervention_type: 'explanation',
            intervention_data: { 
              steps: ['Review the concept', 'Practice similar problems'],
              explanation: cachedExplanation
            },
            remediation_strategy: 'Review and practice'
          });
        }
      } catch (error) {
        console.error('Error detecting misconception:', error);
        // Fallback to basic feedback without misconception detection
      }
    }

    // Record enhanced response with confidence
    try {
      const { error } = await supabase
        .from('bootcamp_student_responses')
        .insert({
          student_id: student.student_id,
          question_id: question.question_id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          time_taken: timeTakenSeconds,
          confidence_rating: confidence[0],
          misconception_detected: misconception || null,
          misconception_severity: misconceptionSeverity
        });

      if (error) throw error;

      // Update confidence trends in progress
      await updateConfidenceTrends(question.topic_id, confidence[0], isCorrect);

    } catch (error) {
      console.error('Failed to record response:', error);
      toast.error('Failed to save response');
    }

    // Create response object
    const response: QuestionResponse = {
      questionId: question.question_id,
      selectedAnswer,
      isCorrect,
      timeSpent: timeTakenSeconds,
      confidence: confidence[0],
      misconception,
      feedback: isCorrect ? 'Correct!' : getMisconceptionFeedback(misconception)
    };

    onAnswer(response);
  };

  const updateConfidenceTrends = async (topicId: string, confidenceValue: number, correct: boolean) => {
    if (!student) return;

    try {
      // For now, just update basic progress since confidence_trend columns may not exist yet
      await supabase
        .from('bootcamp_student_progress')
        .upsert({
          student_id: student.student_id,
          topic_id: topicId,
          last_activity: new Date().toISOString()
        }, {
          onConflict: 'student_id,topic_id'
        });
    } catch (error) {
      console.error('Failed to update confidence trends:', error);
    }
  };

  const getMisconceptionFeedback = (misconceptionCode: string): string => {
    const feedbackMap: Record<string, string> = {
      'algebra_wrong_operation': 'Remember to use the inverse operation. If you\'re adding, you need to subtract on both sides.',
      'fractions_denominator_add': 'When adding fractions, keep the denominators the same and only add the numerators.',
      'place_value_digit_confusion': 'Each position in a number has a different value. The rightmost digit is ones, then tens, then hundreds.',
      'default': 'Let\'s review this concept together. Check the worked example below.'
    };
    
    return feedbackMap[misconceptionCode] || feedbackMap['default'];
  };

  const getConfidenceColor = (value: number): string => {
    if (value >= 0.8) return 'text-success';
    if (value >= 0.6) return 'text-warning';
    return 'text-destructive';
  };

  const getConfidenceLabel = (value: number): string => {
    if (value >= 0.9) return 'Very confident';
    if (value >= 0.7) return 'Confident';
    if (value >= 0.5) return 'Somewhat sure';
    if (value >= 0.3) return 'Uncertain';
    return 'Guessing';
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge 
              variant={question.difficulty === 'foundation' ? 'default' : 
                     question.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
            >
              {question.difficulty}
            </Badge>
            <Badge variant="outline">
              {question.question_category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question Text */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-relaxed">
              {question.question_text}
            </h3>
            
            {question.visual_aid && (
              <div className="flex justify-center p-4 bg-muted rounded-lg">
                <div className="text-muted-foreground">
                  [Visual Aid: {question.visual_aid}]
                </div>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((letter) => {
              const optionKey = `option_${letter.toLowerCase()}` as keyof BootcampQuestion;
              const optionText = question[optionKey] as string;
              
              if (!optionText) return null;

              const isSelected = selectedAnswer === letter;
              const isCorrect = letter === question.correct_answer;
              
              return (
                <button
                  key={letter}
                  onClick={() => handleAnswerSelect(letter)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    isAnswered
                      ? isCorrect
                        ? 'border-success bg-success/10 text-success'
                        : isSelected
                        ? 'border-destructive bg-destructive/10 text-destructive'
                        : 'border-muted bg-muted/50'
                      : isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium ${
                      isAnswered
                        ? isCorrect
                          ? 'border-success bg-success text-success-foreground'
                          : isSelected
                          ? 'border-destructive bg-destructive text-destructive-foreground'
                          : 'border-muted-foreground bg-muted'
                        : isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground'
                    }`}>
                      {letter}
                    </span>
                    <span className="flex-1">{optionText}</span>
                    {isAnswered && isCorrect && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Confidence Rating */}
          {showConfidenceRating && !isAnswered && selectedAnswer && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="font-medium">How confident are you in your answer?</span>
              </div>
              
              <div className="space-y-3">
                <Slider
                  value={confidence}
                  onValueChange={setConfidence}
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Guessing</span>
                  <span className={`font-medium ${getConfidenceColor(confidence[0])}`}>
                    {getConfidenceLabel(confidence[0])} ({Math.round(confidence[0] * 100)}%)
                  </span>
                  <span className="text-muted-foreground">Very confident</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {selectedAnswer && !isAnswered && (
            <Button 
              onClick={handleSubmitAnswer} 
              className="w-full"
              size="lg"
              disabled={isDetecting}
            >
              {isDetecting ? "Analyzing..." : "Submit Answer"}
            </Button>
          )}

          {/* Enhanced Feedback */}
          {showFeedback && (
            <div className={`p-4 rounded-lg border ${
              selectedAnswer === question.correct_answer
                ? 'border-success bg-success/10'
                : 'border-destructive bg-destructive/10'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {selectedAnswer === question.correct_answer ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className={`font-medium ${
                    selectedAnswer === question.correct_answer ? 'text-success' : 'text-destructive'
                  }`}>
                    {selectedAnswer === question.correct_answer ? 'Correct!' : 'Not quite right'}
                  </span>
                </div>

                {/* Misconception-specific feedback */}
                {misconceptionDetails && selectedAnswer !== question.correct_answer && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {getMisconceptionFeedback(misconceptionDetails.intervention_type)}
                    </p>
                    
                    {misconceptionDetails.intervention_type === 'worked_example' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowWorkedExample(true)}
                        className="gap-2"
                      >
                        <Lightbulb className="h-4 w-4" />
                        Show Worked Example
                      </Button>
                    )}
                  </div>
                )}

                {/* General explanation */}
                {question.explanation && (
                  <div className="mt-3 p-3 bg-background/50 rounded border">
                    <p className="text-sm">{question.explanation}</p>
                  </div>
                )}

                {/* Confidence calibration feedback */}
                {confidence[0] > 0.8 && selectedAnswer !== question.correct_answer && (
                  <div className="flex items-start gap-2 text-sm text-warning">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>You were very confident but got it wrong. Let's review this concept more carefully.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Worked Example Modal */}
      <Dialog open={showWorkedExample} onOpenChange={setShowWorkedExample}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Worked Example
            </DialogTitle>
          </DialogHeader>
          
          {misconceptionDetails?.intervention_data && (
            <div className="space-y-4">
              {misconceptionDetails.intervention_data.steps && (
                <div>
                  <h4 className="font-medium mb-2">Step-by-step solution:</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    {misconceptionDetails.intervention_data.steps.map((step: string, index: number) => (
                      <li key={index} className="text-sm">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              
              {misconceptionDetails.intervention_data.example && (
                <div className="p-3 bg-muted/50 rounded border">
                  <p className="text-sm font-mono">{misconceptionDetails.intervention_data.example}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};