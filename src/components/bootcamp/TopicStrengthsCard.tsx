import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface TopicStrengthsCardProps {
  strongTopics: string[];
  weakTopics: string[];
}

export const TopicStrengthsCard: React.FC<TopicStrengthsCardProps> = ({ 
  strongTopics, 
  weakTopics 
}) => {
  return (
    <div className="bg-muted/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Topic Performance</h3>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
          <CheckCircle className="h-4 w-4 text-success mr-2" />
          Strong Areas
        </h4>
        <div className="space-y-2">
          {strongTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-success/10 rounded">
              <span className="text-sm text-foreground">{topic}</span>
              <span className="text-sm font-medium text-success">85%+</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
          <AlertCircle className="h-4 w-4 text-warning mr-2" />
          Needs Practice
        </h4>
        <div className="space-y-2">
          {weakTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-warning/10 rounded">
              <span className="text-sm text-foreground">{topic}</span>
              <button className="text-xs font-medium text-warning hover:text-warning/80 transition-colors">
                Practice →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};