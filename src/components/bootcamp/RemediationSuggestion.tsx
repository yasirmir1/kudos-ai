import React from 'react';
import { Info, FileText, Brain } from 'lucide-react';

interface RemediationSuggestionProps {
  misconception?: {
    code?: string;
    name?: string;
    description?: string;
    remediationVideo?: string;
    practiceSet?: string;
  };
  topic: string;
}

export const RemediationSuggestion: React.FC<RemediationSuggestionProps> = ({ 
  misconception, 
  topic 
}) => {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-primary mb-2">Let's work on this together!</h4>
          <p className="text-sm text-primary/80 mb-3">
            Based on your answer, we recommend reviewing:
          </p>
          <div className="space-y-2">
            <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              <FileText className="h-4 w-4" />
              <span>Watch: {misconception?.remediationVideo || `Understanding ${topic}`}</span>
            </button>
            <button className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              <Brain className="h-4 w-4" />
              <span>Practice: {misconception?.practiceSet || `${topic} Fundamentals`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};