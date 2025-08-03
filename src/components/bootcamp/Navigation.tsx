import React, { useState } from 'react';
import { BarChart3, Brain, TrendingUp, Zap, Star, Plus, GraduationCap, Settings, Trophy, HelpCircle, Medal } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
}

interface User {
  name: string;
  level: string;
  streakDays: number;
  totalPoints: number;
  accuracy: number;
  questionsToday: number;
}

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: User;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  setCurrentView,
  user
}) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: BarChart3
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: GraduationCap
    },
    {
      id: 'practice',
      label: 'Practice',
      icon: Brain
    },
    {
      id: 'mocktest',
      label: 'Mock Test',
      icon: Star
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: TrendingUp
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Trophy
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: Settings
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle
    }
  ];
  return (
    <nav className="bg-card shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="hidden lg:flex space-x-1">
              {navItems.slice(0, 8).map(item => (
                <button 
                  key={item.id} 
                  onClick={() => {
                    if (item.href) {
                      window.location.href = item.href;
                    } else {
                      setCurrentView(item.id);
                    }
                  }}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === item.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            
            <div className="lg:hidden flex space-x-1">
              {navItems.slice(0, 4).map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setCurrentView(item.id)} 
                  className={`flex items-center space-x-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                    currentView === item.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{user.streakDays} day streak</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Star className="h-4 w-4 text-primary" />
              <span className="font-medium">{user.totalPoints}</span>
            </div>
            
            {/* Secondary nav items as dropdown or icons */}
            <div className="hidden lg:flex space-x-1">
              {navItems.slice(8).map(item => (
                <button 
                  key={item.id} 
                  onClick={() => {
                    if (item.href) {
                      window.location.href = item.href;
                    } else {
                      setCurrentView(item.id);
                    }
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    currentView === item.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  title={item.label}
                >
                  <item.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};