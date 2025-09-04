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
      className={`px-4 py-3 rounded-lg border transition-all duration-200 ${
        isClickable 
          ? 'cursor-pointer hover:bg-muted/50 hover:border-primary/50' 
          : 'bg-muted/20'
      }`}
      onClick={onClick}
    >
      {/* Layout: Text on left, badges on middle right */}
      <div className="flex items-center justify-between gap-3 min-h-[40px]">
        {/* Column 1: Content - takes available space */}
        <div className="flex-1 min-w-0 flex items-center">
          <p className="text-xs font-medium text-foreground leading-relaxed flex-1 min-w-0">
            {topic}
          </p>
          {showClickHint && (
            <span className="text-xs text-primary flex-shrink-0 whitespace-nowrap ml-3">Click to practice</span>
          )}
        </div>
        
        {/* Column 2: Badges - middle right position */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <Badge variant={getBadgeVariant()} className="text-sm px-2 py-1 font-semibold">
            {accuracyPercent}%
          </Badge>
          <Badge variant="secondary" className="text-sm px-2 py-1 font-semibold">
            {displayCount}
          </Badge>
        </div>
      </div>
    </div>
  );
};