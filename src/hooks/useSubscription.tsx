import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

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
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    } else {
      setSubscriptions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = async (featureType: 'daily_mode' | 'bootcamp') => {
    if (!user) return false;

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
  };

  const getActiveSubscription = () => {
    return subscriptions.find(sub => 
      sub.status === 'active' || 
      (sub.status === 'trial' && sub.trial_end_date && new Date(sub.trial_end_date) > new Date())
    );
  };

  const isTrialActive = () => {
    const activeSub = getActiveSubscription();
    return activeSub?.is_trial && activeSub.trial_end_date && new Date(activeSub.trial_end_date) > new Date();
  };

  const getTrialDaysRemaining = () => {
    const activeSub = getActiveSubscription();
    if (!activeSub?.is_trial || !activeSub.trial_end_date) return 0;
    
    const endDate = new Date(activeSub.trial_end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return {
    subscriptions,
    loading,
    hasAccess,
    getActiveSubscription,
    isTrialActive,
    getTrialDaysRemaining,
    refetch: fetchSubscriptions
  };
};