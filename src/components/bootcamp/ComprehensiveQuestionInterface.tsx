import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Brain, 
  AlertTriangle, 
  Lightbulb, 
  GripVertical,
  Info 
} from 'lucide-react';
import { useBootcampDatabase, BootcampQuestion } from '@/hooks/useBootcampDatabase';
import { BootcampAPI } from '@/lib/bootcamp-api';
import { RemediationSuggestion } from './RemediationSuggestion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type QuestionType = 'multiple_choice' | 'written_answer' | 'drag_drop' | 'written_entry';
export type SessionType = 'practice' | 'diagnostic' | 'review' | 'challenge' | 'mock_test';

interface ComprehensiveQuestionInterfaceProps {
  // Session configuration
  sessionType?: SessionType;
  questionCount?: number;
  onSessionComplete?: (results: SessionResults) => void;
  
  // Single question mode
  question?: ExtendedBootcampQuestion;
  onAnswer?: (response: QuestionResponse) => void;
  questionNumber?: number;
  totalQuestions?: number;
  studentId?: string;
  sessionId?: string;
  
  // Display options
  showTimer?: boolean;
  showProgress?: boolean;
  showConfidenceRating?: boolean;
  showDiagnosticFeedback?: boolean;
  allowReview?: boolean;
}

interface ExtendedBootcampQuestion extends BootcampQuestion {
  question_type: QuestionType;
  drag_items?: string[];
  drop_zones?: { id: string; label: string; correct_items: string[] }[];
  bootcamp_answers?: Array<{
    answer_option: string;
    answer_value: string;
    is_correct: boolean;
    misconception_type?: string;
    diagnostic_feedback?: string;
  }>;
}

interface QuestionResponse {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  confidence: number | null;
  misconception?: string;
  feedback: string;
}

interface SessionResults {
  sessionId: string;
  questionsAttempted: number;
  questionsCorrect: number;
  totalTime: number;
  accuracy: number;
  misconceptionsDetected: string[];
}

interface DragItem {
  id: string;
  content: string;
  position: { x: number; y: number } | null;
  zone: string | null;
}

