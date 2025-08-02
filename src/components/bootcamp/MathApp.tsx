import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Dashboard } from './Dashboard';
import { PracticeSession } from './PracticeSession';
import { ProgressView } from './ProgressView';
import { TopicsView } from './TopicsView';
import { MockTest } from './MockTest';
import { useAuth } from '../../hooks/useAuth';
import { useBootcampData } from '../../hooks/useBootcampData';
import { BootcampAPI } from '../../lib/bootcamp-api';
import { Loader2 } from 'lucide-react';

interface User {
  name: string;
  level: string;
  streakDays: number;
  totalPoints: number;
  accuracy: number;
  questionsToday: number;
}

export const MathApp: React.FC = () => {
  const { user: authUser } = useAuth();
  const { student, stats, isLoading } = useBootcampData();
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (student && authUser) {
      const userData: User = {
        name: student.username || student.email?.split('@')[0] || 'Student',
        level: stats.accuracy > 80 ? 'Advanced' : 
               stats.accuracy > 60 ? 'Intermediate' : 'Foundation',
        streakDays: stats.streakDays || 0,
        totalPoints: stats.totalPoints || 0,
        accuracy: stats.accuracy || 0,
        questionsToday: stats.questionsToday || 0
      };
      setUser(userData);
    } else if (authUser && !isLoading && !student) {
      // Fallback user data
      setUser({
        name: authUser.email?.split('@')[0] || 'Student',
        level: 'Foundation',
        streakDays: 0,
        totalPoints: 0,
        accuracy: 0,
        questionsToday: 0
      });
    }
  }, [student, stats, authUser, isLoading]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <Navigation currentView={currentView} setCurrentView={setCurrentView} user={user} />
      <main className="container mx-auto px-4 py-6">
        {currentView === 'dashboard' && <Dashboard user={user} setCurrentView={setCurrentView} />}
        {currentView === 'practice' && <PracticeSession />}
        {currentView === 'mocktest' && <MockTest />}
        {currentView === 'progress' && <ProgressView />}
        {currentView === 'topics' && <TopicsView setCurrentView={setCurrentView} />}
      </main>
    </div>
  );
};