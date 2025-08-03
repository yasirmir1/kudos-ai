import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Target, Trophy, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBootcampDatabase } from '@/hooks/useBootcampDatabase';
import { useToast } from '@/hooks/use-toast';

interface BootcampQuestion {
  id: number;
  question_id: string;
  question_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer: string;
  explanation?: string;
  difficulty: string;
  question_type: string;
  time_seconds: number;
  marks: number;
}

interface QuickPracticeModalProps {
  topic: {
    id: string;
    name: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickPracticeModal({ topic, isOpen, onClose }: QuickPracticeModalProps) {
  const [questions, setQuestions] = useState<BootcampQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [results, setResults] = useState<{ correct: number; total: number } | null>(null);
  
  const { student } = useBootcampDatabase();
  const { toast } = useToast();

  useEffect(() => {
    if (topic && isOpen) {
      loadQuestions();
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setResults(null);
    }
  }, [topic, isOpen]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isSubmitted]);

  const loadQuestions = async () => {
    if (!topic) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bootcamp_questions')
        .select('*')
        .eq('topic_id', topic.id)
        .limit(5); // Load 5 questions for quick practice

      if (error) throw error;

      if (data && data.length > 0) {
        setQuestions(data);
        // Set timer for total practice session (sum of all question times)
        const totalTime = data.reduce((sum, q) => sum + q.time_seconds, 0);
        setTimeLeft(totalTime);
        setStartTime(new Date());
      } else {
        toast({
          title: "No Questions Available",
          description: "No practice questions found for this topic.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error",
        description: "Failed to load practice questions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isSubmitted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!student || !topic || !startTime) return;

    setIsSubmitted(true);
    
    try {
      let correctCount = 0;
      const endTime = new Date();
      const totalTimeTaken = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Save each question response to learning_results
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const selectedAnswer = selectedAnswers[i] || '';
        const isCorrect = selectedAnswer === question.correct_answer;
        
        if (isCorrect) {
          correctCount++;
        }

        // Calculate time taken for this question (approximate)
        const questionTimeTaken = Math.floor(totalTimeTaken / questions.length);

        await supabase.from('learning_results').insert({
          student_id: student.student_id,
          topic_id: topic.id,
          question_id: question.question_id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          time_taken_seconds: questionTimeTaken,
          session_type: 'quick_practice'
        });
      }

      setResults({
        correct: correctCount,
        total: questions.length
      });

      toast({
        title: "Practice Complete!",
        description: `You got ${correctCount} out of ${questions.length} questions correct.`,
      });

    } catch (error) {
      console.error('Error saving results:', error);
      toast({
        title: "Error",
        description: "Failed to save practice results.",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setResults(null);
    setStartTime(new Date());
    if (questions.length > 0) {
      const totalTime = questions.reduce((sum, q) => sum + q.time_seconds, 0);
      setTimeLeft(totalTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Practice: {topic?.name}
          </DialogTitle>
          <DialogDescription>
            Test your knowledge with a few quick questions from this topic.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading practice questions...</p>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No practice questions available for this topic.</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        ) : results ? (
          // Results view
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Practice Complete!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold">
                    {results.correct}/{results.total}
                  </div>
                  <p className="text-muted-foreground">Questions Correct</p>
                  
                  <div className="flex justify-center">
                    <Badge variant={results.correct / results.total >= 0.8 ? "default" : results.correct / results.total >= 0.6 ? "secondary" : "destructive"}>
                      {Math.round((results.correct / results.total) * 100)}% Score
                    </Badge>
                  </div>

                  <div className="flex gap-3 justify-center mt-6">
                    <Button onClick={handleRetry} variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    <Button onClick={onClose}>
                      Continue Learning
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Question view
          <div className="space-y-6">
            {/* Progress and Timer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <Progress value={progressPercentage} className="w-32" />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span className={timeLeft < 60 ? "text-red-500 font-semibold" : ""}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Question Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{currentQuestion?.difficulty}</Badge>
                  <Badge variant="secondary">{currentQuestion?.marks} mark{currentQuestion?.marks !== 1 ? 's' : ''}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-semibold">{currentQuestion?.question_text}</h3>
                
                {currentQuestion?.question_type === 'multiple_choice' && (
                  <div className="grid gap-3">
                    {['option_a', 'option_b', 'option_c', 'option_d'].map((optionKey, index) => {
                      const optionValue = currentQuestion[optionKey as keyof BootcampQuestion] as string;
                      if (!optionValue) return null;
                      
                      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                      const isSelected = selectedAnswers[currentQuestionIndex] === optionLetter;
                      
                      return (
                        <Button
                          key={optionKey}
                          variant={isSelected ? "default" : "outline"}
                          className="justify-start h-auto p-4 text-left"
                          onClick={() => handleAnswerSelect(optionLetter)}
                          disabled={isSubmitted}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                              {optionLetter}
                            </div>
                            <span>{optionValue}</span>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                )}
                
                {currentQuestion?.question_type === 'numeric_entry' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Answer:</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-md"
                      placeholder="Enter your answer here..."
                      value={selectedAnswers[currentQuestionIndex] || ''}
                      onChange={(e) => handleAnswerSelect(e.target.value)}
                      disabled={isSubmitted}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={handlePreviousQuestion}
                variant="outline"
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!selectedAnswers[currentQuestionIndex]}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Practice
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      // Auto-advance to next question after selection
                      if (selectedAnswers[currentQuestionIndex]) {
                        handleNextQuestion();
                      }
                    }}
                    disabled={!selectedAnswers[currentQuestionIndex]}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}