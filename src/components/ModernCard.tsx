import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  variant?: "default" | "gradient" | "minimal";
}

export function ModernCard({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  className,
  headerAction,
  variant = "default"
}: ModernCardProps) {
  const getCardStyles = () => {
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-br from-card via-card to-primary/5 border-0 shadow-md";
      case "minimal":
        return "border-0 shadow-sm bg-card/50 backdrop-blur-sm";
      default:
        return "border-0 bg-card shadow-sm";
    }
  };

  return (
    <Card className={cn(getCardStyles(), className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-display font-semibold text-foreground">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {headerAction && (
            <div>{headerAction}</div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}