import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Lightbulb, Target, ArrowRight } from 'lucide-react';

interface ConceptIntroductionProps {
  content: any;
  onComplete: () => void;
  onNext: () => void;
}

export function ConceptIntroduction({ content, onComplete, onNext }: ConceptIntroductionProps) {
  const concepts = content?.concepts || [];
  const introduction = content?.introduction || '';
  const learningObjective = content?.learning_objective || '';
  const keyExample = content?.key_example || '';
  const realWorldConnections = content?.real_world_connections || [];

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Welcome to the Concept
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{introduction}</p>
          {learningObjective && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <div className="flex items-start gap-2">
                <Target className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary">Learning Goal</h4>
                  <p className="text-sm">{learningObjective}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Concepts */}
      {concepts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Key Concepts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {concepts.map((concept: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm">{concept}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Example */}
      {keyExample && (
        <Card>
          <CardHeader>
            <CardTitle>Key Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-mono text-lg">{keyExample}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real World Connections */}
      {realWorldConnections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Real World Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {realWorldConnections.map((connection: string, index: number) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-background border rounded">
                  <Badge variant="outline" className="text-xs">
                    {index + 1}
                  </Badge>
                  <span className="text-sm">{connection}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={onComplete} variant="outline" className="flex-1">
          Mark as Complete
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue to Guided Practice
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}