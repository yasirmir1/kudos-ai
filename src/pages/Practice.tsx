import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, RotateCcw, Sparkles } from 'lucide-react';
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
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [generatingExplanation, setGeneratingExplanation] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  useEffect(() => {
    loadAdaptiveQuestions();
  }, [user]);

  const loadAdaptiveQuestions = async () => {
    try {
      setLoading(true);
      
      // First, get all question IDs the user has already answered
      const { data: answeredQuestions } = await supabase
        .from('student_answers')
        .select('question_id')
        .eq('student_id', user?.id);

      const answeredQuestionIds = answeredQuestions?.map(q => q.question_id) || [];

      // Then get NEW questions that the user hasn't seen
      let query = supabase
        .from('curriculum')
        .select('*')
        .limit(20);

      if (answeredQuestionIds.length > 0) {
        query = query.not('question_id', 'in', `(${answeredQuestionIds.map(id => `'${id}'`).join(',')})`);
      }

      const { data: newQuestions, error: newError } = await query;

      let questions: Question[] = [];

      if (newQuestions && newQuestions.length > 0) {
        // Format new questions
        const formattedNewQuestions = newQuestions.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : 
                   typeof q.options === 'string' ? JSON.parse(q.options) : 
                   Object.values(q.options || {})
        }));

        questions = formattedNewQuestions;

        // Add 2-3% repeated questions for reinforcement
        const repeatPercentage = Math.random() < 0.025; // 2.5% chance
        
        if (repeatPercentage && questions.length > 15 && answeredQuestionIds.length > 0) {
          // Get a few questions the user got CORRECT before (for confidence building)
          const { data: correctlyAnswered } = await supabase
            .from('student_answers')
            .select('question_id')
            .eq('student_id', user?.id)
            .eq('is_correct', true)
            .lt('answered_at', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()) // 2 days ago
            .order('answered_at', { ascending: false })
            .limit(5);

          if (correctlyAnswered && correctlyAnswered.length > 0) {
            const repeatQuestionIds = correctlyAnswered.slice(0, 2).map(q => q.question_id);
            
            const { data: repeatQuestions } = await supabase
              .from('curriculum')
              .select('*')
              .in('question_id', repeatQuestionIds);

            if (repeatQuestions && repeatQuestions.length > 0) {
              const formattedRepeatQuestions = repeatQuestions.map(q => ({
                ...q,
                options: Array.isArray(q.options) ? q.options : 
                         typeof q.options === 'string' ? JSON.parse(q.options) : 
                         Object.values(q.options || {})
              }));

              // Replace 1-2 new questions with repeat questions and shuffle
              questions = [
                ...questions.slice(0, -repeatQuestions.length),
                ...formattedRepeatQuestions
              ];
              
              // Shuffle the array so repeat questions aren't at the end
              questions = questions.sort(() => Math.random() - 0.5);

              console.log(`Added ${repeatQuestions.length} repeat questions for reinforcement`);
            }
          }
        }
      } else {
        console.log('No new questions found, falling back to adaptive algorithm');
        
        // Fallback to adaptive questions if no new questions available
        const { data, error } = await supabase
          .rpc('get_adaptive_questions_enhanced', { 
            p_student_id: user?.id,
            p_count: 20 
          });

        if (error) {
          console.error('Error loading adaptive questions:', error);
          // Final fallback to any questions
          const { data: fallbackData } = await supabase
            .from('curriculum')
            .select('*')
            .limit(20);
          
          if (fallbackData) {
            const formattedData = fallbackData.map(q => ({
              ...q,
              options: Array.isArray(q.options) ? q.options : 
                       typeof q.options === 'string' ? JSON.parse(q.options) : 
                       Object.values(q.options || {})
            }));
            questions = formattedData;
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
          questions = extractedQuestions;
        }
      }

      setQuestions(questions);
      console.log(`Loaded ${questions.length} questions (prioritizing new content)`);

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

    // Analyze red herrings triggered
    let redHerringTriggered: string[] = [];
    if (!isCorrect && currentQuestion.red_herring_tag) {
      // Map common wrong answers to red herring tags
      redHerringTriggered = currentQuestion.red_herring_tag;
    }

    // Determine if difficulty was appropriate (based on time taken and correctness)
    const difficultyAppropriate = (() => {
      if (isCorrect && timeTaken < 30) return true;  // Too easy
      if (isCorrect && timeTaken < 120) return true; // Just right
      if (!isCorrect && timeTaken > 180) return false; // Too hard
      return null; // Uncertain
    })();

    // Save enhanced answer data to database immediately
    try {
      console.log('Saving answer for question:', currentQuestion.question_id);
      
      const { data, error } = await supabase
        .from('student_answers')
        .insert({
          student_id: user?.id,
          question_id: currentQuestion.question_id,
          topic: currentQuestion.topic,
          subtopic: currentQuestion.subtopic,
          difficulty: currentQuestion.difficulty,
          answer_given: selectedAnswer,
          is_correct: isCorrect,
          time_taken_seconds: timeTaken,
          red_herring_triggered: redHerringTriggered.length > 0 ? redHerringTriggered : null,
          difficulty_appropriate: difficultyAppropriate
        });

      if (error) {
        console.error('Error saving answer:', error);
        toast({
          title: "Failed to save answer",
          description: "Your answer wasn't saved. Please check your connection.",
          variant: "destructive",
        });
      } else {
        console.log('Answer saved successfully:', data);
        // Success toast only for first few questions to not be annoying
        if (currentIndex < 3) {
          toast({
            title: "Answer saved!",
            description: `Your ${isCorrect ? 'correct' : 'incorrect'} answer has been recorded.`,
          });
        }
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      toast({
        title: "Failed to save answer",
        description: "Your answer wasn't saved. Please check your connection.",
        variant: "destructive",
      });
    }

    // Generate AI explanation if answer is incorrect
    if (!isCorrect) {
      generateAiExplanation(currentQuestion, selectedAnswer);
    }
  };

  const generateAiExplanation = async (question: Question, studentAnswer: string) => {
    setGeneratingExplanation(true);
    setAiExplanation('');

    try {
      const { data, error } = await supabase.functions.invoke('explain-question-mistake', {
        body: {
          question: question.example_question,
          student_answer: studentAnswer,
          correct_answer: question.correct_answer,
          misconception: question.red_herring_tag?.[0] || 'general_mistake',
          topic: question.topic
        }
      });

      if (error) {
        console.error('Error generating explanation:', error);
        setAiExplanation("I'm having trouble creating your explanation right now. The main thing is to learn from this mistake and try a different approach next time!");
        return;
      }

      if (data?.explanation) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation("I'm working on your explanation! In the meantime, remember that making mistakes is how we learn. You're doing great!");
      }
    } catch (error) {
      console.error('Exception during AI explanation:', error);
      setAiExplanation("Every mistake is a step closer to getting it right! Keep practicing and you'll master this concept.");
    } finally {
      setGeneratingExplanation(false);
    }
  };

  const generateAdditionalQuestions = async () => {
    if (generatingQuestions) return;
    
    setGeneratingQuestions(true);
    try {
      // Get user's weak topics to focus generation
      const { data: weakTopics } = await supabase
        .rpc('get_weak_topics', { p_student_id: user?.id });
      
      // Determine what topic/subtopic to generate for
      let targetTopic = 'Mathematics';
      let targetSubtopic = 'General';
      let targetDifficulty = 'Medium';
      
      if (weakTopics && weakTopics.length > 0) {
        targetTopic = weakTopics[0].topic;
        // Get a random subtopic from existing curriculum for this topic
        const { data: existingQuestions } = await supabase
          .from('curriculum')
          .select('subtopic, difficulty')
          .eq('topic', targetTopic)
          .limit(10);
        
        if (existingQuestions && existingQuestions.length > 0) {
          const randomQuestion = existingQuestions[Math.floor(Math.random() * existingQuestions.length)];
          targetSubtopic = randomQuestion.subtopic;
          targetDifficulty = randomQuestion.difficulty;
        }
      }

      console.log(`Generating questions for ${targetTopic} - ${targetSubtopic} (${targetDifficulty})`);
      
      const response = await fetch(`https://gqkfbxhuijpfcnjimlfj.functions.supabase.co/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: targetTopic,
          subtopic: targetSubtopic,
          difficulty: targetDifficulty,
          count: 5,
          saveToDatabase: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const reader = response.body?.getReader();
      const newQuestions: Question[] = [];
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'question') {
                  const question = data.data;
                  // Format the question properly
                  const formattedQuestion: Question = {
                    ...question,
                    options: Array.isArray(question.options) ? question.options : 
                             typeof question.options === 'string' ? JSON.parse(question.options) : 
                             Object.values(question.options || {})
                  };
                  newQuestions.push(formattedQuestion);
                }
              } catch (e) {
                console.error('Error parsing streaming data:', e);
              }
            }
          }
        }
      }
      
      if (newQuestions.length > 0) {
        setQuestions(prev => [...prev, ...newQuestions]);
        toast({
          title: "New questions generated!",
          description: `Added ${newQuestions.length} questions tailored to your learning needs.`,
        });
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Failed to generate questions",
        description: "Continuing with existing questions.",
        variant: "destructive",
      });
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleNextQuestion = async () => {
    // Check if we're running low on questions and generate more if needed
    const remainingQuestions = questions.length - (currentIndex + 1);
    if (remainingQuestions <= 3 && !generatingQuestions) {
      generateAdditionalQuestions();
    }
    
    if (currentIndex + 1 >= questions.length) {
      setSessionComplete(true);
      return;
    }
    
    setCurrentIndex(currentIndex + 1);
    setSelectedAnswer('');
    setIsAnswered(false);
    setShowExplanation(false);
    setAiExplanation('');
    setGeneratingExplanation(false);
    setStartTime(new Date());
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer('');
    setIsAnswered(false);
    setShowExplanation(false);
    setAiExplanation('');
    setGeneratingExplanation(false);
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

  if (questions.length === 0 && !loading) {
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
              {generatingQuestions && (
                <span className="ml-2 text-blue-600 text-xs">
                  • Generating more questions...
                </span>
              )}
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
                <span className="text-sm text-right leading-tight max-w-[12rem] sm:max-w-xs" style={{ textWrap: 'balance' }}>{currentQuestion.subtopic}</span>
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

        {/* AI Explanation Card */}
        {showExplanation && !selectedAnswer?.includes(currentQuestion.correct_answer) && (
          <Card className="mx-auto max-w-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-center flex items-center justify-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Explanation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-6">
              {generatingExplanation && (
                <div className="bg-blue-50 p-4 rounded border flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-blue-700">Creating a helpful explanation just for you...</span>
                </div>
              )}
              
              {aiExplanation && (
                <div className="bg-blue-50 p-4 rounded border">
                  <div className="text-sm whitespace-pre-line leading-[1.4] [&>div]:mb-6 [&>p]:mb-6 [&_h4]:mb-4">{aiExplanation}</div>
                </div>
              )}
              
              {!aiExplanation && !generatingExplanation && (
                <div className="bg-gray-50 p-4 rounded border text-center">
                  <p className="text-sm text-gray-600">Explanation will appear here automatically</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Static Explanation Card for correct answers or fallback */}
        {showExplanation && selectedAnswer === currentQuestion.correct_answer && (currentQuestion.red_herring_explanation || currentQuestion.pedagogical_notes) && (
          <Card className="mx-auto max-w-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-center">Great job!</CardTitle>
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