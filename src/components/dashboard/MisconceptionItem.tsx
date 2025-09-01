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
      className="px-4 py-3 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all duration-200"
      onClick={onClick}
    >
      {/* Row 1: Topics and badges on same row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        {/* Topics on left - allow wrapping */}
        <div className="flex-1 min-w-0">
          {misconception.topics && misconception.topics.length > 0 && (
            <p className="text-xs text-muted-foreground break-words leading-relaxed">
              {misconception.topics.join(', ')}
            </p>
          )}
        </div>
        
        {/* Badges on right */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {getFrequencyBadge(misconception.frequency)}
          {misconception.fromCache && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 text-green-600 border-green-300">
              ⚡
            </Badge>
          )}
          <Badge variant="destructive" className="text-[10px] px-1 py-0">
            {Math.round((misconception.frequency / (misconception.frequency + 10)) * 100)}%
          </Badge>
          <Badge variant="secondary" className="text-[10px] px-1 py-0">
            {misconception.frequency}
          </Badge>
        </div>
      </div>
      
      {/* Row 2: Main content using full width */}
      <div className="w-full">
        <p className="text-[11px] font-medium text-foreground w-full leading-relaxed break-words">
          {kidFriendlyLabel}
        </p>
      </div>
    </div>
  );
};