import { supabase } from '@/integrations/supabase/client';

export interface AdaptiveQuestionParams {
  studentId: string;
  topicId?: string;
  count?: number;
  confidenceThreshold?: number;
  accuracyThreshold?: number;
}

export interface WeightedQuestion {
  question_id: string;
  weight: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  adaptive_factor: number;
}

export class EnhancedBootcampAPI {
  
  /**
   * Get adaptive questions weighted by confidence and accuracy
   */
  static async getConfidenceWeightedQuestions(params: AdaptiveQuestionParams): Promise<WeightedQuestion[]> {
    const { studentId, topicId, count = 10, confidenceThreshold = 0.6, accuracyThreshold = 0.7 } = params;
    
    try {
      // Get student's recent performance with confidence data
      let query = supabase
        .from('bootcamp_student_responses')
        .select(`
          question_id,
          is_correct,
          confidence_rating,
          misconception_detected,
          time_taken,
          bootcamp_questions!inner(
            question_id,
            topic_id,
            difficulty,
            cognitive_level
          )
        `)
        .eq('student_id', studentId)
        .order('responded_at', { ascending: false })
        .limit(50);

      if (topicId) {
        query = query.eq('bootcamp_questions.topic_id', topicId);
      }

      const { data: responses, error } = await query;
      if (error) throw error;

      // Analyze performance patterns
      const performanceAnalysis = this.analyzePerformancePatterns(responses || []);
      
      // Get candidate questions
      const candidateQuestions = await this.getCandidateQuestions(studentId, topicId, performanceAnalysis);
      
      // Weight questions based on adaptive factors
      const weightedQuestions = this.calculateAdaptiveWeights(
        candidateQuestions, 
        performanceAnalysis, 
        confidenceThreshold, 
        accuracyThreshold
      );

      return weightedQuestions.slice(0, count);
      
    } catch (error) {
      console.error('Error getting confidence-weighted questions:', error);
      return [];
    }
  }

