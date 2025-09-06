import React from 'react';
import { Play, BookOpen, BarChart3, Home, FileText, Zap, Star, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const handleExit = () => {
    navigate('/');
  };

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
    label: 'Analytics',
    icon: FileText
  }];

  // Filter out curriculum tab in daily practice
  const navItems = allNavItems.filter(item => item.id !== 'curriculum' || isBootcampRoute);

  // Mock user stats for dashboard - in real app these would come from props or context
  const userStats = {
    name: user?.email?.split('@')[0] || 'Student',
    level: 'Intermediate',
    streakDays: 7,
    totalPoints: 2450
  };
  return (
    <main className="container mx-auto px-6 py-4">
      <nav className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex space-x-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center transition-colors ${
                currentView === item.id
                  ? 'text-primary bg-primary/10 border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4 mr-1.5" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
};