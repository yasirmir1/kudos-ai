import React from 'react';
import { Calendar, Target, Trophy, Flame, Play, RefreshCw } from 'lucide-react';

interface PracticeSession {
  sessionNumber: number;
  date: string;
  questionsCompleted: number;
  accuracy: number;
  timeSpent: string;
  status: 'Excellent' | 'Good' | 'Needs Improvement';
}

interface PracticePerformanceCardProps {
  sessionsCompleted: number;
  averageAccuracy: number;
  bestSession: number;
  totalQuestions: number;
  recentSessions: PracticeSession[];
  onStartPractice?: () => void;
  onReviewMistakes?: () => void;
}

export const PracticePerformanceCard: React.FC<PracticePerformanceCardProps> = ({
  sessionsCompleted,
  averageAccuracy,
  bestSession,
  totalQuestions,
  recentSessions,
  onStartPractice,
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
      <h2 className="text-lg font-medium text-foreground mb-6">Practice Performance</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Sessions Completed</p>
            <p className="text-3xl font-bold text-foreground">{sessionsCompleted}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Average Accuracy</p>
            <p className="text-3xl font-bold text-foreground">{averageAccuracy}%</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Target className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Best Session</p>
            <p className="text-3xl font-bold text-foreground">{bestSession}%</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Questions</p>
            <p className="text-3xl font-bold text-foreground">{totalQuestions}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Flame className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {onStartPractice && (
        <div className="space-y-3">
          <button
            onClick={onStartPractice} 
            className="w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-lg flex items-center justify-center text-lg hover:bg-primary/90 transition-colors"
          >
            Start Practice Session
            <Play className="ml-2 h-5 w-5" />
          </button>
          <button 
            onClick={onReviewMistakes}
            className="w-full rounded-lg py-3 px-6 flex items-center justify-center transition-colors"
            style={{
              backgroundColor: 'hsl(var(--purple-light))',
              color: 'hsl(var(--purple-light-foreground))'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(var(--purple-light) / 0.8)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'hsl(var(--purple-light))';
            }}
          >
            Review Mistakes
            <RefreshCw className="ml-2 h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};