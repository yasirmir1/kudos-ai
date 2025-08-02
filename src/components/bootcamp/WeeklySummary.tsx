import React from 'react';
import { Clock, Target, Award } from 'lucide-react';

interface ChildData {
  name: string;
}

interface WeeklySummaryProps {
  childData: ChildData;
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ childData }) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-4">This Week's Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm text-primary font-medium">Time Spent</span>
          </div>
          <p className="text-2xl font-bold text-foreground">3h 45m</p>
          <p className="text-sm text-muted-foreground mt-1">Across 5 sessions</p>
        </div>
        <div className="bg-success/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-success" />
            <span className="text-sm text-success font-medium">Accuracy</span>
          </div>
          <p className="text-2xl font-bold text-foreground">78%</p>
          <p className="text-sm text-muted-foreground mt-1">↑ 5% from last week</p>
        </div>
        <div className="bg-secondary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-5 w-5 text-secondary-foreground" />
            <span className="text-sm text-secondary-foreground font-medium">Achievements</span>
          </div>
          <p className="text-2xl font-bold text-foreground">3 New</p>
          <p className="text-sm text-muted-foreground mt-1">Speed Demon + 2 more</p>
        </div>
      </div>
    </div>
  );
};