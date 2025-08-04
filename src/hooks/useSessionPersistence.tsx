import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

// Custom hook to manage session persistence and prevent state loss
export const useSessionPersistence = () => {
  const { user, session, loading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Mark as initialized once we have a definitive auth state
    if (!loading) {
      setIsInitialized(true);
    }
  }, [loading]);

  // Helper to check if user is authenticated and session is valid
  const isAuthenticated = () => {
    return !!(user && session && !loading);
  };

  // Helper to check if we should show loading state
  const shouldShowLoading = () => {
    return loading || !isInitialized;
  };

  // Helper to get user data safely
  const getUserData = () => {
    if (!isAuthenticated()) return null;
    return {
      id: user!.id,
      email: user!.email,
      metadata: user!.user_metadata,
      sessionToken: session!.access_token
    };
  };

  return {
    user,
    session,
    loading,
    isInitialized,
    isAuthenticated: isAuthenticated(),
    shouldShowLoading: shouldShowLoading(),
    getUserData
  };
};

// Utility function to safely navigate with session check
export const navigateWithAuth = (path: string, requireAuth = true) => {
  const currentUser = document.querySelector('[data-user-authenticated]');
  const isAuthenticated = currentUser?.getAttribute('data-user-authenticated') === 'true';
  
  if (requireAuth && !isAuthenticated) {
    window.location.href = '/auth';
    return;
  }
  
  window.location.href = path;
};