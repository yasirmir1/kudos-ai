import React from 'react';
import { TrendingUp } from 'lucide-react';
import { RadarDataPoint } from './types';

interface StrengthsListProps {
  strengths: RadarDataPoint[];
}

export const StrengthsList: React.FC<StrengthsListProps> = ({ strengths }) => {
  return (
    <div>
      <div className="flex items-center mb-4">
        <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-700">Top Strengths</h2>
      </div>
      <div className="space-y-2">
        {strengths.map((skill, index) => (
          <div key={skill.skill} className="flex items-baseline">
            <p className="text-gray-600 flex-grow">{skill.skill}</p>
            <p className="font-semibold text-green-500 ml-2">{skill.current}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};