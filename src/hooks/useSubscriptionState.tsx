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
      // Defer subscription data loading to prevent deadlocks
      setTimeout(() => {
        loadSubscriptionData();
      }, 100);
    } else {
      // Only reset state if we're truly logged out (not just a temporary state change)
      const timeoutId = setTimeout(() => {
        if (!user) {
          setUserState('no_access');
          setIsTrialActive(false);
          setTrialDaysRemaining(0);
          setLoading(false);
        }
      }, 500); // Increased delay to prevent premature resets during navigation
      
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

      // Only check Stripe subscription status via edge function
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (!stripeError && stripeData) {
        if (stripeData.subscribed) {
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
        } else if (stripeData.trial_end_date) {
          // User has a Stripe trial
          const trialEndDate = new Date(stripeData.trial_end_date);
          const now = new Date();
          
          if (trialEndDate > now) {
            // Active trial
            const diffTime = trialEndDate.getTime() - now.getTime();
            const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            setTrialDaysRemaining(daysLeft);
            setIsTrialActive(true);
            setUserState('trial');
            return;
          } else {
            // Expired trial
            setUserState('expired');
            setIsTrialActive(false);
            setTrialDaysRemaining(0);
            return;
          }
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
      // Start Stripe trial instead of local trial
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          planId: planId + '_monthly', // Default to monthly for trials
          trial: true 
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        // Open Stripe checkout for trial signup
        window.open(data.url, '_blank');
        return { success: true, message: 'Redirecting to Stripe for trial setup...' };
      }
      
      return { success: false, message: 'Failed to create trial checkout session' };
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

  const getBillingHistory = async (): Promise<{ invoices?: any[]; payments?: any[]; error?: string }> => {
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
    getBillingHistory,
    refetch: loadSubscriptionData
  };
};