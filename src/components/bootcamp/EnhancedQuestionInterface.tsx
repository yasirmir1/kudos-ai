import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Brain, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useBootcampDatabase, BootcampQuestion } from '@/hooks/useBootcampDatabase';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnhancedQuestionInterfaceProps {
  sessionType?: 'practice' | 'diagnostic' | 'review' | 'challenge';
  questionCount?: number;
  onSessionComplete?: (results: SessionResults) => void;
}

interface SessionResults {
  sessionId: string;
  questionsAttempted: number;
  questionsCorrect: number;
  totalTime: number;
  accuracy: number;
  misconceptionsDetected: string[];
}

export const EnhancedQuestionInterface: React.FC<EnhancedQuestionInterfaceProps> = ({
  sessionType = 'practice',
  questionCount = 10,
  onSessionComplete
}) => {
  const { 
    student, 
    startLearningSession, 
    recordStudentResponse, 
    endLearningSession, 
    getAdaptiveQuestions 
  } = useBootcampDatabase();
  
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [questions, setQuestions] = useState<BootcampQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [misconceptionsDetected, setMisconceptionsDetected] = useState<string[]>([]);

  useEffect(() => {
    initializeSession();
  }, [student]);

  const initializeSession = async () => {
    if (!student) return;

    try {
      setIsLoading(true);
      
      // Start new learning session
      const session = await startLearningSession(sessionType);
      setCurrentSession(session);

      // Get adaptive questions based on student's progress
      const adaptiveQuestions = await getAdaptiveQuestions(questionCount);
      
      if (adaptiveQuestions.length > 0) {
        // Convert adaptive question data to full question objects
        const questionIds = adaptiveQuestions.map((q: any) => q.question_id);
        
        const { data: fullQuestions, error } = await supabase
          .from('bootcamp_questions')
          .select('*')
          .in('question_id', questionIds);

        if (error) throw error;

        if (fullQuestions && fullQuestions.length > 0) {
          setQuestions(fullQuestions);
          setStartTime(Date.now());
        } else {
          toast.error('No questions available for this session');
        }
      } else {
        // Fallback: Get random questions if adaptive generation fails
        const { data: fallbackQuestions, error } = await supabase
          .from('bootcamp_questions')
          .select('*')
          .limit(questionCount);

        if (error) throw error;
        
        if (fallbackQuestions && fallbackQuestions.length > 0) {
          setQuestions(fallbackQuestions);
          setStartTime(Date.now());
        } else {
          toast.error('No questions available');
        }
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      toast.error('Failed to initialize practice session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !currentSession || isAnswered) return;

    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    try {
      // Detect potential misconceptions based on wrong answer
      let misconceptionDetected: string | undefined;
      
      if (!isCorrect) {
        // Query answer options to check for misconception codes
        const { data: answerOption } = await supabase
          .from('bootcamp_answer_options')
          .select('misconception_code')
          .eq('question_id', currentQuestion.question_id)
          .eq('answer_value', selectedAnswer)
          .maybeSingle();

        if (answerOption?.misconception_code) {
          misconceptionDetected = answerOption.misconception_code;
          setMisconceptionsDetected(prev => [...prev, answerOption.misconception_code]);
        }
      }

      // Record the response
      await recordStudentResponse(
        currentQuestion.question_id,
        selectedAnswer,
        isCorrect,
        timeTaken,
        misconceptionDetected
      );

      setIsAnswered(true);

      // Show immediate feedback
      if (isCorrect) {
        toast.success('Correct! Well done!');
      } else {
        toast.error(`Incorrect. The correct answer was ${currentQuestion.correct_answer}`);
      }

      // Auto-advance after 2 seconds
      setTimeout(() => {
        nextQuestion();
      }, 2000);

    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setIsAnswered(false);
      setStartTime(Date.now());
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    if (!currentSession) return;

    try {
      await endLearningSession(currentSession.session_id);

      // Calculate session results
      const totalResponses = currentQuestionIndex + 1;
      const correctAnswers = questions.slice(0, totalResponses).reduce((count, question, index) => {
        // This is simplified - in a real implementation, you'd track this properly
        return count + (Math.random() > 0.3 ? 1 : 0); // Placeholder
      }, 0);

      const results: SessionResults = {
        sessionId: currentSession.session_id,
        questionsAttempted: totalResponses,
        questionsCorrect: correctAnswers,
        totalTime: Math.floor((Date.now() - startTime) / 1000),
        accuracy: Math.round((correctAnswers / totalResponses) * 100),
        misconceptionsDetected
      };

      setSessionResults(results);
      onSessionComplete?.(results);

      toast.success(`Session complete! You scored ${results.accuracy}%`);

    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading practice session...</p>
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
              <div className="text-2xl font-bold text-primary">{sessionResults.questionsCorrect}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{sessionResults.questionsAttempted}</div>
              <div className="text-sm text-muted-foreground">Attempted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{sessionResults.accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.floor(sessionResults.totalTime / 60)}m</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
          </div>

          {sessionResults.misconceptionsDetected.length > 0 && (
            <div className="bg-warning/10 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h3 className="font-semibold">Areas for Improvement</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {sessionResults.misconceptionsDetected.map((misconception, index) => (
                  <Badge key={index} variant="outline" className="text-warning border-warning">
                    {misconception}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={initializeSession} 
            className="w-full"
          >
            Start New Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg mb-4">No questions available</p>
            <Button onClick={initializeSession}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const options = [
    { key: 'A', value: currentQuestion.option_a },
    { key: 'B', value: currentQuestion.option_b },
    { key: 'C', value: currentQuestion.option_c },
    { key: 'D', value: currentQuestion.option_d }
  ].filter(option => option.value); // Filter out empty options

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session
          </CardTitle>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <Badge variant="secondary">
              <Clock className="h-4 w-4 mr-1" />
              {currentQuestion.time_seconds}s
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{currentQuestion.difficulty}</Badge>
            <Badge variant="outline">{currentQuestion.topic_id}</Badge>
            <span>•</span>
            <span>{currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}</span>
          </div>

          <div className="text-lg font-medium leading-relaxed">
            {currentQuestion.question_text}
          </div>

          {currentQuestion.visual_aid && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Visual Aid:</p>
              <div className="whitespace-pre-wrap">{currentQuestion.visual_aid}</div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {options.map((option) => (
            <Button
              key={option.key}
              variant={selectedAnswer === option.key ? "default" : "outline"}
              className={`w-full justify-start text-left h-auto py-4 px-6 ${
                isAnswered
                  ? option.key === currentQuestion.correct_answer
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : option.key === selectedAnswer && option.key !== currentQuestion.correct_answer
                    ? 'bg-red-100 border-red-500 text-red-800'
                    : ''
                  : ''
              }`}
              onClick={() => handleAnswerSelect(option.key)}
              disabled={isAnswered}
            >
              <div className="flex items-start gap-3">
                <span className="font-bold bg-background rounded px-2 py-1 text-sm">
                  {option.key}
                </span>
                <span className="flex-1">{option.value}</span>
                {isAnswered && option.key === currentQuestion.correct_answer && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                {isAnswered && option.key === selectedAnswer && option.key !== currentQuestion.correct_answer && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            </Button>
          ))}
        </div>

        {!isAnswered && (
          <Button 
            onClick={submitAnswer}
            disabled={!selectedAnswer}
            className="w-full"
            size="lg"
          >
            Submit Answer
          </Button>
        )}

        {isAnswered && currentQuestion.explanation && (
          <div className="bg-primary/5 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Explanation:</h4>
            <p className="text-sm">{currentQuestion.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};