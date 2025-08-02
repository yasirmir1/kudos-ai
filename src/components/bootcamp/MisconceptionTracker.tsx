import React from 'react';
import { misconceptionPaths, getMisconceptionsByCode } from '@/lib/bootcamp-data';

interface Misconception {
  code: string;
  name: string;
  occurrences: number;
  status: 'active' | 'improving' | 'resolved';
}

interface MisconceptionTrackerProps {
  misconceptions: Misconception[];
}

export const MisconceptionTracker: React.FC<MisconceptionTrackerProps> = ({ 
  misconceptions 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-destructive';
      case 'improving': return 'bg-warning';
      case 'resolved': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-destructive/10 text-destructive';
      case 'improving': return 'bg-warning/10 text-warning';
      case 'resolved': return 'bg-success/10 text-success';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <div className="bg-muted/50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Misconception Tracking</h3>
      <div className="space-y-3">
        {misconceptions.map((misc, index) => {
          const misconceptionDetail = getMisconceptionsByCode(misc.code);
          return (
            <div key={index} className="bg-card rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(misc.status)}`} />
                  <span className="text-sm font-medium text-foreground">{misc.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{misc.occurrences} times</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBg(misc.status)}`}>
                  {misc.status}
                </span>
                <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                  Review Tutorial
                </button>
              </div>
              {misconceptionDetail && (
                <p className="text-xs text-muted-foreground mt-2">
                  {misconceptionDetail.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};