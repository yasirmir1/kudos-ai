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
    <div className="w-full bg-background border border-border rounded-lg p-4 shadow-card" style={{ 
      background: 'hsl(var(--card))', 
      borderColor: 'hsl(var(--border))', 
      color: 'hsl(var(--card-foreground))',
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
      zIndex: 1
    }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">Week {currentWeek}</span>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">Foundation</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="text-sm mr-1">🎯</span>
              <span>Foundation</span>
            </div>
          </div>
          <h4 className="text-xl font-bold text-foreground">Number & Place Value</h4>
          <p className="text-sm text-muted-foreground">Multi-Topic Learning Module</p>
        </div>
        
        <div className="ml-6">
          <button 
            className="bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
            onClick={() => onStartLearning(currentWeek)}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};