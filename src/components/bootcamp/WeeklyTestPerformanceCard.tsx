import React from 'react';
import { Calendar, TrendingUp, Trophy, Flame } from 'lucide-react';

interface WeeklyTestData {
  weekNumber: number;
  dateRange: string;
  correct: number;
  total: number;
  accuracy: number;
  status: 'Excellent' | 'Good' | 'Needs Improvement';
}

interface WeeklyTestPerformanceCardProps {
  activeWeeks: number;
  averageScore: number;
  bestWeek: number;
  weekStreak: number;
  recentWeeks: WeeklyTestData[];
}

export const WeeklyTestPerformanceCard: React.FC<WeeklyTestPerformanceCardProps> = ({
  activeWeeks,
  averageScore,
  bestWeek,
  weekStreak,
  recentWeeks
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-success';
      case 'Good': return 'text-warning';
      case 'Needs Improvement': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'bg-success/10 text-success';
      case 'Good': return 'bg-warning/10 text-warning';
      case 'Needs Improvement': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Weekly Test Performance</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Calendar className="h-4 w-4 text-primary mr-1" />
            <span className="text-2xl font-bold text-foreground">{activeWeeks}</span>
          </div>
          <p className="text-xs text-muted-foreground">Active Weeks</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-4 w-4 text-warning mr-1" />
            <span className="text-2xl font-bold text-foreground">{averageScore}%</span>
          </div>
          <p className="text-xs text-muted-foreground">Average Score</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Trophy className="h-4 w-4 text-success mr-1" />
            <span className="text-2xl font-bold text-foreground">{bestWeek}%</span>
          </div>
          <p className="text-xs text-muted-foreground">Best Week</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Flame className="h-4 w-4 text-orange-500 mr-1" />
            <span className="text-2xl font-bold text-foreground">{weekStreak}</span>
          </div>
          <p className="text-xs text-muted-foreground">Week Streak</p>
        </div>
      </div>

      {/* Recent Weeks */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Recent Weeks</h3>
        <div className="space-y-3">
          {recentWeeks.map((week, index) => (
            <div key={index} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground">Week {week.weekNumber}</span>
                <span className={`text-lg font-bold ${getStatusColor(week.status)}`}>
                  {week.accuracy}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {week.dateRange} • {week.correct}/{week.total} correct
              </p>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(week.status)}`}>
                {week.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};