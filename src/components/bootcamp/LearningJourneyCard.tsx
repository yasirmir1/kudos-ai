import React from 'react';
import { BookOpen, Play, ArrowRight } from 'lucide-react';

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
    },
    {
      week: 5,
      topic: 'Decimals',
      level: 'Intermediate',
      mainConcepts: ['Decimal Places', 'Converting Fractions']
    }
  ];

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Your Learning Journey</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{weekData.level}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Half - Current Week Content */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl font-bold text-primary">Week {weekData.week}</span>
                <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {weekData.level}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-1">
                {weekData.topic} - Week {weekData.week}
              </h3>
              
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm font-medium text-foreground">{weekData.topic}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{weekData.category}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3">This week covers:</h4>
            <div className="grid grid-cols-1 gap-2">
              {weekData.covers.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onStartLearning(weekData.week)}
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg px-6 py-3 flex items-center justify-center space-x-3 hover:from-primary/90 hover:to-primary/70 transition-colors font-medium"
          >
            <Play className="h-5 w-5" />
            <span>{hasStarted ? 'Continue Learning' : 'Start Learning'}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Right Half - Upcoming Weeks */}
        <div className="bg-muted/30 rounded-lg p-6 border border-muted">
          <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Weeks</h3>
          <div className="space-y-3">
            {upcomingWeeks.map((week, index) => (
              <div key={index} className="bg-card rounded-lg p-4 border border-muted/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-primary">Week {week.week}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {week.level}
                    </span>
                  </div>
                </div>
                
                <h4 className="font-medium text-foreground text-sm mb-2">{week.topic}</h4>
                
                <div className="flex flex-wrap gap-1">
                  {week.mainConcepts.map((concept, conceptIndex) => (
                    <span key={conceptIndex} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-muted">
            <p className="text-xs text-muted-foreground text-center">
              Complete Week {weekData.week} to unlock the next week
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};