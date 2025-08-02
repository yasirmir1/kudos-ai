import React, { useState } from 'react';
import { Calculator, BarChart3, Brain, BookOpen, TrendingUp, Zap, Star, Plus, GraduationCap, Users, Settings } from 'lucide-react';
interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
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
  const navItems: NavItem[] = [{
    id: 'dashboard',
    label: 'Home',
    icon: BarChart3
  }, {
    id: 'practice',
    label: 'Practice',
    icon: Brain
  }, {
    id: 'learn',
    label: 'Learn',
    icon: GraduationCap
  }, {
    id: 'topics',
    label: 'Topics',
    icon: BookOpen
  }, {
    id: 'progress',
    label: 'Progress',
    icon: TrendingUp
  }, {
    id: 'analytics',
    label: 'Analytics',
    icon: Users
  }, {
    id: 'questions',
    label: 'Questions',
    icon: Settings
  }, {
    id: 'generate',
    label: 'Generate',
    icon: Plus
  }];
  return <nav className="bg-card shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            
            <div className="hidden md:flex space-x-4">
              {navItems.map(item => <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  <item.icon className="h-4 w-4" />
                  
                </button>)}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Zap className="h-4 w-4 text-warning" />
              <span className="font-medium">{user.streakDays} day streak</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Star className="h-4 w-4 text-primary" />
              <span className="font-medium">{user.totalPoints}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>;
};