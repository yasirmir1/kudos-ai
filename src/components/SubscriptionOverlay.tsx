import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSubscriptionState } from '@/hooks/useSubscriptionState';
import { usePricingModal } from '@/contexts/PricingModalContext';
import { Clock, Crown, Check, Star } from 'lucide-react';
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
  const {
    openPricingModal
  } = usePricingModal();
  const handleSubscribeClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the overlay click from triggering

    try {
      const planId = requiredFeature === 'bootcamp' ? isAnnual ? 'pass_plus_annual' : 'pass_plus_monthly' : isAnnual ? 'pass_annual' : 'pass_monthly';
      const {
        url,
        error
      } = await createCheckoutSession(planId);
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
    return <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }

  // Show trial warning for trials ending soon
  if (isTrialActive && trialDaysRemaining <= 3 && trialDaysRemaining > 0) {
    return <div className="relative">
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
            <Button onClick={handleSubscribeClick} size="sm" className="ml-4 flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white">
              <Crown className="mr-1 h-4 w-4" />
              Subscribe
            </Button>
          </div>
        </div>
        {children}
      </div>;
  }

  // If user doesn't have access, show grayed out content with click overlay
  if (!hasAccessTo(requiredFeature)) {
    return <div className="relative">
        {/* Grayed out content */}
        <div className="filter grayscale opacity-50 pointer-events-none select-none">
          {children}
        </div>
        
        {/* Invisible overlay to capture clicks */}
        <div className="absolute inset-0 z-50 cursor-default bg-transparent">
          {/* Optional: Add some visual indicators */}
          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground shadow-lg animate-pulse">
              <Crown className="h-3 w-3 mr-1" />
              {userState === 'expired' ? 'Trial Expired - Click to Upgrade' : userState === 'pass' && requiredFeature === 'bootcamp' ? 'Bootcamp Access Required' : 'Upgrade Required'}
            </Badge>
          </div>
          
          {/* Center upgrade button */}
          <div className="absolute top-[80px] left-1/2 transform -translate-x-1/2 mx-[25px]">
            <div className="relative bg-card rounded-2xl border border-primary shadow-learning scale-105 p-8 w-[532px] min-h-[500px] transition-all duration-300 hover:shadow-learning hover:-translate-y-1 px-[32px]">
              
              
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">
                  {userState === 'expired' ? 'Pass Plus' : userState === 'pass' && requiredFeature === 'bootcamp' ? 'Pass Plus' : requiredFeature === 'bootcamp' ? 'Pass Plus' : 'Pass'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {requiredFeature === 'bootcamp' ? 'Complete 11+ preparation' : 'Perfect for focused practice'}
                </p>
                
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Monthly
                  </span>
                  <Switch checked={isAnnual} onCheckedChange={setIsAnnual} className="data-[state=checked]:bg-primary" />
                  <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Annual
                  </span>
                </div>
                
                {isAnnual && <div className="flex justify-center mb-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Save up to 45%
                    </Badge>
                  </div>}
                
                <div className="mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    {isAnnual && <span className="text-lg text-muted-foreground line-through">
                        £{requiredFeature === 'bootcamp' ? '180' : '96'}
                      </span>}
                    <span className="text-4xl font-bold">
                      £{isAnnual ? requiredFeature === 'bootcamp' ? '99' : '59' : requiredFeature === 'bootcamp' ? '15' : '8'}
                    </span>
                    <span className="text-muted-foreground">/{isAnnual ? 'year' : 'month'}</span>
                  </div>
                  <p className="text-primary font-medium mt-2 text-xs">Switch to Annual, save 37%</p>
                </div>

                <Button onClick={handleSubscribeClick} className="w-full mb-3 bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">Subscribe Now</Button>
                
                

                <div className="space-y-3 text-left mx-0">
                  {requiredFeature === 'bootcamp' ? <>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-base">Everything in Pass</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-base">Full bootcamp curriculum</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-base">Mock exam simulations</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-base">Advanced analytics & reports</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-base">Personalized study plans</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-base">Priority support</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-base">Offline practice worksheets</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-base">Achievement badges & rewards</span>
                      </div>
                    </> : <>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Unlimited daily practice questions</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Real-time progress tracking</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Personalized learning insights</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Topic-based analytics</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Mobile & desktop access</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Parent dashboard</span>
                      </div>
                    </>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }

  // User has access, render children normally
  return <>{children}</>;
};