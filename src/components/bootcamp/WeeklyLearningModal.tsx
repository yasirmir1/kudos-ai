import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  Target, 
  Brain, 
  ArrowRight, 
  CheckCircle,
  Play,
  Calendar,
  Users,
  Clock
} from 'lucide-react';
import { useBootcampData } from '@/hooks/useBootcampData';
import { toast } from 'sonner';

interface WeeklyPlan {
  week: number;
  title: string;
  topics: string[];
  module: string;
  difficulty: string;
  focus: string;
}

interface Topic {
  id: string;
  name: string;
  module_id: string;
  difficulty: string;
  skills: string[];
  topic_order: number;
}

interface Question {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  topic_id: string;
  difficulty: string;
  explanation?: string;
}

interface WeeklyLearningModalProps {
  weekPlan: WeeklyPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WeeklyLearningModal({ weekPlan, isOpen, onClose }: WeeklyLearningModalProps) {
  const { student, fetchBootcampData } = useBootcampData();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    questionsAnswered: 0,
    questionsCorrect: 0,
    startTime: null as Date | null,
    sessionId: null as string | null
  });

  useEffect(() => {
    if (weekPlan && isOpen) {
      loadWeeklyContent();
      resetSession();
    }
  }, [weekPlan, isOpen]);

  const resetSession = () => {
    setCurrentQuestionIndex(0);
    setSessionStarted(false);
    setSessionCompleted(false);
    setSelectedAnswer('');
    setShowExplanation(false);
    setSessionStats({
      questionsAnswered: 0,
      questionsCorrect: 0,
      startTime: null,
      sessionId: null
    });
  };

  const loadWeeklyContent = async () => {
    if (!weekPlan) return;
    
    setLoading(true);
    try {
      // Fetch topics for this week
      const { data: topicsData, error: topicsError } = await supabase
        .from('bootcamp_topics')
        .select('*')
        .in('name', weekPlan.topics)
        .order('topic_order');

      if (topicsError) throw topicsError;
      setTopics(topicsData || []);

      // Fetch questions for these topics (mix of difficulties)
      if (topicsData && topicsData.length > 0) {
        const topicIds = topicsData.map(t => t.id);
        const { data: questionsData, error: questionsError } = await supabase
          .from('bootcamp_questions')
          .select('*')
          .in('topic_id', topicIds)
          .limit(15); // 15 questions per weekly session

        if (questionsError) throw questionsError;
        
        // Shuffle questions for variety
        const shuffledQuestions = (questionsData || []).sort(() => Math.random() - 0.5);
        setQuestions(shuffledQuestions);
      }
    } catch (error) {
      console.error('Error loading weekly content:', error);
      toast.error('Failed to load weekly content');
    }
    setLoading(false);
  };

  const startSession = async () => {
    if (!student?.student_id) return;

    try {
      // Create a learning session
      const { data: sessionData, error: sessionError } = await supabase
        .from('bootcamp_learning_sessions')
        .insert({
          student_id: student.student_id,
          session_type: 'weekly_plan',
          topics_covered: weekPlan?.topics || [],
          questions_attempted: 0,
          questions_correct: 0
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSessionStats(prev => ({
        ...prev,
        startTime: new Date(),
        sessionId: sessionData.session_id
      }));
      setSessionStarted(true);
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start learning session');
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !questions[currentQuestionIndex] || !student?.student_id) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    const timeTaken = sessionStats.startTime ? 
      Math.floor((new Date().getTime() - sessionStats.startTime.getTime()) / 1000) : 60;

    try {
      // Record the response
      await supabase
        .from('bootcamp_student_responses')
        .insert({
          student_id: student.student_id,
          question_id: currentQuestion.question_id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          time_taken: timeTaken,
          session_id: sessionStats.sessionId
        });

      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        questionsCorrect: prev.questionsCorrect + (isCorrect ? 1 : 0)
      }));

      setShowExplanation(true);
    } catch (error) {
      console.error('Error recording answer:', error);
      toast.error('Failed to record answer');
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowExplanation(false);
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    if (!sessionStats.sessionId || !student?.student_id) return;

    try {
      // Update session with final stats
      await supabase
        .from('bootcamp_learning_sessions')
        .update({
          session_end: new Date().toISOString(),
          questions_attempted: sessionStats.questionsAnswered,
          questions_correct: sessionStats.questionsCorrect,
          performance_score: (sessionStats.questionsCorrect / sessionStats.questionsAnswered) * 100
        })
        .eq('session_id', sessionStats.sessionId);

      // Update progress for each topic covered
      for (const topic of topics) {
        await supabase.rpc('bootcamp_update_student_progress', {
          p_student_id: student.student_id,
          p_topic_id: topic.id
        });
      }

      setSessionCompleted(true);
      await fetchBootcampData(); // Refresh the bootcamp data
      toast.success('Weekly session completed successfully!');
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Failed to complete session');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading weekly content...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Week {weekPlan?.week}: {weekPlan?.title}
          </DialogTitle>
        </DialogHeader>

        {!sessionStarted ? (
          // Session Overview
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-2">{weekPlan?.title}</h3>
              <p className="text-muted-foreground mb-4">
                Focus: {weekPlan?.focus}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span>{topics.length} topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>{questions.length} questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>~20-30 minutes</span>
                </div>
              </div>
            </div>

            {/* Topics Coverage */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Topics Covered This Week</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map((topic, index) => (
                  <Card key={topic.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{topic.name}</h5>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {topic.difficulty}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {topic.skills?.length || 0} skills
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-primary">
                          Topic {index + 1}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button 
                onClick={startSession} 
                size="lg" 
                disabled={questions.length === 0}
                className="px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Weekly Session
              </Button>
            </div>
          </div>
        ) : sessionCompleted ? (
          // Session Complete
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Week {weekPlan?.week} Complete!
              </h3>
              <p className="text-muted-foreground">
                Great job completing this week's learning session
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 max-w-md mx-auto">
              <h4 className="font-semibold mb-4">Session Results</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Questions Answered:</span>
                  <span className="font-medium">{sessionStats.questionsAnswered}</span>
                </div>
                <div className="flex justify-between">
                  <span>Correct Answers:</span>
                  <span className="font-medium text-green-600">{sessionStats.questionsCorrect}</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-medium">
                    {Math.round((sessionStats.questionsCorrect / sessionStats.questionsAnswered) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Topics Covered:</span>
                  <span className="font-medium">{topics.length}</span>
                </div>
              </div>
            </div>

            <Button onClick={onClose} size="lg">
              <CheckCircle className="h-5 w-5 mr-2" />
              Continue Learning Journey
            </Button>
          </div>
        ) : (
          // Question Session
          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{Math.round((sessionStats.questionsCorrect / Math.max(sessionStats.questionsAnswered, 1)) * 100)}% accuracy</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {currentQuestion && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {topics.find(t => t.id === currentQuestion.topic_id)?.name}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary">
                      {currentQuestion.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-relaxed">
                    {currentQuestion.question_text}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Answer Options */}
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((option) => {
                      const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof Question] as string;
                      if (!optionText) return null;
                      
                      const isSelected = selectedAnswer === option;
                      const isCorrect = option === currentQuestion.correct_answer;
                      const showResult = showExplanation;
                      
                      return (
                        <button
                          key={option}
                          onClick={() => !showExplanation && setSelectedAnswer(option)}
                          disabled={showExplanation}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                            showResult
                              ? isCorrect
                                ? 'border-green-500 bg-green-50 text-green-800'
                                : isSelected
                                ? 'border-red-500 bg-red-50 text-red-800'
                                : 'border-gray-200 bg-gray-50'
                              : isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`font-semibold text-sm ${
                              showResult && isCorrect ? 'text-green-700' : 
                              showResult && isSelected ? 'text-red-700' : ''
                            }`}>
                              {option}.
                            </span>
                            <span className="flex-1">{optionText}</span>
                            {showResult && isCorrect && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {showExplanation && currentQuestion.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                      <p className="text-blue-800 text-sm">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    {!showExplanation ? (
                      <Button 
                        onClick={submitAnswer} 
                        disabled={!selectedAnswer}
                        className="px-6"
                      >
                        Submit Answer
                      </Button>
                    ) : (
                      <Button onClick={nextQuestion} className="px-6">
                        {currentQuestionIndex < questions.length - 1 ? (
                          <>
                            Next Question
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            Complete Session
                            <CheckCircle className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}