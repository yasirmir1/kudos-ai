import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserState = 'trial' | 'pass' | 'pass_plus' | 'expired' | 'no_access';

interface StripeSubscriber {
  id: string;
  user_id: string;
  email: string;
  stripe_customer_id: string | null;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  updated_at: string;
  created_at: string;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  is_trial: boolean;
  trial_end_date: string | null;
  subscription_end_date: string | null;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriber, setSubscriber] = useState<StripeSubscriber | null>(null);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [userState, setUserState] = useState<UserState>('no_access');
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [isTrialActive, setIsTrialActive] = useState(false);

  useEffect(() => {
    if (user) {
      // Defer subscription data loading to prevent deadlocks
      setTimeout(() => {
        loadSubscriptionData();
      }, 100);
    } else {
      // Only reset state if we're truly logged out
      const timeoutId = setTimeout(() => {
        if (!user) {
          setUserState('no_access');
          setIsTrialActive(false);
          setTrialDaysRemaining(0);
          setSubscriber(null);
          setSubscriptions([]);
          setLoading(false);
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [user]);

  const loadSubscriptionData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Check for exemptions first (cached for 5 minutes)
      const { data: exemptionsData } = await supabase
        .from('subscription_exemptions')
        .select('*')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .eq('is_active', true);

      const activeExemption = exemptionsData?.find(exemption => 
        exemption.is_active && 
        (!exemption.expires_at || new Date(exemption.expires_at) > new Date())
      );
      
      if (activeExemption) {
        setUserState('pass_plus');
        setIsTrialActive(false);
        setTrialDaysRemaining(0);
        return;
      }

      // Check Stripe subscription status
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (!stripeError && stripeData) {
        if (stripeData.subscribed) {
          setIsTrialActive(false);
          setTrialDaysRemaining(0);
          
          if (stripeData.subscription_tier === 'Pass') {
            setUserState('pass');
          } else if (stripeData.subscription_tier === 'Pass Plus') {
            setUserState('pass_plus');
          } else {
            setUserState('pass');
          }
          
          // Update subscriber state
          setSubscriber({
            id: '',
            user_id: user.id,
            email: user.email || '',
            stripe_customer_id: stripeData.stripe_customer_id || null,
            subscribed: true,
            subscription_tier: stripeData.subscription_tier,
            subscription_end: stripeData.subscription_end,
            updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          });
          return;
        } else if (stripeData.trial_end_date) {
          const trialEndDate = new Date(stripeData.trial_end_date);
          const now = new Date();
          
          if (trialEndDate > now) {
            const diffTime = trialEndDate.getTime() - now.getTime();
            const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            setTrialDaysRemaining(daysLeft);
            setIsTrialActive(true);
            setUserState('trial');
            return;
          } else {
            setUserState('expired');
            setIsTrialActive(false);
            setTrialDaysRemaining(0);
            return;
          }
        }
      }

      // Fetch trial subscriptions from user_subscriptions table
      const { data: trialData, error: trialError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id);

      if (!trialError && trialData) {
        setSubscriptions(trialData);
        
        // Check for active local trial
        const activeTrial = trialData.find(sub => 
          sub.status === 'trial' && 
          sub.trial_end_date && 
          new Date(sub.trial_end_date) > new Date()
        );
        
        if (activeTrial) {
          const trialEndDate = new Date(activeTrial.trial_end_date);
          const now = new Date();
          const diffTime = trialEndDate.getTime() - now.getTime();
          const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          
          setTrialDaysRemaining(daysLeft);
          setIsTrialActive(true);
          setUserState('trial');
          return;
        }
      }

      // No subscription or trial found
      setUserState('no_access');
      setIsTrialActive(false);
      setTrialDaysRemaining(0);

    } catch (error) {
      console.error('Error loading subscription data:', error);
      setUserState('no_access');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Memoized feature access checking logic for performance
  const hasAccessTo = useCallback((feature: 'daily_mode' | 'bootcamp'): boolean => {
    switch (userState) {
      case 'trial':
        return true;
      case 'pass':
        return feature === 'daily_mode';
      case 'pass_plus':
        return true;
      case 'expired':
      case 'no_access':
        return false;
      default:
        return false;
    }
  }, [userState]);

  // Enhanced hasAccess function with caching for backward compatibility
  const hasAccess = useCallback(async (featureType: 'daily_mode' | 'bootcamp') => {
    if (!user) return false;
    return hasAccessTo(featureType);
  }, [user, hasAccessTo]);

  const isTrialExpired = useCallback((): boolean => {
    return userState === 'expired';
  }, [userState]);

  // Optimized Stripe-based trial starter with error handling
  const startTrial = useCallback(async (planId: string = 'pass_plus'): Promise<{ success: boolean; message: string; url?: string }> => {
    if (!user) {
      return { success: false, message: 'User must be authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planId: planId + '_monthly',
          trial: true 
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        return { success: true, message: 'Redirecting to Stripe for trial setup...', url: data.url };
      }
      
      return { success: false, message: 'Failed to create trial checkout session' };
    } catch (error) {
      console.error('Error starting trial:', error);
      return { success: false, message: 'Failed to start trial' };
    }
  }, [user]);

  // Optimized local trial starter for backward compatibility
  const startLocalTrial = useCallback(async (planId: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { data, error } = await supabase.rpc('start_trial', {
        plan_id_param: planId
      });

      if (error) throw error;
      
      await loadSubscriptionData();
      return data;
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  }, [user, loadSubscriptionData]);

  const createCheckoutSession = useCallback(async (planId: string): Promise<{ url?: string; error?: string }> => {
    if (!user) {
      return { error: 'User must be authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { error: 'Failed to create checkout session' };
    }
  }, [user]);

  const openCustomerPortal = useCallback(async (): Promise<{ url?: string; error?: string }> => {
    if (!user) {
      return { error: 'User must be authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      return { error: 'Failed to open customer portal' };
    }
  }, [user]);

  const getBillingHistory = useCallback(async (): Promise<{ invoices?: any[]; payments?: any[]; error?: string }> => {
    if (!user) {
      return { error: 'User must be authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('get-billing-history');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching billing history:', error);
      return { error: 'Failed to fetch billing history' };
    }
  }, [user]);

  // Memoized legacy compatibility methods
  const hasActiveStripeSubscription = useMemo(() => {
    return subscriber?.subscribed === true;
  }, [subscriber?.subscribed]);

  const getActiveTrialSubscription = useMemo(() => {
    return subscriptions.find(sub => 
      sub.status === 'trial' && 
      sub.trial_end_date && 
      new Date(sub.trial_end_date) > new Date()
    );
  }, [subscriptions]);

  const hasActiveSubscription = useMemo(() => {
    return hasActiveStripeSubscription || !!getActiveTrialSubscription || userState !== 'no_access';
  }, [hasActiveStripeSubscription, getActiveTrialSubscription, userState]);

  const getSubscriptionTier = useMemo(() => {
    if (hasActiveStripeSubscription) {
      return subscriber?.subscription_tier || null;
    }
    
    if (getActiveTrialSubscription) {
      return getActiveTrialSubscription.plan_id === 'pass' ? 'Pass' : 'Pass Plus';
    }
    
    switch (userState) {
      case 'pass':
        return 'Pass';
      case 'pass_plus':
        return 'Pass Plus';
      case 'trial':
        return 'Trial';
      default:
        return null;
    }
  }, [hasActiveStripeSubscription, subscriber?.subscription_tier, getActiveTrialSubscription, userState]);

  const getSubscriptionEndDate = useMemo(() => {
    if (hasActiveStripeSubscription) {
      return subscriber?.subscription_end ? new Date(subscriber.subscription_end) : null;
    }
    
    if (getActiveTrialSubscription?.trial_end_date) {
      return new Date(getActiveTrialSubscription.trial_end_date);
    }
    
    return null;
  }, [hasActiveStripeSubscription, subscriber?.subscription_end, getActiveTrialSubscription]);

  const getTrialDaysRemaining = useCallback(() => {
    return trialDaysRemaining;
  }, [trialDaysRemaining]);

  const hasUsedTrial = useCallback((planId: string) => {
    return subscriptions.some(sub => sub.plan_id === planId && sub.is_trial);
  }, [subscriptions]);

  const refetch = useCallback(async () => {
    await loadSubscriptionData();
  }, [loadSubscriptionData]);

  return {
    // Original useSubscription exports
    subscriber,
    subscriptions,
    hasActiveSubscription,
    hasActiveStripeSubscription,
    isTrialActive,
    getSubscriptionTier,
    getSubscriptionEndDate,
    getTrialDaysRemaining,
    hasUsedTrial,
    createCheckoutSession,
    openCustomerPortal,
    startLocalTrial, // Local trial for backward compatibility
    hasAccess,
    refetch,
    
    // Original useSubscriptionState exports
    userState,
    loading,
    isTrialExpired: isTrialExpired(),
    trialDaysRemaining,
    hasAccessTo,
    startTrial, // Stripe trial (primary)
    getBillingHistory
  };
};