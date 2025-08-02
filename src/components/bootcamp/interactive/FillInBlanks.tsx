import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, RotateCcw } from 'lucide-react';

interface FillInBlanksProps {
  problems?: Array<{
    number: string;
    blanks: number[];
    description: string;
  }>;
  onComplete?: () => void;
}

const defaultProblems = [
  {
    number: "1,234,567",
    blanks: [2, 5], // positions to blank out (0-indexed, excluding commas)
    description: "Fill in the missing digits"
  },
  {
    number: "5,000,042",
    blanks: [0, 6], 
    description: "Complete this large number"
  },
  {
    number: "9,876,543",
    blanks: [1, 3, 7],
    description: "What digits are missing?"
  }
];

export function FillInBlanks({ problems = defaultProblems, onComplete }: FillInBlanksProps) {
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const currentProblem = problems[currentProblemIndex];
  
  const formatNumberWithBlanks = (number: string, blanks: number[]) => {
    const digits = number.replace(/,/g, '').split('');
    const result = [];
    let digitIndex = 0;
    
    for (let i = 0; i < number.length; i++) {
      if (number[i] === ',') {
        result.push(',');
      } else {
        if (blanks.includes(digitIndex)) {
          result.push('_');
        } else {
          result.push(digits[digitIndex]);
        }
        digitIndex++;
      }
    }
    return result;
  };

  const getCorrectAnswers = () => {
    const digits = currentProblem.number.replace(/,/g, '').split('');
    const correct: { [key: number]: string } = {};
    currentProblem.blanks.forEach(blankIndex => {
      correct[blankIndex] = digits[blankIndex];
    });
    return correct;
  };

  const handleAnswerChange = (blankIndex: number, value: string) => {
    // Only allow single digits
    if (value.length <= 1 && (value === '' || /^[0-9]$/.test(value))) {
      setAnswers(prev => ({ ...prev, [blankIndex]: value }));
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const isComplete = currentProblem.blanks.every(blankIndex => answers[blankIndex]?.length > 0);
  const correctAnswers = getCorrectAnswers();
  const isCorrect = submitted && currentProblem.blanks.every(blankIndex => 
    answers[blankIndex] === correctAnswers[blankIndex]
  );

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const nextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
      setAnswers({});
      setSubmitted(false);
    } else if (onComplete) {
      onComplete();
    }
  };

  const displayElements = formatNumberWithBlanks(currentProblem.number, currentProblem.blanks);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Complete the Number</span>
          <div className="flex gap-2">
            <Badge variant="outline">
              {currentProblemIndex + 1} of {problems.length}
            </Badge>
            <Button onClick={reset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {currentProblem.description}
          </p>
        </div>

        {/* Number with Blanks */}
        <div className="flex items-center justify-center gap-1 text-3xl font-mono">
          {displayElements.map((element, index) => {
            if (element === ',') {
              return <span key={index} className="text-muted-foreground">,</span>;
            } else if (element === '_') {
              // Find which blank this represents
              const digitsBefore = displayElements.slice(0, index).filter(e => e !== ',').length;
              const blankIndex = currentProblem.blanks.find(bi => {
                const blanksBeforeThis = currentProblem.blanks.filter(b => b < bi).length;
                return digitsBefore === bi - blanksBeforeThis + currentProblem.blanks.indexOf(bi);
              });
              
              // Simplified: just use the position in the blanks array
              const blankPosition = currentProblem.blanks[digitsBefore - displayElements.slice(0, index).filter(e => e !== ',' && e !== '_').length];
              
              return (
                <Input
                  key={index}
                  className={`w-12 h-12 text-center text-2xl font-mono border-2 ${
                    submitted 
                      ? answers[blankPosition] === correctAnswers[blankPosition]
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-red-500 bg-red-50 dark:bg-red-950'
                      : 'border-primary'
                  }`}
                  value={answers[blankPosition] || ''}
                  onChange={(e) => handleAnswerChange(blankPosition, e.target.value)}
                  maxLength={1}
                  disabled={submitted && isCorrect}
                />
              );
            } else {
              return <span key={index} className="w-12 text-center">{element}</span>;
            }
          })}
        </div>

        {/* Hints */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Fill in the missing digits to complete the number
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          {!submitted ? (
            <Button 
              onClick={handleSubmit} 
              disabled={!isComplete}
              className="px-8"
            >
              Check Answer
            </Button>
          ) : (
            <div className="text-center space-y-3">
              <div className={`flex items-center justify-center gap-2 ${
                isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span>❌</span>
                )}
                <span className="font-semibold">
                  {isCorrect ? 'Correct!' : 'Not quite right'}
                </span>
              </div>
              
              {isCorrect ? (
                <Button onClick={nextProblem} className="px-8">
                  {currentProblemIndex < problems.length - 1 ? 'Next Problem' : 'Complete'}
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    The correct number is: <span className="font-mono font-bold">{currentProblem.number}</span>
                  </p>
                  <Button onClick={reset} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}