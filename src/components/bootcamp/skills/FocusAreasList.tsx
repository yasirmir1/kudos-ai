import React from 'react';
import { TrendingDown } from 'lucide-react';
import { RadarDataPoint } from './types';

interface FocusAreasListProps {
  weaknesses: RadarDataPoint[];
}

export const FocusAreasList: React.FC<FocusAreasListProps> = ({ weaknesses }) => {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-orange-700 flex items-center gap-1">
        <TrendingDown className="h-3 w-3" />
        Focus Areas
      </h4>
      <div className="space-y-1">
        {weaknesses.map((skill, index) => (
          <div key={skill.skill} className="flex items-center">
            <span className="text-xs font-medium">{skill.skill}</span>
            <span className="text-xs font-bold text-orange-600 ml-auto">{skill.current}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};