import React from 'react';
import { Play, BookOpen, BarChart3, Home, FileText, Zap, Star, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
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
  const {
    user
  } = useAuth();
  const location = useLocation();
  
  // Check if we're in bootcamp mode
  const isBootcampRoute = location.pathname.startsWith('/bootcamp');
  
  const allNavItems: NavItem[] = [{
    id: 'overview',
    label: 'Home',
    icon: Home
  }, {
    id: 'practice',
    label: 'Practice',
    icon: Play
  }, {
    id: 'curriculum',
    label: 'Curriculum',
    icon: BookOpen
  }, {
    id: 'report',
    label: 'Report',
    icon: FileText
  }];

  // Filter out curriculum tab in daily mode
  const navItems = allNavItems.filter(item => 
    item.id !== 'curriculum' || isBootcampRoute
  );

  // Mock user stats for dashboard - in real app these would come from props or context
  const userStats = {
    name: user?.email?.split('@')[0] || 'Student',
    level: 'Intermediate',
    streakDays: 7,
    totalPoints: 2450
  };
  return <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16">
          {/* Main Navigation */}
          <div className="hidden lg:flex space-x-1">
            {navItems.map(item => <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>)}
          </div>
          
          {/* Mobile Navigation */}
          <div className="lg:hidden flex space-x-1">
            {navItems.slice(0, 4).map(item => <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex items-center space-x-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${currentView === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>)}
          </div>
        </div>
      </div>
    </nav>;
};