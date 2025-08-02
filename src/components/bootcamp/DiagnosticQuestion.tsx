import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Lightbulb, XCircle } from 'lucide-react';
import { RemediationSuggestion } from './RemediationSuggestion';

interface QuestionOption {
  id: string;
  value: string;
  feedback: string;
  misconception?: {
    name: string;
    description: string;
    remediationVideo?: string;
    practiceSet?: string;
  };
}

interface Question {
  id: string;
  questionText: string;
  category: 'arithmetic' | 'reasoning';
  difficulty: 'foundation' | 'intermediate' | 'advanced';
  topic: string;
  visualAid?: string;
  options: QuestionOption[];
  correctAnswer: string;
}

interface DiagnosticQuestionProps {
  question: Question;
  onAnswer: (response: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    confidence: number | null;
    misconception?: any;
  }) => void;
  questionNumber: number;
  totalQuestions: number;
}

export const DiagnosticQuestion: React.FC<DiagnosticQuestionProps> = ({
  question,
  onAnswer,
  questionNumber,
  totalQuestions
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTimeSpent(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelect = (optionId: string) => {
    if (!selectedAnswer) {
      setSelectedAnswer(optionId);
      setShowDiagnostic(true);
      
      const isCorrect = optionId === question.correctAnswer;
      const misconception = !isCorrect ? question.options.find(o => o.id === optionId)?.misconception : null;
      
      onAnswer({
        questionId: question.id,
        selectedAnswer: optionId,
        isCorrect,
        timeSpent,
        confidence,
        misconception
      });
    }
  };

  const getDiagnosticStyles = (optionId: string) => {
    if (!showDiagnostic) return 'border-border hover:border-border/60 hover:bg-muted/50';
    if (optionId === question.correctAnswer) return 'border-success bg-success/10';
    if (optionId === selectedAnswer) return 'border-destructive bg-destructive/10';
    return 'border-border';
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.category === 'arithmetic' 
                ? 'bg-primary/10 text-primary' 
                : 'bg-secondary/80 text-secondary-foreground'
            }`}>
              {question.category === 'arithmetic' ? 'Arithmetic' : 'Reasoning'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.difficulty === 'foundation' 
                ? 'bg-success/10 text-success' 
                : question.difficulty === 'intermediate'
                ? 'bg-warning/10 text-warning'
                : 'bg-destructive/10 text-destructive'
            }`}>
              {question.difficulty}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm">
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-2">
          {question.questionText}
        </h3>
        
        {question.visualAid && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <img src={question.visualAid} alt="Question visual" className="max-w-full h-auto" />
          </div>
        )}

        {!selectedAnswer && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">How confident are you?</p>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  onClick={() => setConfidence(level)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    confidence === level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {question.options.map(option => {
          const isSelected = selectedAnswer === option.id;
          const isCorrect = option.id === question.correctAnswer;
          
          return (
            <button
              key={option.id}
              onClick={() => handleAnswerSelect(option.id)}
              disabled={showDiagnostic}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                getDiagnosticStyles(option.id)
              } ${showDiagnostic ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                !showDiagnostic && isSelected ? 'border-primary bg-primary/10' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="font-medium text-muted-foreground mt-0.5">{option.id}.</span>
                <div className="flex-1">
                  <span className="text-foreground">{option.value}</span>
                  
                  {showDiagnostic && isSelected && (
                    <div className="mt-3 space-y-2">
                      <div className={`flex items-start space-x-2 p-3 rounded-lg ${
                        isCorrect ? 'bg-success/10' : 'bg-destructive/10'
                      }`}>
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                        )}
                        <p className={`text-sm ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                          {option.feedback}
                        </p>
                      </div>
                      
                      {!isCorrect && option.misconception && (
                        <div className="flex items-start space-x-2 p-3 bg-warning/10 rounded-lg">
                          <Lightbulb className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-warning mb-1">
                              Common Misconception Detected: {option.misconception.name}
                            </p>
                            <p className="text-sm text-warning/80">
                              {option.misconception.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {showDiagnostic && isCorrect && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                  {showDiagnostic && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {showDiagnostic && selectedAnswer !== question.correctAnswer && (
        <RemediationSuggestion 
          misconception={question.options.find(o => o.id === selectedAnswer)?.misconception}
          topic={question.topic}
        />
      )}
    </div>
  );
};