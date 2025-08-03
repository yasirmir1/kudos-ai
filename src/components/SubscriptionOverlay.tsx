import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSubscriptionState } from '@/hooks/useSubscriptionState';
import { usePricingModal } from '@/contexts/PricingModalContext';
import { Clock, Crown } from 'lucide-react';

interface SubscriptionOverlayProps {
  children: React.ReactNode;
  requiredFeature: 'daily_mode' | 'bootcamp';
}

export const SubscriptionOverlay: React.FC<SubscriptionOverlayProps> = ({ 
  children, 
  requiredFeature 
}) => {
  const { 
    userState, 
    loading, 
    hasAccessTo, 
    isTrialActive, 
    trialDaysRemaining
  } = useSubscriptionState();

  const { openPricingModal } = usePricingModal();

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
                  Upgrade now to continue without interruption.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => openPricingModal({ 
                requiredFeature,
                highlightPlan: requiredFeature === 'bootcamp' ? 'pass_plus' : 'pass'
              })}
              size="sm"
              className="ml-4 flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Crown className="mr-1 h-4 w-4" />
              Upgrade
            </Button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // If user doesn't have access, show grayed out content with click overlay
  if (!hasAccessTo(requiredFeature)) {
    return (
      <div className="relative">
        {/* Grayed out content */}
        <div className="filter grayscale opacity-50 pointer-events-none select-none">
          {children}
        </div>
        
        {/* Invisible overlay to capture clicks */}
        <div 
          className="absolute inset-0 z-50 cursor-pointer bg-transparent"
          onClick={() => openPricingModal({ 
            requiredFeature,
            highlightPlan: requiredFeature === 'bootcamp' ? 'pass_plus' : 'pass'
          })}
        >
          {/* Optional: Add some visual indicators */}
          <div className="absolute top-4 right-4">
            <Badge 
              variant="secondary" 
              className="bg-primary/90 text-primary-foreground shadow-lg animate-pulse"
            >
              <Crown className="h-3 w-3 mr-1" />
              {userState === 'expired' 
                ? 'Trial Expired - Click to Upgrade' 
                : userState === 'pass' && requiredFeature === 'bootcamp'
                  ? 'Bootcamp Access Required'
                  : 'Upgrade Required'
              }
            </Badge>
          </div>
          
          {/* Center upgrade button */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
            <div className="bg-card/95 backdrop-blur-sm rounded-lg p-6 shadow-xl border text-center max-w-md">
              <Crown className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {userState === 'expired' 
                  ? 'Trial Expired' 
                  : userState === 'pass' && requiredFeature === 'bootcamp'
                    ? 'Bootcamp Access Required'
                    : 'Upgrade to Continue'
                }
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {userState === 'expired' 
                  ? 'Your free trial has ended. Upgrade to continue learning.'
                  : userState === 'pass' && requiredFeature === 'bootcamp'
                    ? 'Upgrade to Pass Plus to access Bootcamp features.'
                    : 'Get full access to all features and content.'
                }
              </p>
              <Button 
                size="lg" 
                className="font-semibold"
              >
                <Crown className="h-4 w-4 mr-2" />
                {userState === 'expired' ? 'Upgrade Now' : 'View Plans'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render children normally
  return <>{children}</>;
};