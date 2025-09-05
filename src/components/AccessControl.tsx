import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccessControlProps {
  feature: 'daily_mode' | 'bootcamp';
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export const AccessControl = ({ 
  feature, 
  children, 
  fallbackTitle = "Premium Feature",
  fallbackDescription = "This feature requires a subscription."
}: AccessControlProps) => {
  const { user } = useAuth();
  const { hasAccess, loading, isTrialActive, getTrialDaysRemaining } = useSubscription();
  const navigate = useNavigate();
  const [hasFeatureAccess, setHasFeatureAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setHasFeatureAccess(false);
        setCheckingAccess(false);
        return;
      }

      try {
        const access = await hasAccess(feature);
        setHasFeatureAccess(access);
      } catch (error) {
        console.error('Error checking access:', error);
        setHasFeatureAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user, feature, hasAccess]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please sign in to access this feature.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || checkingAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64 mx-auto" />
          <div className="h-32 bg-muted rounded max-w-md mx-auto" />
        </div>
      </div>
    );
  }

  if (!hasFeatureAccess) {
    const featureName = feature === 'daily_mode' ? 'Daily Practice' : 'Bootcamp';
    const requiredPlan = feature === 'daily_mode' ? 'Pass' : 'Pass Plus';

    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Crown className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>{fallbackTitle}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {fallbackDescription}
            </p>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-sm">
                Requires {requiredPlan} subscription
              </Badge>
              <p className="text-sm text-muted-foreground">
                Access to {featureName} and more
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => navigate('/pricing')} className="w-full">
                View Pricing Plans
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show trial warning if user is on trial
  const trialDaysRemaining = getTrialDaysRemaining();
  const showTrialWarning = isTrialActive && trialDaysRemaining <= 3;

  return (
    <div>
      {showTrialWarning && (
        <div className="bg-warning/10 border-warning border-l-4 p-4 mb-4">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-warning mr-2" />
            <div className="flex-1">
              <p className="text-sm font-medium text-warning">
                Trial Ending Soon
              </p>
              <p className="text-sm text-muted-foreground">
                Your trial ends in {trialDaysRemaining} day(s). 
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-1 text-warning underline"
                  onClick={() => navigate('/pricing')}
                >
                  Upgrade now
                </Button>
              </p>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};