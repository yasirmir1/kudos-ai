import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, CheckCircle, XCircle, ArrowRight, Loader2, Calculator, Lightbulb, FileText } from 'lucide-react';
import { QuestionProgress } from './QuestionProgress';
import { FractionBar, NumberLine, GeometryShape } from './VisualMathTools';
import PracticeReport from './PracticeReport';
import { BootcampAPI, BootcampQuestion } from '../../lib/bootcamp-api';
import { EnhancedQuestionInterface } from './EnhancedQuestionInterface';
import { BootcampQuestion as EnhancedBootcampQuestion } from '@/hooks/useBootcampDatabase';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface AdaptedQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'text_input' | 'fraction_visual' | 'number_line' | 'geometry' | 'drawing';
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
  hint?: string;
  explanation?: string;
  visualData?: {
    totalParts?: number;
    min?: number;
    max?: number;
    step?: number;
    shapeType?: 'triangle' | 'rectangle' | 'circle';
  };
}

interface SessionData {
  sessionId: string;
  questions: AdaptedQuestion[];
  startTime: number;
  responses: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timeTaken: number;
  }>;
}

export const EnhancedPracticeSession: React.FC = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<AdaptedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timer, setTimer] = useState(90);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [sessionComplete, setSessionComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'question' | 'tools' | 'notes'>('question');
  const [notes, setNotes] = useState<string>('');
  const [topicNameMap, setTopicNameMap] = useState<Map<string, string>>(new Map());
  const [useEnhancedInterface, setUseEnhancedInterface] = useState(true);

  useEffect(() => {
    if (user) {
      loadTopicNames();
      loadQuestions();
      startSession();
    }
  }, [user]);

  const loadTopicNames = async () => {
    try {
      const { data: topics } = await supabase
        .from('bootcamp_topics')
        .select('id, name')
        .order('topic_order');
      
      const nameMap = new Map();
      if (topics) {
        topics.forEach((topic: any) => {
          nameMap.set(topic.id, topic.name);
        });
      }
      setTopicNameMap(nameMap);
    } catch (error) {
      console.error('Error loading topic names:', error);
    }
  };

  const startSession = async () => {
    if (!user) return;
    
    try {
      let studentProfile = await BootcampAPI.getStudentProfile(user.id);
      if (!studentProfile) {
        studentProfile = await BootcampAPI.createStudentProfile(user.id, {
          email: user.email,
          username: user.email?.split('@')[0] || 'Student',
          school_year: 7
        });
      }
      
      if (studentProfile) {
        const session = await BootcampAPI.startLearningSession(studentProfile.student_id);
        setSessionData({
          sessionId: session.session_id,
          questions: [],
          startTime: Date.now(),
          responses: []
        });
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
        studentProfile = await BootcampAPI.createStudentProfile(user.id, {
          email: user.email,
          username: user.email?.split('@')[0] || 'Student',
          school_year: 7
        });
      }

      const rawQuestions = await BootcampAPI.getAdaptiveQuestions(studentProfile.student_id, 15);
      
      const adaptedQuestions: AdaptedQuestion[] = rawQuestions.map((q: any, index: number) => {
        // Determine question type based on content and add visual elements for certain topics
        const hasOptions = q.option_a || q.option_b || q.option_c || q.option_d;
        let questionType: AdaptedQuestion['type'] = hasOptions ? 'multiple_choice' : 'text_input';
        
        // Add visual components for specific math topics
        if (q.topic_id?.toLowerCase().includes('fraction')) {
          questionType = 'fraction_visual';
        } else if (q.topic_id?.toLowerCase().includes('number') && index % 4 === 1) {
          questionType = 'number_line';
        } else if (q.topic_id?.toLowerCase().includes('geometry') || q.topic_id?.toLowerCase().includes('area')) {
          questionType = 'geometry';
        }
        
        if (questionType === 'multiple_choice') {
          const options = [
            { id: 'A', value: q.option_a, isCorrect: q.correct_answer === 'A' },
            { id: 'B', value: q.option_b, isCorrect: q.correct_answer === 'B' },
            { id: 'C', value: q.option_c, isCorrect: q.correct_answer === 'C' },
            { id: 'D', value: q.option_d, isCorrect: q.correct_answer === 'D' }
          ].filter(opt => opt.value);

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
            timeAllowed: q.time_seconds || 90,
            hint: generateHint(q.question_text, q.topic_id),
            explanation: q.explanation
          };
        } else {
          return {
            id: q.question_id,
            text: q.question_text,
            type: questionType,
            correct: q.correct_answer || q.explanation || '',
            topic: q.topic_id || 'General',
            difficulty: q.difficulty || 'foundation',
            timeAllowed: q.time_seconds || 90,
            hint: generateHint(q.question_text, q.topic_id),
            explanation: q.explanation,
            visualData: generateVisualData(questionType)
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

  const generateHint = (questionText: string, topic: string): string => {
    if (topic?.toLowerCase().includes('fraction')) {
      return "Think about parts of a whole. Use the visual tool to help!";
    } else if (topic?.toLowerCase().includes('decimal')) {
      return "Remember decimal place values: tenths, hundredths, thousandths...";
    } else if (topic?.toLowerCase().includes('geometry')) {
      return "Draw or visualize the shape. What formula applies here?";
    }
    return "Break the problem into smaller steps. What information do you have?";
  };

  const generateVisualData = (type: AdaptedQuestion['type']) => {
    switch (type) {
      case 'fraction_visual':
        return { totalParts: 8 };
      case 'number_line':
        return { min: 0, max: 20, step: 1 };
      case 'geometry':
        return { shapeType: 'rectangle' as const };
      default:
        return {};
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
      setShowHint(false);
      setActiveTab('question');
    }
  }, [currentQuestion, question]);


  const submitResponse = async (questionId: string, selectedOption: string, timeTaken: number) => {
    if (!user || !sessionData) return;
    
    try {
      const studentProfile = await BootcampAPI.getStudentProfile(user.id);
      if (studentProfile) {
        await BootcampAPI.submitResponse({
          student_id: studentProfile.student_id,
          question_id: questionId,
          selected_answer: selectedOption,
          time_taken_seconds: timeTaken,
          session_id: sessionData.sessionId
        });

        // Update session data
        const isCorrect = checkAnswer(selectedOption);
        setSessionData(prev => prev ? {
          ...prev,
          responses: [...prev.responses, {
            questionId,
            answer: selectedOption,
            isCorrect,
            timeTaken
          }]
        } : null);
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const checkAnswer = (answer: string): boolean => {
    if (!question) return false;
    
    if (question.type === 'multiple_choice') {
      return question.options?.find(opt => opt.id === answer)?.isCorrect || false;
    } else {
      return answer.toLowerCase().trim() === question.correct.toLowerCase().trim();
    }
  };

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

  const handleVisualToolSubmit = async (answer: string) => {
    if (!question) return;
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = checkAnswer(answer);
    
    setTextAnswer(answer);
    setShowFeedback(true);
    setIsPaused(true);
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    
    await submitResponse(question.id, answer, timeTaken);
  };

  const handleTextSubmit = async () => {
    if (!question || !textAnswer.trim()) return;
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = checkAnswer(textAnswer);
    
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
    if (!sessionData) return;
    
    try {
      await BootcampAPI.endLearningSession(sessionData.sessionId, questions.length, correctCount);
      setSessionComplete(true);
      toast.success('Practice session completed!');
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'foundation': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getOptionStyles = (option: { id: string; isCorrect: boolean }) => {
    if (!showFeedback) {
      return selectedAnswer === option.id 
        ? 'border-primary bg-primary/10' 
        : 'border-border hover:border-border/60 hover:bg-muted/50';
    }
    if (option.isCorrect) return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    if (option.id === selectedAnswer && !option.isCorrect) return 'border-destructive bg-destructive/10';
    return 'border-border';
  };

  // Handle keyboard navigation - Enter to go to next question
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Enter key when feedback is shown (ready to move to next)
      if (e.key === 'Enter' && showFeedback) {
        e.preventDefault();
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFeedback, handleNext]);

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

  if (sessionComplete && sessionData) {
    return (
      <PracticeReport 
        sessionData={{
          date: new Date().toISOString().split('T')[0],
          duration: `${Math.floor((Date.now() - sessionData.startTime) / 60000)} minutes`,
          questionsCompleted: questions.length,
          accuracy: Math.round((correctCount / questions.length) * 100),
          topicsCovered: [...new Set(questions.map(q => topicNameMap.get(q.topic) || q.topic))],
          strengths: ['Visual problem solving', 'Interactive tools usage'],
          improvements: ['Multi-step reasoning', 'Time management'],
          misconceptions: [],
          recommendedActions: [
            'Continue using visual tools for fractions',
            'Practice more geometry problems',
            'Review number line concepts'
          ],
          pointsEarned: correctCount * 10,
          streakDays: 5
        }}
      />
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
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold">Practice Complete!</h2>
        <p className="text-muted-foreground">
          You scored {correctCount} out of {questions.length} questions
        </p>
      </div>
    );
  }

  // Convert AdaptedQuestion to EnhancedBootcampQuestion format for EnhancedQuestionInterface
  const enhancedQuestion: EnhancedBootcampQuestion = {
    question_id: question.id,
    module_id: 'practice',
    topic_id: question.topic,
    subtopic_id: 'general',
    question_text: question.text,
    question_type: 'multiple_choice',
    question_category: 'arithmetic',
    difficulty: question.difficulty as 'foundation' | 'intermediate' | 'advanced',
    cognitive_level: 'application',
    option_a: question.options?.[0]?.value || '',
    option_b: question.options?.[1]?.value || '',
    option_c: question.options?.[2]?.value || '',
    option_d: question.options?.[3]?.value || '',
    correct_answer: question.correct,
    explanation: question.explanation || '',
    visual_aid: question.visualData ? 'Visual aid available' : '',
    prerequisite_skills: [],
    exam_boards: [],
    marks: 1,
    time_seconds: question.timeAllowed
  };

  if (useEnhancedInterface) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Enhanced Practice Session</h2>
            <Badge variant="outline">AI-Powered Learning</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUseEnhancedInterface(false)}
          >
            Switch to Classic View
          </Button>
        </div>
        
        <EnhancedQuestionInterface
          question={enhancedQuestion}
          onAnswer={(response) => {
            console.log('Enhanced response:', response);
            if (response.isCorrect) {
              setCorrectCount(prev => prev + 1);
            }
            setShowFeedback(true);
            setTimeout(() => {
              handleNext();
            }, 3000); // Auto-advance after feedback
          }}
          questionNumber={currentQuestion + 1}
          totalQuestions={questions.length}
          showConfidenceRating={true}
          showContextualHints={true}
        />
        
        {showFeedback && (
          <div className="text-center pt-4">
            <Button onClick={handleNext} size="lg" className="gap-2">
              Next Question <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Classic Practice Session</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUseEnhancedInterface(true)}
        >
          Switch to Enhanced View
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <Badge className={getDifficultyColor(question.difficulty)}>
                {question.difficulty}
              </Badge>
              <Badge variant="outline">{question.topic}</Badge>
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
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'question' | 'tools' | 'notes')} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="question">Question</TabsTrigger>
              <TabsTrigger value="tools">Visual Tools</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="question" className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-4">{question.text}</h3>
                
                {question.hint && showHint && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">{question.hint}</p>
                    </div>
                  </div>
                )}

                {!showHint && question.hint && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowHint(true)}
                    className="mb-4"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Show Hint
                  </Button>
                )}
              </div>

              {/* Question Interface */}
              {question.type === 'multiple_choice' && question.options ? (
                <div className="space-y-3">
                  {question.options?.map(option => (
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
                          <CheckCircle className="h-5 w-5 text-green-500" />
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
              ) : question.type === 'text_input' ? (
                <div className="space-y-4">
                  <Input
                    type="text"
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    disabled={showFeedback}
                    placeholder="Type your answer here..."
                    className="text-lg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !showFeedback && textAnswer.trim()) {
                        handleTextSubmit();
                      }
                    }}
                  />
                  {!showFeedback && (
                    <Button
                      onClick={handleTextSubmit}
                      disabled={!textAnswer.trim()}
                    >
                      Submit Answer
                    </Button>
                  )}
                </div>
              ) : null}

              {/* Feedback Display */}
              {showFeedback && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 ${
                    (question.type === 'multiple_choice' && question.options?.find(opt => opt.id === selectedAnswer)?.isCorrect) ||
                    (question.type !== 'multiple_choice' && checkAnswer(textAnswer))
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-destructive bg-destructive/10'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {((question.type === 'multiple_choice' && question.options?.find(opt => opt.id === selectedAnswer)?.isCorrect) ||
                        (question.type !== 'multiple_choice' && checkAnswer(textAnswer))) ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-green-700 dark:text-green-300 font-medium">Excellent!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-destructive" />
                          <span className="text-destructive font-medium">Not quite right</span>
                        </>
                      )}
                    </div>
                    {question.explanation && (
                      <p className="text-sm text-muted-foreground">{question.explanation}</p>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleNext}>
                      <span>{currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish'}</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              {question.type === 'fraction_visual' && question.visualData && (
                <FractionBar
                  question={{
                    prompt: "Use the visual tool to solve: " + question.text,
                    totalParts: question.visualData.totalParts
                  }}
                  onAnswerSubmit={handleVisualToolSubmit}
                />
              )}
              
              {question.type === 'number_line' && question.visualData && (
                <NumberLine
                  question={{
                    prompt: "Use the number line to solve: " + question.text,
                    min: question.visualData.min,
                    max: question.visualData.max,
                    step: question.visualData.step
                  }}
                  onAnswerSubmit={handleVisualToolSubmit}
                />
              )}
              
              {question.type === 'geometry' && question.visualData && (
                <GeometryShape
                  question={{
                    prompt: "Use the geometry tool to solve: " + question.text,
                    shapeType: question.visualData.shapeType || 'rectangle'
                  }}
                  onAnswerSubmit={handleVisualToolSubmit}
                />
              )}

              {!['fraction_visual', 'number_line', 'geometry'].includes(question.type) && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Visual tools not available for this question type.</p>
                    <p className="text-sm text-muted-foreground mt-2">Switch to the Question tab to answer.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Working Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Use this space for calculations, sketches, or notes..."
                    className="min-h-32"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <QuestionProgress 
        current={currentQuestion + 1} 
        total={questions.length} 
        correct={correctCount} 
      />
    </div>
  );
};