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

      // Get student profile
      const { data: studentData, error: studentError } = await supabase
        .from('bootcamp_students')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (studentError) throw studentError;

      if (!studentData) {
        // Create student profile if it doesn't exist
        const { data: newStudent, error: createError } = await supabase
          .from('bootcamp_students')
          .insert({
            user_id: user?.id,
            username: user?.email?.split('@')[0] || 'Student',
            email: user?.email || '',
            school_year: 7
          })
          .select()
          .single();

        if (createError) throw createError;
        setStudent(newStudent);
      } else {
        setStudent(studentData);
      }

      const studentId = studentData?.student_id || (await getStudentId());

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

        // Fetch responses data for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: responsesData, error: responsesError } = await supabase
          .from('bootcamp_student_responses')
          .select('*')
          .eq('student_id', studentId)
          .gte('responded_at', thirtyDaysAgo.toISOString())
          .order('responded_at', { ascending: false });

        if (responsesError) throw responsesError;
        console.log('Fetched responses:', responsesData);
        setResponses(responsesData || []);

        // Calculate stats
        calculateStats(responsesData || [], progressData || []);
      }
    } catch (err) {
      console.error('Error fetching bootcamp data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentId = async () => {
    const { data } = await supabase.rpc('get_current_student_id');
    return data;
  };

  const calculateStats = (responses: StudentResponse[], progress: StudentProgress[]) => {
    const today = new Date().toDateString();
    const todayResponses = responses.filter(r => {
      const responseDate = new Date(r.responded_at);
      return responseDate.toDateString() === today;
    });
    
    const correctResponses = responses.filter(r => r.is_correct);
    const accuracy = responses.length > 0 ? 
      Math.round((correctResponses.length / responses.length) * 100) : 0;

    // Calculate streak (simplified - consecutive days with activity)
    const uniqueDays = [...new Set(responses.map(r => 
      new Date(r.responded_at).toDateString()
    ))].sort();
    
    let streakDays = 0;
    const today_str = new Date().toDateString();
    
    if (uniqueDays.includes(today_str)) {
      streakDays = 1;
      for (let i = uniqueDays.length - 2; i >= 0; i--) {
        const currentDay = new Date(uniqueDays[i + 1]);
        const prevDay = new Date(uniqueDays[i]);
        const dayDiff = (currentDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          streakDays++;
        } else {
          break;
        }
      }
    }

    // Simple points calculation
    const totalPoints = correctResponses.length * 10 + streakDays * 50;

    // Determine level based on total questions and accuracy
    let level = 'Beginner';
    if (responses.length > 100 && accuracy > 80) {
      level = 'Advanced';
    } else if (responses.length > 50 && accuracy > 70) {
      level = 'Intermediate';
    }

    setStats({
      totalQuestions: responses.length,
      questionsToday: todayResponses.length,
      accuracy,
      streakDays,
      totalPoints,
      level
    });
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