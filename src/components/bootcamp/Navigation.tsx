import React, { useState } from 'react';
import { Home, Lightbulb, Edit, FileText, TrendingUp, Flame, Star } from 'lucide-react';

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
      icon: Home
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: Lightbulb
    },
    {
      id: 'practice',
      label: 'Practice',
      icon: Edit
    },
    {
      id: 'mocktest',
      label: 'Mock Test',
      icon: FileText
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: TrendingUp
    },
  ];
  return (
    <main className="container mx-auto px-6 py-8">
      <nav className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex space-x-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.href) {
                  window.location.href = item.href;
                } else {
                  setCurrentView(item.id);
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-colors ${
                currentView === item.id
                  ? 'text-primary bg-primary/10 border border-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-orange-500" />
          <span>{user.streakDays} day streak</span>
          <span className="font-bold text-foreground">{user.totalPoints}</span>
        </div>
      </nav>
    </main>
  );
};