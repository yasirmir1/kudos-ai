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
  return <div>
      <Navigation currentView={currentView} setCurrentView={setCurrentView} user={user} />
      <main className="container mx-auto px-4 py-6">
        {error && <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>}
        
        {currentView === 'dashboard' && <Dashboard user={user} setCurrentView={setCurrentView} />}
        {currentView === 'practice' && <EnhancedPracticeSession />}
        {currentView === 'mocktest' && <MockTest />}
        {currentView === 'learn' && <LearnView />}
        {currentView === 'progress' && <ProgressView />}
        {currentView === 'topics' && <TopicsView setCurrentView={setCurrentView} />}
        {currentView === 'achievements' && <AchievementCenter />}
        
        {currentView === 'settings' && (window.location.href = '/settings')}
        {currentView === 'report' && <PracticeReport />}
      </main>
    </div>;
};
export default Bootcamp;