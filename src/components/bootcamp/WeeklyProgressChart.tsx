import React from 'react';

export const WeeklyProgressChart: React.FC = () => {
  return (
    <div className="bg-card rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Weekly Activity</h2>
        <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
          View Details
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...Array(7)].map((_, i) => {
          const intensity = Math.random();
          return (
            <div key={i} className="text-center">
              <div className="text-xs text-muted-foreground mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
              </div>
              <div 
                className={`w-10 h-10 rounded-lg mx-auto ${
                  intensity > 0.8 ? 'bg-primary' :
                  intensity > 0.6 ? 'bg-primary/60' :
                  intensity > 0.3 ? 'bg-primary/30' :
                  'bg-muted'
                }`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total this week</span>
          <span className="font-medium text-foreground">186 questions</span>
        </div>
      </div>
    </div>
  );
};