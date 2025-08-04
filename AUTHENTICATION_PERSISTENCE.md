# Authentication & Session Persistence Guide

## Overview
This document outlines the enhanced authentication system that ensures user sessions and states persist correctly across pages and components.

## Key Improvements Made

### 1. Enhanced Auth Hook (`src/hooks/useAuth.tsx`)
- **Robust Session Management**: Proper handling of both user and session objects
- **Auth State Cleanup**: Automatic cleanup of stale authentication data
- **Error Handling**: Comprehensive error handling for all auth operations
- **Session Persistence**: Proper initialization order to prevent auth state loss

### 2. Session Persistence Utilities (`src/hooks/useSessionPersistence.tsx`)
- **Cross-Component State**: Helper hook for consistent auth state across components
- **Safe Navigation**: Utility functions for auth-aware navigation
- **State Validation**: Methods to safely check authentication status

### 3. Global Session Tracking (`src/App.tsx`)
- **DOM Attributes**: Global tracking via `data-user-authenticated` attributes
- **State Synchronization**: Real-time updates of authentication status
- **Component Isolation**: Session tracker component for clean separation

### 4. Enhanced Subscription State (`src/hooks/useSubscriptionState.tsx`)
- **Delayed Loading**: Prevents auth deadlocks with deferred data loading
- **Improved Persistence**: Longer delays to prevent premature state resets
- **Error Recovery**: Better handling of subscription state errors

## Authentication Flow

### Sign In Process
1. **Cleanup**: Remove any existing auth tokens
2. **Global Signout**: Attempt to clear any existing sessions
3. **Authentication**: Sign in with credentials
4. **Redirect**: Force page reload to ensure clean state

### Sign Out Process
1. **State Cleanup**: Clear all auth-related localStorage/sessionStorage
2. **Global Signout**: Sign out from Supabase with global scope
3. **Redirect**: Force navigation to auth page with clean state

### Session Persistence
1. **Initialization**: Check existing session before setting up listeners
2. **State Tracking**: Monitor auth changes via `onAuthStateChange`
3. **Global Attributes**: Update DOM attributes for cross-component access
4. **Error Recovery**: Handle session errors gracefully

## Usage Examples

### Using Enhanced Auth Hook
```typescript
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, session, loading, signOut } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <SignInPrompt />;
  
  return <AuthenticatedContent user={user} />;
};
```

### Using Session Persistence Hook
```typescript
import { useSessionPersistence } from '@/hooks/useSessionPersistence';

const MyComponent = () => {
  const { 
    isAuthenticated, 
    shouldShowLoading, 
    getUserData 
  } = useSessionPersistence();
  
  if (shouldShowLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <SignInRequired />;
  
  const userData = getUserData();
  return <UserDashboard data={userData} />;
};
```

### Safe Navigation
```typescript
import { navigateWithAuth } from '@/hooks/useSessionPersistence';

// Navigate with auth check
navigateWithAuth('/dashboard', true); // Requires auth
navigateWithAuth('/pricing', false);  // No auth required
```

## Best Practices

### 1. Component Design
- Always check `loading` state before rendering auth-dependent content
- Use the session persistence hook for components that need reliable auth state
- Handle auth errors gracefully with fallback UI

### 2. Navigation
- Use `navigateWithAuth` for programmatic navigation
- Force page reloads after auth state changes for clean state
- Always redirect to appropriate pages after auth operations

### 3. State Management
- Never rely on just the `user` object - always check `session` too
- Use the global DOM attributes for cross-component auth checks
- Handle auth state changes with proper cleanup

## Troubleshooting

### Session Not Persisting
1. Check browser localStorage for `supabase.auth.*` keys
2. Verify Supabase client configuration includes persistence settings
3. Check for multiple project conflicts in localStorage

### Auth State Resets
1. Ensure proper initialization order in auth provider
2. Check for premature state resets during navigation
3. Verify session persistence hook is used correctly

### Token Errors
1. Clear all auth-related localStorage/sessionStorage
2. Force global signout and signin
3. Check for expired or invalid tokens

## Technical Details

### Supabase Client Configuration
```typescript
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,      // Persistent storage
    persistSession: true,       // Enable session persistence
    autoRefreshToken: true,     // Auto-refresh tokens
  }
});
```

### Auth State Cleanup Function
```typescript
export const cleanupAuthState = () => {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Also clean sessionStorage if used
};
```

This system ensures reliable authentication persistence across all pages and components, preventing session loss and auth state inconsistencies.