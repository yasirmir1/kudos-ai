import React, { useState } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';

interface Module {
  name: string;
  progress: number;
  topics: string[];
  color: 'primary' | 'success' | 'secondary' | 'warning';
}

interface ModuleCardProps {
  module: Module;
  setCurrentView: (view: string) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, setCurrentView }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary': return 'from-primary to-primary/80';
      case 'success': return 'from-success to-success/80';
      case 'secondary': return 'from-secondary to-secondary/80';
      case 'warning': return 'from-warning to-warning/80';
      default: return 'from-primary to-primary/80';
    }
  };

  const getButtonClasses = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-primary/10 text-primary hover:bg-primary/20';
      case 'success': return 'bg-success/10 text-success hover:bg-success/20';
      case 'secondary': return 'bg-secondary/20 text-secondary-foreground hover:bg-secondary/30';
      case 'warning': return 'bg-warning/10 text-warning hover:bg-warning/20';
      default: return 'bg-primary/10 text-primary hover:bg-primary/20';
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-2 bg-gradient-to-r ${getColorClasses(module.color)}`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{module.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{module.topics.length} topics</p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronRight className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">{module.progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${getColorClasses(module.color)} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${module.progress}%` }}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-2 mb-4">
            {module.topics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                <span className="text-sm text-foreground">{topic}</span>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setCurrentView('practice')}
          className={`w-full font-medium py-2 rounded-lg transition-colors ${getButtonClasses(module.color)}`}
        >
          Practice Module
        </button>
      </div>
    </div>
  );
};