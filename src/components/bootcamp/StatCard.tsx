import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: number;
  subtext?: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  subtext, 
  color 
}) => {
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive'
  };

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
        {trend && (
          <span className={`flex items-center text-xs font-medium ${
            trend > 0 ? 'text-success' : 'text-destructive'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3 ml-1" />
            ) : (
              <TrendingDown className="h-3 w-3 ml-1" />
            )}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {subtext && <p className="text-xs text-muted-foreground/80 mt-1">{subtext}</p>}
    </div>
  );
};