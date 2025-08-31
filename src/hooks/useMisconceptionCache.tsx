import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CachedMisconception {
  red_herring: string;
  frequency: number;
  topics: string[];
  explanation?: string;
  fromCache: boolean;
}

export const useMisconceptionCache = (studentId: string | null) => {
  const [cachedMisconceptions, setCachedMisconceptions] = useState<CachedMisconception[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cacheHitRate, setCacheHitRate] = useState(0);

  // Get misconceptions with cached explanations
  const loadMisconceptionsWithCache = useCallback(async () => {
    if (!studentId) return;
    
    setIsLoading(true);
    try {
      // Get student misconceptions (handles null responses properly)
      const { data: misconceptions, error: misconceptionsError } = await supabase
        .rpc('get_student_misconceptions', { p_student_id: studentId });

      if (misconceptionsError) {
        console.error('Error fetching misconceptions:', misconceptionsError);
        setIsLoading(false);
        return;
      }

      // Handle case where no misconceptions exist (null/empty response)
      if (!misconceptions || misconceptions.length === 0) {
        setCachedMisconceptions([]);
        setIsLoading(false);
        return;
      }

      // Check cache for each misconception
      const misconceptionsWithCache = await Promise.all(
        misconceptions.map(async (misconception: any) => {
          const cacheKey = `${studentId}-misconception-${misconception.red_herring}`;
          
          const { data: cached } = await supabase
            .from('bootcamp_explanation_cache')
            .select('explanation')
            .eq('cache_key', cacheKey)
            .maybeSingle();

          return {
            red_herring: misconception.red_herring,
            frequency: misconception.frequency,
            topics: misconception.topics || [],
            explanation: cached?.explanation,
            fromCache: !!cached
          };
        })
      );

      // Calculate cache hit rate
      const cacheHits = misconceptionsWithCache.filter(m => m.fromCache).length;
      const hitRate = misconceptionsWithCache.length > 0 ? 
        (cacheHits / misconceptionsWithCache.length) * 100 : 0;

      setCachedMisconceptions(misconceptionsWithCache);
      setCacheHitRate(hitRate);
    } catch (error) {
      console.error('Error loading misconceptions with cache:', error);
      setCachedMisconceptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  // Cache an explanation
  const cacheExplanation = useCallback(async (
    misconceptionCode: string,
    explanation: string,
    apiSource: string = 'local'
  ) => {
    if (!studentId) return;

    try {
      const cacheKey = `${studentId}-misconception-${misconceptionCode}`;
      
      await supabase
        .from('bootcamp_explanation_cache')
        .upsert({
          cache_key: cacheKey,
          explanation,
          api_source: apiSource,
          usage_count: 1,
          created_at: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error caching explanation:', error);
    }
  }, [studentId]);

  // Get explanation from cache
  const getFromCache = useCallback(async (misconceptionCode: string): Promise<string | null> => {
    if (!studentId) return null;

    try {
      const cacheKey = `${studentId}-misconception-${misconceptionCode}`;
      
      const { data, error } = await supabase
        .from('bootcamp_explanation_cache')
        .select('explanation, usage_count')
        .eq('cache_key', cacheKey)
        .maybeSingle();

      if (error || !data) return null;

      // Update usage stats
      await supabase
        .from('bootcamp_explanation_cache')
        .update({ 
          usage_count: data.usage_count + 1,
          last_accessed: new Date().toISOString()
        })
        .eq('cache_key', cacheKey);

      return data.explanation;
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  }, [studentId]);

  // Clear old cache entries (cleanup)
  const clearOldCache = useCallback(async (daysOld: number = 30) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      await supabase
        .from('bootcamp_explanation_cache')
        .delete()
        .lt('last_accessed', cutoffDate.toISOString())
        .eq('cache_key', `${studentId}-%`); // Only clear this student's cache
    } catch (error) {
      console.error('Error clearing old cache:', error);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      loadMisconceptionsWithCache();
    }
  }, [loadMisconceptionsWithCache, studentId]);

  return {
    cachedMisconceptions,
    isLoading,
    cacheHitRate,
    loadMisconceptionsWithCache,
    cacheExplanation,
    getFromCache,
    clearOldCache
  };
};