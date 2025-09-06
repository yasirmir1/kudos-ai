import React from 'react';
import { Clock, BookOpen, TrendingUp, Play, ArrowRight } from 'lucide-react';

interface CurrentPracticeCardProps {
  hasCurrentSession: boolean;
  currentTopic?: string;
  progress?: number;
  timeElapsed?: string;
  questionsCompleted?: number;
  totalQuestions?: number;
  onContinueSession?: () => void;
  onStartNewSession?: () => void;
}

export const CurrentPracticeCard: React.FC<CurrentPracticeCardProps> = ({
  hasCurrentSession,
  currentTopic,
  progress = 0,
  timeElapsed,
  questionsCompleted = 0,
  totalQuestions = 20,
  onContinueSession,
  onStartNewSession
}) => {
  return (
    <div className="bg-card border border-muted rounded-xl p-6 shadow-card" style={{ 
      background: 'hsl(var(--card))', 
      borderColor: 'hsl(var(--border))', 
      color: 'hsl(var(--card-foreground))',
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
      zIndex: 1
    }}>
      <h2 className="text-lg font-medium text-foreground mb-6">Current Practice Session</h2>
      
      {hasCurrentSession ? (
        <div className="space-y-6">
          {/* Session Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Topic</p>
                <p className="font-medium text-foreground">{currentTopic || 'Mixed Topics'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Elapsed</p>
                <p className="font-medium text-foreground">{timeElapsed || '15 min'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-medium text-foreground">{questionsCompleted} / {totalQuestions} questions</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Session Progress</span>
              <span className="text-foreground font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={onContinueSession}
            className="w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-lg flex items-center justify-center text-lg hover:bg-primary/90 transition-colors"
          >
            Continue Session
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="text-center space-y-6">
          {/* No Active Session */}
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-full p-8 mx-auto w-fit">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium text-foreground mb-2">No Active Session</p>
              <p className="text-muted-foreground text-sm">
                Start a new practice session to continue your learning journey
              </p>
            </div>
          </div>

          {/* Start New Session Button */}
          <button
            onClick={onStartNewSession}
            className="w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-lg flex items-center justify-center text-lg hover:bg-primary/90 transition-colors"
          >
            Start New Session
            <Play className="ml-2 h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};