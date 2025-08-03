import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onError?: (error: Error, attempt: number) => void;
}

export const useRetry = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const executeWithRetry = useCallback(
    async <T,>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
      const {
        maxAttempts = 3,
        delay = 1000,
        backoff = true,
        onError
      } = options;

      setIsRetrying(true);
      setAttempts(0);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          setAttempts(attempt);
          const result = await fn();
          setIsRetrying(false);
          setAttempts(0);
          return result;
        } catch (error) {
          const err = error as Error;
          
          if (onError) {
            onError(err, attempt);
          }

          if (attempt === maxAttempts) {
            setIsRetrying(false);
            setAttempts(0);
            throw err;
          }

          // Wait before next attempt
          const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      setIsRetrying(false);
      setAttempts(0);
      throw new Error('Max retry attempts reached');
    },
    []
  );

  const reset = useCallback(() => {
    setIsRetrying(false);
    setAttempts(0);
  }, []);

  return {
    executeWithRetry,
    isRetrying,
    attempts,
    reset
  };
};

export default useRetry;