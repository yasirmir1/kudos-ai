import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle } from 'lucide-react';

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
          <Badge variant="destructive" className="text-[10px] px-1 py-0">High</Badge>
        </div>
      );
    } else if (frequency >= 3) {
      return (
        <div className="flex items-center gap-1">
          <Circle className="w-2 h-2 fill-yellow-500 text-yellow-500" />
          <Badge variant="secondary" className="text-[10px] px-1 py-0">Medium</Badge>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
          <Badge variant="outline" className="text-[10px] px-1 py-0">Low</Badge>
        </div>
      );
    }
  };

  return (
    <div 
      className="px-4 py-2 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all duration-200"
      onClick={onClick}
    >
      {/* Top row: topics with frequency badge, count on right */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {misconception.topics && misconception.topics.length > 0 && (
            <p className="text-sm text-muted-foreground truncate">
              {misconception.topics.join(', ')}
            </p>
          )}
          {getFrequencyBadge(misconception.frequency)}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {misconception.fromCache && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
              ⚡ Cached
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {misconception.frequency}
          </Badge>
        </div>
      </div>
      
      {/* Misconception text */}
      <div>
        <p className="text-[10px] font-medium text-foreground line-clamp-2">
          {kidFriendlyLabel}
        </p>
      </div>
    </div>
  );
};