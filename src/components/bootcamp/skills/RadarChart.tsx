import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { RadarDataPoint } from './types';

interface RadarChartProps {
  data: RadarDataPoint[];
}

export const SkillRadarChart: React.FC<RadarChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-md h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <PolarGrid />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ 
                fontSize: 11, 
                textAnchor: 'middle',
                fill: '#4B5563',
                fontWeight: 400
              }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={false}
              tickCount={3}
            />
            <Radar
              name="Current"
              dataKey="current"
              stroke="rgb(59, 130, 246)"
              fill="rgba(59, 130, 246, 0.2)"
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ fill: 'rgb(59, 130, 246)', strokeWidth: 2, stroke: '#fff', r: 3 }}
            />
            <Radar
              name="Target"
              dataKey="target"
              stroke="rgb(156, 163, 175)"
              fill="transparent"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center mt-4 space-x-6 text-sm text-gray-600">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          <span>Current</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 border-2 border-dashed border-gray-400 rounded-full mr-2"></span>
          <span>Target</span>
        </div>
      </div>
    </div>
  );
};