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

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
      fetchTrialSubscriptions();
    } else {
      setSubscriber(null);
      setSubscriptions([]);
      setLoading(false);
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user) return;

    try {
      // Call our check-subscription edge function for Stripe subscriptions
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
    }
  };

  const fetchTrialSubscriptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching trial subscriptions:', error);
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

  const startTrial = async (planId: string) => {
    if (!user) throw new Error('User must be authenticated');

    try {
      const { data, error } = await supabase.rpc('start_trial', {
        plan_id_param: planId
      });

      if (error) throw error;
      
      // Refresh trial subscriptions after starting trial
      await fetchTrialSubscriptions();
      return data;
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  };

  // Check if user has active Stripe subscription
  const hasActiveStripeSubscription = () => {
    return subscriber?.subscribed === true;
  };

  // Check if user has active trial
  const getActiveTrialSubscription = () => {
    return subscriptions.find(sub => 
      sub.status === 'trial' && 
      sub.trial_end_date && 
      new Date(sub.trial_end_date) > new Date()
    );
  };

  // Check if user has any active subscription (trial or paid)
  const hasActiveSubscription = () => {
    return hasActiveStripeSubscription() || !!getActiveTrialSubscription();
  };

  // Get the subscription tier (from Stripe or trial)
  const getSubscriptionTier = () => {
    if (hasActiveStripeSubscription()) {
      return subscriber?.subscription_tier || null;
    }
    
    const activeTrial = getActiveTrialSubscription();
    if (activeTrial) {
      return activeTrial.plan_id === 'pass' ? 'Pass' : 'Pass Plus';
    }
    
    return null;
  };

  const getSubscriptionEndDate = () => {
    if (hasActiveStripeSubscription()) {
      return subscriber?.subscription_end ? new Date(subscriber.subscription_end) : null;
    }
    
    const activeTrial = getActiveTrialSubscription();
    if (activeTrial?.trial_end_date) {
      return new Date(activeTrial.trial_end_date);
    }
    
    return null;
  };

  // Trial-specific methods
  const isTrialActive = () => {
    return !!getActiveTrialSubscription();
  };

  const getTrialDaysRemaining = () => {
    const activeTrial = getActiveTrialSubscription();
    if (!activeTrial?.trial_end_date) return 0;
    
    const endDate = new Date(activeTrial.trial_end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const hasUsedTrial = (planId: string) => {
    return subscriptions.some(sub => sub.plan_id === planId && sub.is_trial);
  };

  // Feature access checking
  const hasAccess = async (featureType: 'daily_mode' | 'bootcamp') => {
    if (!user) return false;

    // Check if user has active subscription (trial or paid)
    if (hasActiveSubscription()) {
      // For trials, allow access to both features during trial period
      if (isTrialActive()) {
        return true; // Trial users get access to all features
      }
      
      // For paid subscriptions, check via existing RPC
      try {
        const { data, error } = await supabase.rpc('user_has_feature_access', {
          feature_type: featureType
        });
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error checking feature access:', error);
        return false;
      }
    }

    return false;
  };

  const refetch = async () => {
    await Promise.all([
      checkSubscriptionStatus(),
      fetchTrialSubscriptions()
    ]);
  };

  return {
    subscriber,
    subscriptions,
    loading,
    hasActiveSubscription,
    hasActiveStripeSubscription,
    isTrialActive,
    getSubscriptionTier,
    getSubscriptionEndDate,
    getTrialDaysRemaining,
    hasUsedTrial,
    createCheckoutSession,
    openCustomerPortal,
    startTrial,
    hasAccess,
    refetch
  };
};