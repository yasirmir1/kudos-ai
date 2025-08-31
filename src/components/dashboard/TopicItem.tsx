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

const getDisplayCount = (type: 'strength' | 'focus', accuracy: number, attempts: number) => {
  if (type === 'strength') {
    return Math.round(accuracy * attempts); // correct answers
  } else {
    return Math.round((1 - accuracy) * attempts); // mistakes
  }
};

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
  const displayCount = getDisplayCount(type, accuracy, attempts);
  const displayText = type === 'strength' ? 'correct' : 'mistake';
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
      className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
        isClickable 
          ? 'cursor-pointer hover:bg-muted/50 hover:border-primary/50' 
          : 'bg-muted/20'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground truncate">
            {topic}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={getBadgeVariant()}>
            {accuracyPercent}%
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {displayCount}{displayText.charAt(0)}
          </Badge>
        </div>
      </div>
      
      {showClickHint && (
        <div className="flex justify-end">
          <span className="text-xs text-primary">Click to practice</span>
        </div>
      )}
    </div>
  );
};