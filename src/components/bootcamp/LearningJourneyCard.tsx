import React from 'react';
import { BookOpen, Play, ArrowRight, Check } from 'lucide-react';

interface LearningJourneyCardProps {
  currentWeek: number;
  hasStarted: boolean;
  onStartLearning: (week: number) => void;
}

export const LearningJourneyCard: React.FC<LearningJourneyCardProps> = ({
  currentWeek,
  hasStarted,
  onStartLearning
}) => {
  // Sample data for the current week - this could come from props or API
  const weekData = {
    week: currentWeek,
    level: 'Foundation',
    topic: 'Number & Place Value',
    category: 'Multi-Topic',
    covers: [
      'Reading and Writing Large Numbers',
      'Rounding Numbers',
      'Place Value Understanding',
      'Number Sequences'
    ]
  };

  // Sample data for upcoming weeks
  const upcomingWeeks = [
    {
      week: 2,
      topic: 'Addition & Subtraction',
      level: 'Foundation',
      mainConcepts: ['Mental Strategies', 'Column Method']
    },
    {
      week: 3,
      topic: 'Multiplication & Division',
      level: 'Foundation',
      mainConcepts: ['Tables', 'Word Problems']
    },
    {
      week: 4,
      topic: 'Fractions',
      level: 'Foundation',
      mainConcepts: ['Simple Fractions', 'Equivalent Fractions']
    }
  ];

  return (
    <div className="lg:col-span-2 bg-background border border-border rounded-lg p-6 shadow-card" style={{ 
      background: 'hsl(var(--card))', 
      borderColor: 'hsl(var(--border))', 
      color: 'hsl(var(--card-foreground))',
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
      zIndex: 1
    }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">Your Learning Journey</h3>
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="text-sm mr-1">🎯</span>
          <span>Foundation</span>
        </div>
      </div>
      <div>
        <div className="mb-3">
          <span className="text-sm font-semibold text-primary">Week {currentWeek}</span>
          <span className="ml-2 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">Foundation</span>
        </div>
        <h4 className="text-xl font-bold text-foreground">Number & Place Value - Week 1</h4>
        <p className="text-base text-muted-foreground mt-2">Number & Place Value • Multi-Topic</p>
      </div>

      <div className="mt-6">
        <p className="text-base font-semibold text-foreground mb-4">This week covers:</p>
        <ul className="space-y-3 text-base text-muted-foreground">
          <li className="flex items-start">
            <Check className="h-4 w-4 text-primary mr-3 mt-1 flex-shrink-0" />
            Reading and Writing Large Numbers
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 text-primary mr-3 mt-1 flex-shrink-0" />
            Rounding Numbers
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 text-primary mr-3 mt-1 flex-shrink-0" />
            Place Value Understanding
          </li>
          <li className="flex items-start">
            <Check className="h-4 w-4 text-primary mr-3 mt-1 flex-shrink-0" />
            Number Sequences
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <button 
          className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          onClick={() => onStartLearning(currentWeek)}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          Start Learning
        </button>
      </div>
    </div>
  );
};