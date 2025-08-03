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
  visual_aid?: string;
  marks: number;
  time_seconds: number;
  bootcamp_answers: AnswerOption[];
  selection_reason?: string;
  priority?: number;
}

export interface AnswerOption {
  answer_option: string;
  answer_value: string;
  is_correct: boolean;
  misconception_type?: string;
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
      
      // The edge function returns questions directly in the response, not wrapped in data.questions
      const questions = data?.questions || data || [];
      return questions;
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
      // Get unified response data including activity source
      const { data, error } = await supabase
        .from('bootcamp_student_responses')
        .select(`
          *,
          bootcamp_questions!inner(topic_id, question_id)
        `)
        .eq('student_id', studentId)
        .order('responded_at', { ascending: false });

      if (error) throw error;

      // Calculate actual accuracy by topic from all unified responses
      const topicStats = new Map();
      
      data?.forEach(response => {
        const topicId = response.bootcamp_questions.topic_id;
        if (!topicStats.has(topicId)) {
          topicStats.set(topicId, { correct: 0, total: 0, activityTypes: new Set() });
        }
        const stats = topicStats.get(topicId);
        stats.total++;
        if (response.is_correct) stats.correct++;
        stats.activityTypes.add(response.activity_source || 'practice');
      });

      // Convert to array format expected by the UI
      const progressArray = Array.from(topicStats.entries()).map(([topicId, stats]) => {
        const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
        return {
          topic_id: topicId,
          accuracy_percentage: stats.total > 0 ? Math.round(accuracy * 100) : 0,
          status: stats.total === 0 ? 'not_started' : 
                  accuracy >= 0.9 ? 'mastered' :
                  accuracy >= 0.7 ? 'completed' : 'in_progress',
          last_activity: new Date().toISOString(),
          mastery_score: accuracy,
          activity_types: Array.from(stats.activityTypes) // Include activity sources
        };
      });

      return progressArray;
    } catch (error) {
      console.error('Error getting student progress:', error);
      return [];
    }
  }

  static async getStudentPerformanceSummary(studentId: string) {
    try {
      // Return mock data since the table doesn't exist
      return {
        username: 'Student',
        total_questions_attempted: 0,
        total_correct: 0,
        overall_accuracy: 0,
        average_time_per_question: 0,
        active_days: 0,
        current_streak: 0
      };
    } catch (error) {
      console.error('Error getting performance summary:', error);
      throw error;
    }
  }

  static async getStudentMisconceptions(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('bootcamp_student_responses')
        .select(`
          misconception_detected,
          responded_at,
          question_id
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

  static async updateStudentProgress(studentId: string, topicId: string, accuracy: number, averageTime: number) {
    try {
      const status = accuracy >= 90 ? 'mastered' : accuracy >= 70 ? 'completed' : 'in_progress';
      const masteryScore = accuracy / 100;

      const { data, error } = await supabase
        .from('bootcamp_student_progress')
        .upsert({
          student_id: studentId,
          topic_id: topicId,
          status,
          accuracy_percentage: accuracy,
          average_speed_seconds: averageTime,
          mastery_score: masteryScore,
          last_activity: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating student progress:', error);
      throw error;
    }
  }

  static async getStudentSkills(studentId: string) {
    try {
      const { data, error } = await supabase
        .from('bootcamp_student_skills')
        .select('*')
        .eq('student_id', studentId)
        .order('last_assessed', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting student skills:', error);
      throw error;
    }
  }

  static async updateStudentSkill(studentId: string, skillName: string, proficiency: number, questionsAttempted: number, questionsCorrect: number, averageTime: number) {
    try {
      const { data, error } = await supabase
        .from('bootcamp_student_skills')
        .upsert({
          student_id: studentId,
          skill_name: skillName,
          proficiency_level: proficiency,
          questions_attempted: questionsAttempted,
          questions_correct: questionsCorrect,
          average_time_seconds: averageTime,
          last_assessed: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating student skill:', error);
      throw error;
    }
  }

  static async getLearningPath(studentId: string) {
    try {
      // Get current progress
      const progress = await this.getStudentProgress(studentId);
      
      // Get topics that haven't been started or are in progress
      const { data: allTopics, error } = await supabase
        .from('bootcamp_topics')
        .select('*')
        .order('topic_order');

      if (error) throw error;

      const progressMap = new Map(progress.map(p => [p.topic_id, p]));
      
      return allTopics.map(topic => ({
        ...topic,
        progress: progressMap.get(topic.id) || { status: 'not_started', accuracy_percentage: 0, mastery_score: 0 }
      }));
    } catch (error) {
      console.error('Error getting learning path:', error);
      throw error;
    }
  }

  static async startLearningSession(studentId: string, sessionType: string = 'learning') {
    try {
      const { data, error } = await supabase
        .from('bootcamp_learning_sessions')
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

  static async endLearningSession(sessionId: string, questionsAttempted: number, questionsCorrect: number, topicsCovered: string[] = []) {
    try {
      const performanceScore = questionsAttempted > 0 ? 
        Math.round((questionsCorrect / questionsAttempted) * 100) : 0;

      const { data, error } = await supabase
        .from('bootcamp_learning_sessions')
        .update({
          session_end: new Date().toISOString(),
          questions_attempted: questionsAttempted,
          questions_correct: questionsCorrect,
          performance_score: performanceScore,
          topics_covered: topicsCovered
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