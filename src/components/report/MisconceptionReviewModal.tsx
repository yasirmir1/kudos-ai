import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, AlertTriangle, Target, BarChart3, Brain, BookOpen, Lightbulb, ArrowRight } from 'lucide-react';
import { getFriendlyMisconceptionName } from '@/lib/misconceptionLabels';

interface MisconceptionPattern {
  misconception_code: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern_type: 'emerging' | 'developing' | 'recurring' | 'persistent';
  topics: string[];
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface MisconceptionReviewModalProps {
  misconception: MisconceptionPattern | null;
  isOpen: boolean;
  onClose: () => void;
  onStartPractice?: () => void;
}

export const MisconceptionReviewModal: React.FC<MisconceptionReviewModalProps> = ({
  misconception,
  isOpen,
  onClose,
  onStartPractice
}) => {
  if (!misconception) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Needs Focus';
      case 'high': return 'Working On It';
      case 'medium': return 'Learning';
      default: return 'Improving';
    }
  };

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'persistent': return AlertTriangle;
      case 'recurring': return TrendingUp;
      case 'developing': return Target;
      default: return BarChart3;
    }
  };

  const getSeverityProgress = (severity: string) => {
    switch (severity) {
      case 'critical': return 100;
      case 'high': return 75;
      case 'medium': return 50;
      default: return 25;
    }
  };

  const getRecommendations = (misconceptionCode: string) => {
    // Map misconception codes to helpful recommendations
    const recommendations: { [key: string]: string[] } = {
      '[\"Algebra_IncorrectOperation\"]': [
        'Practice identifying the correct inverse operation for each step',
        'Use visual methods like balance scales to understand equality',
        'Work through problems step-by-step with clear annotations'
      ],
      'MixedNumbers_ImproperConversion': [
        'Practice converting between mixed numbers and improper fractions regularly',
        'Use visual fraction models to understand the relationship',
        'Break down the conversion process into clear steps'
      ],
      '[\"Rounding_IncorrectDirection\"]': [
        'Remember: 5 or more rounds up, 4 or less rounds down',
        'Practice with number lines to visualize rounding',
        'Focus on identifying the key digit that determines rounding direction'
      ],
      '[\"Decimals_IncorrectPlaceValueShift\"]': [
        'Practice multiplying and dividing by powers of 10 with place value charts',
        'Remember: multiply = move right, divide = move left',
        'Use concrete examples with money to make it relatable'
      ]
    };

    return recommendations[misconceptionCode] || [
      'Practice with similar problems to build understanding',
      'Work through examples step-by-step',
      'Ask for help when concepts are unclear'
    ];
  };

  const PatternIcon = getPatternIcon(misconception.pattern_type);
  const friendlyName = getFriendlyMisconceptionName(misconception.misconception_code);
  const recommendations = getRecommendations(misconception.misconception_code);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-600" />
            Understanding This Learning Area
          </DialogTitle>
          <DialogDescription>
            Let's explore this concept and how to improve
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Misconception Summary */}
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <PatternIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <h3 className="font-medium text-lg leading-tight">
                  {friendlyName}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={`text-xs ${getSeverityColor(misconception.severity)}`}>
                  {getSeverityLabel(misconception.severity)}
                </Badge>
                {misconception.trend === 'increasing' && (
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-2xl font-bold text-primary">{misconception.frequency}</div>
                <div className="text-sm text-muted-foreground">Times Seen</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="text-lg font-bold text-primary capitalize">{misconception.pattern_type}</div>
                <div className="text-sm text-muted-foreground">Pattern Type</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Understanding Level</span>
                <span className="text-sm text-muted-foreground">
                  {100 - getSeverityProgress(misconception.severity)}% mastered
                </span>
              </div>
              <Progress 
                value={100 - getSeverityProgress(misconception.severity)} 
                className="h-2"
              />
            </div>

            {/* Topics */}
            {misconception.topics.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Related Topics:</p>
                <div className="flex flex-wrap gap-2">
                  {misconception.topics.map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic.length > 25 ? `${topic.substring(0, 25)}...` : topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              How to Improve
            </h4>
            
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <Alert key={index} className="border-blue-200 bg-blue-50">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="p-1">
                    <strong>Tip {index + 1}:</strong> {recommendation}
                  </AlertDescription>
                </Alert>
              ))}
            </div>

            {misconception.severity === 'critical' && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="p-1">
                  <strong>Priority Area:</strong> This concept needs immediate attention. 
                  Consider focusing extra practice time here for the best improvement.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
            {onStartPractice && (
              <Button onClick={onStartPractice} className="flex-1">
                <ArrowRight className="h-4 w-4 mr-2" />
                Start Practice
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};