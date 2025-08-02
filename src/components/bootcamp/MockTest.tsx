import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Flag, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Placeholder questions for demo
const PLACEHOLDER_QUESTIONS = Array.from({ length: 50 }, (_, i) => ({
  question_id: `Q${i + 1}`,
  question_text: `Question ${i + 1}: What is ${Math.floor(Math.random() * 20) + 5} × ${Math.floor(Math.random() * 20) + 5}?`,
  option_a: `${Math.floor(Math.random() * 100) + 50}`,
  option_b: `${Math.floor(Math.random() * 100) + 150}`,
  option_c: `${Math.floor(Math.random() * 100) + 250}`,
  option_d: `${Math.floor(Math.random() * 100) + 350}`,
  correct_answer: 'A',
  topic_id: ['Arithmetic', 'Algebra', 'Geometry', 'Statistics'][Math.floor(Math.random() * 4)],
  difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
  question_type: 'multiple_choice'
}));

interface MockTestState {
  status: 'instructions' | 'active' | 'completed';
  currentQuestion: number;
  timeRemaining: number; // in seconds
  answers: Record<number, string>;
  questions: any[];
  startTime: Date | null;
  sessionId: string | null;
}

interface MockTestResults {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number;
  topicBreakdown: Record<string, { correct: number; total: number }>;
}

export const MockTest: React.FC = () => {
  const [testState, setTestState] = useState<MockTestState>({
    status: 'instructions',
    currentQuestion: 0,
    timeRemaining: 3600, // 60 minutes
    answers: {},
    questions: [],
    startTime: null,
    sessionId: null
  });
  const [results, setResults] = useState<MockTestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitTest = useCallback(async () => {
    const answeredCount = Object.keys(testState.answers).length;
    const timeSpent = testState.startTime ? Math.floor((Date.now() - testState.startTime.getTime()) / 1000) : 0;
    
    // Calculate results (this would typically come from backend)
    const topicBreakdown: Record<string, { correct: number; total: number }> = {};
    let correctAnswers = 0;

    testState.questions.forEach((question, index) => {
      const topic = question.topic_id || 'Unknown';
      if (!topicBreakdown[topic]) {
        topicBreakdown[topic] = { correct: 0, total: 0 };
      }
      topicBreakdown[topic].total++;
      
      // This is simplified - in real implementation, you'd check against correct answers
      if (testState.answers[index]) {
        // For demo purposes, assume 70% accuracy
        if (Math.random() > 0.3) {
          correctAnswers++;
          topicBreakdown[topic].correct++;
        }
      }
    });

    const results: MockTestResults = {
      totalQuestions: testState.questions.length,
      answeredQuestions: answeredCount,
      correctAnswers,
      accuracy: (correctAnswers / testState.questions.length) * 100,
      timeSpent,
      topicBreakdown
    };

    setResults(results);
    setTestState(prev => ({ ...prev, status: 'completed' }));
  }, [testState.answers, testState.questions, testState.startTime]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (testState.status === 'active' && testState.timeRemaining > 0) {
      interval = setInterval(() => {
        setTestState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (testState.timeRemaining === 0 && testState.status === 'active') {
      handleSubmitTest();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testState.status, testState.timeRemaining, handleSubmitTest]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTest = async () => {
    setIsLoading(true);
    try {
      // Use placeholder questions for demo
      setTestState(prev => ({
        ...prev,
        status: 'active',
        questions: PLACEHOLDER_QUESTIONS,
        startTime: new Date(),
        sessionId: 'demo-session'
      }));
    } catch (error) {
      console.error('Failed to start test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = useCallback((selectedAnswer: string) => {
    // Update local state
    setTestState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentQuestion]: selectedAnswer
      }
    }));
  }, [testState.currentQuestion]);

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
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8">
          <div className="text-center mb-8">
            <Flag className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">11+ Mock Test</h1>
            <p className="text-muted-foreground text-lg">
              Complete practice examination under timed conditions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-muted rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Test Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span className="font-medium">50</span>
                </div>
                <div className="flex justify-between">
                  <span>Time Limit:</span>
                  <span className="font-medium">60 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Topics:</span>
                  <span className="font-medium">All areas</span>
                </div>
                <div className="flex justify-between">
                  <span>Question Types:</span>
                  <span className="font-medium">Multiple choice</span>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Instructions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Read each question carefully</li>
                <li>• You can navigate between questions</li>
                <li>• Mark questions for review if needed</li>
                <li>• Submit before time runs out</li>
                <li>• No calculators allowed</li>
              </ul>
            </div>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Once you start, the timer cannot be paused. Ensure you have a quiet environment and stable internet connection.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button 
              onClick={startTest} 
              disabled={isLoading}
              className="px-8 py-3 text-lg"
            >
              {isLoading ? 'Loading Questions...' : 'Start Mock Test'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (testState.status === 'completed' && results) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8">
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

          <div className="text-center space-x-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Take Another Test
            </Button>
            <Button onClick={() => setTestState(prev => ({ ...prev, status: 'instructions' }))}>
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
      <Card className="mb-6 p-4">
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
            <Button variant="destructive" onClick={handleSubmitTest}>
              Submit Test
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
            <Card className="p-6">
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">
                  {currentQuestion.difficulty} • {currentQuestion.topic_id}
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
          <Card className="mt-6 p-4">
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
          <Card className="p-4">
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