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
          <Circle className="w-3 h-3 fill-red-500 text-red-500" />
          <Badge variant="destructive" className="text-xs">High</Badge>
        </div>
      );
    } else if (frequency >= 3) {
      return (
        <div className="flex items-center gap-1">
          <Circle className="w-3 h-3 fill-yellow-500 text-yellow-500" />
          <Badge variant="secondary" className="text-xs">Medium</Badge>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <Circle className="w-3 h-3 fill-green-500 text-green-500" />
          <Badge variant="outline" className="text-xs">Low</Badge>
        </div>
      );
    }
  };

  return (
    <div 
      className="p-3 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {getFrequencyBadge(misconception.frequency)}
          {misconception.fromCache && (
            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
              ⚡ Cached
            </Badge>
          )}
        </div>
        <Badge variant="secondary" className="text-xs flex-shrink-0">
          {misconception.frequency}x
        </Badge>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground line-clamp-2">
          {kidFriendlyLabel}
        </p>
        
        {misconception.topics && misconception.topics.length > 0 && (
          <p className="text-xs text-muted-foreground truncate">
            {misconception.topics.join(', ')}
          </p>
        )}
        
        <p className="text-xs text-muted-foreground">
          Let's see what happened and learn together! 🌟
        </p>
      </div>
    </div>
  );
};