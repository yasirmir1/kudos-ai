import React, { useState } from 'react';
import { PracticeHomepage } from './PracticeHomepage';
import { EnhancedPracticeSession } from './EnhancedPracticeSession';

export const PracticeView: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<'homepage' | 'session'>('homepage');

  const handleStartPractice = () => {
    setCurrentMode('session');
  };

  const handleBackToHomepage = () => {
    setCurrentMode('homepage');
  };

  const handleReviewMistakes = () => {
    // This would open a modal or navigate to mistakes review
    console.log('Review mistakes clicked');
  };

  if (currentMode === 'session') {
    return (
      <div className="p-6">
        <div className="mb-4">
          <button
            onClick={handleBackToHomepage}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Practice Center
          </button>
        </div>
        <EnhancedPracticeSession />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PracticeHomepage 
        onStartPractice={handleStartPractice}
        onReviewMistakes={handleReviewMistakes}
      />
    </div>
  );
};