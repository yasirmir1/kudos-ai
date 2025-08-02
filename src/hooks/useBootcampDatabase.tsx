import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Comprehensive interfaces for all bootcamp data
export interface BootcampStudent {
  student_id: string;
  user_id: string;
  username: string;
  email: string;
  school_year: number;
  exam_boards: string[];
  subscription_tier: string;
  created_at: string;
  last_active: string;
}

export interface StudentProgress {
  progress_id: string;
  student_id: string;
  topic_id: string;
  module_id: string;
  status: string; // Changed from union type to string
  accuracy_percentage: number;
  average_speed_seconds: number;
  mastery_score: number;
  last_activity: string;
}

export interface StudentSkill {
  skill_id: string;
  student_id: string;
  skill_name: string;
  skill_category: string;
  proficiency_level: number;
  questions_attempted: number;
  questions_correct: number;
  average_time_seconds: number;
  active_misconceptions: string[];
  misconceptions_cleared: string[];
  last_assessed: string;
}

export interface StudentResponse {
  response_id: string;
  student_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  time_taken: number;
  misconception_detected: string | null;
  timestamp: string;
}

export interface LearningSession {
  session_id: string;
  student_id: string;
  session_start: string;
  session_end: string | null;
  session_type: string; // Changed from union type to string
  topics_covered: string[];
  questions_attempted: number;
  questions_correct: number;
  performance_score: number;
}

export interface AdaptiveRecommendation {
  recommendation_id: string;
  student_id: string;
  recommendation_type: string; // Changed from union type to string
  content: any;
  priority: number;
  completed: boolean;
  expires_at: string;
  generated_at: string;
}

export interface Achievement {
  achievement_id: string;
  student_id: string;
  achievement_name: string;
  achievement_type: string;
  points_awarded: number;
  badge_url: string;
  earned_at: string;
}

export interface BootcampQuestion {
  question_id: string;
  module_id: string;
  topic_id: string;
  subtopic_id: string;
  question_text: string;
  question_type: string;
  question_category: string;
  difficulty: string;
  cognitive_level: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  visual_aid: string;
  prerequisite_skills: string[];
  exam_boards: string[];
  marks: number;
  time_seconds: number;
}

export const useBootcampDatabase = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<BootcampStudent | null>(null);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAllBootcampData();
    }
  }, [user]);

  const loadAllBootcampData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get or create student
      const studentData = await getOrCreateStudent();
      setStudent(studentData);

      if (studentData) {
        // Load all related data in parallel
        const [
          progressData,
          skillsData,
          responsesData,
          sessionsData,
          recommendationsData,
          achievementsData
        ] = await Promise.all([
          loadStudentProgress(studentData.student_id),
          loadStudentSkills(studentData.student_id),
          loadStudentResponses(studentData.student_id),
          loadLearningSessions(studentData.student_id),
          loadAdaptiveRecommendations(studentData.student_id),
          loadAchievements(studentData.student_id)
        ]);

        setProgress(progressData);
        setSkills(skillsData);
        setResponses(responsesData);
        setSessions(sessionsData);
        setRecommendations(recommendationsData);
        setAchievements(achievementsData);
      }
    } catch (err) {
      console.error('Error loading bootcamp data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrCreateStudent = async (): Promise<BootcampStudent | null> => {
    if (!user?.id) return null;

    // Try to get existing student
    const { data: existingStudent, error: getError } = await supabase
      .from('bootcamp_students')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (getError) throw getError;

    if (existingStudent) {
      return existingStudent;
    }

    // Create new student
    const { data: newStudent, error: createError } = await supabase
      .from('bootcamp_students')
      .insert({
        user_id: user.id,
        username: user.email?.split('@')[0] || 'Student',
        email: user.email || '',
        school_year: 7,
        exam_boards: ['AQA'],
        subscription_tier: 'free'
      })
      .select()
      .single();

    if (createError) throw createError;
    return newStudent;
  };

  const loadStudentProgress = async (studentId: string): Promise<StudentProgress[]> => {
    const { data, error } = await supabase
      .from('bootcamp_student_progress')
      .select('*')
      .eq('student_id', studentId)
      .order('last_activity', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const loadStudentSkills = async (studentId: string): Promise<StudentSkill[]> => {
    const { data, error } = await supabase
      .from('bootcamp_student_skills')
      .select('*')
      .eq('student_id', studentId)
      .order('last_assessed', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const loadStudentResponses = async (studentId: string): Promise<StudentResponse[]> => {
    const { data, error } = await supabase
      .from('bootcamp_student_responses')
      .select('*')
      .eq('student_id', studentId)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data || [];
  };

  const loadLearningSessions = async (studentId: string): Promise<LearningSession[]> => {
    const { data, error } = await supabase
      .from('bootcamp_learning_sessions')
      .select('*')
      .eq('student_id', studentId)
      .order('session_start', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  };

  const loadAdaptiveRecommendations = async (studentId: string): Promise<AdaptiveRecommendation[]> => {
    const { data, error } = await supabase
      .from('bootcamp_adaptive_recommendations')
      .select('*')
      .eq('student_id', studentId)
      .eq('completed', false)
      .order('priority', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const loadAchievements = async (studentId: string): Promise<Achievement[]> => {
    const { data, error } = await supabase
      .from('bootcamp_achievements')
      .select('*')
      .eq('student_id', studentId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  // Question answering functions
  const startLearningSession = async (sessionType: 'practice' | 'diagnostic' | 'review' | 'challenge' = 'practice') => {
    if (!student) return null;

    const { data, error } = await supabase
      .from('bootcamp_learning_sessions')
      .insert({
        student_id: student.student_id,
        session_type: sessionType,
        session_start: new Date().toISOString(),
        topics_covered: [],
        questions_attempted: 0,
        questions_correct: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const recordStudentResponse = async (
    questionId: string,
    selectedAnswer: string,
    isCorrect: boolean,
    timeTaken: number,
    misconceptionDetected?: string
  ) => {
    if (!student) return null;

    const { data, error } = await supabase
      .from('bootcamp_student_responses')
      .insert({
        student_id: student.student_id,
        question_id: questionId,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        time_taken: timeTaken,
        misconception_detected: misconceptionDetected
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger progress updates
    await updateStudentProgress(questionId);
    
    return data;
  };

  const updateStudentProgress = async (questionId: string) => {
    if (!student) return;

    // Get question details to determine topic
    const { data: question } = await supabase
      .from('bootcamp_questions')
      .select('topic_id')
      .eq('question_id', questionId)
      .single();

    if (question?.topic_id) {
      // Use the database function to update progress
      await supabase.rpc('bootcamp_update_student_progress', {
        p_student_id: student.student_id,
        p_topic_id: question.topic_id
      });
    }
  };

  const endLearningSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('bootcamp_learning_sessions')
      .update({
        session_end: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    if (error) throw error;
  };

  const getAdaptiveQuestions = async (count: number = 10) => {
    if (!student) return [];

    const { data, error } = await supabase.rpc('bootcamp_generate_adaptive_practice_set', {
      p_student_id: student.student_id,
      p_question_count: count
    });

    if (error) throw error;
    return data || [];
  };

  return {
    // Data
    student,
    progress,
    skills,
    responses,
    sessions,
    recommendations,
    achievements,
    
    // State
    isLoading,
    error,
    
    // Functions
    loadAllBootcampData,
    startLearningSession,
    recordStudentResponse,
    endLearningSession,
    getAdaptiveQuestions
  };
};