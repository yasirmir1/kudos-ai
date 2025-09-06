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
    <div className="w-full bg-background border border-border rounded-lg p-6 shadow-card" style={{ 
      background: 'hsl(var(--card))', 
      borderColor: 'hsl(var(--border))', 
      color: 'hsl(var(--card-foreground))',
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Topic Type Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎯</span>
        <span className="text-sm text-muted-foreground">Multi-Topic Learning Module</span>
      </div>
      
      <div className="grid grid-cols-4 gap-6 items-center">
        {/* Week Badge */}
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold text-primary mb-1">Week {currentWeek}</div>
          <div className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">Foundation</div>
        </div>
        
        {/* Topic Information */}
        <div className="col-span-2">
          <h3 className="text-2xl font-bold text-foreground mb-1">Number & Place Value</h3>
          <p className="text-sm text-muted-foreground">Master essential number concepts and place value understanding</p>
        </div>
        
        {/* Action Button */}
        <div className="flex justify-end">
          <button 
            className="bg-primary text-primary-foreground font-semibold py-4 px-8 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center text-lg"
            onClick={() => onStartLearning(currentWeek)}
          >
            <ArrowRight className="mr-2 h-5 w-5" />
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};