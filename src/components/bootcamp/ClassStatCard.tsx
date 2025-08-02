import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ClassStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

export const ClassStatCard: React.FC<ClassStatCardProps> = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600'
  };

  return (
    <div className="bg-muted rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
        <span className={`text-xs font-medium ${colorClasses[color]}`}>{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
};