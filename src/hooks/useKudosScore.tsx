import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface KudosData {
  current_score: number;
  trend: number[];
  performance_improvement: number;
  difficulty_progression: number;
  speed_efficiency: number;
}

interface ResponseWithQuestion {
  is_correct: boolean;
  time_taken: number;
  responded_at: string;
  question: {
    difficulty: string;
    time_seconds: number;
  };
}

export const useKudosScore = () => {
  const { user } = useAuth();
  const [kudosData, setKudosData] = useState<KudosData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      calculateKudosScore();
    }
  }, [user]);

  const calculateKudosScore = async () => {
    try {
      // Get student ID
      const { data: studentData } = await supabase
        .from('bootcamp_students')
        .select('student_id')
        .eq('user_id', user?.id)
        .single();

      if (!studentData) return;

      // Fetch responses with question difficulty
      const { data: responses } = await supabase
        .from('bootcamp_student_responses')
        .select(`
          is_correct,
          time_taken,
          responded_at,
          question_id,
          bootcamp_questions!inner(difficulty, time_seconds)
        `)
        .eq('student_id', studentData.student_id)
        .order('responded_at', { ascending: true })
        .limit(100);

      if (responses && responses.length > 0) {
        const processedResponses = responses.map(r => ({
          is_correct: r.is_correct,
          time_taken: r.time_taken,
          responded_at: r.responded_at,
          question: {
            difficulty: (r as any).bootcamp_questions.difficulty,
            time_seconds: (r as any).bootcamp_questions.time_seconds
          }
        })) as ResponseWithQuestion[];

        const kudosScore = calculateDynamicKudos(processedResponses);
        setKudosData(kudosScore);
      }
    } catch (error) {
      console.error('Error calculating kudos score:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDynamicKudos = (responses: ResponseWithQuestion[]): KudosData => {
    // Difficulty multipliers
    const difficultyMultipliers = {
      'foundation': 1.0,
      'intermediate': 1.5,
      'advanced': 2.0,
      'expert': 2.5
    };

    // Calculate kudos for each response
    const kudosPerResponse = responses.map((response, index) => {
      const difficultyMultiplier = difficultyMultipliers[response.question.difficulty as keyof typeof difficultyMultipliers] || 1.0;
      
      // Base accuracy score
      let score = response.is_correct ? 100 : 0;
      
      // Apply difficulty multiplier
      score *= difficultyMultiplier;
      
      // Speed bonus/penalty (optimal time is the expected time for the question)
      const optimalTime = response.question.time_seconds;
      const actualTime = response.time_taken;
      const timeRatio = actualTime / optimalTime;
      
      // Speed efficiency: 1.0 = optimal, <1.0 = faster than expected, >1.0 = slower
      let speedMultiplier = 1.0;
      if (timeRatio <= 0.5) {
        speedMultiplier = 1.3; // 30% bonus for being very fast
      } else if (timeRatio <= 0.8) {
        speedMultiplier = 1.15; // 15% bonus for being reasonably fast
      } else if (timeRatio <= 1.2) {
        speedMultiplier = 1.0; // No penalty for reasonable time
      } else if (timeRatio <= 2.0) {
        speedMultiplier = 0.9; // 10% penalty for being slow
      } else {
        speedMultiplier = 0.7; // 30% penalty for being very slow
      }
      
      score *= speedMultiplier;
      
      // Progressive difficulty bonus - reward maintaining performance as questions get harder
      const progressionIndex = index / responses.length; // 0 to 1
      const progressionBonus = 1 + (progressionIndex * 0.2); // Up to 20% bonus for later questions
      score *= progressionBonus;
      
      return {
        score,
        difficulty: response.question.difficulty,
        timeRatio,
        isCorrect: response.is_correct,
        index
      };
    });

    // Calculate trend over time (groups of 10)
    const trendData = [];
    for (let i = 0; i < kudosPerResponse.length; i += 10) {
      const group = kudosPerResponse.slice(i, i + 10);
      const avgScore = group.reduce((sum, item) => sum + item.score, 0) / group.length;
      trendData.push(Math.round(avgScore));
    }

    // Current score (last 10 responses)
    const recentResponses = kudosPerResponse.slice(-10);
    const currentScore = recentResponses.length > 0 
      ? Math.round(recentResponses.reduce((sum, item) => sum + item.score, 0) / recentResponses.length)
      : 0;

    // Performance improvement (compare first quarter vs last quarter)
    const firstQuarter = kudosPerResponse.slice(0, Math.floor(kudosPerResponse.length / 4));
    const lastQuarter = kudosPerResponse.slice(-Math.floor(kudosPerResponse.length / 4));
    
    const firstQuarterAvg = firstQuarter.length > 0 
      ? firstQuarter.reduce((sum, item) => sum + item.score, 0) / firstQuarter.length 
      : 0;
    const lastQuarterAvg = lastQuarter.length > 0 
      ? lastQuarter.reduce((sum, item) => sum + item.score, 0) / lastQuarter.length 
      : 0;
    
    const performanceImprovement = firstQuarterAvg > 0 
      ? Math.round(((lastQuarterAvg - firstQuarterAvg) / firstQuarterAvg) * 100)
      : 0;

    // Difficulty progression score
    const avgDifficultyFirst = firstQuarter.length > 0
      ? firstQuarter.reduce((sum, item) => sum + (difficultyMultipliers[item.difficulty as keyof typeof difficultyMultipliers] || 1), 0) / firstQuarter.length
      : 1;
    const avgDifficultyLast = lastQuarter.length > 0
      ? lastQuarter.reduce((sum, item) => sum + (difficultyMultipliers[item.difficulty as keyof typeof difficultyMultipliers] || 1), 0) / lastQuarter.length
      : 1;
    
    const difficultyProgression = Math.round(((avgDifficultyLast - avgDifficultyFirst) / avgDifficultyFirst) * 100);

    // Speed efficiency (average time ratio for recent responses)
    const speedEfficiency = recentResponses.length > 0
      ? Math.round((1 / (recentResponses.reduce((sum, item) => sum + item.timeRatio, 0) / recentResponses.length)) * 100)
      : 100;

    return {
      current_score: currentScore,
      trend: trendData,
      performance_improvement: performanceImprovement,
      difficulty_progression: difficultyProgression,
      speed_efficiency: speedEfficiency
    };
  };

  return { kudosData, loading, refetch: calculateKudosScore };
};