import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Award, Trophy, Target, ArrowLeft, CheckCircle, X } from 'lucide-react';

interface AssessmentProps {
  content: any;
  onComplete: () => void;
  onPrevious: () => void;
}

export function Assessment({ content, onComplete, onPrevious }: AssessmentProps) {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  
  const assessmentQuestions = content?.assessment_questions || [];
  const introduction = content?.introduction || '';
  const successCriteria = content?.success_criteria || {};
  const feedback = content?.feedback || {};

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    assessmentQuestions.forEach((question: any) => {
      if (answers[question.id]?.toLowerCase().trim() === question.correct_answer?.toLowerCase().trim()) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setSubmitted(true);
  };

  const getScorePercentage = () => {
    return assessmentQuestions.length > 0 ? Math.round((score / assessmentQuestions.length) * 100) : 0;
  };

  const getFeedbackMessage = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return feedback.excellent || "Outstanding work! 🎉";
    if (percentage >= 70) return feedback.good || "Great job! 👍";
    return feedback.needs_work || "Good try! Let's practice more. 💪";
  };

  const isPassing = getScorePercentage() >= (successCriteria.passing_score || 80);

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Assessment Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{introduction}</p>
          {successCriteria && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">Success Criteria</span>
              </div>
              <div className="text-sm space-y-1">
                {successCriteria.passing_score && (
                  <p>• Passing Score: {successCriteria.passing_score}%</p>
                )}
                {successCriteria.minimum_correct && (
                  <p>• Minimum Correct: {successCriteria.minimum_correct} questions</p>
                )}
                {successCriteria.total_points && (
                  <p>• Total Points: {successCriteria.total_points}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Questions */}
      {!submitted && assessmentQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {assessmentQuestions.map((question: any, index: number) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <Badge variant="outline">Q{index + 1}</Badge>
                    <div className="flex-1">
                      <p className="font-medium">{question.question}</p>
                      {question.points && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Points: {question.points}
                        </p>
                      )}
                    </div>
                  </div>

                  {question.type === 'multiple_choice' && question.options ? (
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onValueChange={(value) => handleAnswerChange(question.id, value)}
                      className="ml-6"
                    >
                      {question.options.map((option: string, optionIndex: number) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                          <Label htmlFor={`${question.id}-${optionIndex}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="ml-6">
                      <Input
                        placeholder="Enter your answer..."
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleSubmit}
                disabled={assessmentQuestions.some((q: any) => !answers[q.id])}
                size="lg"
              >
                Submit Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {submitted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Your Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="text-4xl font-bold">{getScorePercentage()}%</div>
                <div className="text-muted-foreground">
                  {score} out of {assessmentQuestions.length} correct
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isPassing ? 'bg-green-50 dark:bg-green-950' : 'bg-orange-50 dark:bg-orange-950'}`}>
                <p className="font-semibold">{getFeedbackMessage()}</p>
              </div>

              {/* Question Review */}
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-left">Question Review:</h4>
                {assessmentQuestions.map((question: any, index: number) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = userAnswer?.toLowerCase().trim() === question.correct_answer?.toLowerCase().trim();
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-4 text-left">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">Q{index + 1}: {question.question}</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p>Your answer: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{userAnswer}</span></p>
                            {!isCorrect && (
                              <p>Correct answer: <span className="text-green-600">{question.correct_answer}</span></p>
                            )}
                            {question.explanation && (
                              <p className="text-muted-foreground italic">{question.explanation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={onPrevious} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Practice
        </Button>
        <Button 
          onClick={onComplete} 
          className="flex-1"
          disabled={!submitted}
        >
          {submitted ? (isPassing ? 'Complete Journey! 🎉' : 'Review & Try Again') : 'Complete Assessment First'}
        </Button>
      </div>
    </div>
  );
}