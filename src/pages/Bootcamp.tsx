import { useState } from 'react';
import { AppNavigation } from '@/components/AppNavigation';
import { Dashboard } from '@/components/bootcamp/Dashboard';
import { PracticeSession } from '@/components/bootcamp/PracticeSession';
import { ProgressView } from '@/components/bootcamp/ProgressView';
import { TopicsView } from '@/components/bootcamp/TopicsView';
import { LearnView } from '@/components/bootcamp/LearnView';
import { Navigation } from '@/components/bootcamp/Navigation';
import { BulkQuestionGenerator } from '@/components/BulkQuestionGenerator';
import { useBootcampData } from '@/hooks/useBootcampData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

const Bootcamp = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { student, stats, isLoading, error, generateSampleQuestions } = useBootcampData();
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
        <AppNavigation />
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading your bootcamp data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <AppNavigation />
      <Navigation currentView={currentView} setCurrentView={setCurrentView} user={user} />
      <main className="container mx-auto px-4 py-6">
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {stats.totalQuestions === 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>No questions found in database. Generate some sample questions to get started.</span>
              <Button 
                onClick={handleGenerateSampleQuestions}
                disabled={isGeneratingSamples}
                size="sm"
              >
                {isGeneratingSamples ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Sample Questions'
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {currentView === 'dashboard' && <Dashboard user={user} setCurrentView={setCurrentView} />}
        {currentView === 'practice' && <PracticeSession />}
        {currentView === 'learn' && <LearnView />}
        {currentView === 'progress' && <ProgressView />}
        {currentView === 'topics' && <TopicsView setCurrentView={setCurrentView} />}
        {currentView === 'generate' && <BulkQuestionGenerator />}
      </main>
    </div>
  );
};

export default Bootcamp;