import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MisconceptionDetectionResult {
  misconceptionCode: string | null;
  confidence: number;
  explanation?: string;
  fromCache: boolean;
}

interface AnswerOption {
  answer_value: string;
  is_correct: boolean;
  misconception_code: string | null;
  detection_confidence: number;
  pattern_rules: any;
}

export const useMisconceptionDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);

  // Local rule-based detection using answer options
  const detectLocalMisconception = useCallback(async (
    questionId: string,
    selectedAnswer: string
  ): Promise<MisconceptionDetectionResult> => {
    try {
      // Get answer options for the question
      const { data: answerOptions, error } = await supabase
        .from('bootcamp_answer_options')
        .select('*')
        .eq('question_id', questionId);

      if (error || !answerOptions) {
        return { misconceptionCode: null, confidence: 0, fromCache: false };
      }

      // Find the selected answer option
      const selectedOption = answerOptions.find(
        (option: AnswerOption) => option.answer_value === selectedAnswer
      );

      if (!selectedOption) {
        return { misconceptionCode: null, confidence: 0, fromCache: false };
      }

      // If it's correct, no misconception
      if (selectedOption.is_correct) {
        return { misconceptionCode: null, confidence: 1, fromCache: false };
      }

      // Return misconception if detected
      if (selectedOption.misconception_code) {
        return {
          misconceptionCode: selectedOption.misconception_code,
          confidence: selectedOption.detection_confidence || 0.8,
          fromCache: false
        };
      }

      return { misconceptionCode: null, confidence: 0, fromCache: false };
    } catch (error) {
      console.error('Local misconception detection error:', error);
      return { misconceptionCode: null, confidence: 0, fromCache: false };
    }
  }, []);

  // Check explanation cache
  const getCachedExplanation = useCallback(async (
    studentId: string,
    questionId: string,
    misconceptionCode: string
  ): Promise<string | null> => {
    try {
      const cacheKey = `${studentId}-${questionId}-${misconceptionCode}`;
      
      const { data, error } = await supabase
        .from('bootcamp_explanation_cache')
        .select('explanation, usage_count')
        .eq('cache_key', cacheKey)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      // Update usage count
      await supabase
        .from('bootcamp_explanation_cache')
        .update({ 
          usage_count: data.usage_count + 1,
          last_accessed: new Date().toISOString()
        })
        .eq('cache_key', cacheKey);

      return data.explanation;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }, []);

  // Queue for batch processing
  const queueForExplanation = useCallback(async (
    studentId: string,
    questionId: string,
    studentAnswer: string,
    correctAnswer: string,
    misconceptionCode: string | null
  ) => {
    try {
      await supabase
        .from('bootcamp_misconception_queue')
        .insert({
          student_id: studentId,
          question_id: questionId,
          student_answer: studentAnswer,
          correct_answer: correctAnswer,
          misconception_code: misconceptionCode,
          priority: misconceptionCode ? 2 : 1, // Higher priority for detected misconceptions
          status: 'pending'
        });
    } catch (error) {
      console.error('Queue insertion error:', error);
    }
  }, []);

  // Main detection function
  const detectMisconception = useCallback(async (
    studentId: string,
    questionId: string,
    selectedAnswer: string,
    correctAnswer: string
  ): Promise<MisconceptionDetectionResult> => {
    setIsDetecting(true);

    try {
      // Step 1: Local detection first
      const localResult = await detectLocalMisconception(questionId, selectedAnswer);
      
      // Step 2: Check cache for explanation if misconception detected
      let explanation: string | undefined;
      if (localResult.misconceptionCode) {
        const cachedExplanation = await getCachedExplanation(
          studentId,
          questionId,
          localResult.misconceptionCode
        );
        if (cachedExplanation) {
          explanation = cachedExplanation;
          localResult.fromCache = true;
        }
      }

      // Step 3: Queue for batch processing if no cached explanation
      if (localResult.misconceptionCode && !explanation) {
        await queueForExplanation(
          studentId,
          questionId,
          selectedAnswer,
          correctAnswer,
          localResult.misconceptionCode
        );
      }

      return {
        ...localResult,
        explanation
      };
    } catch (error) {
      console.error('Misconception detection error:', error);
      return { misconceptionCode: null, confidence: 0, fromCache: false };
    } finally {
      setIsDetecting(false);
    }
  }, [detectLocalMisconception, getCachedExplanation, queueForExplanation]);

  return {
    detectMisconception,
    isDetecting
  };
};