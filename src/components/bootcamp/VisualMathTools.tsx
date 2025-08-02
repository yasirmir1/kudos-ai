import React, { useState } from 'react';
import { Minus, Plus, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface FractionBarProps {
  onAnswerSubmit: (answer: string) => void;
  question: {
    prompt: string;
    totalParts?: number;
  };
}

export const FractionBar: React.FC<FractionBarProps> = ({ question, onAnswerSubmit }) => {
  const [totalParts, setTotalParts] = useState([question.totalParts || 8]);
  const [selectedParts, setSelectedParts] = useState(0);

  const handlePartClick = (index: number) => {
    setSelectedParts(prev => {
      const newSelection = prev === index + 1 ? 0 : index + 1;
      return newSelection;
    });
  };

  const handleSubmit = () => {
    const fraction = `${selectedParts}/${totalParts[0]}`;
    onAnswerSubmit(fraction);
  };

  const reset = () => {
    setSelectedParts(0);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Fraction Bar Tool</CardTitle>
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Total Parts:</span>
            <div className="w-32">
              <Slider
                value={totalParts}
                onValueChange={setTotalParts}
                max={20}
                min={2}
                step={1}
              />
            </div>
            <Badge variant="outline">{totalParts[0]}</Badge>
          </div>
          
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Fraction Display */}
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {selectedParts}/{totalParts[0]}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {selectedParts > 0 ? `= ${(selectedParts / totalParts[0]).toFixed(2)}` : 'Select parts above'}
          </div>
        </div>

        {/* Visual Fraction Bar */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1 p-4 bg-muted/20 rounded-lg">
            {Array.from({ length: totalParts[0] }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePartClick(index)}
                className={`flex-1 min-w-8 h-12 border-2 rounded transition-all ${
                  index < selectedParts
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
                style={{ minWidth: `${Math.max(40, 300 / totalParts[0])}px` }}
              >
                <span className="text-xs">{index + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={selectedParts === 0}>
            <Check className="h-4 w-4 mr-2" />
            Submit Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface NumberLineProps {
  onAnswerSubmit: (answer: string) => void;
  question: {
    prompt: string;
    min?: number;
    max?: number;
    step?: number;
  };
}

export const NumberLine: React.FC<NumberLineProps> = ({ question, onAnswerSubmit }) => {
  const min = question.min || 0;
  const max = question.max || 10;
  const step = question.step || 1;
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  const numbers = [];
  for (let i = min; i <= max; i += step) {
    numbers.push(i);
  }

  const handleNumberClick = (value: number) => {
    setSelectedValue(value);
  };

  const handleSubmit = () => {
    if (selectedValue !== null) {
      onAnswerSubmit(selectedValue.toString());
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Number Line Tool</CardTitle>
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Value Display */}
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {selectedValue !== null ? selectedValue : 'Select a number'}
          </div>
        </div>

        {/* Number Line */}
        <div className="relative p-4 bg-muted/20 rounded-lg overflow-x-auto">
          <div className="flex items-center justify-between min-w-max gap-2">
            {numbers.map((num) => (
              <div key={num} className="flex flex-col items-center">
                <button
                  onClick={() => handleNumberClick(num)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedValue === num
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-border hover:border-primary/50'
                  }`}
                >
                  {num}
                </button>
                <div className="w-0.5 h-4 bg-border mt-1"></div>
              </div>
            ))}
          </div>
          {/* Line */}
          <div className="absolute bottom-6 left-4 right-4 h-0.5 bg-border"></div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={selectedValue === null}>
            <Check className="h-4 w-4 mr-2" />
            Submit Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface GeometryShapeProps {
  onAnswerSubmit: (answer: string) => void;
  question: {
    prompt: string;
    shapeType: 'triangle' | 'rectangle' | 'circle';
  };
}

export const GeometryShape: React.FC<GeometryShapeProps> = ({ question, onAnswerSubmit }) => {
  const [measurements, setMeasurements] = useState({
    width: 5,
    height: 3,
    radius: 4
  });

  const calculateArea = () => {
    switch (question.shapeType) {
      case 'rectangle':
        return measurements.width * measurements.height;
      case 'triangle':
        return (measurements.width * measurements.height) / 2;
      case 'circle':
        return Math.PI * measurements.radius * measurements.radius;
      default:
        return 0;
    }
  };

  const handleSubmit = () => {
    const area = calculateArea();
    onAnswerSubmit(area.toFixed(2));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Geometry Tool - {question.shapeType}</CardTitle>
        <p className="text-sm text-muted-foreground">{question.prompt}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shape Visualization */}
        <div className="flex justify-center p-8 bg-muted/20 rounded-lg">
          <svg width="200" height="160" viewBox="0 0 200 160">
            {question.shapeType === 'rectangle' && (
              <rect
                x="50"
                y="40"
                width={measurements.width * 10}
                height={measurements.height * 10}
                fill="hsl(var(--primary))"
                fillOpacity="0.2"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
            )}
            {question.shapeType === 'triangle' && (
              <polygon
                points={`100,40 ${100 - measurements.width * 5},${40 + measurements.height * 10} ${100 + measurements.width * 5},${40 + measurements.height * 10}`}
                fill="hsl(var(--primary))"
                fillOpacity="0.2"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
            )}
            {question.shapeType === 'circle' && (
              <circle
                cx="100"
                cy="80"
                r={measurements.radius * 8}
                fill="hsl(var(--primary))"
                fillOpacity="0.2"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
            )}
          </svg>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {(question.shapeType === 'rectangle' || question.shapeType === 'triangle') && (
            <>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-16">Width:</span>
                <div className="flex-1">
                  <Slider
                    value={[measurements.width]}
                    onValueChange={([value]) => setMeasurements(prev => ({ ...prev, width: value }))}
                    max={10}
                    min={1}
                    step={0.5}
                  />
                </div>
                <Badge variant="outline">{measurements.width}</Badge>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-16">Height:</span>
                <div className="flex-1">
                  <Slider
                    value={[measurements.height]}
                    onValueChange={([value]) => setMeasurements(prev => ({ ...prev, height: value }))}
                    max={10}
                    min={1}
                    step={0.5}
                  />
                </div>
                <Badge variant="outline">{measurements.height}</Badge>
              </div>
            </>
          )}
          
          {question.shapeType === 'circle' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium w-16">Radius:</span>
              <div className="flex-1">
                <Slider
                  value={[measurements.radius]}
                  onValueChange={([value]) => setMeasurements(prev => ({ ...prev, radius: value }))}
                  max={10}
                  min={1}
                  step={0.5}
                />
              </div>
              <Badge variant="outline">{measurements.radius}</Badge>
            </div>
          )}
        </div>

        {/* Area Display */}
        <div className="text-center p-4 bg-accent/50 rounded-lg">
          <div className="text-lg font-semibold">
            Area: {calculateArea().toFixed(2)} square units
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button onClick={handleSubmit}>
            <Check className="h-4 w-4 mr-2" />
            Submit Answer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};