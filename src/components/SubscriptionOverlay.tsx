import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSubscription } from '@/hooks/useSubscription';
import { useTrialModal } from '@/contexts/TrialModalContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Crown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useSubscriptionOverlay } from '@/contexts/SubscriptionOverlayContext';

interface SubscriptionOverlayProps {
  children: React.ReactNode;
  requiredFeature: 'daily_mode' | 'bootcamp';
}

export const SubscriptionOverlay: React.FC<SubscriptionOverlayProps> = ({
  children,
  requiredFeature
}) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [trialEligible, setTrialEligible] = useState<boolean | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const { user } = useAuth();
  const {
    userState,
    loading,
    hasAccessTo,
    isTrialActive,
    trialDaysRemaining,
    createCheckoutSession,
    startTrial
  } = useSubscription();
  const { openTrialModal } = useTrialModal();
  const { setIsOverlayActive } = useSubscriptionOverlay();

  // Check trial eligibility when component mounts for authenticated users
  useEffect(() => {
    const checkTrialEligibility = async () => {
      if (!user?.email || userState !== 'no_access') return;
      
      setCheckingEligibility(true);
      try {
        const { data, error } = await supabase.functions.invoke('check-trial-eligibility', {
          body: { email: user.email }
        });
        
        if (error) {
          console.error('Error checking trial eligibility:', error);
          setTrialEligible(true); // Default to eligible if check fails
        } else {
          setTrialEligible(data?.eligible ?? true);
        }
      } catch (error) {
        console.error('Error checking trial eligibility:', error);
        setTrialEligible(true); // Default to eligible if check fails
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkTrialEligibility();
  }, [user?.email, userState]);

  const handleSubscribeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const planId = requiredFeature === 'bootcamp' 
        ? isAnnual ? 'pass_plus_annual' : 'pass_plus_monthly' 
        : isAnnual ? 'pass_annual' : 'pass_monthly';
      
      const { url, error } = await createCheckoutSession(planId);
      if (error) {
        toast.error('Failed to start checkout process. Please try again.');
        return;
      }
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleStartTrial = async () => {
    try {
      const planId = requiredFeature === 'bootcamp' ? 'pass_plus' : 'pass';
      
      if (user) {
        // User is logged in - use the existing startTrial method
        const result = await startTrial(planId);
        if (!result.success) {
          toast.error(result.message);
        }
      } else {
        // User not logged in - call create-checkout directly for trial
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { 
            planId: planId + '_monthly',
            trial: true,
            unauthenticated: true
          }
        });

        if (error) {
          toast.error('Failed to start trial. Please try again.');
          return;
        }
        
        if (data?.url) {
          window.open(data.url, '_blank');
        }
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show trial warning for trials ending soon
  if (isTrialActive && trialDaysRemaining <= 3 && trialDaysRemaining > 0) {
    return (
      <div className="relative">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-l-4 border-amber-400 p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Trial ending soon
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Your free trial expires in {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'}. 
                  Add a payment method to continue without interruption.
                </p>
              </div>
            </div>
            <Button onClick={handleSubscribeClick} size="sm" className="ml-4 flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white">
              <Crown className="mr-1 h-4 w-4" />
              Subscribe
            </Button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // If user doesn't have access, show grayed out content with conditional upgrade prompt
  if (!hasAccessTo(requiredFeature)) {
    // Set overlay as active when blocking access
    setIsOverlayActive(true);
    // Show loading while checking eligibility
    if (checkingEligibility) {
      return (
        <div className="relative">
          {/* Content blocked except navbar when no access */}
          <div className="relative">
            {children}
            {/* Invisible overlay blocking content interaction below navbars */}
            <div className="fixed top-40 left-0 right-0 bottom-0 z-20 pointer-events-auto" />
          </div>
          
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-card rounded-2xl border border-primary shadow-lg p-8 max-w-sm text-center animate-scale-in pointer-events-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Checking eligibility...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        {/* Content blocked except navbar when no access */}
        <div className="relative">
          {children}
          {/* Invisible overlay blocking content interaction below navbars */}
          <div className="fixed top-40 left-0 right-0 bottom-0 z-20 pointer-events-auto" />
        </div>
        
        {/* Conditional upgrade prompt based on trial eligibility */}
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-card rounded-2xl border border-primary shadow-lg p-8 max-w-sm text-center animate-scale-in pointer-events-auto">
            <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
            
            {/* Conditional content based on trial eligibility and user state */}
            {userState === 'no_access' && trialEligible && (
              <>
                <h3 className="text-xl font-bold mb-2">Start Your Free Trial</h3>
                <p className="text-muted-foreground mb-6">
                  Get instant access to all premium features with a 7-day free trial.
                </p>
                <Button onClick={handleStartTrial} className="w-full mb-3" size="lg">
                  Start 7-Day Free Trial
                </Button>
                <p className="text-xs text-muted-foreground">
                  No credit card required • Cancel anytime
                </p>
              </>
            )}
            
            {userState === 'no_access' && trialEligible === false && (
              <>
                <h3 className="text-xl font-bold mb-2">Trial Already Used</h3>
                <p className="text-muted-foreground mb-6">
                  You've already used your free trial. Subscribe to continue accessing premium features.
                </p>
                <Button onClick={() => openTrialModal({ 
                  planId: requiredFeature === 'bootcamp' ? 'pass_plus' : 'pass', 
                  requiredFeature, 
                  mode: 'upgrade' 
                })} className="w-full mb-3" size="lg">
                  Subscribe Now
                </Button>
              </>
            )}
            
            {userState === 'expired' && (
              <>
                <h3 className="text-xl font-bold mb-2">Trial Expired</h3>
                <p className="text-muted-foreground mb-6">
                  Your 7-day free trial has ended. Subscribe to continue using premium features.
                </p>
                <Button onClick={() => openTrialModal({ 
                  planId: requiredFeature === 'bootcamp' ? 'pass_plus' : 'pass', 
                  requiredFeature, 
                  mode: 'upgrade' 
                })} className="w-full mb-3" size="lg">
                  Subscribe Now
                </Button>
              </>
            )}
            
            {(userState === 'trial' || userState === 'pass') && requiredFeature === 'bootcamp' && (
              <>
                <h3 className="text-xl font-bold mb-2">Upgrade Required</h3>
                <p className="text-muted-foreground mb-6">
                  This bootcamp feature requires Pass Plus. Upgrade to unlock the full learning experience.
                </p>
                <Button onClick={() => openTrialModal({ 
                  planId: 'pass_plus', 
                  requiredFeature, 
                  mode: 'upgrade' 
                })} className="w-full mb-3" size="lg">
                  Upgrade to Pass Plus
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User has access, render children normally
  // Clear overlay state when user has access
  setIsOverlayActive(false);
  return <>{children}</>;
};