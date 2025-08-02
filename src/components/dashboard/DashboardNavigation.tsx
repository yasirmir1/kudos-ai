import React from 'react';
import { Play, BookOpen, BarChart3, Home, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface DashboardNavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  currentView,
  setCurrentView
}) => {
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home
    },
    {
      id: 'practice',
      label: 'Practice',
      icon: Play
    },
    {
      id: 'curriculum',
      label: 'Curriculum',
      icon: BookOpen
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3
    },
    {
      id: 'report',
      label: 'Report',
      icon: FileText
    }
  ];

  return (
    <div className="bg-card/50 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  isActive && "bg-primary text-primary-foreground shadow-sm"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};