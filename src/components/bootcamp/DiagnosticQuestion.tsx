import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Info, Lightbulb } from 'lucide-react';
import { RemediationSuggestion } from './RemediationSuggestion';
import { BootcampAPI, type BootcampQuestion } from '@/lib/bootcamp-api';

interface DiagnosticQuestionProps {
  question: BootcampQuestion;
  onAnswer: (response: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    confidence: number | null;
    misconception?: string;
    feedback: string;
  }) => void;
  questionNumber: number;
  totalQuestions: number;
  studentId: string;
  sessionId?: string;
}

export const DiagnosticQuestion: React.FC<DiagnosticQuestionProps> = ({ 
  question, 
  onAnswer, 
  questionNumber, 
  totalQuestions, 
  studentId,
  sessionId 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTimeSpent(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelect = async (optionLetter: string) => {
    if (!selectedAnswer && !isSubmitting) {
      setIsSubmitting(true);
      setSelectedAnswer(optionLetter);
      setShowDiagnostic(true);
      
      try {
        const response = await BootcampAPI.submitResponse({
          student_id: studentId,
          question_id: question.question_id,
          selected_answer: optionLetter,
          time_taken_seconds: timeSpent,
          confidence_rating: confidence,
          session_id: sessionId
        });

        onAnswer({
          questionId: question.question_id,
          selectedAnswer: optionLetter,
          isCorrect: response.is_correct,
          timeSpent,
          confidence,
          misconception: response.misconception,
          feedback: response.feedback
        });
      } catch (error) {
        console.error('Error submitting answer:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getDiagnosticStyles = (option: any) => {
    if (!showDiagnostic) return 'border-border hover:border-border/60 hover:bg-muted/50';
    if (option.is_correct) return 'border-success bg-success/10';
    if (option.answer_option === selectedAnswer) return 'border-destructive bg-destructive/10';
    return 'border-border';
  };

  const selectedOption = question.bootcamp_answers?.find(opt => opt.answer_option === selectedAnswer);

  return (
    <div className="bg-card rounded-xl shadow-sm border p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              question.question_category === 'arithmetic' 
                ? 'bg-primary/10 text-primary' 
                : 'bg-secondary/80 text-secondary-foreground'
            }`}>
              {question.question_category}
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
            {question.selection_reason && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {question.selection_reason}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-sm">
              {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-2">
          {question.question_text}
        </h3>
        
        {question.visual_aid && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <img src={question.visual_aid} alt="Question visual" className="max-w-full h-auto" />
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
        {question.bootcamp_answers?.map(option => {
          const isSelected = selectedAnswer === option.answer_option;
          
          return (
            <button
              key={option.answer_option}
              onClick={() => handleAnswerSelect(option.answer_option)}
              disabled={showDiagnostic || isSubmitting}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                getDiagnosticStyles(option)
              } ${showDiagnostic ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                !showDiagnostic && isSelected ? 'border-primary bg-primary/10' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="font-medium text-muted-foreground mt-0.5">{option.answer_option}.</span>
                <div className="flex-1">
                  <span className="text-foreground">{option.answer_value}</span>
                  
                  {showDiagnostic && isSelected && (
                    <div className="mt-3 space-y-2">
                      <div className={`flex items-start space-x-2 p-3 rounded-lg ${
                        option.is_correct ? 'bg-success/10' : 'bg-destructive/10'
                      }`}>
                        {option.is_correct ? (
                          <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                        )}
                        <p className={`text-sm ${option.is_correct ? 'text-success' : 'text-destructive'}`}>
                          {option.diagnostic_feedback}
                        </p>
                      </div>
                      
                      {!option.is_correct && option.misconception_type && (
                        <div className="flex items-start space-x-2 p-3 bg-warning/10 rounded-lg">
                          <Lightbulb className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-warning mb-1">
                              Misconception Detected: {option.misconception_type}
                            </p>
                            <p className="text-sm text-warning/80">
                              This error pattern has been identified for targeted practice.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {showDiagnostic && option.is_correct && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                  {showDiagnostic && isSelected && !option.is_correct && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  {isSubmitting && isSelected && (
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {showDiagnostic && selectedOption && !selectedOption.is_correct && selectedOption.misconception_type && (
        <RemediationSuggestion 
          misconception={{
            code: selectedOption.misconception_type,
            description: 'This misconception needs targeted practice'
          }}
          topic={question.topic_id}
        />
      )}
    </div>
  );
};