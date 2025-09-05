import React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'destructive';
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 56,
  strokeWidth = 4,
  className,
  showValue = true,
  color = 'primary'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const getColor = () => {
    switch (color) {
      case 'success':
        return 'stroke-green-500';
      case 'warning':
        return 'stroke-orange-500';
      case 'destructive':
        return 'stroke-red-500';
      default:
        return 'stroke-primary';
    }
  };

  const getTextColor = () => {
    switch (color) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-orange-600';
      case 'destructive':
        return 'text-red-600';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('transition-all duration-300 ease-in-out', getColor())}
        />
      </svg>
      {showValue && (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center text-sm font-semibold',
          getTextColor()
        )}>
          {Math.round(value)}
        </div>
      )}
    </div>
  );
};