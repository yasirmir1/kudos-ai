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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="px-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <div className="text-center flex-1 mx-8">
            <p className="text-sm text-muted-foreground mb-2">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <Progress value={progress} className="w-64 h-2 mx-auto" />
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="font-bold text-lg">{score}/{currentIndex + (isAnswered ? 1 : 0)}</p>
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-8 mx-auto max-w-3xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between mb-4 gap-6">
              <div className="flex items-center space-x-3 flex-shrink-0">
                <Badge variant="secondary" className="px-3 py-1">{currentQuestion.topic}</Badge>
                <Badge variant="outline" className="px-3 py-1">{currentQuestion.difficulty}</Badge>
              </div>
              <div className="flex items-start space-x-1 text-muted-foreground min-w-0 flex-1 justify-end">
                <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-right leading-tight max-w-xs">{currentQuestion.subtopic}</span>
              </div>
            </div>
            <h3 className="text-xl font-medium leading-relaxed text-left px-4">{currentQuestion.example_question}</h3>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {/* Answer Options */}
            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correct_answer;
                const showCorrectness = isAnswered && (isSelected || isCorrect);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                    className={`w-full p-5 text-left border rounded-lg transition-all ${
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
                      <span className="text-base leading-relaxed">{option}</span>
                      {showCorrectness && (
                        isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600 ml-4 flex-shrink-0" />
                        ) : isSelected ? (
                          <XCircle className="h-5 w-5 text-red-600 ml-4 flex-shrink-0" />
                        ) : null
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              {!isAnswered ? (
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  size="lg"
                  className="px-8"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} size="lg" className="px-8">
                  {currentIndex + 1 >= questions.length ? 'Finish Session' : 'Next Question'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Explanation Card */}
        {showExplanation && (currentQuestion.red_herring_explanation || currentQuestion.pedagogical_notes) && (
          <Card className="mx-auto max-w-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-center">Explanation</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-6 space-y-6">
              {currentQuestion.red_herring_explanation && (
                <div className="text-center">
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Why other answers might seem tempting:</h4>
                  <p className="text-sm leading-relaxed">{currentQuestion.red_herring_explanation}</p>
                </div>
              )}
              {currentQuestion.pedagogical_notes && (
                <div className="text-center">
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Learning tip:</h4>
                  <p className="text-sm leading-relaxed">{currentQuestion.pedagogical_notes}</p>
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