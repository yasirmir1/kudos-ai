import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { QuestionProgress } from './QuestionProgress';

interface QuestionOption {
  id: string;
  value: string;
  feedback: string;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correct: string;
  topic: string;
  difficulty: 'foundation' | 'intermediate' | 'advanced';
}

export const PracticeSession: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timer, setTimer] = useState(90);
  const [isPaused, setIsPaused] = useState(false);

  const questions: Question[] = [
    {
      id: 'DQ001',
      text: 'Round 3,847 to the nearest hundred',
      options: [
        { id: 'A', value: '3,800', feedback: 'Correct! You identified the hundreds place correctly.' },
        { id: 'B', value: '3,850', feedback: 'You rounded to the nearest ten instead of hundred.' },
        { id: 'C', value: '3,900', feedback: 'Remember: the tens digit (4) is less than 5, so round down.' },
        { id: 'D', value: '4,000', feedback: 'You rounded to the nearest thousand instead of hundred.' }
      ],
      correct: 'A',
      topic: 'Place Value',
      difficulty: 'foundation'
    }
  ];

  const question = questions[currentQuestion];

  useEffect(() => {
    if (!isPaused && timer > 0 && !showFeedback) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused, timer, showFeedback]);

  const handleAnswerSelect = (optionId: string) => {
    setSelectedAnswer(optionId);
    setShowFeedback(true);
    setIsPaused(true);
  };

  const handleNext = () => {
    setCurrentQuestion(current => current + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimer(90);
    setIsPaused(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'foundation': return 'bg-success/10 text-success';
      case 'intermediate': return 'bg-primary/10 text-primary';
      case 'advanced': return 'bg-secondary/20 text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getOptionStyles = (option: QuestionOption) => {
    if (!showFeedback) {
      return selectedAnswer === option.id 
        ? 'border-primary bg-primary/10' 
        : 'border-border hover:border-border/60 hover:bg-muted/50';
    }
    if (option.id === question.correct) return 'border-success bg-success/10';
    if (option.id === selectedAnswer && option.id !== question.correct) return 'border-destructive bg-destructive/10';
    return 'border-border';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-muted-foreground">Question {currentQuestion + 1} of 20</span>
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
                {showFeedback && option.id === question.correct && (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
                {showFeedback && option.id === selectedAnswer && option.id !== question.correct && (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
              {showFeedback && option.id === selectedAnswer && (
                <p className="mt-2 text-sm text-muted-foreground">{option.feedback}</p>
              )}
            </button>
          ))}
        </div>

        {showFeedback && (
          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {selectedAnswer === question.correct ? (
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
              <span>Next Question</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <QuestionProgress current={currentQuestion + 1} total={20} correct={12} />
    </div>
  );
};