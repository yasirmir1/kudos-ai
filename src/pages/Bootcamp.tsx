import { useState } from 'react';
import { AppNavigation } from '@/components/AppNavigation';
import { Dashboard } from '@/components/bootcamp/Dashboard';
import { PracticeSession } from '@/components/bootcamp/PracticeSession';
import { ProgressView } from '@/components/bootcamp/ProgressView';
import { TopicsView } from '@/components/bootcamp/TopicsView';
import { Navigation } from '@/components/bootcamp/Navigation';
import { BulkQuestionGenerator } from '@/components/BulkQuestionGenerator';

interface User {
  name: string;
  level: string;
  streakDays: number;
  totalPoints: number;
  accuracy: number;
  questionsToday: number;
}

const Bootcamp = () => {
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
      <AppNavigation />
      <Navigation currentView={currentView} setCurrentView={setCurrentView} user={user} />
      <main className="container mx-auto px-4 py-6">
        {currentView === 'dashboard' && <Dashboard user={user} setCurrentView={setCurrentView} />}
        {currentView === 'practice' && <PracticeSession />}
        {currentView === 'progress' && <ProgressView />}
        {currentView === 'topics' && <TopicsView setCurrentView={setCurrentView} />}
        {currentView === 'generate' && <BulkQuestionGenerator />}
      </main>
    </div>
  );
};

export default Bootcamp;