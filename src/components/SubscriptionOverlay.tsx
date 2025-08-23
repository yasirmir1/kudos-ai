import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSubscriptionState } from '@/hooks/useSubscriptionState';
import { useTrialModal } from '@/contexts/TrialModalContext';
import { Clock, Crown, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionOverlayProps {
  children: React.ReactNode;
  requiredFeature: 'daily_mode' | 'bootcamp';
}

export const SubscriptionOverlay: React.FC<SubscriptionOverlayProps> = ({
  children,
  requiredFeature
}) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const {
    userState,
    loading,
    hasAccessTo,
    isTrialActive,
    trialDaysRemaining,
    createCheckoutSession
  } = useSubscriptionState();
  const { openTrialModal } = useTrialModal();

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

  const handleStartTrial = () => {
    openTrialModal({
      planId: requiredFeature === 'bootcamp' ? 'pass_plus' : 'pass',
      requiredFeature,
      mode: 'signup'
    });
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

  // If user doesn't have access, show grayed out content with simple upgrade prompt
  if (!hasAccessTo(requiredFeature)) {
    return (
      <div className="relative">
        {/* Grayed out content */}
        <div className="filter grayscale opacity-50 pointer-events-none select-none">
          {children}
        </div>
        
        {/* Simple upgrade prompt that opens modal */}
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/10">
          <div className="bg-card rounded-2xl border border-primary shadow-lg p-8 max-w-sm text-center">
            <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {requiredFeature === 'bootcamp' ? 'Bootcamp Access Required' : 'Premium Access Required'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {userState === 'expired' 
                ? 'Your trial has expired. Subscribe to continue.' 
                : userState === 'pass' && requiredFeature === 'bootcamp'
                ? 'Upgrade to Pass Plus for full bootcamp access.'
                : 'Start your free trial to unlock this feature.'}
            </p>
            
            {userState === 'no_access' && (
              <Button onClick={handleStartTrial} className="w-full mb-3" size="lg">
                Start Free Trial
              </Button>
            )}
            
            {userState === 'expired' && (
              <Button onClick={() => openTrialModal({ planId: requiredFeature === 'bootcamp' ? 'pass_plus' : 'pass', requiredFeature, mode: 'upgrade' })} className="w-full mb-3" size="lg">
                Subscribe Now
              </Button>
            )}
            
            {(userState === 'trial' || userState === 'pass') && requiredFeature === 'bootcamp' && (
              <Button onClick={() => openTrialModal({ planId: 'pass_plus', requiredFeature, mode: 'upgrade' })} className="w-full mb-3" size="lg">
                Upgrade to Pass Plus
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User has access, render children normally
  return <>{children}</>;
};