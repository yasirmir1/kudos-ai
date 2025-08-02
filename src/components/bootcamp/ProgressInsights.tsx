import React from 'react';
import { TrendingUp, AlertCircle, Award, LucideIcon } from 'lucide-react';

interface Insight {
  type: 'positive' | 'attention';
  title: string;
  description: string;
  icon: LucideIcon;
}

export const ProgressInsights: React.FC = () => {
  const insights: Insight[] = [
    {
      type: 'positive',
      title: 'Strong improvement in mental arithmetic',
      description: 'Calculation speed increased by 20% this week',
      icon: TrendingUp
    },
    {
      type: 'attention',
      title: 'Fractions need more practice',
      description: 'Common error: adding denominators directly',
      icon: AlertCircle
    },
    {
      type: 'positive',
      title: 'Consistent daily practice',
      description: 'Logged in 6 out of 7 days',
      icon: Award
    }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-4">Key Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className={`flex items-start space-x-3 p-4 rounded-lg ${
            insight.type === 'positive' ? 'bg-success/10' : 'bg-warning/10'
          }`}>
            <insight.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
              insight.type === 'positive' ? 'text-success' : 'text-warning'
            }`} />
            <div>
              <p className={`font-medium ${
                insight.type === 'positive' ? 'text-success' : 'text-warning'
              }`}>
                {insight.title}
              </p>
              <p className={`text-sm mt-1 ${
                insight.type === 'positive' ? 'text-success/80' : 'text-warning/80'
              }`}>
                {insight.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};