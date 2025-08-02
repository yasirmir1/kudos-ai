import React from 'react';

interface Misconception {
  code: string;
  name: string;
  occurrences: number;
  status: 'active' | 'improving' | 'resolved';
}

interface MisconceptionTrackerProps {
  misconceptions: Misconception[];
}

export const MisconceptionTracker: React.FC<MisconceptionTrackerProps> = ({ 
  misconceptions 
}) => {
  return (
    <div className="bg-muted/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Misconception Tracking</h3>
      <div className="space-y-3">
        {misconceptions.map((misc, index) => (
          <div key={index} className="bg-card rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  misc.status === 'active' ? 'bg-destructive' :
                  misc.status === 'improving' ? 'bg-warning' :
                  'bg-success'
                }`} />
                <span className="text-sm font-medium text-foreground">{misc.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{misc.occurrences} times</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${
                misc.status === 'active' ? 'bg-destructive/10 text-destructive' :
                misc.status === 'improving' ? 'bg-warning/10 text-warning' :
                'bg-success/10 text-success'
              }`}>
                {misc.status}
              </span>
              <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                Review Tutorial
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};