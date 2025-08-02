import React from 'react';

interface QuestionProgressProps {
  current: number;
  total: number;
  correct: number;
}

export const QuestionProgress: React.FC<QuestionProgressProps> = ({ current, total, correct }) => {
  const accuracy = Math.round((correct / current) * 100);
  
  return (
    <div className="bg-card rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Session Progress</span>
        <span className="text-sm text-muted-foreground">{current} of {total}</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2 mb-3">
        <div 
          className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Accuracy: {accuracy}%</span>
        <span className="text-muted-foreground">Correct: {correct}/{current}</span>
      </div>
    </div>
  );
};