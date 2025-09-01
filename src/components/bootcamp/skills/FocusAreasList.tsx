import React from 'react';
import { Target } from 'lucide-react';
import { RadarDataPoint } from './types';

interface FocusAreasListProps {
  weaknesses: RadarDataPoint[];
}

export const FocusAreasList: React.FC<FocusAreasListProps> = ({ weaknesses }) => {
  return (
    <div>
      <div className="flex items-center mb-4">
        <Target className="h-5 w-5 text-red-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-700">Focus Areas</h2>
      </div>
      <div className="space-y-2">
        {weaknesses.map((skill, index) => (
          <div key={skill.skill} className="flex items-baseline">
            <p className="text-gray-600 flex-grow">{skill.skill}</p>
            <p className="font-semibold text-red-500 ml-2">{skill.current}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};