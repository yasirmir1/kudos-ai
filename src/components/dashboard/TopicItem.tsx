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
      className={`px-4 py-2 rounded-lg border transition-all duration-200 relative ${
        isClickable 
          ? 'cursor-pointer hover:bg-muted/50 hover:border-primary/50' 
          : 'bg-muted/20'
      }`}
      onClick={onClick}
    >
      {/* Badges in top right */}
      <div className="absolute top-2 right-2 flex items-center gap-1 flex-shrink-0">
        <Badge variant={getBadgeVariant()} className="text-[10px] px-1 py-0">
          {accuracyPercent}%
        </Badge>
        <Badge variant="secondary" className="text-[10px] px-1 py-0">
          {displayCount}
        </Badge>
      </div>
      
      {/* Content with minimal right padding */}
      <div className="pr-2">
        <p className="text-xs font-medium text-foreground break-words" style={{ marginBottom: showClickHint ? '4px' : '0' }}>
          {topic}
        </p>
        {showClickHint && (
          <span className="text-xs text-primary">Click to practice</span>
        )}
      </div>
    </div>
  );
};