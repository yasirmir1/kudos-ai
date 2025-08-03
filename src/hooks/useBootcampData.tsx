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

      if (!user?.id) {
        console.log('No user ID available');
        return;
      }

      // First, get or create bootcamp student profile
      let studentProfile;
      const { data: existingStudent, error: studentError } = await supabase
        .from('bootcamp_students')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (studentError) {
        console.error('Error fetching student profile:', studentError);
        throw studentError;
      }

      if (!existingStudent) {
        // Create new bootcamp student profile
        const { data: newStudent, error: createError } = await supabase
          .from('bootcamp_students')
          .insert({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'Student',
            email: user.email || '',
            school_year: 7
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating student profile:', createError);
          throw createError;
        }
        studentProfile = newStudent;
      } else {
        studentProfile = existingStudent;
      }

      // Set student data
      setStudent({
        student_id: studentProfile.student_id,
        username: studentProfile.username || 'Student',
        email: studentProfile.email,
        school_year: studentProfile.school_year || 7,
        created_at: studentProfile.created_at,
        last_active: studentProfile.last_active,
        subscription_tier: studentProfile.subscription_tier || 'free'
      });

      const studentId = studentProfile.student_id;
      console.log('Using student_id for data queries:', studentId);

      if (studentId) {
        console.log('📊 Starting data fetch for student_id:', studentId);
        
        // Fetch actual progress data from bootcamp_student_progress
        console.log('🔍 Fetching bootcamp_student_progress...');
        const { data: progressData, error: progressError } = await supabase
          .from('bootcamp_student_progress')
          .select('*')
          .eq('student_id', studentId);

        if (progressError) {
          console.error('❌ Error fetching progress:', progressError);
          setProgress([]);
        } else {
          console.log('✅ Fetched progress data:', progressData);
          setProgress(progressData || []);
        }

        // Fetch unified response data for comprehensive stats
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        console.log('🔍 Fetching unified response data...');
        const { data: allResponsesData, error: responsesError } = await supabase
          .from('bootcamp_student_responses')
          .select('*')
          .eq('student_id', studentId)
          .gte('responded_at', thirtyDaysAgo.toISOString())
          .order('responded_at', { ascending: false });

        if (responsesError) {
          console.error('❌ Error fetching unified responses:', responsesError);
          setResponses([]);
        } else {
          console.log('✅ Fetched unified responses:', allResponsesData?.length, 'total');
          console.log('📊 Activity breakdown:', {
            practice: allResponsesData?.filter(r => r.activity_source === 'practice').length,
            learning_session: allResponsesData?.filter(r => r.activity_source === 'learning_session').length,
            mock_test: allResponsesData?.filter(r => r.activity_source === 'mock_test').length
          });
          
          // Convert to unified format
          const unifiedResponses = (allResponsesData || []).map(response => ({
            response_id: response.response_id,
            question_id: response.question_id,
            is_correct: response.is_correct,
            time_taken: response.time_taken || 0,
            responded_at: response.responded_at,
            misconception_detected: response.misconception_detected,
            activity_source: response.activity_source
          }));

          setResponses(unifiedResponses);
        }

        // For mock test sessions, we still get session metadata for achievements and detailed analysis
        console.log('🔍 Fetching mock test session metadata...');
        const { data: mockTestSessions, error: mockTestError } = await supabase
          .from('bootcamp_mock_test_sessions')
          .select('*')
          .eq('student_id', studentId)
          .gte('started_at', thirtyDaysAgo.toISOString())
          .order('started_at', { ascending: false });

        if (mockTestError) {
          console.error('❌ Error fetching mock test sessions:', mockTestError);
        } else {
          console.log('✅ Fetched mock test sessions:', mockTestSessions?.length);
        }

        // Calculate stats with unified data
        const mockTestData = mockTestSessions || [];
        calculateStats(allResponsesData || [], progressData || [], mockTestData);
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