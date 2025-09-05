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
    }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-xl font-medium text-foreground mb-6">Your Learning Journey</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Learning Card - Taking 2/3 width */}
        <div className="lg:col-span-2 bg-gradient-blue-light border-2 border-primary/20 rounded-xl p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-sm font-medium text-primary mb-2">
                Week {weekData.week} <span className="text-muted-foreground ml-2">{weekData.level}</span>
              </p>
              <h4 className="text-2xl font-bold text-foreground mb-2">
                {weekData.topic} - Week {weekData.week}
              </h4>
              <p className="text-muted-foreground">{weekData.topic} • {weekData.category}</p>
            </div>
          </div>

          <div className="mb-10">
            <p className="font-medium text-foreground mb-4">This week covers:</p>
            <ul className="space-y-3 text-muted-foreground">
              {weekData.covers.map((item, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => onStartLearning(weekData.week)}
            className="w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-lg flex items-center justify-center text-lg hover:bg-primary/90 transition-colors"
          >
            {hasStarted ? 'Continue Learning' : 'Start Learning'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* Upcoming Weeks Sidebar - Taking 1/3 width */}
        <div className="bg-card border border-muted rounded-xl p-8 shadow-card">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-medium text-foreground">Upcoming Weeks</h4>
            <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{weekData.level}</span>
          </div>
          
          <div className="space-y-4">
            {upcomingWeeks.map((week, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium text-foreground mb-1">
                  Week {week.week} <span className="text-sm text-muted-foreground ml-2">{week.level}</span>
                </p>
                <p className="text-muted-foreground mb-2">{week.topic}</p>
                <div className="flex gap-2 flex-wrap">
                  {week.mainConcepts.map((concept, conceptIndex) => (
                    <span key={conceptIndex} className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};