import React, { useState, useEffect } from 'react';
import { CurrentPracticeCard } from './CurrentPracticeCard';
import { PracticePerformanceCard } from './PracticePerformanceCard';
import { useAuth } from '../../hooks/useAuth';
import { BootcampAPI } from '../../lib/bootcamp-api';
import { supabase } from '@/integrations/supabase/client';

interface PracticeHomepageProps {
  onStartPractice: () => void;
  onReviewMistakes?: () => void;
}

export const PracticeHomepage: React.FC<PracticeHomepageProps> = ({
  onStartPractice,
  onReviewMistakes
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [practiceData, setPracticeData] = useState({
    hasCurrentSession: false,
    currentTopic: '',
    progress: 0,
    timeElapsed: '',
    questionsCompleted: 0,
    totalQuestions: 20,
    sessionsCompleted: 0,
    averageAccuracy: 0,
    bestSession: 0,
    totalQuestionsAnswered: 0,
    recentSessions: []
  });

  useEffect(() => {
    if (user) {
      loadPracticeData();
    }
  }, [user]);

  const loadPracticeData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const studentProfile = await BootcampAPI.getStudentProfile(user.id);
      if (studentProfile) {
        // Get practice session data
        const [sessionResponse, responseStats] = await Promise.all([
          // Check for active sessions
          supabase
            .from('bootcamp_learning_sessions')
            .select('*')
            .eq('student_id', studentProfile.student_id)
            .eq('session_type', 'practice')
            .order('created_at', { ascending: false })
            .limit(1),
          
          // Get overall practice statistics
          supabase
            .from('bootcamp_student_responses')
            .select(`
              is_correct,
              session_id,
              created_at
            `)
            .eq('student_id', studentProfile.student_id)
        ]);

        // Calculate statistics
        const responses = responseStats.data || [];
        const practiceResponses = responses.filter(r => r.session_id); // Filter for valid sessions
        const sessionsCount = new Set(practiceResponses.map(r => r.session_id)).size;
        const correctAnswers = practiceResponses.filter(r => r.is_correct).length;
        const averageAccuracy = practiceResponses.length > 0 ? Math.round((correctAnswers / practiceResponses.length) * 100) : 0;
        
        // Calculate best session accuracy
        const sessionStats = new Map();
        practiceResponses.forEach(r => {
          if (!sessionStats.has(r.session_id)) {
            sessionStats.set(r.session_id, { correct: 0, total: 0 });
          }
          const stats = sessionStats.get(r.session_id);
          stats.total++;
          if (r.is_correct) stats.correct++;
        });

        const bestSessionAccuracy = Array.from(sessionStats.values())
          .map(s => Math.round((s.correct / s.total) * 100))
          .reduce((max, acc) => Math.max(max, acc), 0);

        // Check for current active session
        const hasCurrentSession = sessionResponse.data && sessionResponse.data.length > 0;
        let currentTopic = '';
        let progress = 0;
        let timeElapsed = '';
        let questionsCompleted = 0;
        let totalQuestions = 20;
        
        if (hasCurrentSession) {
          const currentSession = sessionResponse.data[0];
          // Get questions for current session
          const currentResponses = practiceResponses.filter(r => r.session_id === currentSession.session_id);
          progress = currentResponses.length > 0 ? (currentResponses.length / 20) * 100 : 0;
          
          currentTopic = 'Mixed Topics';
          timeElapsed = calculateTimeElapsed(currentSession.created_at);
          questionsCompleted = currentResponses.length;
          totalQuestions = 20;
        }

        setPracticeData({
          hasCurrentSession,
          currentTopic,
          progress,
          timeElapsed,
          questionsCompleted,
          totalQuestions,
          sessionsCompleted: sessionsCount,
          averageAccuracy,
          bestSession: bestSessionAccuracy,
          totalQuestionsAnswered: practiceResponses.length,
          recentSessions: []
        });
      }
    } catch (error) {
      console.error('Error loading practice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeElapsed = (startTime: string): string => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-muted rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-card border border-muted rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Practice Center</h1>
        <p className="text-muted-foreground">
          Continue your learning journey with adaptive practice sessions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentPracticeCard
          hasCurrentSession={practiceData.hasCurrentSession}
          currentTopic={practiceData.currentTopic}
          progress={practiceData.progress}
          timeElapsed={practiceData.timeElapsed}
          questionsCompleted={practiceData.questionsCompleted}
          totalQuestions={practiceData.totalQuestions}
          onContinueSession={onStartPractice}
          onStartNewSession={onStartPractice}
        />
        
        <PracticePerformanceCard
          sessionsCompleted={practiceData.sessionsCompleted}
          averageAccuracy={practiceData.averageAccuracy}
          bestSession={practiceData.bestSession}
          totalQuestions={practiceData.totalQuestionsAnswered}
          recentSessions={practiceData.recentSessions}
          onStartPractice={onStartPractice}
          onReviewMistakes={onReviewMistakes}
        />
      </div>
    </div>
  );
};