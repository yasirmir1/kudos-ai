import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  children?: ReactNode;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  onClick, 
  trend, 
  className,
  children 
}: StatsCardProps) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm",
        onClick && "cursor-pointer hover:shadow-vibrant hover:-translate-y-1",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="text-3xl font-bold font-display text-foreground">
            {value}
          </div>
          
          {trend && (
            <div className="flex items-center text-xs">
              <span 
                className={cn(
                  "font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-muted-foreground ml-1">
                {trend.label}
              </span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          
          {children}
        </div>
      </CardContent>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 pointer-events-none" />
    </Card>
  );
}