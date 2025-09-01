import React from 'react';
import { TrendingUp } from 'lucide-react';
import { RadarDataPoint } from './types';

interface StrengthsListProps {
  strengths: RadarDataPoint[];
}

export const StrengthsList: React.FC<StrengthsListProps> = ({ strengths }) => {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-green-700 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        Top Strengths
      </h4>
      <div className="space-y-1">
        {strengths.map((skill, index) => (
          <div key={skill.skill} className="flex items-center">
            <span className="text-xs font-medium">{skill.skill}</span>
            <span className="text-xs font-bold text-green-600 ml-auto">{skill.current}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};