import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { QuestionProgress } from './QuestionProgress';
import { BootcampAPI, BootcampQuestion } from '../../lib/bootcamp-api';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

interface AdaptedQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'text_input';
  options?: Array<{
    id: string;
    value: string;
    feedback: string;
    isCorrect: boolean;
  }>;
  correct: string;
  topic: string;
  difficulty: 'foundation' | 'intermediate' | 'advanced';
  timeAllowed: number;
}

export const PracticeSession: React.FC = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<AdaptedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [timer, setTimer] = useState(90);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (user) {
      loadQuestions();
      startSession();
    }
  }, [user]);

  const startSession = async () => {
    if (!user) return;
    
    try {
      let studentProfile = await BootcampAPI.getStudentProfile(user.id);
      if (!studentProfile) {
        // Auto-create profile if it doesn't exist
        studentProfile = await BootcampAPI.createStudentProfile(user.id, {
          email: user.email,
          username: user.email?.split('@')[0] || 'Student',
          school_year: 7
        });
      }
      
      if (studentProfile) {
        const session = await BootcampAPI.startLearningSession(studentProfile.student_id);
        setSessionId(session.session_id);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const loadQuestions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let studentProfile = await BootcampAPI.getStudentProfile(user.id);
      if (!studentProfile) {
        // Auto-create profile if it doesn't exist
        studentProfile = await BootcampAPI.createStudentProfile(user.id, {
          email: user.email,
          username: user.email?.split('@')[0] || 'Student',
          school_year: 7
        });
      }

      const rawQuestions = await BootcampAPI.getAdaptiveQuestions(studentProfile.student_id, 20);
      
      const adaptedQuestions: AdaptedQuestion[] = rawQuestions.map((q: any) => {
        // Determine question type based on available options
        const hasOptions = q.option_a || q.option_b || q.option_c || q.option_d;
        const questionType = hasOptions ? 'multiple_choice' : 'text_input';
        
        if (questionType === 'multiple_choice') {
          // Convert the database format to the expected format for multiple choice
          const options = [
            { id: 'A', value: q.option_a, isCorrect: q.correct_answer === 'A' },
            { id: 'B', value: q.option_b, isCorrect: q.correct_answer === 'B' },
            { id: 'C', value: q.option_c, isCorrect: q.correct_answer === 'C' },
            { id: 'D', value: q.option_d, isCorrect: q.correct_answer === 'D' }
          ].filter(opt => opt.value); // Remove empty options

          return {
            id: q.question_id,
            text: q.question_text,
            type: 'multiple_choice',
            options: options.map(opt => ({
              id: opt.id,
              value: opt.value,
              feedback: opt.isCorrect ? q.explanation || 'Correct!' : 'Not quite right.',
              isCorrect: opt.isCorrect
            })),
            correct: q.correct_answer || 'A',
            topic: q.topic_id || 'General',
            difficulty: q.difficulty || 'foundation',
            timeAllowed: q.time_seconds || 90
          };
        } else {
          // Text input question
          return {
            id: q.question_id,
            text: q.question_text,
            type: 'text_input',
            correct: q.correct_answer || q.explanation || '',
            topic: q.topic_id || 'General',
            difficulty: q.difficulty || 'foundation',
            timeAllowed: q.time_seconds || 90
          };
        }
      });
      
      setQuestions(adaptedQuestions);
      if (adaptedQuestions.length > 0) {
        setTimer(adaptedQuestions[0].timeAllowed);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async (questionId: string, selectedOption: string, timeTaken: number) => {
    if (!user || !sessionId) return;
    
    try {
      const studentProfile = await BootcampAPI.getStudentProfile(user.id);
      if (studentProfile) {
        await BootcampAPI.submitResponse({
          student_id: studentProfile.student_id,
          question_id: questionId,
          selected_answer: selectedOption,
          time_taken_seconds: timeTaken,
          session_id: sessionId
        });
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const question = questions[currentQuestion];

  useEffect(() => {
    if (!isPaused && timer > 0 && !showFeedback && question) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, timer, showFeedback, question]);

  useEffect(() => {
    if (question) {
      setTimer(question.timeAllowed);
      setStartTime(Date.now());
    }
  }, [currentQuestion, question]);

  const handleAnswerSelect = async (optionId: string) => {
    if (!question || question.type !== 'multiple_choice') return;
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = question.options?.find(opt => opt.id === optionId)?.isCorrect || false;
    
    setSelectedAnswer(optionId);
    setShowFeedback(true);
    setIsPaused(true);
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    
    await submitResponse(question.id, optionId, timeTaken);
  };

  const handleTextSubmit = async () => {
    if (!question || question.type !== 'text_input' || !textAnswer.trim()) return;
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = textAnswer.trim().toLowerCase() === question.correct.toLowerCase();
    
    setShowFeedback(true);
    setIsPaused(true);
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    
    await submitResponse(question.id, textAnswer.trim(), timeTaken);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(current => current + 1);
      setSelectedAnswer(null);
      setTextAnswer('');
      setShowFeedback(false);
      setIsPaused(false);
    } else {
      endSession();
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    
    try {
      await BootcampAPI.endLearningSession(sessionId, questions.length, correctCount);
      toast.success('Practice session completed!');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'foundation': return 'bg-success/10 text-success';
      case 'intermediate': return 'bg-primary/10 text-primary';
      case 'advanced': return 'bg-secondary/20 text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getOptionStyles = (option: { id: string; isCorrect: boolean }) => {
    if (!showFeedback) {
      return selectedAnswer === option.id 
        ? 'border-primary bg-primary/10' 
        : 'border-border hover:border-border/60 hover:bg-muted/50';
    }
    if (option.isCorrect) return 'border-success bg-success/10';
    if (option.id === selectedAnswer && !option.isCorrect) return 'border-destructive bg-destructive/10';
    return 'border-border';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your personalized questions...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="text-center p-8 space-y-4">
        <p className="text-lg font-medium">No questions available</p>
        <p className="text-muted-foreground">Please try again later or contact support.</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center p-8 space-y-4">
        <CheckCircle className="h-16 w-16 text-success mx-auto" />
        <h2 className="text-2xl font-bold">Practice Complete!</h2>
        <p className="text-muted-foreground">
          You scored {correctCount} out of {questions.length} questions
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <div className={`flex items-center space-x-2 ${timer < 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Timer className="h-4 w-4" />
              <span className="font-mono">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xl font-medium text-foreground mb-2">{question.text}</p>
          <p className="text-sm text-muted-foreground">Topic: {question.topic}</p>
        </div>

        {question.type === 'multiple_choice' && question.options ? (
          <div className="space-y-3">
            {question.options.map(option => (
              <button
                key={option.id}
                onClick={() => !showFeedback && handleAnswerSelect(option.id)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  getOptionStyles(option)
                } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-muted-foreground">{option.id}.</span>
                    <span className="text-foreground">{option.value}</span>
                  </div>
                  {showFeedback && option.isCorrect && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                  {showFeedback && option.id === selectedAnswer && !option.isCorrect && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                {showFeedback && option.id === selectedAnswer && (
                  <p className="mt-2 text-sm text-muted-foreground">{option.feedback}</p>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={showFeedback}
                placeholder="Type your answer here..."
                className="w-full p-4 text-lg border-2 border-border rounded-lg focus:border-primary focus:outline-none disabled:bg-muted disabled:cursor-not-allowed"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !showFeedback && textAnswer.trim()) {
                    handleTextSubmit();
                  }
                }}
              />
            </div>
            {!showFeedback && (
              <button
                onClick={handleTextSubmit}
                disabled={!textAnswer.trim()}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            )}
            {showFeedback && (
              <div className="p-4 rounded-lg border-2 border-border bg-muted/50">
                <div className="flex items-center space-x-2 mb-2">
                  {textAnswer.trim().toLowerCase() === question.correct.toLowerCase() ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-success" />
                      <span className="text-success font-medium">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-destructive" />
                      <span className="text-destructive font-medium">Not quite right</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Your answer:</strong> {textAnswer}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Correct answer:</strong> {question.correct}
                </p>
              </div>
            )}
          </div>
        )}

        {showFeedback && question.type === 'multiple_choice' && (
          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {question.options?.find(opt => opt.id === selectedAnswer)?.isCorrect ? (
                <>
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-success font-medium">Excellent!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="text-destructive font-medium">Not quite right</span>
                </>
              )}
            </div>
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span>{currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {showFeedback && question.type === 'text_input' && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span>{currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <QuestionProgress 
        current={currentQuestion + 1} 
        total={questions.length} 
        correct={correctCount} 
      />
    </div>
  );
};