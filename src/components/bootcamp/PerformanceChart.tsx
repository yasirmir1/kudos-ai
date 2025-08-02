import React from 'react';

interface DayData {
  day: string;
  accuracy: number;
  questions: number;
}

export const PerformanceChart: React.FC = () => {
  const data: DayData[] = [
    { day: 'Mon', accuracy: 72, questions: 25 },
    { day: 'Tue', accuracy: 78, questions: 30 },
    { day: 'Wed', accuracy: 75, questions: 28 },
    { day: 'Thu', accuracy: 82, questions: 35 },
    { day: 'Fri', accuracy: 85, questions: 40 },
    { day: 'Sat', accuracy: 80, questions: 32 },
    { day: 'Sun', accuracy: 88, questions: 45 }
  ];

  const maxQuestions = Math.max(...data.map(d => d.questions));

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">This Week's Performance</h2>
      <div className="space-y-4">
        <div className="flex items-end justify-between h-48">
          {data.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center">
                <span className="text-xs text-muted-foreground mb-1">{day.accuracy}%</span>
                <div className="w-8 bg-secondary rounded-t flex flex-col justify-end" style={{ height: '120px' }}>
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all duration-300"
                    style={{ height: `${(day.questions / maxQuestions) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-foreground mt-2">{day.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-t from-primary to-primary/60 rounded" />
            <span className="text-muted-foreground">Questions Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Numbers show accuracy %</span>
          </div>
        </div>
      </div>
    </div>
  );
};