  /**
   * Analyze student performance patterns for adaptive weighting
   */
  private static analyzePerformancePatterns(responses: any[]) {
    const analysis = {
      avgConfidence: 0,
      avgAccuracy: 0,
      confidenceAccuracyGap: 0,
      weakTopics: [] as string[],
      strongTopics: [] as string[],
      overconfidenceAreas: [] as string[],
      underconfidenceAreas: [] as string[],
      commonMisconceptions: [] as string[]
    };

    if (responses.length === 0) return analysis;

    // Calculate averages
    const totalConfidence = responses.reduce((sum, r) => sum + (r.confidence_rating || 0.5), 0);
    const totalAccuracy = responses.filter(r => r.is_correct).length / responses.length;
    
    analysis.avgConfidence = totalConfidence / responses.length;
    analysis.avgAccuracy = totalAccuracy;
    analysis.confidenceAccuracyGap = analysis.avgConfidence - analysis.avgAccuracy;

    // Group by topic
    const topicPerformance = responses.reduce((acc, response) => {
      const topicId = response.bootcamp_questions?.topic_id;
      if (!topicId) return acc;

      if (!acc[topicId]) {
        acc[topicId] = { correct: 0, total: 0, confidence: 0 };
      }
      
      acc[topicId].total++;
      if (response.is_correct) acc[topicId].correct++;
      acc[topicId].confidence += response.confidence_rating || 0.5;
      
      return acc;
    }, {} as Record<string, any>);

    // Identify weak and strong topics
    Object.entries(topicPerformance).forEach(([topicId, perf]: [string, any]) => {
      const accuracy = perf.correct / perf.total;
      const avgConfidence = perf.confidence / perf.total;
      
      if (accuracy < 0.6) {
        analysis.weakTopics.push(topicId);
      } else if (accuracy > 0.8) {
        analysis.strongTopics.push(topicId);
      }

      // Detect confidence calibration issues
      if (avgConfidence > accuracy + 0.2) {
        analysis.overconfidenceAreas.push(topicId);
      } else if (accuracy > avgConfidence + 0.2) {
        analysis.underconfidenceAreas.push(topicId);
      }
    });

    // Common misconceptions
    analysis.commonMisconceptions = responses
      .filter(r => r.misconception_detected)
      .map(r => r.misconception_detected)
      .reduce((acc, misc) => {
        acc[misc] = (acc[misc] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return analysis;
  }

  /**
   * Get candidate questions for adaptive selection
   */
  private static async getCandidateQuestions(studentId: string, topicId?: string, analysis?: any) {
    let query = supabase
      .from('bootcamp_questions')
      .select(`
        question_id,
        topic_id,
        difficulty,
        cognitive_level,
        question_category,
        prerequisite_skills
      `)
      .limit(50);

    if (topicId) {
      query = query.eq('topic_id', topicId);
    }

    // Exclude recently answered questions
    const { data: recentQuestions } = await supabase
      .from('bootcamp_student_responses')
      .select('question_id')
      .eq('student_id', studentId)
      .gte('responded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    const excludeIds = recentQuestions?.map(r => r.question_id) || [];
    
    if (excludeIds.length > 0) {
      query = query.not('question_id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  /**
   * Calculate adaptive weights for question selection
   */
  private static calculateAdaptiveWeights(
    questions: any[], 
    analysis: any, 
    confidenceThreshold: number, 
    accuracyThreshold: number
  ): WeightedQuestion[] {
    
    return questions.map(question => {
      let weight = 1.0;
      let reason = 'Standard practice';
      let priority: 'high' | 'medium' | 'low' = 'medium';
      let adaptiveFactor = 1.0;

      // Weight based on topic performance
      if (analysis.weakTopics.includes(question.topic_id)) {
        weight *= 2.0;
        adaptiveFactor *= 1.5;
        reason = 'Targets weak topic';
        priority = 'high';
      } else if (analysis.strongTopics.includes(question.topic_id)) {
        weight *= 0.5;
        adaptiveFactor *= 0.8;
        reason = 'Review strong topic';
        priority = 'low';
      }

      // Weight based on confidence calibration
      if (analysis.overconfidenceAreas.includes(question.topic_id)) {
        weight *= 1.5;
        adaptiveFactor *= 1.3;
        reason = 'Confidence calibration needed';
        priority = 'high';
      } else if (analysis.underconfidenceAreas.includes(question.topic_id)) {
        weight *= 1.3;
        adaptiveFactor *= 1.1;
        reason = 'Build confidence';
        priority = 'medium';
      }

      // Weight based on difficulty and current performance
      if (analysis.avgAccuracy < accuracyThreshold) {
        // Struggling students get easier questions
        if (question.difficulty === 'foundation') {
          weight *= 1.5;
          adaptiveFactor *= 1.2;
        } else if (question.difficulty === 'advanced') {
          weight *= 0.3;
          adaptiveFactor *= 0.7;
        }
      } else if (analysis.avgAccuracy > 0.85 && analysis.avgConfidence > 0.8) {
        // High performers get challenging questions
        if (question.difficulty === 'advanced') {
          weight *= 1.8;
          adaptiveFactor *= 1.4;
          reason = 'Challenge question';
          priority = 'high';
        }
      }

      // Boost questions that address common misconceptions
      if (Object.keys(analysis.commonMisconceptions).length > 0) {
        weight *= 1.2;
        adaptiveFactor *= 1.1;
      }

      return {
        question_id: question.question_id,
        weight,
        reason,
        priority,
        adaptive_factor: adaptiveFactor
      };
    }).sort((a, b) => b.weight - a.weight);
  }

  /**
   * Generate skip-ahead recommendations for high performers
   */
  static async getSkipAheadCandidates(studentId: string): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('bootcamp_student_progress')
        .select('topic_id, accuracy_percentage')
        .eq('student_id', studentId)
        .gte('accuracy_percentage', 85);

      return (data || []).map(progress => progress.topic_id);
        
    } catch (error) {
      console.error('Error getting skip-ahead candidates:', error);
      return [];
    }
  }

  /**
   * Generate extra practice recommendations for struggling areas
   */
  static async getExtraPracticeCandidates(studentId: string): Promise<string[]> {
    try {
      const { data } = await supabase
        .from('bootcamp_student_progress')
        .select('topic_id, accuracy_percentage')
        .eq('student_id', studentId)
        .lt('accuracy_percentage', 60);

      return (data || []).map(progress => progress.topic_id);
        
    } catch (error) {
      console.error('Error getting extra practice candidates:', error);
      return [];
    }
  }
}