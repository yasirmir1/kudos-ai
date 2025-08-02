import React, { useState } from 'react';
import { Navigation } from './Navigation';
import { Dashboard } from './Dashboard';
import { PracticeSession } from './PracticeSession';
import { ProgressView } from './ProgressView';
import { TopicsView } from './TopicsView';

interface User {
  name: string;
  level: string;
  streakDays: number;
  totalPoints: number;
  accuracy: number;
  questionsToday: number;
}

export const MathApp: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState<User>({
    name: 'Sarah',
    level: 'Intermediate',
    streakDays: 7,
    totalPoints: 1250,
    accuracy: 78,
    questionsToday: 15
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <Navigation currentView={currentView} setCurrentView={setCurrentView} user={user} />
      <main className="container mx-auto px-4 py-6">
        {currentView === 'dashboard' && <Dashboard user={user} setCurrentView={setCurrentView} />}
        {currentView === 'practice' && <PracticeSession />}
        {currentView === 'progress' && <ProgressView />}
        {currentView === 'topics' && <TopicsView setCurrentView={setCurrentView} />}
      </main>
    </div>
  );
};