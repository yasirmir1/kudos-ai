import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type UserState = 'trial' | 'pass' | 'pass_plus' | 'expired' | 'no_access';

export const useSubscriptionState = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userState, setUserState] = useState<UserState>('no_access');
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [isTrialActive, setIsTrialActive] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    } else {
      // Only reset state if we're truly logged out (not just a temporary state change)
      const timeoutId = setTimeout(() => {
        if (!user) {
          setUserState('no_access');
          setIsTrialActive(false);
          setTrialDaysRemaining(0);
          setLoading(false);
        }
      }, 100); // Small delay to prevent state reset during navigation
      
      return () => clearTimeout(timeoutId);
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Check for exemptions first
      const { data: exemptionsData } = await supabase
        .from('subscription_exemptions')
        .select('*')
        .or(`user_id.eq.${user.id},email.eq.${user.email}`)
        .eq('is_active', true);

      // Check for active exemption
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

      // First check Stripe subscription status via edge function
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('check-subscription');
      
      if (!stripeError && stripeData?.subscribed) {
        // User has active Stripe subscription
        setIsTrialActive(false);
        setTrialDaysRemaining(0);
        
        if (stripeData.subscription_tier === 'Pass') {
          setUserState('pass');
        } else if (stripeData.subscription_tier === 'Pass Plus') {
          setUserState('pass_plus');
        } else {
          setUserState('pass'); // Default to pass for any Stripe subscription
        }
        return;
      }

      // If no Stripe subscription, check local trial subscriptions
      const { data: subscriptionsData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!subscriptionsData || subscriptionsData.length === 0) {
        setUserState('no_access');
        setIsTrialActive(false);
        setTrialDaysRemaining(0);
        return;
      }

      // Find active trial subscription
      const now = new Date();
      const activeTrialSubscription = subscriptionsData.find(sub => 
        sub.is_trial && 
        sub.trial_end_date && 
        new Date(sub.trial_end_date) > now
      );

      if (activeTrialSubscription) {
        // Active trial found
        const endDate = new Date(activeTrialSubscription.trial_end_date);
        const diffTime = endDate.getTime() - now.getTime();
        const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        setTrialDaysRemaining(daysLeft);
        setIsTrialActive(true);
        setUserState('trial');
        return;
      }

      // Check if user has expired trial
      const expiredTrial = subscriptionsData.find(sub => 
        sub.is_trial && 
        sub.trial_end_date && 
        new Date(sub.trial_end_date) <= now
      );
      
      setUserState(expiredTrial ? 'expired' : 'no_access');
      setIsTrialActive(false);
      setTrialDaysRemaining(0);

    } catch (error) {
      console.error('Error loading subscription data:', error);
      setUserState('no_access');
    } finally {
      setLoading(false);
    }
  };

  const hasAccessTo = (feature: 'daily_mode' | 'bootcamp'): boolean => {
    switch (userState) {
      case 'trial':
        return true; // Trial has access to everything
      case 'pass':
        return feature === 'daily_mode';
      case 'pass_plus':
        return true; // Pass Plus has access to everything
      case 'expired':
      case 'no_access':
        return false;
      default:
        return false;
    }
  };

  const isTrialExpired = (): boolean => {
    return userState === 'expired';
  };

  const startTrial = async (planId: string = 'pass_plus'): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'User must be authenticated' };
    }

    try {
      const { data, error } = await supabase.rpc('start_trial', {
        plan_id_param: planId
      });

      if (error) throw error;
      
      await loadSubscriptionData(); // Refresh data
      return { success: true, message: 'Trial started successfully' };
    } catch (error) {
      console.error('Error starting trial:', error);
      return { success: false, message: 'Failed to start trial' };
    }
  };

  const createCheckoutSession = async (planId: string): Promise<{ url?: string; error?: string }> => {
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
  };

  const openCustomerPortal = async (): Promise<{ url?: string; error?: string }> => {
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
  };

  return {
    // State
    userState,
    loading,
    
    // Computed values
    isTrialActive,
    isTrialExpired: isTrialExpired(),
    trialDaysRemaining,
    
    // Access checks
    hasAccessTo,
    
    // Actions
    startTrial,
    createCheckoutSession,
    openCustomerPortal,
    refetch: loadSubscriptionData
  };
};