import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Dashboard } from './Dashboard';
import { PracticeSession } from './PracticeSession';
import { ProgressView } from './ProgressView';
import { TopicsView } from './TopicsView';
import { useAuth } from '../../hooks/useAuth';
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
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser) {
      loadUserData();
    }
  }, [authUser]);

  const loadUserData = async () => {
    if (!authUser) return;
    
    setLoading(true);
    try {
      const [studentProfile, performanceSummary] = await Promise.all([
        BootcampAPI.getStudentProfile(authUser.id),
        BootcampAPI.getStudentPerformanceSummary(authUser.id)
      ]);

      if (studentProfile) {
        const userData: User = {
          name: studentProfile.username || studentProfile.email?.split('@')[0] || 'Student',
          level: performanceSummary?.overall_accuracy > 80 ? 'Advanced' : 
                 performanceSummary?.overall_accuracy > 60 ? 'Intermediate' : 'Foundation',
          streakDays: performanceSummary?.active_days || 0,
          totalPoints: Math.round((performanceSummary?.total_correct || 0) * 10),
          accuracy: Math.round(performanceSummary?.overall_accuracy || 0),
          questionsToday: 0 // This would need a daily query
        };
        setUser(userData);
      } else {
        // Create default profile if none exists
        await BootcampAPI.createStudentProfile(authUser.id, {
          email: authUser.email,
          username: authUser.email?.split('@')[0] || 'Student',
          school_year: 7
        });
        
        setUser({
          name: authUser.email?.split('@')[0] || 'Student',
          level: 'Foundation',
          streakDays: 0,
          totalPoints: 0,
          accuracy: 0,
          questionsToday: 0
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback user data
      setUser({
        name: authUser.email?.split('@')[0] || 'Student',
        level: 'Foundation',
        streakDays: 0,
        totalPoints: 0,
        accuracy: 0,
        questionsToday: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
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
        {currentView === 'progress' && <ProgressView />}
        {currentView === 'topics' && <TopicsView setCurrentView={setCurrentView} />}
      </main>
    </div>
  );
};