export const ComprehensiveQuestionInterface: React.FC<ComprehensiveQuestionInterfaceProps> = ({
  sessionType = 'practice',
  questionCount = 10,
  onSessionComplete,
  question: singleQuestion,
  onAnswer: singleQuestionCallback,
  questionNumber = 1,
  totalQuestions = 1,
  studentId: propStudentId,
  sessionId: propSessionId,
  showTimer = true,
  showProgress = true,
  showConfidenceRating = true,
  showDiagnosticFeedback = true,
  allowReview = false
}) => {
  const { 
    student, 
    startLearningSession, 
    recordStudentResponse, 
    endLearningSession, 
    getAdaptiveQuestions 
  } = useBootcampDatabase();
  
  // Session state (for full session mode)
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [questions, setQuestions] = useState<ExtendedBootcampQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);
  const [isLoading, setIsLoading] = useState(!singleQuestion);
  const [misconceptionsDetected, setMisconceptionsDetected] = useState<string[]>([]);

  // Question state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [dragItems, setDragItems] = useState<DragItem[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Timing and feedback
  const [startTime, setStartTime] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  
  // Refs for drag and drop
  const dragContainerRef = useRef<HTMLDivElement>(null);

  // Get current question
  const currentQuestion = singleQuestion || questions[currentQuestionIndex];
  const effectiveStudentId = propStudentId || student?.student_id;
  const effectiveSessionId = propSessionId || currentSession?.session_id;

  // Initialize session (for full session mode)
  useEffect(() => {
    if (!singleQuestion) {
      initializeSession();
    } else {
      setStartTime(Date.now());
    }
  }, [singleQuestion]);

  // Timer effect
  useEffect(() => {
    if (currentQuestion && !isAnswered) {
      const timer = setInterval(() => setTimeSpent(t => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentQuestion, isAnswered]);

  // Initialize drag items
  useEffect(() => {
    if (currentQuestion?.drag_items) {
      setDragItems(
        currentQuestion.drag_items.map((item, index) => ({
          id: `item-${index}`,
          content: item,
          position: null,
          zone: null
        }))
      );
    }
  }, [currentQuestion]);

  const initializeSession = async () => {
    if (!effectiveStudentId) return;
    
    setIsLoading(true);
    try {
      const session = await startLearningSession(sessionType === 'mock_test' ? 'practice' : sessionType);
      setCurrentSession(session);
      
      // For now, use a simplified approach for questions
      // In a real implementation, you would fetch actual questions
      const mockQuestions: ExtendedBootcampQuestion[] = [];
      setQuestions(mockQuestions);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Failed to initialize session:', error);
      toast.error('Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = async (optionLetter: string) => {
    if (selectedAnswer || isSubmitting) return;
    
    setIsSubmitting(true);
    setSelectedAnswer(optionLetter);
    setIsAnswered(true);
    
    if (showDiagnosticFeedback) {
      setShowDiagnostic(true);
    }

    await submitAnswer(optionLetter);
  };

  const handleWrittenAnswerSubmit = async () => {
    if (!writtenAnswer.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setIsAnswered(true);
    await submitAnswer(writtenAnswer);
  };

  const handleDragDrop = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setIsAnswered(true);
    
    const dragAnswer = JSON.stringify(
      dragItems.reduce((acc, item) => {
        if (item.zone) {
          acc[item.zone] = acc[item.zone] || [];
          acc[item.zone].push(item.content);
        }
        return acc;
      }, {} as Record<string, string[]>)
    );
    
    await submitAnswer(dragAnswer);
  };

  const submitAnswer = async (answer: string) => {
    if (!currentQuestion || !effectiveStudentId) return;

    try {
      let isCorrect = false;
      let misconception = '';
      let feedback = '';

      // Determine correctness based on question type
      if (currentQuestion.question_type === 'multiple_choice') {
        const selectedOption = currentQuestion.bootcamp_answers?.find(
          opt => opt.answer_option === answer
        );
        isCorrect = selectedOption?.is_correct || false;
        misconception = selectedOption?.misconception_type || '';
        feedback = selectedOption?.diagnostic_feedback || '';
      } else if (currentQuestion.question_type === 'drag_drop') {
        // Simplified drag-drop correctness check
        const answerObj = JSON.parse(answer);
        isCorrect = currentQuestion.drop_zones?.every(zone =>
          zone.correct_items.every(item => answerObj[zone.id]?.includes(item))
        ) || false;
      } else {
        // For written answers, compare with correct answer
        isCorrect = answer.toLowerCase().trim() === currentQuestion.correct_answer?.toLowerCase().trim();
      }

      const response: QuestionResponse = {
        questionId: currentQuestion.question_id,
        selectedAnswer: answer,
        isCorrect,
        timeSpent: Math.floor((Date.now() - startTime) / 1000),
        confidence,
        misconception,
        feedback
      };

      // Record response if in session mode
      if (effectiveSessionId && !singleQuestion) {
        // Simplified response recording
        try {
          const { error } = await supabase
            .from('bootcamp_student_responses')
            .insert({
              student_id: effectiveStudentId,
              question_id: currentQuestion.question_id,
              selected_answer: answer,
              is_correct: isCorrect,
              time_taken: response.timeSpent,
              confidence_rating: confidence,
              misconception_detected: misconception || null
            });
          
          if (error) throw error;
        } catch (error) {
          console.error('Failed to record response:', error);
        }
      }

      // Call callback for single question mode
      if (singleQuestionCallback) {
        singleQuestionCallback(response);
      }

      // Track misconceptions
      if (misconception && !misconceptionsDetected.includes(misconception)) {
        setMisconceptionsDetected(prev => [...prev, misconception]);
      }

    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast.error('Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetQuestionState();
    } else {
      handleSessionComplete();
    }
  };

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setWrittenAnswer('');
    setIsAnswered(false);
    setShowDiagnostic(false);
    setTimeSpent(0);
    setConfidence(null);
    setStartTime(Date.now());
  };

  const handleSessionComplete = async () => {
    if (!currentSession || !effectiveStudentId) return;

    try {
      await endLearningSession(effectiveStudentId);
      
      const results: SessionResults = {
        sessionId: currentSession.session_id,
        questionsAttempted: currentQuestionIndex + 1,
        questionsCorrect: 0, // Would need to track this
        totalTime: Math.floor((Date.now() - startTime) / 1000),
        accuracy: 0, // Would need to calculate
        misconceptionsDetected
      };
      
      setSessionResults(results);
      onSessionComplete?.(results);
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    
    setDragItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, zone: zoneId } : item
    ));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Brain className="h-8 w-8 animate-pulse mx-auto text-primary" />
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessionResults) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Session Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{sessionResults.questionsAttempted}</p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{sessionResults.questionsCorrect}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round(sessionResults.accuracy)}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.floor(sessionResults.totalTime / 60)}m</p>
              <p className="text-sm text-muted-foreground">Time</p>
            </div>
          </div>
          
          {sessionResults.misconceptionsDetected.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Areas for Review:</p>
              <div className="flex flex-wrap gap-2">
                {sessionResults.misconceptionsDetected.map((misconception, index) => (
                  <Badge key={index} variant="outline" className="text-orange-600">
                    {misconception}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto" />
            <p className="text-muted-foreground">No questions available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-4">
        {showProgress && !singleQuestion && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session</span>
            </div>
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
          </div>
        )}
        
        {singleQuestion && showProgress && (
          <div className="flex justify-between items-center">
            <Badge variant="outline">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            {showTimer && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant={currentQuestion.difficulty === 'foundation' ? 'default' : 
                     currentQuestion.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
            >
              {currentQuestion.difficulty}
            </Badge>
            <Badge variant="outline">
              {currentQuestion.question_category}
            </Badge>
          </div>
          
          {showTimer && !singleQuestion && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium leading-relaxed">
            {currentQuestion.question_text}
          </h3>
          
          {currentQuestion.visual_aid && (
            <div className="flex justify-center">
              <img 
                src={currentQuestion.visual_aid} 
                alt="Question visual" 
                className="max-w-full h-auto rounded-lg border"
              />
            </div>
          )}
        </div>

        {/* Question Interface */}
        <div className="space-y-4">
          {currentQuestion.question_type === 'multiple_choice' && (
            <div className="space-y-3">
              {currentQuestion.bootcamp_answers?.map((option, index) => {
                const isSelected = selectedAnswer === option.answer_option;
                const isCorrect = option.is_correct;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option.answer_option)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full p-4 text-left rounded-lg border-2 transition-all",
                      "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
                      isSelected && !showDiagnostic && "border-primary bg-primary/5",
                      isSelected && showDiagnostic && isCorrect && "border-green-500 bg-green-50",
                      isSelected && showDiagnostic && !isCorrect && "border-red-500 bg-red-50",
                      isAnswered && !isSelected && "opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium">
                        {option.answer_option}
                      </span>
                      <span>{option.answer_value}</span>
                      
                      {isSelected && showDiagnostic && (
                        <div className="ml-auto">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {currentQuestion.question_type === 'written_answer' && (
            <div className="space-y-4">
              <Textarea
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder="Enter your answer..."
                disabled={isAnswered}
                className="min-h-24"
              />
              {!isAnswered && (
                <Button 
                  onClick={handleWrittenAnswerSubmit}
                  disabled={!writtenAnswer.trim() || isSubmitting}
                  className="w-full"
                >
                  Submit Answer
                </Button>
              )}
            </div>
          )}

          {currentQuestion.question_type === 'written_entry' && (
            <div className="space-y-4">
              <Input
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder="Enter your answer..."
                disabled={isAnswered}
              />
              {!isAnswered && (
                <Button 
                  onClick={handleWrittenAnswerSubmit}
                  disabled={!writtenAnswer.trim() || isSubmitting}
                  className="w-full"
                >
                  Submit Answer
                </Button>
              )}
            </div>
          )}

          {currentQuestion.question_type === 'drag_drop' && (
            <div className="space-y-6" ref={dragContainerRef}>
              {/* Drag Items */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Drag these items:</p>
                <div className="flex flex-wrap gap-2">
                  {dragItems.filter(item => !item.zone).map(item => (
                    <div
                      key={item.id}
                      draggable={!isAnswered}
                      onDragStart={(e) => handleDragStart(e, item.id)}
                      className={cn(
                        "px-3 py-2 bg-secondary rounded-lg cursor-move flex items-center gap-2",
                        isAnswered && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <GripVertical className="h-4 w-4" />
                      {item.content}
                    </div>
                  ))}
                </div>
              </div>

              {/* Drop Zones */}
              <div className="space-y-4">
                {currentQuestion.drop_zones?.map(zone => (
                  <div
                    key={zone.id}
                    onDrop={(e) => handleDrop(e, zone.id)}
                    onDragOver={handleDragOver}
                    className="min-h-16 p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg"
                  >
                    <p className="text-sm font-medium mb-2">{zone.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {dragItems.filter(item => item.zone === zone.id).map(item => (
                        <div
                          key={item.id}
                          className="px-3 py-2 bg-primary/10 rounded-lg text-sm"
                        >
                          {item.content}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {!isAnswered && dragItems.every(item => item.zone) && (
                <Button onClick={handleDragDrop} disabled={isSubmitting} className="w-full">
                  Submit Answer
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Confidence Rating */}
        {showConfidenceRating && !isAnswered && (
          <div className="space-y-3">
            <p className="text-sm font-medium">How confident are you in your answer?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(level => (
                <Button
                  key={level}
                  variant={confidence === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfidence(level)}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Diagnostic Feedback */}
        {showDiagnostic && showDiagnosticFeedback && selectedAnswer && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Diagnostic Feedback</span>
            </div>
            
            {currentQuestion.bootcamp_answers?.find(opt => opt.answer_option === selectedAnswer)?.diagnostic_feedback && (
              <p className="text-sm">
                {currentQuestion.bootcamp_answers.find(opt => opt.answer_option === selectedAnswer)?.diagnostic_feedback}
              </p>
            )}
            
            {currentQuestion.bootcamp_answers?.find(opt => opt.answer_option === selectedAnswer)?.misconception_type && (
              <RemediationSuggestion 
                misconception={{
                  code: currentQuestion.bootcamp_answers.find(opt => opt.answer_option === selectedAnswer)?.misconception_type || '',
                  name: currentQuestion.bootcamp_answers.find(opt => opt.answer_option === selectedAnswer)?.misconception_type || ''
                }}
                topic={currentQuestion.topic_id}
              />
            )}
          </div>
        )}

        {/* Navigation */}
        {isAnswered && !singleQuestion && (
          <div className="flex justify-end pt-4">
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Session'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};