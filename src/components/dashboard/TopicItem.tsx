import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '@/components/ui/circular-progress';

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
  
  const getProgressColor = () => {
    if (type === 'strength') return 'success';
    if (accuracyPercent >= 50) return 'warning';
    return 'destructive';
  };

  return (
    <div 
      className={`px-4 py-4 rounded-lg border transition-all duration-200 ${
        isClickable 
          ? 'cursor-pointer hover:bg-muted/50 hover:border-primary/50' 
          : 'bg-muted/20'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-6">
        {/* Topic name and click hint */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-foreground leading-relaxed mb-1">
            {topic}
          </p>
          {showClickHint && (
            <span className="text-sm text-primary">Click to practice</span>
          )}
        </div>
        
        {/* Circular progress and count with increased spacing */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <CircularProgress
            value={accuracyPercent}
            size={48}
            color={getProgressColor()}
          />
          <span className="text-xl font-medium text-foreground">
            {displayCount}
          </span>
        </div>
      </div>
    </div>
  );
};