import React, { useState, useEffect } from 'react';
import { CurrentPracticeCard } from './CurrentPracticeCard';
import { PracticeOverviewCard } from './PracticeOverviewCard';
import { useAuth } from '../../hooks/useAuth';
import { BootcampAPI } from '../../lib/bootcamp-api';
import { supabase } from '@/integrations/supabase/client';

interface PracticeHomepageProps {
  onStartPractice: () => void;
}

export const PracticeHomepage: React.FC<PracticeHomepageProps> = ({
  onStartPractice
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [practiceData, setPracticeData] = useState({
    hasCurrentSession: false,
    currentTopic: '',
    progress: 0,
    timeElapsed: '',
    questionsCompleted: 0,
    totalQuestions: 20
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
          totalQuestions
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
    <>
      {/* Header Section */}
      <div className="relative px-12 py-10 rounded-3xl shadow-2xl mx-auto max-w-4xl mb-6" style={{ 
        background: 'linear-gradient(to right, #6366f1, #9333ea)',
        minHeight: '200px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Practice Session</h1>
              <p className="text-indigo-100 text-sm">Adaptive practice to strengthen your understanding</p>
            </div>
          </div>
          
          {/* Quick Stats Badges */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              30 min
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              20 questions
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Adaptive difficulty
            </span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-12 rounded-3xl shadow-2xl mx-auto max-w-4xl" style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Key Information Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-blue-50 rounded-2xl">
            <div className="text-3xl font-bold text-blue-600 mb-1">20</div>
            <div className="text-xs text-gray-600 font-medium">Questions</div>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-2xl">
            <div className="text-3xl font-bold text-purple-600 mb-1">30</div>
            <div className="text-xs text-gray-600 font-medium">Minutes</div>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-2xl">
            <div className="text-3xl font-bold text-green-600 mb-1">70%</div>
            <div className="text-xs text-gray-600 font-medium">Target Accuracy</div>
          </div>
        </div>

        {/* What to Expect Section */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            What to expect
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
              <span className="text-sm text-gray-600">Questions adapt to your skill level for optimal learning</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
              <span className="text-sm text-gray-600">Mix of topics based on your current progress and weak areas</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
              <span className="text-sm text-gray-600">Take your time - practice sessions can be paused</span>
            </div>
          </div>
        </div>

        {/* Tips Row */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
            <span className="text-xs text-amber-800 font-medium">Immediate feedback provided</span>
          </div>
          <div className="flex-1 flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-xs text-blue-800 font-medium">Progress auto-saved</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="flex-1 py-4 px-8 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-lg">
            Quick Review
          </button>
          <button
            onClick={onStartPractice}
            className="flex-1 py-4 px-8 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-lg bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transform hover:scale-[1.02]"
          >
            Start Practice Session
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};