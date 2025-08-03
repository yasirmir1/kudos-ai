import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

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

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscriber, setSubscriber] = useState<StripeSubscriber | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    } else {
      setSubscriber(null);
      setLoading(false);
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    try {
      // Call our check-subscription edge function
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;

      // Also fetch the subscriber record from the database
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscriberError && subscriberError.code !== 'PGRST116') {
        throw subscriberError;
      }

      setSubscriber(subscriberData);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (planId: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  const hasActiveSubscription = () => {
    return subscriber?.subscribed === true;
  };

  const getSubscriptionTier = () => {
    return subscriber?.subscription_tier || null;
  };

  const getSubscriptionEndDate = () => {
    return subscriber?.subscription_end ? new Date(subscriber.subscription_end) : null;
  };

  // Legacy compatibility methods for existing components
  const hasAccess = async (featureType: 'daily_mode' | 'bootcamp') => {
    return hasActiveSubscription();
  };

  const isTrialActive = () => {
    return false; // No trial support in Stripe implementation
  };

  const getTrialDaysRemaining = () => {
    return 0; // No trial support in Stripe implementation
  };

  return {
    subscriber,
    loading,
    hasActiveSubscription,
    getSubscriptionTier,
    getSubscriptionEndDate,
    createCheckoutSession,
    openCustomerPortal,
    refetch: checkSubscriptionStatus,
    // Legacy compatibility
    hasAccess,
    isTrialActive,
    getTrialDaysRemaining
  };
};