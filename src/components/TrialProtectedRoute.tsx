import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Clock, AlertTriangle } from 'lucide-react';

interface TrialProtectedRouteProps {
  children: React.ReactNode;
  requiredFeature?: 'daily_mode' | 'bootcamp';
}

export const TrialProtectedRoute: React.FC<TrialProtectedRouteProps> = ({ 
  children, 
  requiredFeature = 'daily_mode' 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    isTrialActive, 
    getTrialDaysRemaining, 
    hasActiveSubscription,
    hasActiveStripeSubscription,
    createCheckoutSession,
    loading 
  } = useSubscription();

  const trialDaysRemaining = getTrialDaysRemaining();
  const isTrialExpired = isTrialActive() && trialDaysRemaining <= 0;

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  // Show loading while checking subscription status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show upgrade prompt if trial is expired and no active subscription
  if (isTrialExpired && !hasActiveStripeSubscription()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl font-semibold">Trial Expired</CardTitle>
            <CardDescription>
              Your 30-day free trial has ended. Upgrade to continue accessing {requiredFeature === 'bootcamp' ? 'Bootcamp' : 'Daily Mode'}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <Clock className="inline h-4 w-4 mr-1" />
              Trial ended {Math.abs(trialDaysRemaining)} {Math.abs(trialDaysRemaining) === 1 ? 'day' : 'days'} ago
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleUpgradeClick}
                className="w-full"
                size="lg"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade Now
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/pricing')}
                className="w-full"
              >
                View Pricing Plans
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="w-full"
                size="sm"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show warning for trials ending soon (last 3 days)
  if (isTrialActive() && trialDaysRemaining <= 3 && trialDaysRemaining > 0) {
    return (
      <div className="relative">
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-amber-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Trial ending soon
                </p>
                <p className="text-sm text-amber-700">
                  Your free trial expires in {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'}. 
                  Upgrade now to continue without interruption.
                </p>
              </div>
            </div>
            <Button 
              onClick={handleUpgradeClick}
              size="sm"
              className="ml-4"
            >
              Upgrade
            </Button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Allow access if user has active subscription or valid trial
  if (hasActiveSubscription()) {
    return <>{children}</>;
  }

  // Default: redirect to pricing if no access
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Access Required</CardTitle>
          <CardDescription>
            You need an active subscription to access this feature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate('/pricing')}
            className="w-full"
          >
            View Pricing Plans
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};