import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Student {
  student_id: string;
  username: string;
  email: string;
  school_year: number;
  created_at: string;
  last_active: string | null;
  subscription_tier: string;
}

interface StudentProgress {
  topic_id: string;
  accuracy_percentage: number;
  status: string;
  mastery_score: number;
  last_activity: string;
}

interface StudentResponse {
  response_id: string;
  question_id: string;
  is_correct: boolean;
  time_taken: number;
  responded_at: string;
  misconception_detected?: string;
}

interface BootcampStats {
  totalQuestions: number;
  questionsToday: number;
  accuracy: number;
  streakDays: number;
  totalPoints: number;
  level: string;
}

export const useBootcampData = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [stats, setStats] = useState<BootcampStats>({
    totalQuestions: 0,
    questionsToday: 0,
    accuracy: 0,
    streakDays: 0,
    totalPoints: 0,
    level: 'Beginner'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBootcampData();
    }
  }, [user]);

  const fetchBootcampData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get student profile from unified_profiles
      const { data: studentData, error: studentError } = await supabase
        .from('unified_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (studentError) throw studentError;

      if (!studentData) {
        // Create unified profile if it doesn't exist
        const { data: newStudent, error: createError } = await supabase
          .from('unified_profiles')
          .insert({
            id: user?.id,
            username: user?.email?.split('@')[0] || 'Student',
            email: user?.email || '',
            school_year: 7
          })
          .select()
          .single();

        if (createError) throw createError;
        setStudent({
          student_id: newStudent.id,
          username: newStudent.username || 'Student',
          email: newStudent.email,
          school_year: newStudent.school_year || 7,
          created_at: newStudent.created_at,
          last_active: newStudent.last_active,
          subscription_tier: newStudent.subscription_tier || 'free'
        });
      } else {
        setStudent({
          student_id: studentData.id,
          username: studentData.username || 'Student',
          email: studentData.email,
          school_year: studentData.school_year || 7,
          created_at: studentData.created_at,
          last_active: studentData.last_active,
          subscription_tier: studentData.subscription_tier || 'free'
        });
      }

      const studentId = user?.id;

      if (studentId) {
        // Fetch actual progress data from bootcamp_student_progress
        const { data: progressData, error: progressError } = await supabase
          .from('bootcamp_student_progress')
          .select('*')
          .eq('student_id', studentId);

        if (progressError) {
          console.error('Error fetching progress:', progressError);
          setProgress([]);
        } else {
          setProgress(progressData || []);
        }

        // Fetch responses data from multiple sources for comprehensive stats
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Fetch from bootcamp_student_responses
        const { data: responsesData, error: responsesError } = await supabase
          .from('bootcamp_student_responses')
          .select('*')
          .eq('student_id', studentId)
          .gte('responded_at', thirtyDaysAgo.toISOString())
          .order('responded_at', { ascending: false });

        if (responsesError) {
          console.error('Error fetching responses:', responsesError);
        }

        // Fetch from learning_results (additional practice data)
        const { data: learningData, error: learningError } = await supabase
          .from('learning_results')
          .select('*')
          .eq('student_id', studentId)
          .gte('responded_at', thirtyDaysAgo.toISOString())
          .order('responded_at', { ascending: false });

        if (learningError) {
          console.error('Error fetching learning results:', learningError);
        }

        // Fetch from bootcamp_mock_test_sessions for additional activity data
        const { data: mockTestData, error: mockTestError } = await supabase
          .from('bootcamp_mock_test_sessions')
          .select('*')
          .eq('student_id', studentId)
          .gte('started_at', thirtyDaysAgo.toISOString())
          .order('started_at', { ascending: false });

        if (mockTestError) {
          console.error('Error fetching mock test sessions:', mockTestError);
        }

        // Combine all response data
        const allResponses = [
          ...(responsesData || []),
          ...(learningData || []).map(lr => ({
            response_id: lr.id,
            question_id: lr.question_id,
            is_correct: lr.is_correct,
            time_taken: lr.time_taken_seconds || 0,
            responded_at: lr.responded_at,
            misconception_detected: undefined
          }))
        ];

        console.log('Combined responses:', allResponses);
        setResponses(allResponses);

        // Calculate stats with all data sources
        calculateStats(allResponses, progressData || [], mockTestData || []);
      }
    } catch (err) {
      console.error('Error fetching bootcamp data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentId = async () => {
    return user?.id;
  };

  const calculateStats = (responses: StudentResponse[], progress: StudentProgress[], mockTestSessions: any[] = []) => {
    console.log('Calculating stats with:', {
      responsesCount: responses.length,
      progressCount: progress.length,
      mockTestSessionsCount: mockTestSessions.length
    });

    const today = new Date().toDateString();
    const todayResponses = responses.filter(r => {
      const responseDate = new Date(r.responded_at);
      return responseDate.toDateString() === today;
    });
    
    const correctResponses = responses.filter(r => r.is_correct);
    const accuracy = responses.length > 0 ? 
      Math.round((correctResponses.length / responses.length) * 100) : 0;

    // Enhanced streak calculation including mock test sessions for activity tracking
    const allActivityDates = [
      ...responses.map(r => new Date(r.responded_at).toDateString()),
      ...mockTestSessions.map(s => new Date(s.started_at).toDateString())
    ];
    
    const uniqueDays = [...new Set(allActivityDates)].sort();
    
    let streakDays = 0;
    const today_str = new Date().toDateString();
    
    // Calculate consecutive day streak from today backwards
    let currentDate = new Date();
    while (true) {
      const dateStr = currentDate.toDateString();
      if (uniqueDays.includes(dateStr)) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Simple points calculation including mock test bonuses
    const mockTestBonus = mockTestSessions.length * 25;
    const totalPoints = correctResponses.length * 10 + streakDays * 50 + mockTestBonus;

    // Determine level based on total questions and accuracy
    let level = 'Beginner';
    if (responses.length > 100 && accuracy > 80) {
      level = 'Advanced';
    } else if (responses.length > 50 && accuracy > 70) {
      level = 'Intermediate';
    }

    const calculatedStats = {
      totalQuestions: responses.length,
      questionsToday: todayResponses.length,
      accuracy,
      streakDays,
      totalPoints,
      level
    };

    console.log('Calculated stats:', calculatedStats);
    setStats(calculatedStats);
  };

  const generateSampleQuestions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-bootcamp-questions', {
        body: {
          topic: 'Number Operations',
          difficulty: 'foundation',
          count: 10
        }
      });

      if (error) throw error;
      
      if (data.success) {
        // Refresh data after generating questions
        await fetchBootcampData();
        return { success: true, message: `Generated ${data.generated} sample questions` };
      }
      
      return { success: false, message: data.error || 'Failed to generate questions' };
    } catch (err) {
      console.error('Error generating sample questions:', err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Failed to generate questions' 
      };
    }
  };

  return {
    student,
    progress,
    responses,
    stats,
    isLoading,
    error,
    fetchBootcampData,
    generateSampleQuestions
  };
};