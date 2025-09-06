import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Flag, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useBootcampDatabase } from '@/hooks/useBootcampDatabase';
import { toast } from 'sonner';

interface MockTestQuestion {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  topic: string;
  difficulty: string;
  question_type: string;
  marks: number;
  time_seconds: number;
}

interface MockTestState {
  status: 'instructions' | 'active' | 'completed' | 'paused';
  currentQuestion: number;
  timeRemaining: number; // in seconds
  answers: Record<number, string>;
  questions: MockTestQuestion[];
  startTime: Date | null;
  sessionId: string | null;
  timeSpent: number; // total time spent (for pause/resume)
}

interface MockTestResults {
  sessionId: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number;
  topicBreakdown: Record<string, { correct: number; total: number; accuracy: number }>;
  misconceptionsSummary: Array<{
    misconception_code: string;
    frequency: number;
    questions: string[];
  }>;
}

export const MockTest: React.FC = () => {
  const { student, isLoading: dbLoading } = useBootcampDatabase();
  const [testState, setTestState] = useState<MockTestState>({
    status: 'instructions',
    currentQuestion: 0,
    timeRemaining: 3600, // 60 minutes
    answers: {},
    questions: [],
    startTime: null,
    sessionId: null,
    timeSpent: 0
  });
  const [results, setResults] = useState<MockTestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing session on component mount
  useEffect(() => {
    if (student) {
      loadExistingSession();
    }
  }, [student]);

  const loadExistingSession = async () => {
    if (!student) return;

    try {
      // Check for existing active mock test session
      const { data: existingSession } = await supabase
        .from('bootcamp_mock_test_sessions')
        .select('*')
        .eq('student_id', student.student_id)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSession) {
        // Load session data and continue where left off
        const sessionData = existingSession.session_data as any || {};
        const startTime = new Date(existingSession.started_at);
        const timeElapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        
        // Load questions for this session
        const { data: sessionQuestions } = await supabase
          .from('bootcamp_mock_test_answers' as any)
          .select(`
            question_id,
            question_order,
            student_answer
          `)
          .eq('session_id', existingSession.session_id)
          .order('question_order');

        if (sessionQuestions && sessionQuestions.length > 0) {
          // Get the questions from the mock_test_questions table
          const questionIds = (sessionQuestions as any[]).map((q: any) => q.question_id);
          const { data: questions } = await supabase
            .from('mock_test_questions')
            .select('*')
            .in('question_id', questionIds)
            .eq('is_active', true);

          if (questions) {
            const answers: Record<number, string> = {};
            
            (sessionQuestions as any[]).forEach((q: any) => {
              if (q.student_answer) {
                answers[q.question_order] = q.student_answer;
              }
            });

            setTestState({
              status: 'active',
              currentQuestion: (sessionData.currentQuestion as number) || 0,
              timeRemaining: Math.max(0, existingSession.time_limit_seconds - timeElapsed),
              answers,
              questions: questions as MockTestQuestion[],
              startTime,
              sessionId: existingSession.session_id,
              timeSpent: timeElapsed
            });

            toast.info('Continuing your mock test session');
          }
        }
      }
    } catch (error) {
      console.error('Failed to load existing session:', error);
    }
  };

  const handleSubmitTest = useCallback(async () => {
    if (!testState.sessionId || !student) return;

    setIsLoading(true);
    try {
      // Submit all responses to backend
      const responses = Object.entries(testState.answers).map(([questionIndex, answer]) => ({
        session_id: testState.sessionId,
        question_id: testState.questions[parseInt(questionIndex)].question_id,
        question_order: parseInt(questionIndex),
        student_answer: answer,
        answered_at: new Date().toISOString()
      }));

      // Update responses in the database with correctness calculation
      let correctCount = 0;
      for (const response of responses) {
        const question = testState.questions[response.question_order];
        const isCorrect = response.student_answer === question.correct_answer;
        if (isCorrect) correctCount++;

        await supabase
          .from('bootcamp_mock_test_answers' as any)
          .update({
            student_answer: response.student_answer,
            answered_at: response.answered_at,
            is_correct: isCorrect,
            time_taken_seconds: testState.startTime ? 
              Math.floor((Date.now() - testState.startTime.getTime()) / 1000) / Object.keys(testState.answers).length : 60
          })
          .eq('session_id', response.session_id)
          .eq('question_order', response.question_order);
      }

      // Complete the session
      const timeSpent = testState.startTime ? Math.floor((Date.now() - testState.startTime.getTime()) / 1000) : testState.timeSpent;
      await supabase
        .from('bootcamp_mock_test_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent,
          questions_attempted: Object.keys(testState.answers).length,
          questions_correct: correctCount
        })
        .eq('session_id', testState.sessionId);

      // Calculate results
      const topicBreakdown: Record<string, { correct: number; total: number; accuracy: number }> = {};
      let correctAnswers = 0;

      testState.questions.forEach((question, index) => {
        const topic = question.topic || 'Unknown';
        if (!topicBreakdown[topic]) {
          topicBreakdown[topic] = { correct: 0, total: 0, accuracy: 0 };
        }
        topicBreakdown[topic].total++;
        
        if (testState.answers[index] === question.correct_answer) {
          correctAnswers++;
          topicBreakdown[topic].correct++;
        }
      });

      // Calculate accuracy for each topic
      Object.keys(topicBreakdown).forEach(topic => {
        topicBreakdown[topic].accuracy = (topicBreakdown[topic].correct / topicBreakdown[topic].total) * 100;
      });

      const results: MockTestResults = {
        sessionId: testState.sessionId,
        totalQuestions: testState.questions.length,
        answeredQuestions: Object.keys(testState.answers).length,
        correctAnswers,
        accuracy: (correctAnswers / testState.questions.length) * 100,
        timeSpent,
        topicBreakdown,
        misconceptionsSummary: [] // Will be populated in post-session analysis
      };

      setResults(results);
      setTestState(prev => ({ ...prev, status: 'completed' }));
      toast.success('Mock test completed!');
    } catch (error) {
      console.error('Failed to submit test:', error);
      toast.error('Failed to submit test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [testState, student]);

  // Timer effect with pause/resume and persistence
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (testState.status === 'active' && testState.timeRemaining > 0) {
      interval = setInterval(() => {
        setTestState(prev => {
          const newState = {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          };
          
          // Auto-save progress every 10 seconds
          if (prev.timeRemaining % 10 === 0 && prev.sessionId) {
            saveProgress(newState);
          }
          
          return newState;
        });
      }, 1000);
    } else if (testState.timeRemaining === 0 && testState.status === 'active') {
      toast.warning('Time is up! Submitting your test automatically.');
      handleSubmitTest();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testState.status, testState.timeRemaining, handleSubmitTest]);

  const saveProgress = async (currentState: MockTestState) => {
    if (!currentState.sessionId || !student) return;

    try {
      // Update session progress
      await supabase
        .from('bootcamp_mock_test_sessions')
        .update({
          session_data: {
            currentQuestion: currentState.currentQuestion,
            answers: currentState.answers
          }
        })
        .eq('session_id', currentState.sessionId);

      // Update individual question responses
      Object.entries(currentState.answers).forEach(async ([questionIndex, answer]) => {
        await supabase
          .from('bootcamp_mock_test_answers' as any)
          .update({
            student_answer: answer
          })
          .eq('session_id', currentState.sessionId)
          .eq('question_order', parseInt(questionIndex));
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTest = async () => {
    if (!student) {
      toast.error('Please log in to start the mock test');
      return;
    }

    setIsLoading(true);
    try {
      // Create new mock test session
      const { data: newSession, error: sessionError } = await supabase
        .from('bootcamp_mock_test_sessions')
        .insert({
          student_id: student.student_id,
          session_type: 'mock_test',
          status: 'in_progress',
          total_questions: 50,
          time_limit_seconds: 3600,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Get questions from database (real 11+ style questions)
      const { data: questions, error: questionsError } = await supabase
        .from('mock_test_questions')
        .select('*')
        .eq('is_active', true)
        .limit(50)
        .order('question_id');

      if (questionsError) throw questionsError;

      if (!questions || questions.length === 0) {
        throw new Error('No questions available');
      }

      // Create question assignments for this session
      const questionAssignments = questions.map((question, index) => ({
        session_id: newSession.session_id,
        question_id: question.question_id,
        question_order: index
      }));

      const { error: assignmentError } = await supabase
        .from('bootcamp_mock_test_answers' as any)
        .insert(questionAssignments);

      if (assignmentError) throw assignmentError;

      setTestState({
        status: 'active',
        currentQuestion: 0,
        timeRemaining: 3600,
        answers: {},
        questions: questions as MockTestQuestion[],
        startTime: new Date(),
        sessionId: newSession.session_id,
        timeSpent: 0
      });

      toast.success('Mock test started! Good luck!');
    } catch (error) {
      console.error('Failed to start test:', error);
      toast.error('Failed to start test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exitTest = async () => {
    if (!testState.sessionId) return;

    try {
      // Save current progress before exiting
      await saveProgress(testState);
      
      toast.info('Progress saved. You can resume this test later.');
      setTestState(prev => ({ ...prev, status: 'instructions' }));
    } catch (error) {
      console.error('Failed to save progress:', error);
      toast.error('Failed to save progress');
    }
  };

  const handleAnswer = useCallback((selectedAnswer: string) => {
    // Update local state (no immediate feedback in mock test)
    setTestState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentQuestion]: selectedAnswer
      }
    }));
  }, []);

  const navigateToQuestion = (questionIndex: number) => {
    setTestState(prev => ({
      ...prev,
      currentQuestion: questionIndex
    }));
  };

  const nextQuestion = () => {
    if (testState.currentQuestion < testState.questions.length - 1) {
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
    }
  };

  const previousQuestion = () => {
    if (testState.currentQuestion > 0) {
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
    }
  };

  if (testState.status === 'instructions') {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto">
          {/* Main Card */}
          <div className="overflow-hidden">
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 px-12 py-10">
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">11+ Mock Test</h1>
                    <p className="text-indigo-100 text-sm">Practice under real exam conditions</p>
                  </div>
                </div>
                
                {/* Quick Stats Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    60 min
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    50 questions
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    All topics
                  </span>
                </div>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-12">
              {/* Key Information Grid */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-2xl">
                  <div className="text-3xl font-bold text-blue-600 mb-1">50</div>
                  <div className="text-xs text-gray-600 font-medium">Questions</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-2xl">
                  <div className="text-3xl font-bold text-purple-600 mb-1">60</div>
                  <div className="text-xs text-gray-600 font-medium">Minutes</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-2xl">
                  <div className="text-3xl font-bold text-green-600 mb-1">70%</div>
                  <div className="text-xs text-gray-600 font-medium">Pass Mark</div>
                </div>
              </div>

              {/* What to Expect Section */}
              <div className="mb-8">
                <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  What to expect
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                    <span className="text-sm text-gray-600">Multiple choice questions from all 11+ topics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                    <span className="text-sm text-gray-600">Timer starts immediately and cannot be paused</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                    <span className="text-sm text-gray-600">Review and change answers before submitting</span>
                  </div>
                </div>
              </div>

              {/* Tips Row */}
              <div className="flex gap-3 mb-8">
                <div className="flex-1 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                  </svg>
                  <span className="text-xs text-amber-800 font-medium">No calculator allowed</span>
                </div>
                <div className="flex-1 flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-xs text-blue-800 font-medium">Progress auto-saved</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="flex-1 py-4 px-8 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-lg">
                  Practice Mode
                </button>
                <button
                  onClick={startTest}
                  disabled={isLoading || dbLoading || !student}
                  className={`flex-1 py-4 px-8 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-lg ${
                    isLoading || dbLoading || !student
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transform hover:scale-[1.02]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading Questions...
                    </>
                  ) : dbLoading ? (
                    'Preparing...'
                  ) : !student ? (
                    'Please log in to start'
                  ) : (
                    <>
                      Start Exam Mode
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (testState.status === 'completed' && results) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8" style={{ 
          background: 'hsl(var(--card))', 
          borderColor: 'hsl(var(--border))', 
          color: 'hsl(var(--card-foreground))',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
          zIndex: 1
        }}>
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Test Completed!</h1>
            <p className="text-muted-foreground">
              Here are your results from the mock test
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {results.accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {results.correctAnswers}/{results.totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">Questions Correct</div>
            </div>
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {formatTime(results.timeSpent)}
              </div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Topic Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(results.topicBreakdown).map(([topic, stats]) => (
                <div key={topic} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium">{topic}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {stats.correct}/{stats.total}
                    </span>
                    <div className="w-24">
                      <Progress value={(stats.correct / stats.total) * 100} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Your performance analysis and misconception patterns will be available in your detailed report.
              </p>
              <p className="text-sm text-muted-foreground">
                This mock test simulates real 11+ exam conditions with no immediate feedback during the test.
              </p>
            </div>
          </div>

          <div className="text-center space-x-4">
            <Button variant="outline" onClick={() => setTestState(prev => ({ 
              ...prev, 
              status: 'instructions',
              currentQuestion: 0,
              timeRemaining: 3600,
              answers: {},
              questions: [],
              startTime: null,
              sessionId: null,
              timeSpent: 0
            }))}>
              Take Another Test
            </Button>
            <Button onClick={() => window.location.href = '/bootcamp'}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Active test view
  const currentQuestion = testState.questions[testState.currentQuestion];
  const progress = ((testState.currentQuestion + 1) / testState.questions.length) * 100;
  const answeredCount = Object.keys(testState.answers).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header with timer and progress */}
      <Card className="mb-6 p-4" style={{ 
        background: 'hsl(var(--card))', 
        borderColor: 'hsl(var(--border))', 
        color: 'hsl(var(--card-foreground))',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Question {testState.currentQuestion + 1} of {testState.questions.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Answered: {answeredCount}/{testState.questions.length}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${testState.timeRemaining < 600 ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg">
                {formatTime(testState.timeRemaining)}
              </span>
            </div>
            <Button variant="outline" onClick={exitTest} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Exit Test
            </Button>
            <Button variant="destructive" onClick={handleSubmitTest} disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Test'}
            </Button>
          </div>
        </div>
        
        <div className="mt-4">
          <Progress value={progress} />
        </div>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Question content */}
        <div className="lg:col-span-3">
          {currentQuestion && (
            <Card className="p-6" style={{ 
              background: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))', 
              color: 'hsl(var(--card-foreground))',
              boxShadow: 'var(--shadow-card)',
              position: 'relative',
              zIndex: 1
            }}>
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">
                  {currentQuestion.difficulty} • {currentQuestion.topic}
                </span>
              </div>
              
              <h2 className="text-lg font-medium mb-6">{currentQuestion.question_text}</h2>
              
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-4 text-left rounded-lg border transition-colors ${
                      testState.answers[testState.currentQuestion] === option
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <span className="font-medium mr-3">{option}.</span>
                    {currentQuestion[`option_${option.toLowerCase()}`]}
                  </button>
                ))}
              </div>
            </Card>
          )}
          
          {/* Navigation */}
          <Card className="mt-6 p-4" style={{ 
            background: 'hsl(var(--card))', 
            borderColor: 'hsl(var(--border))', 
            color: 'hsl(var(--card-foreground))',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            zIndex: 1
          }}>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={testState.currentQuestion === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Use the question grid to jump to any question
              </div>
              
              <Button
                onClick={nextQuestion}
                disabled={testState.currentQuestion === testState.questions.length - 1}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Question grid navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4" style={{ 
            background: 'hsl(var(--card))', 
            borderColor: 'hsl(var(--border))', 
            color: 'hsl(var(--card-foreground))',
            boxShadow: 'var(--shadow-card)',
            position: 'relative',
            zIndex: 1
          }}>
            <h3 className="font-semibold mb-4">Question Overview</h3>
            <div className="grid grid-cols-5 gap-2">
              {testState.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => navigateToQuestion(index)}
                  className={`
                    w-10 h-10 rounded text-sm font-medium transition-colors
                    ${index === testState.currentQuestion 
                      ? 'bg-primary text-primary-foreground' 
                      : testState.answers[index]
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-muted hover:bg-muted/80'
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted rounded"></div>
                <span>Not answered</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};