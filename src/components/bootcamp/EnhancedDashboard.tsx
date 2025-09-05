import React, { useState } from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { Dashboard } from './Dashboard';
import { useAuth } from '../../hooks/useAuth';

interface User {
  name: string;
  level: string;
  streakDays: number;
  totalPoints: number;
  accuracy: number;
  questionsToday: number;
  weeklyGoal?: number;
}

export const EnhancedDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentMode, setCurrentMode] = useState<'daily' | 'bootcamp'>('bootcamp');

  // Mock user data - replace with real data
  const mockUser: User = {
    name: user?.email?.split('@')[0] || 'Student',
    level: 'Beginner',
    streakDays: 0,
    totalPoints: 290,
    accuracy: 25,
    questionsToday: 0,
    weeklyGoal: 85
  };

  const handleStartLearning = (week: number) => {
    setCurrentView('learn');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        onSignOut={handleSignOut}
      />
      
      <Navigation 
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={mockUser}
      />
      
      <div className="mt-6">
        <Dashboard 
          user={mockUser}
          setCurrentView={setCurrentView}
          onStartLearning={handleStartLearning}
        />
      </div>
    </div>
  );
};