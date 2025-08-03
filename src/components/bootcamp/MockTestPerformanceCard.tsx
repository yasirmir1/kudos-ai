import React from 'react';
import { Clock, Target, BarChart3, Award } from 'lucide-react';

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
}

export const MockTestPerformanceCard: React.FC<MockTestPerformanceCardProps> = ({
  testsCompleted,
  averageScore,
  bestScore,
  averageTime,
  recentTests,
  onStartMockTest
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
      <h2 className="text-lg font-semibold text-foreground mb-4">Mock Test Performance</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <BarChart3 className="h-4 w-4 text-primary mr-1" />
            <span className="text-2xl font-bold text-foreground">{testsCompleted}</span>
          </div>
          <p className="text-xs text-muted-foreground">Tests Completed</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Target className="h-4 w-4 text-warning mr-1" />
            <span className="text-2xl font-bold text-foreground">{averageScore}%</span>
          </div>
          <p className="text-xs text-muted-foreground">Average Score</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Award className="h-4 w-4 text-success mr-1" />
            <span className="text-2xl font-bold text-foreground">{bestScore}%</span>
          </div>
          <p className="text-xs text-muted-foreground">Best Score</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-2xl font-bold text-foreground">{averageTime}</span>
          </div>
          <p className="text-xs text-muted-foreground">Avg Time</p>
        </div>
      </div>

      {/* Recent Tests */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Recent Tests</h3>
        <div className="space-y-3">
          {recentTests.map((test, index) => (
            <div key={index} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground">Test {test.testNumber}</span>
                <span className={`text-lg font-bold ${getStatusColor(test.status)}`}>
                  {test.score}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {test.date} • {test.correctAnswers}/{test.totalQuestions} correct • {test.timeSpent}
              </p>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(test.status)}`}>
                {test.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Start Mock Test Button */}
      {onStartMockTest && (
        <div className="mt-6 pt-4 border-t border-muted">
          <button 
            onClick={onStartMockTest} 
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 flex items-center justify-between hover:from-orange-600 hover:to-orange-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5" />
              <span className="font-medium">11+ Mock Test</span>
            </div>
            <span className="text-sm bg-white/20 px-2 py-1 rounded text-xs">60 min</span>
          </button>
        </div>
      )}
    </div>
  );
};