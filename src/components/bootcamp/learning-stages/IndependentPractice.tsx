import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Target, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface IndependentPracticeProps {
  content: any;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function IndependentPractice({ content, onComplete, onNext, onPrevious }: IndependentPracticeProps) {
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [selfCheckItems, setSelfCheckItems] = useState<number[]>([]);
  
  const exercises = content?.exercises || [];
  const selfCheck = content?.self_check || [];
  const extensions = content?.extensions || [];
  const introduction = content?.introduction || '';

  const handleExerciseToggle = (index: number) => {
    setCompletedExercises(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSelfCheckToggle = (index: number) => {
    setSelfCheckItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const allExercisesComplete = exercises.length > 0 && completedExercises.length === exercises.length;
  const allSelfCheckComplete = selfCheck.length > 0 && selfCheckItems.length === selfCheck.length;
  const canProceed = allExercisesComplete && allSelfCheckComplete;

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Independent Practice Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{introduction}</p>
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-medium">
              💪 This is your chance to practice independently and build confidence!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Exercises */}
      {exercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Practice Exercises
              </span>
              <Badge variant={allExercisesComplete ? "default" : "secondary"}>
                {completedExercises.length} / {exercises.length} Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {exercises.map((exercise: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Button
                      variant={completedExercises.includes(index) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleExerciseToggle(index)}
                      className="mt-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <h4 className="font-semibold">{exercise.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{exercise.instruction}</p>
                      
                      {exercise.problems && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {exercise.problems.map((problem: string, pIndex: number) => (
                            <div key={pIndex} className="bg-muted p-2 rounded text-center font-mono">
                              {problem}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Self-Check */}
      {selfCheck.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Self-Assessment</span>
              <Badge variant={allSelfCheckComplete ? "default" : "secondary"}>
                {selfCheckItems.length} / {selfCheck.length} Checked
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Check each item as you complete it to assess your understanding.
            </p>
            <div className="space-y-3">
              {selfCheck.map((item: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={selfCheckItems.includes(index)}
                    onCheckedChange={() => handleSelfCheckToggle(index)}
                    className="mt-1"
                  />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extensions */}
      {extensions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Extension Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Ready for more? Try these additional challenges:
            </p>
            <div className="space-y-2">
              {extensions.map((extension: string, index: number) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded">
                  <Badge variant="outline" className="mt-0.5">
                    {index + 1}
                  </Badge>
                  <span className="text-sm">{extension}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mb-4">
              {canProceed ? (
                <div className="text-green-600">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-semibold">Great work! You're ready for the assessment.</p>
                </div>
              ) : (
                <div className="text-orange-600">
                  <Target className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-semibold">Complete all exercises and self-checks to proceed.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={onPrevious} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Guided Practice
        </Button>
        <Button onClick={onComplete} variant="outline" className="flex-1">
          Mark as Complete
        </Button>
        <Button 
          onClick={onNext} 
          className="flex-1"
          disabled={!canProceed}
        >
          Continue to Assessment
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}