import React from 'react';
import { misconceptionPaths, getRecommendedPractice } from '@/lib/bootcamp-data';

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  topic: string;
  reason: string;
  estimatedTime: string;
  activities: string[];
  misconceptionCode?: string;
}

export const LearningPathRecommendations: React.FC = () => {
  const recommendations: Recommendation[] = [
    {
      priority: 'high',
      topic: 'Fraction Operations',
      reason: 'Frequent denominator addition errors detected',
      estimatedTime: '45 mins',
      activities: ['Visual Fraction Models', '10 Practice Questions', 'Interactive Quiz'],
      misconceptionCode: 'FR1'
    },
    {
      priority: 'medium',
      topic: 'Place Value Understanding',
      reason: 'Digit position confusion identified',
      estimatedTime: '30 mins',
      activities: ['Place Value Charts', '5 Worked Examples', 'Practice Set'],
      misconceptionCode: 'PV1'
    },
    {
      priority: 'low',
      topic: 'Advanced Problem Solving',
      reason: 'Challenge extension',
      estimatedTime: '60 mins',
      activities: ['Strategy Guide', 'Complex Problems', 'Timed Challenge']
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recommended Learning Path</h3>
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const misconceptionDetail = rec.misconceptionCode ? 
            Object.values(misconceptionPaths).find(category => 
              Object.keys(category).includes(rec.misconceptionCode!)
            )?.[rec.misconceptionCode as any] : null;

          return (
            <div key={index} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`w-2 h-2 rounded-full ${getPriorityColor(rec.priority)}`} />
                  <div>
                    <h4 className="font-medium text-foreground">{rec.topic}</h4>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    {misconceptionDetail && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Addresses: {misconceptionDetail.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{rec.estimatedTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {rec.activities.map((activity, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                      {activity}
                    </span>
                  ))}
                </div>
                <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Start →
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">Practice Distribution</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="text-xs">
            <div className="text-base font-semibold text-foreground">20%</div>
            <div className="text-muted-foreground">Revision</div>
          </div>
          <div className="text-xs">
            <div className="text-base font-semibold text-foreground">50%</div>
            <div className="text-muted-foreground">Current Topic</div>
          </div>
          <div className="text-xs">
            <div className="text-base font-semibold text-foreground">20%</div>
            <div className="text-muted-foreground">Preview</div>
          </div>
          <div className="text-xs">
            <div className="text-base font-semibold text-foreground">10%</div>
            <div className="text-muted-foreground">Mixed Review</div>
          </div>
        </div>
      </div>
    </div>
  );
};