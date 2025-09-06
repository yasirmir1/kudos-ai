import React from 'react';
import { Clock, FileText, Target, ArrowRight, Brain, Zap } from 'lucide-react';

interface PracticeOverviewCardProps {
  onStartPractice: () => void;
}

export const PracticeOverviewCard: React.FC<PracticeOverviewCardProps> = ({
  onStartPractice
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
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="bg-primary/10 p-4 rounded-full mx-auto w-fit">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Adaptive Practice</h3>
            <p className="text-muted-foreground">Personalized learning experience</p>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">30 min</p>
              <p className="text-sm text-muted-foreground">Flexible timing</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="bg-primary/10 p-2 rounded-full">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">20 questions</p>
              <p className="text-sm text-muted-foreground">Adaptive difficulty</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="bg-primary/10 p-2 rounded-full">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">AI-Powered</p>
              <p className="text-sm text-muted-foreground">Personalized to you</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="font-medium text-foreground">What makes this special?</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Questions adapt to your skill level in real-time</li>
            <li>• Focus on your weak areas for maximum improvement</li>
            <li>• Instant feedback and detailed explanations</li>
            <li>• Can be paused and resumed anytime</li>
          </ul>
        </div>

        {/* Start Button */}
        <button
          onClick={onStartPractice}
          className="w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-lg flex items-center justify-center text-lg hover:bg-primary/90 transition-colors"
        >
          Start Practice Session
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};