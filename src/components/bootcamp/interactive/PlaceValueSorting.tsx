import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, RotateCcw } from 'lucide-react';

interface PlaceValueSortingProps {
  number?: string;
  onComplete?: () => void;
}

export function PlaceValueSorting({ number = "1234567", onComplete }: PlaceValueSortingProps) {
  const [draggedDigit, setDraggedDigit] = useState<string | null>(null);
  const [positions, setPositions] = useState<{ [key: string]: string }>({
    millions: '',
    hundredThousands: '',
    tenThousands: '',
    thousands: '',
    hundreds: '',
    tens: '',
    ones: ''
  });
  const [availableDigits, setAvailableDigits] = useState<string[]>(number.split(''));

  const placeValues = [
    { key: 'millions', label: 'Millions', value: 1000000 },
    { key: 'hundredThousands', label: 'Hundred Thousands', value: 100000 },
    { key: 'tenThousands', label: 'Ten Thousands', value: 10000 },
    { key: 'thousands', label: 'Thousands', value: 1000 },
    { key: 'hundreds', label: 'Hundreds', value: 100 },
    { key: 'tens', label: 'Tens', value: 10 },
    { key: 'ones', label: 'Ones', value: 1 }
  ];

  const handleDragStart = (digit: string) => {
    setDraggedDigit(digit);
  };

  const handleDrop = (position: string) => {
    if (draggedDigit) {
      // Remove from previous position if it exists
      const previousPosition = Object.keys(positions).find(key => positions[key] === draggedDigit);
      if (previousPosition) {
        setPositions(prev => ({ ...prev, [previousPosition]: '' }));
        setAvailableDigits(prev => [...prev, draggedDigit]);
      }

      // Add to new position
      setPositions(prev => ({ ...prev, [position]: draggedDigit }));
      setAvailableDigits(prev => prev.filter(d => d !== draggedDigit));
      setDraggedDigit(null);
    }
  };

  const handleDigitClick = (digit: string) => {
    // Simple click interface for touch devices
    if (draggedDigit === digit) {
      setDraggedDigit(null); // Deselect
    } else {
      setDraggedDigit(digit); // Select for placement
    }
  };

  const handlePositionClick = (position: string) => {
    if (draggedDigit) {
      handleDrop(position);
    }
  };

  const reset = () => {
    setPositions({
      millions: '',
      hundredThousands: '',
      tenThousands: '',
      thousands: '',
      hundreds: '',
      tens: '',
      ones: ''
    });
    setAvailableDigits(number.split(''));
    setDraggedDigit(null);
  };

  const isComplete = availableDigits.length === 0;
  const isCorrect = isComplete && Object.keys(positions).every((key, index) => {
    const expectedDigit = number[index] || '0';
    return positions[key] === expectedDigit;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Place Value Sorting</span>
          <Button onClick={reset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Drag digits from the number <span className="font-mono font-bold text-lg">{number}</span> to their correct place value positions
          </p>
          {draggedDigit && (
            <Badge variant="secondary">Selected: {draggedDigit}</Badge>
          )}
        </div>

        {/* Available Digits */}
        <div>
          <h4 className="font-medium mb-3">Available Digits:</h4>
          <div className="flex gap-2 justify-center flex-wrap">
            {availableDigits.map((digit, index) => (
              <div
                key={`${digit}-${index}`}
                className={`w-12 h-12 border-2 border-dashed border-primary rounded-lg flex items-center justify-center cursor-move font-mono text-lg font-bold transition-all ${
                  draggedDigit === digit ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                }`}
                draggable
                onDragStart={() => handleDragStart(digit)}
                onClick={() => handleDigitClick(digit)}
              >
                {digit}
              </div>
            ))}
          </div>
        </div>

        {/* Place Value Positions */}
        <div>
          <h4 className="font-medium mb-3">Place Value Positions:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {placeValues.map((place) => (
              <div key={place.key} className="text-center">
                <div className="text-xs font-medium mb-1 text-muted-foreground">
                  {place.label}
                </div>
                <div
                  className={`w-16 h-16 border-2 border-dashed rounded-lg flex items-center justify-center font-mono text-lg font-bold transition-all cursor-pointer ${
                    positions[place.key] 
                      ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300' 
                      : 'border-gray-300 hover:border-primary hover:bg-muted'
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(place.key)}
                  onClick={() => handlePositionClick(place.key)}
                >
                  {positions[place.key] || '?'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {place.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {isComplete && (
          <div className={`text-center p-4 rounded-lg ${
            isCorrect ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <span className="text-red-600">❌</span>
              )}
              <span className={`font-semibold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {isCorrect ? 'Correct! Well done!' : 'Not quite right. Try again!'}
              </span>
            </div>
            {isCorrect && onComplete && (
              <Button onClick={onComplete} className="mt-2">
                Continue
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}