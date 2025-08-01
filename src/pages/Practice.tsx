import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, RotateCcw, Sparkles, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAgeGroup } from '@/contexts/AgeGroupContext';
import { AgeGroupSelector } from '@/components/AgeGroupSelector';
import { SessionStartModal } from '@/components/SessionStartModal';
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
  const {
    user
  } = useAuth();
  const {
    selectedAgeGroup
  } = useAgeGroup();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [sessionComplete, setSessionComplete] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [generatingExplanation, setGeneratingExplanation] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<{
    question: Question;
    isCorrect: boolean;
    timeTaken: number;
  }[]>([]);
  const [showSessionStartModal, setShowSessionStartModal] = useState(true);
  const [sessionQuestionCount, setSessionQuestionCount] = useState(10);
  const [sessionDifficulty, setSessionDifficulty] = useState<string | undefined>(undefined);
  useEffect(() => {
    setSessionStartTime(new Date());
    // Don't automatically load questions - wait for user to start session
  }, [user, selectedAgeGroup]);

  // Record session when user leaves the practice page
  useEffect(() => {
    const recordSessionOnLeave = () => {
      if (answeredQuestions.length > 0) {
        recordSessionResults();
      }
    };

    // Handle page navigation away from component
    return () => {
      recordSessionOnLeave();
    };
  }, [answeredQuestions]);

  // Handle browser tab close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (answeredQuestions.length > 0) {
        recordSessionResults();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [answeredQuestions]);

  // Function removed - now using selectedAgeGroup from context

  const loadAdaptiveQuestions = async (ageGroup: 'year 2-3' | 'year 4-5' | '11+' = 'year 4-5', questionCount: number = 20, difficulty?: string) => {
    try {
      setLoading(true);

      // Get all question IDs the user has already answered to ensure no repeats
      const {
        data: answeredQuestions
      } = await supabase.from('student_answers').select('question_id').eq('student_id', user?.id);
      const answeredQuestionIds = answeredQuestions?.map(q => q.question_id) || [];

      // Get random questions from ALL topics that the user has never seen for their age group
      let query = supabase.from('curriculum').select('*').eq('age_group', ageGroup).limit(questionCount);
      if (answeredQuestionIds.length > 0) {
        query = query.not('question_id', 'in', `(${answeredQuestionIds.map(id => `'${id}'`).join(',')})`);
      }
      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }
      const {
        data: newQuestions,
        error: newError
      } = await query;
      let questions: Question[] = [];
      if (newQuestions && newQuestions.length > 0) {
        // Format questions and shuffle them randomly for variety
        questions = newQuestions.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : typeof q.options === 'string' ? JSON.parse(q.options) : Object.values(q.options || {})
        })).sort(() => Math.random() - 0.5); // Randomize the order

        console.log(`Loaded ${questions.length} new questions from ${new Set(questions.map(q => q.topic)).size} different topics`);
      } else {
        console.log('No new questions available, need to generate more');

        // If no new questions available, generate more AI questions from random topics
        await generateAdditionalQuestions();

        // After generation, try loading new questions again
        let freshQuery = supabase.from('curriculum').select('*').not('question_id', 'in', answeredQuestionIds.length > 0 ? `(${answeredQuestionIds.map(id => `'${id}'`).join(',')})` : '()').limit(questionCount);
        if (difficulty) {
          freshQuery = freshQuery.eq('difficulty', difficulty);
        }
        const {
          data: freshQuestions
        } = await freshQuery;
        if (freshQuestions && freshQuestions.length > 0) {
          questions = freshQuestions.map(q => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : typeof q.options === 'string' ? JSON.parse(q.options) : Object.values(q.options || {})
          })).sort(() => Math.random() - 0.5); // Randomize the order
        } else {
          toast({
            title: "No new questions available",
            description: "Please try again later or contact support.",
            variant: "destructive"
          });
          return;
        }
      }
      setQuestions(questions);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error loading questions",
        description: "Failed to load practice questions.",
        variant: "destructive"
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

    // Calculate time taken for this question
    const timeTaken = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

    // Store question result for session recording
    setAnsweredQuestions(prev => [...prev, {
      question: currentQuestion,
      isCorrect,
      timeTaken
    }]);

    // Time taken was already calculated above

    // Analyze red herrings triggered
    let redHerringTriggered: string[] = [];
    if (!isCorrect && currentQuestion.red_herring_tag) {
      // Map common wrong answers to red herring tags
      redHerringTriggered = currentQuestion.red_herring_tag;
    }

    // Determine if difficulty was appropriate (based on time taken and correctness)
    const difficultyAppropriate = (() => {
      if (isCorrect && timeTaken < 30) return true; // Too easy
      if (isCorrect && timeTaken < 120) return true; // Just right
      if (!isCorrect && timeTaken > 180) return false; // Too hard
      return null; // Uncertain
    })();

    // Save enhanced answer data to database immediately
    try {
      console.log('Saving answer for question:', currentQuestion.question_id);
      const {
        data,
        error
      } = await supabase.from('student_answers').insert({
        student_id: user?.id,
        question_id: currentQuestion.question_id,
        topic: currentQuestion.topic,
        subtopic: currentQuestion.subtopic,
        difficulty: currentQuestion.difficulty,
        answer_given: selectedAnswer,
        is_correct: isCorrect,
        time_taken_seconds: timeTaken,
        red_herring_triggered: redHerringTriggered.length > 0 ? redHerringTriggered : null,
        difficulty_appropriate: difficultyAppropriate,
        age_group: selectedAgeGroup
      });
      if (error) {
        console.error('Error saving answer:', error);
        toast({
          title: "Failed to save answer",
          description: "Your answer wasn't saved. Please check your connection.",
          variant: "destructive"
        });
      } else {
        console.log('Answer saved successfully:', data);
        // Success toast only for first few questions to not be annoying
        if (currentIndex < 3) {
          toast({
            title: "Answer saved!",
            description: `Your ${isCorrect ? 'correct' : 'incorrect'} answer has been recorded.`
          });
        }
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      toast({
        title: "Failed to save answer",
        description: "Your answer wasn't saved. Please check your connection.",
        variant: "destructive"
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
      const {
        data,
        error
      } = await supabase.functions.invoke('explain-question-mistake', {
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
    toast({
      title: "Generating new questions...",
      description: "Creating random questions from various topics."
    });
    try {
      // Get already answered questions to avoid duplicates
      const {
        data: answeredQuestions
      } = await supabase.from('student_answers').select('question_id').eq('student_id', user?.id);
      const answeredQuestionIds = answeredQuestions?.map(q => q.question_id) || [];

      // Get a random existing topic/subtopic combination from the curriculum
      const {
        data: existingTopics
      } = await supabase.from('curriculum').select('topic, subtopic, difficulty').not('question_id', 'in', answeredQuestionIds.length > 0 ? `(${answeredQuestionIds.map(id => `'${id}'`).join(',')})` : '()').limit(50);
      let targetTopic = 'Number - Number and Place Value';
      let targetSubtopic = 'Read, write, order and compare numbers';
      let targetDifficulty = 'Medium';
      if (existingTopics && existingTopics.length > 0) {
        // Pick a completely random topic/subtopic combination
        const randomSelection = existingTopics[Math.floor(Math.random() * existingTopics.length)];
        targetTopic = randomSelection.topic;
        targetSubtopic = randomSelection.subtopic;
        targetDifficulty = randomSelection.difficulty;
      }
      console.log(`Generating questions for ${targetTopic} - ${targetSubtopic} (${targetDifficulty})`);
      const {
        data: response,
        error: functionError
      } = await supabase.functions.invoke('generate-questions', {
        body: {
          topic: targetTopic,
          subtopic: targetSubtopic,
          difficulty: targetDifficulty,
          count: 10,
          // Generate more questions to reduce future generation needs
          saveToDatabase: true
        }
      });
      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error('Failed to generate questions');
      }
      console.log('Generated questions response:', response);
      if (response) {
        toast({
          title: "Questions generated successfully!",
          description: `New questions added for topic: ${targetTopic}`
        });
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Failed to generate questions",
        description: "We'll try again when you need more questions.",
        variant: "destructive"
      });
    } finally {
      setGeneratingQuestions(false);
    }
  };
  const handleNextQuestion = async () => {
    // Check if we're running low on questions and generate more if needed
    const remainingQuestions = questions.length - (currentIndex + 1);
    if (remainingQuestions <= 5 && !generatingQuestions) {
      console.log(`Running low on questions (${remainingQuestions} remaining), generating more...`);
      await generateAdditionalQuestions();

      // Reload questions to include newly generated ones
      setTimeout(async () => {
        const {
          data: answeredQuestions
        } = await supabase.from('student_answers').select('question_id').eq('student_id', user?.id);
        const answeredQuestionIds = answeredQuestions?.map(q => q.question_id) || [];
        const {
          data: newQuestions
        } = await supabase.from('curriculum').select('*').not('question_id', 'in', answeredQuestionIds.length > 0 ? `(${answeredQuestionIds.map(id => `'${id}'`).join(',')})` : '()').limit(20);
        if (newQuestions && newQuestions.length > 0) {
          const formattedQuestions = newQuestions.map(q => ({
            ...q,
            options: Array.isArray(q.options) ? q.options : typeof q.options === 'string' ? JSON.parse(q.options) : Object.values(q.options || {})
          })).sort(() => Math.random() - 0.5); // Randomize order for variety

          // Replace current questions with fresh randomized set
          setQuestions(formattedQuestions);
          console.log(`Refreshed with ${formattedQuestions.length} questions from ${new Set(formattedQuestions.map(q => q.topic)).size} topics`);
        }
      }, 2000); // Wait for generation to complete
    }
    if (currentIndex + 1 >= sessionQuestionCount) {
      setSessionComplete(true);
      // Record the session in the database
      recordSessionResults();
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
  const recordSessionResults = async () => {
    try {
      const sessionEndTime = new Date();
      const totalQuestions = answeredQuestions.length;
      const correctAnswers = answeredQuestions.filter(q => q.isCorrect).length;

      // Calculate average time per question
      const totalTime = answeredQuestions.reduce((sum, q) => sum + q.timeTaken, 0);
      const averageTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;

      // Get unique topics and difficulty levels
      const topicsCovered = [...new Set(answeredQuestions.map(q => q.question.topic))];
      const difficultyLevels = [...new Set(answeredQuestions.map(q => q.question.difficulty))];
      const {
        data,
        error
      } = await supabase.from('practice_sessions').insert({
        student_id: user?.id,
        session_start: sessionStartTime.toISOString(),
        session_end: sessionEndTime.toISOString(),
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        average_time_per_question: averageTimePerQuestion,
        topics_covered: topicsCovered,
        difficulty_levels: difficultyLevels,
        age_group: selectedAgeGroup
      });
      if (error) {
        console.error('Error recording session:', error);
        toast({
          title: "Session not saved",
          description: "Your practice session results couldn't be saved.",
          variant: "destructive"
        });
      } else {
        console.log('Session recorded successfully:', data);
        toast({
          title: "Session saved!",
          description: "Your practice session has been recorded."
        });
      }
    } catch (error) {
      console.error('Error recording session:', error);
      toast({
        title: "Session not saved",
        description: "There was an error saving your session.",
        variant: "destructive"
      });
    }
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
    setSessionStartTime(new Date());
    setAnsweredQuestions([]);
    setShowSessionStartModal(true);
  };

  const handleSessionStart = (questionCount: number, difficulty?: string) => {
    setSessionQuestionCount(questionCount);
    setSessionDifficulty(difficulty);
    setSessionStartTime(new Date());
    setStartTime(new Date());
    loadAdaptiveQuestions(selectedAgeGroup, questionCount, difficulty);
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Preparing your personalized questions...</p>
        </div>
      </div>;
  }
  if (questions.length === 0 && !loading && !showSessionStartModal) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No questions available at the moment.</p>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>;
  }
  if (sessionComplete) {
    const accuracy = answeredQuestions.length > 0 ? Math.round(score / answeredQuestions.length * 100) : 0;
    return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Session Complete!</CardTitle>
            <CardDescription>Here's how you performed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{accuracy}%</div>
              <div className="text-muted-foreground">
                {score} out of {answeredQuestions.length} correct
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
      </div>;
  }
  
  // Don't render the practice interface if no questions are available yet
  if (questions.length === 0) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <SessionStartModal 
        isOpen={showSessionStartModal}
        onClose={() => navigate('/dashboard')}
        onStart={handleSessionStart}
      />
    </div>;
  }
  
  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + 1) / sessionQuestionCount * 100;
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <SessionStartModal 
        isOpen={showSessionStartModal}
        onClose={() => setShowSessionStartModal(false)}
        onStart={handleSessionStart}
      />
      <div className="container mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="px-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <div className="text-center flex-1 mx-8">
            <p className="text-sm text-muted-foreground mb-2">
              Question {currentIndex + 1} of {sessionQuestionCount}
              {generatingQuestions && <span className="ml-2 text-blue-600 text-xs">
                  • Generating more questions...
                </span>}
            </p>
            <Progress value={progress} className="w-64 h-2 mx-auto" />
          </div>
          <AgeGroupSelector />
        </div>

        {/* Question Card */}
        <Card className="mb-8 mx-auto max-w-3xl">
          <CardHeader className="pb-6 py-[10px] px-[10px]">
            <div className="flex items-center justify-between mb-2 gap-6 mx-[20px]">
              <div className="flex items-center space-x-3 flex-shrink-0 my-[3px]">
                <Badge variant="secondary" className="px-3 my-0 py-[5px] mx-0">{currentQuestion.topic}</Badge>
                <Badge variant="outline" className="px-3 py-[5px] mx-0 my-[3px]">{currentQuestion.difficulty}</Badge>
              </div>
              <div className="text-center min-w-[80px]">
                <Badge variant="outline" className="px-3 py-1 mx-0">Score: {score}/{currentIndex + (isAnswered ? 1 : 0)}</Badge>
              </div>
            </div>
            {currentQuestion.subtopic && <div className="mt-0 mb-8 bg-muted/20 rounded-lg border border-border px-[5px] my-0 py-px mx-[20px]">
                <div className="flex items-start space-x-2 py-[5px] my-0 px-[5px] mx-0">
                  <BookOpen className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed text-xs font-extralight">{currentQuestion.subtopic}</p>
                </div>
              </div>}
            <h3 className="text-xl font-medium leading-relaxed text-left px-4 mx-0 my-[20px] py-[20px]">{currentQuestion.example_question}</h3>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {/* Answer Options */}
            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correct_answer;
              const showCorrectness = isAnswered && (isSelected || isCorrect);
              return <button key={index} onClick={() => handleAnswerSelect(option)} disabled={isAnswered} className={`w-full p-5 text-left border rounded-lg transition-all ${isSelected ? isAnswered ? isCorrect ? 'border-green-500 bg-green-50 text-green-900' : 'border-red-500 bg-red-50 text-red-900' : 'border-primary bg-primary/5' : showCorrectness && isCorrect ? 'border-green-500 bg-green-50 text-green-900' : 'border-border hover:border-primary/50 hover:bg-accent/50'} ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-base leading-relaxed">{option}</span>
                      {showCorrectness && (isCorrect ? <CheckCircle className="h-5 w-5 text-green-600 ml-4 flex-shrink-0" /> : isSelected ? <XCircle className="h-5 w-5 text-red-600 ml-4 flex-shrink-0" /> : null)}
                    </div>
                  </button>;
            })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              {!isAnswered ? <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer} size="lg" className="px-8">
                  Submit Answer
                </Button> : <Button onClick={handleNextQuestion} size="lg" className="px-8">
                  {currentIndex + 1 >= sessionQuestionCount ? 'Finish Session' : 'Next Question'}
                </Button>}
            </div>
          </CardContent>
        </Card>

        {/* AI Explanation Card */}
        {showExplanation && !selectedAnswer?.includes(currentQuestion.correct_answer) && <Card className="mx-auto max-w-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-center flex items-center justify-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Explanation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-6">
              {generatingExplanation && <div className="bg-blue-50 p-4 rounded border flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  <span className="text-sm text-blue-700">Creating a helpful explanation just for you...</span>
                </div>}
              
              {aiExplanation && <div className="bg-blue-50 p-4 rounded border">
                  <div className="text-sm whitespace-pre-line leading-[1.4] [&>div]:mb-6 [&>p]:mb-6 [&_h4]:mb-4">{aiExplanation}</div>
                </div>}
              
              {!aiExplanation && !generatingExplanation && <div className="bg-gray-50 p-4 rounded border text-center">
                  <p className="text-sm text-gray-600">Explanation will appear here automatically</p>
                </div>}
            </CardContent>
          </Card>}

      </div>
    </div>;
};
export default Practice;