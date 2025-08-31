import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TopicItemProps {
  topic: string;
  accuracy: number;
  attempts: number;
  index: number;
  type: 'strength' | 'focus';
  onClick?: () => void;
  showClickHint?: boolean;
}

export const TopicItem: React.FC<TopicItemProps> = ({
  topic,
  accuracy,
  attempts,
  index,
  type,
  onClick,
  showClickHint = false
}) => {
  const accuracyPercent = Math.round(accuracy * 100);
  const isClickable = !!onClick;
  
  const getAccuracyColor = () => {
    if (type === 'strength') return 'text-green-600';
    if (accuracyPercent >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBadgeVariant = () => {
    if (type === 'strength') return 'default';
    return 'destructive';
  };

  return (
    <div 
      className={`p-3 rounded-lg border transition-all duration-200 ${
        isClickable 
          ? 'cursor-pointer hover:bg-muted/50 hover:border-primary/50' 
          : 'bg-muted/20'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center min-w-0 flex-1">
          <Badge variant="outline" className="mr-3 flex-shrink-0 text-xs">
            #{index + 1}
          </Badge>
          <p className="text-sm font-medium text-foreground truncate">
            {topic}
          </p>
        </div>
        <Badge variant={getBadgeVariant()} className="ml-2 flex-shrink-0">
          {accuracyPercent}%
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground pl-8">
        <span>{attempts} attempt{attempts !== 1 ? 's' : ''}</span>
        {showClickHint && (
          <span className="text-primary">Click to practice</span>
        )}
      </div>
    </div>
  );
};