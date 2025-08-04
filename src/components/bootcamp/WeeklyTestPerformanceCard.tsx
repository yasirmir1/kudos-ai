import React from 'react';
import { Calendar, TrendingUp, Trophy, Flame, Play, ChevronRight, RefreshCw } from 'lucide-react';

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
  onStartWeeklyChallenge?: () => void;
  onReviewMistakes?: () => void;
}

export const WeeklyTestPerformanceCard: React.FC<WeeklyTestPerformanceCardProps> = ({
  activeWeeks,
  averageScore,
  bestWeek,
  weekStreak,
  recentWeeks,
  onStartWeeklyChallenge,
  onReviewMistakes
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

      {/* Start Weekly Challenge Button */}
      {onStartWeeklyChallenge && (
        <div className="pt-4 border-t border-muted">
          <button
            onClick={onStartWeeklyChallenge} 
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4 flex items-center justify-between hover:from-primary/90 hover:to-primary/70 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Play className="h-5 w-5" />
              <span className="font-medium">Start Weekly Challenge</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </button>
          <button 
            onClick={onReviewMistakes}
            className="w-full mt-3 bg-muted text-muted-foreground rounded-lg p-4 flex items-center justify-between hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5" />
              <span className="font-medium">Review Mistakes</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};