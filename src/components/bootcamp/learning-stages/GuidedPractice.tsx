import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';

interface GuidedPracticeProps {
  content: any;
  onComplete: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function GuidedPractice({ content, onComplete, onNext, onPrevious }: GuidedPracticeProps) {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [checkedCheckpoints, setCheckedCheckpoints] = useState<number[]>([]);
  
  const activities = content?.activities || [];
  const checkpoints = content?.checkpoints || [];
  const introduction = content?.introduction || '';
  const interactiveElements = content?.interactive_elements || [];

  const handleCheckpointToggle = (index: number) => {
    setCheckedCheckpoints(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const allCheckpointsComplete = checkpoints.length > 0 && checkedCheckpoints.length === checkpoints.length;

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
        <Card>
          <CardHeader>
            <CardTitle>Interactive Practice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {interactiveElements.map((element: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                  <h5 className="font-medium">{element.title}</h5>
                  <p className="text-sm text-muted-foreground">{element.description}</p>
                  <Badge variant="secondary" className="mt-2">{element.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                    <Button
                      variant={checkedCheckpoints.includes(index) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCheckpointToggle(index)}
                      className="mt-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <p className="font-medium">{checkpoint.question}</p>
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <strong>Answer:</strong> {checkpoint.answer}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{checkpoint.explanation}</p>
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
          disabled={checkpoints.length > 0 && !allCheckpointsComplete}
        >
          Continue to Independent Practice
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}