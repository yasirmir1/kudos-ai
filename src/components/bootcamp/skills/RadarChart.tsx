import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { RadarDataPoint } from './types';

interface RadarChartProps {
  data: RadarDataPoint[];
}

export const SkillRadarChart: React.FC<RadarChartProps> = ({ data }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="skill" 
            tick={{ 
              fontSize: 8, 
              textAnchor: 'middle',
              fill: 'hsl(var(--foreground))',
              fontWeight: 500
            }}
            tickFormatter={(value) => value.length > 8 ? `${value.substring(0, 8)}...` : value}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fontSize: 6, fill: 'hsl(var(--muted-foreground))' }}
            tickCount={3}
          />
          <Radar
            name="Current"
            dataKey="current"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Target"
            dataKey="target"
            stroke="hsl(var(--muted-foreground))"
            fill="transparent"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <Legend 
            wrapperStyle={{ fontSize: '8px', paddingTop: '4px' }}
            iconType="line"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};