import { useState } from 'react';
import { BulkQuestionGenerator } from '@/components/BulkQuestionGenerator';
import {
  Dashboard,
  EnhancedPracticeSession,
  ProgressView,
  TopicsView,
  LearnView,
  StudentAnalytics,
  QuestionManager,
  AnalyticsDashboard,
  Navigation,
  AchievementCenter,
  
  HelpCenter,
  PracticeReport,
  MockTest,
  BulkCurriculumGenerator
} from '@/components/bootcamp';
import { useBootcampData } from '@/hooks/useBootcampData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
const Bootcamp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const {
    student,
    stats,
    isLoading,
    error,
    generateSampleQuestions
  } = useBootcampData();
  const [isGeneratingSamples, setIsGeneratingSamples] = useState(false);

  // Transform bootcamp data to match the expected User interface
  const user = {
    name: student?.username || 'Student',
    level: stats.level,
    streakDays: stats.streakDays,
    totalPoints: stats.totalPoints,
    accuracy: stats.accuracy,
    questionsToday: stats.questionsToday
  };
  const handleGenerateSampleQuestions = async () => {
    setIsGeneratingSamples(true);
    const result = await generateSampleQuestions();
    setIsGeneratingSamples(false);
    if (result.success) {
      alert(result.message);
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleStartLearning = (week: number) => {
    setSelectedWeek(week);
    setCurrentView('learn');
  };
  if (isLoading) {
    return <div>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your bootcamp data...</span>
          </div>
        </div>
      </div>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation currentView={currentView} setCurrentView={setCurrentView} user={user} />
      <main className="container mx-auto px-4 py-6">
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-6">
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-6xl mx-auto">
          {currentView === 'dashboard' && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-8">
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="pb-4">
                      <h1 className="text-2xl font-bold text-white">Welcome back, {user.name}!</h1>
                      <p className="text-indigo-100 text-sm">Continue your learning journey</p>
                    </div>
                  </div>
                  
                  {/* Quick Stats Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Level {user.level}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      </svg>
                      {user.streakDays} day streak
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      {user.accuracy}% accuracy
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <Dashboard user={user} setCurrentView={setCurrentView} onStartLearning={handleStartLearning} />
              </div>
            </div>
          )}
          
          {currentView === 'practice' && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <EnhancedPracticeSession />
            </div>
          )}
          
          {currentView === 'mocktest' && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <MockTest />
            </div>
          )}
          
          {currentView === 'learn' && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <LearnView selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
            </div>
          )}
          
          {currentView === 'progress' && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <ProgressView />
            </div>
          )}
          
          {currentView === 'topics' && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <TopicsView setCurrentView={setCurrentView} />
            </div>
          )}
          
          {currentView === 'achievements' && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <AchievementCenter />
            </div>
          )}
          
          {currentView === 'report' && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <PracticeReport />
            </div>
          )}
          
          {currentView === 'settings' && (window.location.href = '/settings')}
        </div>
      </main>
    </div>
  );
};
export default Bootcamp;