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
    <div className="bg-card border border-muted rounded-xl p-5 shadow-card" style={{ 
      background: 'hsl(var(--card))', 
      borderColor: 'hsl(var(--border))', 
      color: 'hsl(var(--card-foreground))',
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
      zIndex: 1
    }}>
      <h2 className="text-lg font-medium text-foreground mb-6">Weekly Test Performance</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active Weeks</p>
            <p className="text-3xl font-bold text-foreground">{activeWeeks}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="text-3xl font-bold text-foreground">{averageScore}%</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Best Week</p>
            <p className="text-3xl font-bold text-foreground">{bestWeek}%</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Week Streak</p>
            <p className="text-3xl font-bold text-foreground">{weekStreak}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Flame className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {onStartWeeklyChallenge && (
        <div className="space-y-3">
          <button
            onClick={onStartWeeklyChallenge} 
            className="w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-lg flex items-center justify-center text-lg hover:bg-primary/90 transition-colors"
          >
            Start Weekly Challenge
            <Play className="ml-2 h-5 w-5" />
          </button>
          <button 
            onClick={onReviewMistakes}
            className="w-full bg-muted text-muted-foreground rounded-lg py-3 px-6 flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            Review Mistakes
            <RefreshCw className="ml-2 h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};