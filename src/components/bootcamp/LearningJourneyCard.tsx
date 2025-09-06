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
    <div className="lg:col-span-1 bg-background border border-border rounded-lg p-4 shadow-card max-w-sm" style={{ 
      background: 'hsl(var(--card))', 
      borderColor: 'hsl(var(--border))', 
      color: 'hsl(var(--card-foreground))',
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
      zIndex: 1
    }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-foreground">Your Learning Journey</h3>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="text-xs mr-1">🎯</span>
          <span>Foundation</span>
        </div>
      </div>
      <div>
        <div className="mb-2">
          <span className="text-xs font-semibold text-primary">Week {currentWeek}</span>
          <span className="ml-2 text-xs font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Foundation</span>
        </div>
        <h4 className="text-lg font-bold text-foreground">Number & Place Value</h4>
        <p className="text-sm text-muted-foreground mt-1">Multi-Topic</p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-foreground mb-2">This week covers:</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li className="flex items-start">
            <Check className="h-3 w-3 text-primary mr-2 mt-0.5 flex-shrink-0" />
            Large Numbers
          </li>
          <li className="flex items-start">
            <Check className="h-3 w-3 text-primary mr-2 mt-0.5 flex-shrink-0" />
            Rounding
          </li>
          <li className="flex items-start">
            <Check className="h-3 w-3 text-primary mr-2 mt-0.5 flex-shrink-0" />
            Place Value
          </li>
        </ul>
      </div>

      {/* Upcoming Weeks Summary */}
      <div className="mt-4 bg-muted/30 rounded-lg p-3">
        <p className="text-xs font-semibold text-foreground mb-2">Coming Up:</p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>Week 2-3: Addition & Multiplication</div>
          <div>Week 4: Fractions</div>
        </div>
      </div>

      <div className="mt-4">
        <button 
          className="w-full bg-primary text-primary-foreground font-semibold py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center text-sm"
          onClick={() => onStartLearning(currentWeek)}
        >
          <ArrowRight className="mr-1 h-3 w-3" />
          Start Learning
        </button>
      </div>
    </div>
  );
};