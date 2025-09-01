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

  const getStructuredExplanation = (misconceptionCode: string) => {
    // Map misconception codes to structured explanations with emojis
    const explanations: { [key: string]: {
      whatHappens: string;
      whyTricky: string;
      howToTackle: string;
      showsUpIn: string;
    } } = {
      '[\"Algebra_IncorrectOperation\"]': {
        whatHappens: 'You might confuse addition with subtraction or multiplication with division when solving equations, especially when dealing with inverse operations.',
        whyTricky: 'Algebra requires keeping track of multiple steps, and small slips can lead to big errors—it\'s like solving a puzzle where one wrong piece throws everything off!',
        howToTackle: 'Write down each step clearly, and always double-check which operation you\'re using. Ask yourself, "Am I undoing what\'s being done to the variable?"',
        showsUpIn: 'Algebra, solving equations.'
      },
      'MixedNumbers_ImproperConversion': {
        whatHappens: 'You might convert mixed numbers to improper fractions incorrectly, or vice versa, by forgetting to multiply the whole number by the denominator.',
        whyTricky: 'Mixed numbers combine whole numbers and fractions, making it easy to miss a step in the conversion process.',
        howToTackle: 'Remember the formula: (whole × denominator) + numerator = new numerator. Use visual models to see the relationship clearly.',
        showsUpIn: 'Fractions, mixed numbers, and fraction operations.'
      },
      '[\"Rounding_IncorrectDirection\"]': {
        whatHappens: 'You might round a number like 4,550 down to 4,500 instead of up to 4,600 because the tens digit feels "small."',
        whyTricky: 'Rounding rules depend on the digit *after* your target place value, and it\'s easy to focus on the wrong digit.',
        howToTackle: 'Circle the digit you\'re rounding to, then look *only* at the digit to its right. If it\'s 5 or more, round up!',
        showsUpIn: 'Place value, estimating numbers.'
      },
      '[\"Decimals_IncorrectPlaceValueShift\"]': {
        whatHappens: 'When multiplying or dividing by 10, 100, etc., you might move the decimal point the wrong way (e.g., turning 0.35 into 0.0035 instead of 3.5).',
        whyTricky: 'Decimals don\'t "feel" like whole numbers, and the direction of the shift can be confusing.',
        howToTackle: 'Think of it like jumping on a number line: Multiplying moves the decimal *right* (making the number bigger), dividing moves it *left* (making it smaller).',
        showsUpIn: 'Decimals, metric conversions.'
      },
      '[\"PrimeNumbers_OddNumberConfusion\"]': {
        whatHappens: 'You might think all odd numbers are prime (like 9 or 15), but primes *only* have two factors: 1 and themselves!',
        whyTricky: 'Many primes *are* odd, but not all odds are primes—it\'s a sneaky overlap.',
        howToTackle: 'Test divisibility! If a number has *any* factors other than 1 and itself (e.g., 9 = 3 × 3), it\'s not prime.',
        showsUpIn: 'Number theory, factoring.'
      },
      '[\"Percentage_IncorrectOperation\"]': {
        whatHappens: 'You might divide 20 by 80 instead of finding 20% *of* 80, or add them (20 + 80 = 100).',
        whyTricky: '"Percent of" implies multiplication, but the word "percent" can make you think of division.',
        howToTackle: 'Remember: "%" means "per hundred." To find 20% of 80, calculate 0.20 × 80 = 16.',
        showsUpIn: 'Percentages, ratios.'
      }
    };

    return explanations[misconceptionCode] || {
      whatHappens: 'You might approach this concept in a way that seems logical but leads to incorrect results, often because of a small misunderstanding in the process.',
      whyTricky: 'Math concepts build on each other like a tower of blocks—when one piece is shaky, it affects everything above it. Sometimes what feels "right" actually needs a different approach.',
      howToTackle: 'Take your time to understand the underlying rule or pattern. Work through examples step-by-step, and don\'t hesitate to ask questions when something doesn\'t click!',
      showsUpIn: 'Various mathematical topics and problem-solving situations.'
    };
  };

  const PatternIcon = getPatternIcon(misconception.pattern_type);
  const friendlyName = getFriendlyMisconceptionName(misconception.misconception_code);
  const explanation = getStructuredExplanation(misconception.misconception_code);

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

          {/* Structured Explanation */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Understanding This Challenge
            </h4>
            
            <div className="space-y-4">
              {/* What Usually Happens */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl">🤔</span>
                  <h5 className="font-semibold text-blue-700">What usually happens</h5>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  {explanation.whatHappens}
                </p>
              </div>

              {/* Why This Is Tricky */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl">💡</span>
                  <h5 className="font-semibold text-purple-700">Why this is tricky</h5>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  {explanation.whyTricky}
                </p>
              </div>

              {/* How to Tackle It */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl">🛠️</span>
                  <h5 className="font-semibold text-green-700">How to tackle it</h5>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  {explanation.howToTackle}
                </p>
              </div>

              {/* Shows Up In */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl">📚</span>
                  <h5 className="font-semibold text-orange-700">Shows up in</h5>
                </div>
                <p className="text-sm text-muted-foreground ml-11">
                  {explanation.showsUpIn}
                </p>
              </div>
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