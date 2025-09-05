import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle } from 'lucide-react';
import { CircularProgress } from '@/components/ui/circular-progress';

interface MisconceptionItemProps {
  misconception: {
    red_herring: string;
    frequency: number;
    topics?: string[];
    fromCache?: boolean;
  };
  kidFriendlyLabel: string;
  onClick: () => void;
}

export const MisconceptionItem: React.FC<MisconceptionItemProps> = ({
  misconception,
  kidFriendlyLabel,
  onClick
}) => {
  const getFrequencyBadge = (frequency: number) => {
    if (frequency >= 5) {
      return (
        <div className="flex items-center gap-1">
          <Circle className="w-2 h-2 fill-red-500 text-red-500" />
          <Badge variant="destructive" className="text-[10px] px-1 py-0">Needs Focus</Badge>
        </div>
      );
    } else if (frequency >= 3) {
      return (
        <div className="flex items-center gap-1">
          <Circle className="w-2 h-2 fill-yellow-500 text-yellow-500" />
          <Badge variant="secondary" className="text-[10px] px-1 py-0">Working On It</Badge>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
          <Badge variant="outline" className="text-[10px] px-1 py-0">Getting Better</Badge>
        </div>
      );
    }
  };

  const errorRate = Math.round((misconception.frequency / (misconception.frequency + 10)) * 100);

  return (
    <div 
      className="px-4 py-4 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Misconception content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-relaxed mb-1">
            {kidFriendlyLabel}
          </p>
          <span className="text-sm text-primary">Click to practice</span>
          {misconception.topics && misconception.topics.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {misconception.topics.join(', ')}
            </p>
          )}
        </div>
        
        {/* Circular progress and frequency */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <CircularProgress
            value={errorRate}
            size={48}
            color="destructive"
          />
          <span className="text-lg font-medium text-muted-foreground">
            {misconception.frequency}
          </span>
        </div>
      </div>
    </div>
  );
};