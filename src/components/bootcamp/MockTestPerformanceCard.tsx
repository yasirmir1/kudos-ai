import React from 'react';
import { Clock, Target, BarChart3, Award, RefreshCw, ChevronRight } from 'lucide-react';

interface MockTestSession {
  testNumber: number;
  date: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: string;
  status: 'Excellent' | 'Good' | 'Needs Improvement';
}

interface MockTestPerformanceCardProps {
  testsCompleted: number;
  averageScore: number;
  bestScore: number;
  averageTime: string;
  recentTests: MockTestSession[];
  onStartMockTest?: () => void;
  onReviewMistakes?: () => void;
}

export const MockTestPerformanceCard: React.FC<MockTestPerformanceCardProps> = ({
  testsCompleted,
  averageScore,
  bestScore,
  averageTime,
  recentTests,
  onStartMockTest,
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
    <div className="bg-card border border-muted rounded-xl p-5 shadow-card">
      <h2 className="text-lg font-medium text-foreground mb-6">Mock Test Performance</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Tests Completed</p>
            <p className="text-3xl font-bold text-foreground">{testsCompleted}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="text-3xl font-bold text-foreground">{averageScore}%</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Target className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Best Score</p>
            <p className="text-3xl font-bold text-foreground">{bestScore}%</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Award className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Avg Time</p>
            <p className="text-3xl font-bold text-foreground">{averageTime}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-full">
            <Clock className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {onStartMockTest && (
        <div className="space-y-3">
          <button
            onClick={onStartMockTest} 
            className="w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-lg flex items-center justify-center text-lg hover:bg-primary/90 transition-colors"
          >
            11+ Mock Test
            <span className="ml-auto text-sm bg-white/20 px-2 py-1 rounded text-xs">60 min</span>
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