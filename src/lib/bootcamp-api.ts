import { supabase } from '@/integrations/supabase/client';

export interface BootcampQuestion {
  question_id: string;
  module_id: string;
  topic_id: string;
  subtopic_id: string;
  question_category: 'arithmetic' | 'reasoning' | 'mixed';
  cognitive_level: 'recall' | 'application' | 'analysis' | 'synthesis';
  difficulty: 'foundation' | 'intermediate' | 'advanced';
  question_text: string;
  visual_aid_url?: string;
  marks: number;
  time_seconds: number;
  bootcamp_enhanced_answer_options: AnswerOption[];
  selection_reason?: string;
  priority?: number;
}

export interface AnswerOption {
  option_letter: string;
  answer_value: string;
  is_correct: boolean;
  misconception_code?: string;
  diagnostic_feedback: string;
}

export interface StudentResponse {
  student_id: string;
  question_id: string;
  selected_answer: string;
  time_taken_seconds: number;
  confidence_rating?: number;
  session_id?: string;
}

export class BootcampAPI {
  static async importQuestions(questionData: any[]) {
    try {
      const { data, error } = await supabase.functions.invoke('bootcamp-question-manager', {
        body: {
          action: 'import_questions',
          data: questionData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error importing questions:', error);
      throw error;
    }
  }

  static async getAdaptiveQuestions(studentId: string, questionCount: number = 10): Promise<BootcampQuestion[]> {
    try {
      const { data, error } = await supabase.functions.invoke('bootcamp-question-manager', {
        body: {
          action: 'get_adaptive_questions',
          studentId,
          questionCount
        }
      });

      if (error) throw error;
      return data.questions;
    } catch (error) {
      console.error('Error getting adaptive questions:', error);
      throw error;
    }
  }

  static async submitResponse(responseData: StudentResponse) {
    try {
      const { data, error } = await supabase.functions.invoke('bootcamp-question-manager', {
        body: {
          action: 'submit_response',
          data: responseData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  }

  static async getStudentProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('bootcamp_students')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting student profile:', error);
      throw error;
    }
  }

  static async createStudentProfile(userId: string, profileData: any) {
    try {
      const { data, error } = await supabase
        .from('bootcamp_students')
        .insert({
          user_id: userId,
          ...profileData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating student profile:', error);
      throw error;
    }
  }

  static async getStudentProgress(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('bootcamp_enhanced_student_progress')
        .select(`
          *,
          bootcamp_enhanced_topics (*)
        `)
        .eq('student_id', studentId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting student progress:', error);
      throw error;
    }
  }

  static async getStudentPerformanceSummary(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('bootcamp_student_performance_summary')
        .select('*')
        .eq('student_id', studentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting performance summary:', error);
      throw error;
    }
  }

  static async getStudentMisconceptions(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('bootcamp_enhanced_student_responses')
        .select(`
          misconception_detected,
          responded_at,
          bootcamp_enhanced_questions (topic_id)
        `)
        .eq('student_id', studentId)
        .not('misconception_detected', 'is', null)
        .order('responded_at', { ascending: false });

      if (error) throw error;
      
      // Group misconceptions by frequency
      const misconceptionFreq: { [key: string]: number } = {};
      data.forEach(response => {
        if (response.misconception_detected) {
          misconceptionFreq[response.misconception_detected] = 
            (misconceptionFreq[response.misconception_detected] || 0) + 1;
        }
      });

      return Object.entries(misconceptionFreq)
        .map(([code, count]) => ({ code, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting student misconceptions:', error);
      throw error;
    }
  }

  static async startLearningSession(studentId: string, sessionType: string = 'practice') {
    try {
      const { data, error } = await supabase
        .from('bootcamp_enhanced_learning_sessions')
        .insert({
          student_id: studentId,
          session_type: sessionType,
          session_start: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting learning session:', error);
      throw error;
    }
  }

  static async endLearningSession(sessionId: string, questionsAttempted: number, questionsCorrect: number) {
    try {
      const performanceScore = questionsAttempted > 0 ? 
        Math.round((questionsCorrect / questionsAttempted) * 100) : 0;

      const { data, error } = await supabase
        .from('bootcamp_enhanced_learning_sessions')
        .update({
          session_end: new Date().toISOString(),
          questions_attempted: questionsAttempted,
          questions_correct: questionsCorrect,
          performance_score: performanceScore
        })
        .eq('session_id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error ending learning session:', error);
      throw error;
    }
  }
}

// Function to parse CSV data for import
export function parseBootcampQuestionsCSV(csvText: string) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const question: any = {};
    
    headers.forEach((header, index) => {
      const key = header.trim();
      let value = values[index]?.trim() || '';
      
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      // Convert numeric fields
      if (key === 'marks' || key === 'time_seconds') {
        question[key] = parseInt(value) || 0;
      } else {
        question[key] = value;
      }
    });
    
    return question;
  });
}