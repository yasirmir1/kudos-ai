import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionState, UserState } from '@/hooks/useSubscriptionState';
import { CreditCard, Lock, AlertTriangle, Clock, Crown, Star } from 'lucide-react';

interface SubscriptionOverlayProps {
  children: React.ReactNode;
  requiredFeature: 'daily_mode' | 'bootcamp';
}

export const SubscriptionOverlay: React.FC<SubscriptionOverlayProps> = ({ 
  children, 
  requiredFeature 
}) => {
  const navigate = useNavigate();
  const { 
    userState, 
    loading, 
    hasAccessTo, 
    isTrialExpired, 
    trialDaysRemaining, 
    createCheckoutSession 
  } = useSubscriptionState();

  const handleUpgradeClick = async () => {
    try {
      const planId = requiredFeature === 'bootcamp' ? 'pass_plus' : 'pass';
      const data = await createCheckoutSession(planId);
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
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

  // Show upgrade overlay for users without access
  if (!hasAccessTo(requiredFeature)) {
    const getOverlayContent = () => {
      switch (userState) {
        case 'expired':
          return {
            icon: <AlertTriangle className="h-12 w-12 text-destructive" />,
            title: 'Trial Expired',
            description: `Your 30-day free trial has ended. Upgrade to continue accessing ${requiredFeature === 'bootcamp' ? 'Bootcamp' : 'Daily Mode'}.`,
            buttonText: 'Upgrade Now',
            buttonVariant: 'destructive' as const,
            showDaysLeft: false
          };
        case 'pass':
          return {
            icon: <Lock className="h-12 w-12 text-amber-500" />,
            title: 'Bootcamp Access Required',
            description: 'Upgrade to Pass Plus to access Bootcamp features with advanced learning paths and mock exams.',
            buttonText: 'Upgrade to Pass Plus',
            buttonVariant: 'default' as const,
            showDaysLeft: false
          };
        case 'no_access':
        default:
          return {
            icon: <Crown className="h-12 w-12 text-primary" />,
            title: 'Subscription Required',
            description: `Get access to ${requiredFeature === 'bootcamp' ? 'Bootcamp' : 'Daily Mode'} with personalized learning and progress tracking.`,
            buttonText: 'Start Free Trial',
            buttonVariant: 'default' as const,
            showDaysLeft: false
          };
      }
    };

    const overlayContent = getOverlayContent();

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        {/* Blurred background content */}
        <div className="absolute inset-0 filter blur-sm opacity-30 pointer-events-none overflow-hidden">
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

        {/* Content */}
        <Card className="w-full max-w-md z-10 shadow-2xl border-2">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary/10 to-primary/20">
              {overlayContent.icon}
            </div>
            <CardTitle className="text-2xl font-bold">{overlayContent.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {overlayContent.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {overlayContent.showDaysLeft && (
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Clock className="inline h-5 w-5 mr-2 text-amber-600" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Trial ends in {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'}
                </span>
              </div>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={handleUpgradeClick}
                className="w-full h-12 text-base font-semibold"
                size="lg"
                variant={overlayContent.buttonVariant}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                {overlayContent.buttonText}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/pricing')}
                className="w-full h-10"
              >
                View All Plans
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="w-full h-10"
                size="sm"
              >
                Back to Dashboard
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">
                What you'll get:
              </p>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {requiredFeature === 'bootcamp' ? (
                  <>
                    <div className="flex items-center text-muted-foreground">
                      <Star className="h-3 w-3 mr-2 text-primary" />
                      Structured learning paths
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Star className="h-3 w-3 mr-2 text-primary" />
                      Mock exams & progress tracking
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Star className="h-3 w-3 mr-2 text-primary" />
                      Advanced analytics
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center text-muted-foreground">
                      <Star className="h-3 w-3 mr-2 text-primary" />
                      Daily practice questions
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Star className="h-3 w-3 mr-2 text-primary" />
                      Progress tracking
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Star className="h-3 w-3 mr-2 text-primary" />
                      Performance insights
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show trial warning for trials ending soon
  if (userState === 'trial' && trialDaysRemaining <= 3 && trialDaysRemaining > 0) {
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
              onClick={handleUpgradeClick}
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

  // User has access, render children normally
  return <>{children}</>;
};