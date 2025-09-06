import React from 'react';
import { Clock, FileText, Target, ArrowRight, CheckCircle } from 'lucide-react';

interface PracticeCoverPageProps {
  onStartPractice: () => void;
  onBackToHomepage: () => void;
}

export const PracticeCoverPage: React.FC<PracticeCoverPageProps> = ({
  onStartPractice,
  onBackToHomepage
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={onBackToHomepage}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to Practice Center
      </button>

      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Practice Session</h1>
        <p className="text-xl text-muted-foreground">
          Adaptive practice to strengthen your understanding
        </p>
        
        {/* Duration and Questions Info */}
        <div className="flex items-center justify-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>30 min</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>20 questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Adaptive difficulty</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-muted rounded-xl p-6 text-center" style={{ 
          background: 'hsl(var(--card))', 
          borderColor: 'hsl(var(--border))',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div className="text-3xl font-bold text-primary mb-2">20</div>
          <div className="text-muted-foreground">Questions</div>
        </div>
        
        <div className="bg-card border border-muted rounded-xl p-6 text-center" style={{ 
          background: 'hsl(var(--card))', 
          borderColor: 'hsl(var(--border))',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div className="text-3xl font-bold text-primary mb-2">30</div>
          <div className="text-muted-foreground">Minutes</div>
        </div>
        
        <div className="bg-card border border-muted rounded-xl p-6 text-center" style={{ 
          background: 'hsl(var(--card))', 
          borderColor: 'hsl(var(--border))',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div className="text-3xl font-bold text-primary mb-2">70%</div>
          <div className="text-muted-foreground">Target Accuracy</div>
        </div>
      </div>

      {/* What to Expect Section */}
      <div className="bg-card border border-muted rounded-xl p-6" style={{ 
        background: 'hsl(var(--card))', 
        borderColor: 'hsl(var(--border))',
        boxShadow: 'var(--shadow-card)'
      }}>
        <h3 className="text-lg font-semibold text-foreground mb-4">What to expect</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              Questions adapt to your skill level for optimal learning
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              Mix of topics based on your current progress and weak areas
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              Immediate feedback and explanations for each question
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              Take your time - practice sessions can be paused
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              Detailed progress tracking and recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={onStartPractice}
          className="bg-primary text-primary-foreground font-medium py-4 px-8 rounded-lg flex items-center justify-center text-lg hover:bg-primary/90 transition-colors mx-auto"
        >
          Start Practice Session
          <ArrowRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};