import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, ArrowRight, ArrowLeft, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { PlaceValueSorting, FillInBlanks } from '../interactive';

interface GuidedPracticeProps {
  content: any;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function GuidedPractice({ content, onComplete, onNext, onPrevious }: GuidedPracticeProps) {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState<number[]>([]);
  
  const activities = content?.activities || [];
  const checkpoints = content?.checkpoints || [];
  const introduction = content?.introduction || '';
  const interactiveElements = content?.interactive_elements || [];

  const toggleAnswerReveal = (index: number) => {
    setRevealedAnswers(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const allAnswersRevealed = checkpoints.length > 0 && revealedAnswers.length === checkpoints.length;

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Let's Practice Together
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{introduction}</p>
        </CardContent>
      </Card>

      {/* Activities */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Guided Activities</span>
              {activities.length > 1 && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentActivity(Math.max(0, currentActivity - 1))}
                    disabled={currentActivity === 0}
                  >
                    Previous
                  </Button>
                  <Badge variant="outline">
                    {currentActivity + 1} of {activities.length}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentActivity(Math.min(activities.length - 1, currentActivity + 1))}
                    disabled={currentActivity === activities.length - 1}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities[currentActivity] && (
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-lg">{activities[currentActivity].title}</h4>
                  <p className="text-sm text-muted-foreground">{activities[currentActivity].description}</p>
                </div>
                
                {activities[currentActivity].example && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Example:</h5>
                    <p className="font-mono text-lg">{activities[currentActivity].example}</p>
                  </div>
                )}

                {activities[currentActivity].steps && (
                  <div>
                    <h5 className="font-medium mb-3">Steps:</h5>
                    <div className="space-y-2">
                      {activities[currentActivity].steps.map((step: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-2 bg-background border rounded">
                          <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <p className="text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activities[currentActivity].examples && (
                  <div>
                    <h5 className="font-medium mb-3">Examples:</h5>
                    <div className="grid gap-3">
                      {activities[currentActivity].examples.map((example: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono">{example.number}</span>
                            <ArrowRight className="h-4 w-4" />
                            <span className="font-mono font-semibold">{example.rounded}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{example.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Interactive Elements */}
      {interactiveElements.length > 0 && (
        <div className="space-y-4">
          {interactiveElements.map((element: any, index: number) => {
            // Render actual interactive components based on type
            if (element.type === 'drag_and_drop' && element.title.includes('Place Value')) {
              return (
                <PlaceValueSorting
                  key={index}
                  number="1234567"
                  onComplete={() => {
                    // Optional: track completion
                    console.log('Place Value Sorting completed');
                  }}
                />
              );
            } else if (element.type === 'fill_in_blanks') {
              return (
                <FillInBlanks
                  key={index}
                  onComplete={() => {
                    // Optional: track completion
                    console.log('Fill in Blanks completed');
                  }}
                />
              );
            } else {
              // Fallback for other interactive element types
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{element.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{element.description}</p>
                    <Badge variant="secondary">{element.type}</Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Interactive component for "{element.type}" is being developed.
                    </p>
                  </CardContent>
                </Card>
              );
            }
          })}
        </div>
      )}

      {/* Checkpoints */}
      {checkpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Knowledge Checkpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checkpoints.map((checkpoint: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium mb-3">{checkpoint.question}</p>
                      <Button
                        variant={revealedAnswers.includes(index) ? "secondary" : "default"}
                        size="sm"
                        onClick={() => toggleAnswerReveal(index)}
                        className="mb-3"
                      >
                        {revealedAnswers.includes(index) ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide Answer
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Show Answer
                          </>
                        )}
                      </Button>
                      {revealedAnswers.includes(index) && (
                        <div className="mt-2 space-y-2">
                          <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                            <strong className="text-green-800 dark:text-green-200">Answer:</strong>
                            <p className="text-green-700 dark:text-green-300 mt-1">{checkpoint.answer}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{checkpoint.explanation}</p>
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

      {/* Navigation */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={onPrevious} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Concept
        </Button>
        <Button onClick={onComplete} variant="outline" className="flex-1">
          Mark as Complete
        </Button>
        <Button 
          onClick={onNext} 
          className="flex-1"
          disabled={checkpoints.length > 0 && !allAnswersRevealed}
        >
          Continue to Independent Practice
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}