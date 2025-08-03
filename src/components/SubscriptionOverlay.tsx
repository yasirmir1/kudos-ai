import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSubscriptionState } from '@/hooks/useSubscriptionState';
import { usePricingModal } from '@/contexts/PricingModalContext';
import { Clock, Crown } from 'lucide-react';
import { toast } from 'sonner';

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
    trialDaysRemaining,
    createCheckoutSession
  } = useSubscriptionState();

  const { openPricingModal } = usePricingModal();

  const handleSubscribeClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the overlay click from triggering
    
    try {
      const planId = requiredFeature === 'bootcamp' ? 'pass_plus' : 'pass';
      const { url, error } = await createCheckoutSession(planId);
      
      if (error) {
        toast.error('Failed to start checkout process. Please try again.');
        return;
      }
      
      if (url) {
        // Open Stripe checkout in a new tab
        window.open(url, '_blank');
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
                  Upgrade now to continue without interruption.
                </p>
              </div>
            </div>
            <Button 
              onClick={handleSubscribeClick}
              size="sm"
              className="ml-4 flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Crown className="mr-1 h-4 w-4" />
              Subscribe
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
          className="absolute inset-0 z-50 cursor-default bg-transparent"
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
          <div className="absolute top-[130px] left-1/2 transform -translate-x-1/2">
            <div className="bg-card border-2 border-border/50 hover:border-primary/50 rounded-xl p-10 shadow-2xl max-w-lg transition-all duration-300">
              {/* Title */}
              <div className="text-center mb-8">
                <h3 className="text-5xl font-bold text-foreground mb-3">
                  {userState === 'expired' 
                    ? 'Pass Plus' 
                    : userState === 'pass' && requiredFeature === 'bootcamp'
                      ? 'Pass Plus'
                      : requiredFeature === 'bootcamp' ? 'Pass Plus' : 'Pass'
                  }
                </h3>
                
                {/* Pricing */}
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-primary">
                    £{requiredFeature === 'bootcamp' ? '15' : '8'}<span className="text-xl text-muted-foreground font-normal">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Or £{requiredFeature === 'bootcamp' ? '99' : '59'}/year 
                    <span className="text-green-600 font-semibold ml-1">
                      (save £{requiredFeature === 'bootcamp' ? '81' : '37'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-4 mb-10">
                {requiredFeature === 'bootcamp' ? (
                  <>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-4 flex-shrink-0" />
                      <div className="text-sm text-foreground font-semibold">
                        The 52-Week Bootcamp
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-4 flex-shrink-0" />
                      <div className="text-sm text-foreground font-semibold">
                        Realistic Mock Exams
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-4 flex-shrink-0" />
                      <div className="text-sm text-foreground font-semibold">
                        Weekly Performance Monitoring
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-4 flex-shrink-0" />
                      <div className="text-sm text-foreground font-semibold">
                        All Pass features included
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-4 flex-shrink-0" />
                      <div className="text-sm text-foreground font-semibold">
                        Daily Performance Snapshots
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-4 flex-shrink-0" />
                      <div className="text-sm text-foreground font-semibold">
                        Personalized Progress Analytics
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-4 flex-shrink-0" />
                      <div className="text-sm text-foreground font-semibold">
                        Customized Worksheets
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* CTA Button */}
              <Button 
                onClick={handleSubscribeClick}
                size="lg" 
                className="w-full py-4 font-semibold text-lg rounded-full transition-all duration-200 hover:scale-[1.02]"
              >
                Subscribe Now
              </Button>
              
              {/* Small print */}
              <p className="text-xs text-muted-foreground text-center leading-relaxed pt-4">
                {requiredFeature === 'bootcamp' ? '£15' : '£8'} per month, billed monthly or annually.
                <span className="underline cursor-pointer hover:text-foreground transition-colors ml-1">
                  Terms apply.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render children normally
  return <>{children}</>;
};