import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  question_id: string;
  topic: string;
  subtopic: string;
  example_question: string;
  question_type: string;
  options: any; // Can be string[] or JSON
  correct_answer: string;
  difficulty: string;
  red_herring_tag: string[] | null;
  red_herring_explanation: string | null;
  pedagogical_notes: string | null;
}

const Practice = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    loadAdaptiveQuestions();
  }, [user]);

  const loadAdaptiveQuestions = async () => {
    try {
      setLoading(true);
      
      // Get adaptive questions for the user
      const { data, error } = await supabase
        .rpc('get_adaptive_questions', { 
          p_student_id: user?.id,
          p_count: 10 
        });

      if (error) {
        console.error('Error loading questions:', error);
        // Fallback to random questions if adaptive fails
        const { data: fallbackData } = await supabase
          .from('curriculum')
          .select('*')
          .limit(10);
        
        if (fallbackData) {
          const formattedData = fallbackData.map(q => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : 
                     typeof q.options === 'string' ? JSON.parse(q.options) : 
                     Object.values(q.options || {})
          }));
          setQuestions(formattedData);
        }
      } else if (data) {
        // Extract questions from the JSONB response
        const extractedQuestions = data.map((item: any) => {
          const question = item.question;
          return {
            ...question,
            options: Array.isArray(question.options) ? question.options : 
                     typeof question.options === 'string' ? JSON.parse(question.options) : 
                     Object.values(question.options || {})
          };
        });
        setQuestions(extractedQuestions);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error loading questions",
        description: "We'll use some practice questions for now.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || isAnswered) return;
    
    setIsAnswered(true);
    setShowExplanation(true);
    
    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // Calculate time taken
    const timeTaken = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

    // Save answer to database
    try {
      await supabase
        .from('student_answers')
        .insert({
          student_id: user?.id,
          question_id: currentQuestion.question_id,
          topic: currentQuestion.topic,
          subtopic: currentQuestion.subtopic,
          difficulty: currentQuestion.difficulty,
          answer_given: selectedAnswer,
          is_correct: isCorrect,
          time_taken_seconds: timeTaken
        });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setSessionComplete(true);
      return;
    }
    
    setCurrentIndex(currentIndex + 1);
    setSelectedAnswer('');
    setIsAnswered(false);
    setShowExplanation(false);
    setStartTime(new Date());
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer('');
    setIsAnswered(false);
    setShowExplanation(false);
    setScore(0);
    setSessionComplete(false);
    setStartTime(new Date());
    loadAdaptiveQuestions();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Preparing your personalized questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No questions available at the moment.</p>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const accuracy = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Session Complete!</CardTitle>
            <CardDescription>Here's how you performed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{accuracy}%</div>
              <div className="text-muted-foreground">
                {score} out of {questions.length} correct
              </div>
            </div>
            
            <Progress value={accuracy} className="h-3" />
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button onClick={handleRestart} className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Practice Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <Progress value={progress} className="w-48 h-2 mt-1" />
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="font-bold">{score}/{currentIndex + (isAnswered ? 1 : 0)}</p>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{currentQuestion.topic}</Badge>
                <Badge variant="outline">{currentQuestion.difficulty}</Badge>
              </div>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{currentQuestion.subtopic}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-medium mb-6">{currentQuestion.example_question}</h3>
            
            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correct_answer;
                const showCorrectness = isAnswered && (isSelected || isCorrect);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                    className={`w-full p-4 text-left border rounded-lg transition-all ${
                      isSelected
                        ? isAnswered
                          ? isCorrect
                            ? 'border-green-500 bg-green-50 text-green-900'
                            : 'border-red-500 bg-red-50 text-red-900'
                          : 'border-primary bg-primary/5'
                        : showCorrectness && isCorrect
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showCorrectness && (
                        isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : isSelected ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : null
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              {!isAnswered ? (
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {currentIndex + 1 >= questions.length ? 'Finish Session' : 'Next Question'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Explanation Card */}
        {showExplanation && (currentQuestion.red_herring_explanation || currentQuestion.pedagogical_notes) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Explanation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.red_herring_explanation && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Why other answers might seem tempting:</h4>
                  <p className="text-sm">{currentQuestion.red_herring_explanation}</p>
                </div>
              )}
              {currentQuestion.pedagogical_notes && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Learning tip:</h4>
                  <p className="text-sm">{currentQuestion.pedagogical_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Practice;