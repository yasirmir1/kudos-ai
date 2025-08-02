import React from 'react';
import { useBootcampData } from '@/hooks/useBootcampData';

interface DayData {
  day: string;
  accuracy: number;
  questions: number;
}

export const PerformanceChart: React.FC = () => {
  const { responses, isLoading } = useBootcampData();

  // Process responses data to create weekly performance data
  const processPerformanceData = (): DayData[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayData: { [key: string]: { questions: number; correct: number } } = {};
    
    // Initialize all days
    days.forEach(day => {
      dayData[day] = { questions: 0, correct: 0 };
    });

    // Get last 7 days of responses
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const weeklyResponses = responses.filter(r => 
      new Date(r.responded_at) >= lastWeek
    );

    // Group by day of week
    weeklyResponses.forEach(response => {
      const dayOfWeek = days[new Date(response.responded_at).getDay()];
      dayData[dayOfWeek].questions++;
      if (response.is_correct) {
        dayData[dayOfWeek].correct++;
      }
    });

    return days.map(day => ({
      day,
      questions: dayData[day].questions,
      accuracy: dayData[day].questions > 0 
        ? Math.round((dayData[day].correct / dayData[day].questions) * 100)
        : 0
    }));
  };

  const data = processPerformanceData();
  const maxQuestions = Math.max(...data.map(d => d.questions), 1);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">This Week's Performance</h2>
        <div className="flex items-center justify-center h-48">
          <div className="animate-pulse">Loading performance data...</div>
        </div>
      </div>
    );
  }

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