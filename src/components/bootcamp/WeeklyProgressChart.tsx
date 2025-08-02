import React from 'react';
import { useBootcampData } from '@/hooks/useBootcampData';

export const WeeklyProgressChart: React.FC = () => {
  const { responses, isLoading } = useBootcampData();

  // Process responses data to create weekly activity pattern
  const processWeeklyData = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const weeklyData = days.map(() => 0);
    
    // Get last 7 days of responses
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const weeklyResponses = responses.filter(r => 
      new Date(r.responded_at) >= lastWeek
    );

    // Count responses per day
    weeklyResponses.forEach(response => {
      const dayOfWeek = new Date(response.responded_at).getDay();
      weeklyData[dayOfWeek]++;
    });

    const maxQuestions = Math.max(...weeklyData, 1);
    const totalWeekQuestions = weeklyResponses.length;

    return { weeklyData, maxQuestions, totalWeekQuestions };
  };

  const { weeklyData, maxQuestions, totalWeekQuestions } = processWeeklyData();

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Weekly Activity</h2>
        </div>
        <div className="flex items-center justify-center h-24">
          <div className="animate-pulse">Loading weekly data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Weekly Activity</h2>
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          View Details
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
          const intensity = weeklyData[i] / maxQuestions;
          return (
            <div key={i} className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                {day}
              </div>
              <div 
                className={`w-10 h-10 rounded-lg mx-auto ${
                  intensity > 0.8 ? 'bg-primary' :
                  intensity > 0.6 ? 'bg-primary/60' :
                  intensity > 0.3 ? 'bg-primary/30' :
                  intensity > 0 ? 'bg-primary/10' :
                  'bg-muted'
                }`}
                title={`${weeklyData[i]} questions`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total this week</span>
          <span className="font-medium text-foreground">{totalWeekQuestions} questions</span>
        </div>
      </div>
    </div>
  );
};