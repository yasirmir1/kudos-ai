import React from 'react';

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  topic: string;
  reason: string;
  estimatedTime: string;
  activities: string[];
}

export const LearningPathRecommendations: React.FC = () => {
  const recommendations: Recommendation[] = [
    {
      priority: 'high',
      topic: 'Fraction Operations',
      reason: 'Frequent denominator addition errors detected',
      estimatedTime: '45 mins',
      activities: ['Video Tutorial', '10 Practice Questions', 'Interactive Quiz']
    },
    {
      priority: 'medium',
      topic: 'Algebraic Expressions',
      reason: 'Building on arithmetic foundation',
      estimatedTime: '30 mins',
      activities: ['Concept Introduction', '5 Worked Examples', 'Practice Set']
    },
    {
      priority: 'low',
      topic: 'Advanced Problem Solving',
      reason: 'Challenge extension',
      estimatedTime: '60 mins',
      activities: ['Strategy Guide', 'Complex Problems', 'Timed Challenge']
    }
  ];

  return (
    <div className="bg-card rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recommended Learning Path</h3>
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className={`w-2 h-2 rounded-full ${
                  rec.priority === 'high' ? 'bg-destructive' :
                  rec.priority === 'medium' ? 'bg-warning' :
                  'bg-success'
                }`} />
                <div>
                  <h4 className="font-medium text-foreground">{rec.topic}</h4>
                  <p className="text-sm text-muted-foreground">{rec.reason}</p>
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
        ))}
      </div>
    </div>
  );
};