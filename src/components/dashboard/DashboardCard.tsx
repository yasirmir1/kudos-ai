import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  children,
  className = ""
}) => {
  return (
    <Card className={`h-[500px] flex flex-col ${className}`}>
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex items-center mb-3">
          <Icon className={`h-6 w-6 mr-4 ${iconColor}`} />
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-base text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden px-8">
        <div className="h-full overflow-y-auto space-y-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};