import { useState } from 'react';
import { BulkQuestionGenerator } from '@/components/BulkQuestionGenerator';
import { Dashboard, EnhancedPracticeSession, ProgressView, TopicsView, LearnView, StudentAnalytics, QuestionManager, AnalyticsDashboard, Navigation, AchievementCenter, HelpCenter, PracticeReport, MockTest, BulkCurriculumGenerator, PracticeView } from '@/components/bootcamp';
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
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navigation currentView={currentView} setCurrentView={setCurrentView} user={user} />
      <main className="container mx-auto px-4 py-6">
        {error && <div className="max-w-2xl mx-auto mb-6">
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
          </div>}
        
        <div className="max-w-6xl mx-auto">
          {currentView === 'dashboard' && <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div style={{
            backgroundColor: '#5947e8'
          }} className="relative px-8 py-8 rounded-t-3xl  !bg-[#f2f3fa]">
                
                <div className="relative z-10 flex items-center justify-between h-full">
                  {/* Left side - Welcome message and icon */}
                  <div className="flex items-center gap-6">
                    <div className="w-10 h-10 backdrop-blur flex items-center justify-center rounded-sm bg-slate-200">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-zinc-700 bg-transparent">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex items-center">
                      <h1 className="font-bold text-2xl text-zinc-700">Welcome back, {user.name}!</h1>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <Dashboard user={user} setCurrentView={setCurrentView} onStartLearning={handleStartLearning} />
              </div>
            </div>}
          
          {currentView === 'practice' && <div>
              <PracticeView />
            </div>}
          
          {currentView === 'mocktest' && <div>
              <MockTest />
            </div>}
          
          {currentView === 'learn' && <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <LearnView selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
            </div>}
          
          {currentView === 'progress' && <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <ProgressView />
            </div>}
          
          {currentView === 'topics' && <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <TopicsView setCurrentView={setCurrentView} />
            </div>}
          
          {currentView === 'achievements' && <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <AchievementCenter />
            </div>}
          
          {currentView === 'report' && <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <PracticeReport />
            </div>}
          
          {currentView === 'settings' && (window.location.href = '/settings')}
        </div>
      </main>
    </div>;
};
export default Bootcamp;