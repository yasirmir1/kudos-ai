import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Zap, ExternalLink, Settings } from 'lucide-react';
import { toast } from 'sonner';

const Pricing = () => {
  const { user } = useAuth();
  const { 
    subscriber, 
    loading, 
    hasActiveSubscription, 
    getSubscriptionTier, 
    createCheckoutSession, 
    openCustomerPortal,
    refetch 
  } = useSubscription();
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    // Check for success/cancel parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      toast.success('Payment successful! Checking subscription status...');
      refetch();
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('canceled')) {
      toast.error('Payment was canceled.');
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refetch]);

  const handleGetStarted = async (planId: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setCheckingOut(planId);
    try {
      const { url } = await createCheckoutSession(planId);
      // Open Stripe checkout in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setCheckingOut(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await openCustomerPortal();
      // Open customer portal in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management');
    }
  };

  const plans = [
    {
      id: 'pass',
      name: 'Pass',
      price: '£7.99',
      features: [
        'Daily Performance Snapshots',
        'Insights on 3 Focus Areas',
        'Track Progress Over Time',
        'Personalized Learning Recommendations',
        'Access to Core Practice Questions'
      ]
    },
    {
      id: 'pass_plus',
      name: 'Pass Plus',
      price: '£14.99', 
      features: [
        'Everything in Pass',
        'Full Bootcamp Access',
        'Advanced Analytics Dashboard',
        'Unlimited Practice Questions',
        'Mock Exam Simulations',
        'Priority Support'
      ]
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Select the perfect plan for your learning journey
          </p>
          
          {/* Subscription Status */}
          {user && hasActiveSubscription() && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto mb-8">
              <div className="flex items-center justify-center space-x-2">
                <Crown className="w-5 h-5 text-primary" />
                <span className="font-medium text-primary">
                  Current Plan: {getSubscriptionTier()}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={handleManageSubscription}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Subscription
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = hasActiveSubscription() && getSubscriptionTier() === plan.name;
            const isPremium = plan.id === 'pass_plus';
            
            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden ${
                  isPremium ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
              >
                {isPremium && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={`text-center ${isPremium ? 'pt-12' : 'pt-8'}`}>
                  <div className="flex items-center justify-center mb-4">
                    {isPremium ? (
                      <Crown className="w-8 h-8 text-primary" />
                    ) : (
                      <Zap className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  
                  <CardTitle className="text-3xl font-bold mb-2">
                    {plan.name}
                  </CardTitle>
                  
                  <div className="text-4xl font-bold mb-4">
                    {plan.price}
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-8">
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {isCurrentPlan ? (
                      <Badge 
                        variant="secondary" 
                        className="w-full justify-center py-3 text-sm font-medium bg-primary/10 text-primary border-primary/20"
                      >
                        Current Plan
                      </Badge>
                    ) : (
                      <Button 
                        className={`w-full py-3 font-semibold ${
                          isPremium 
                            ? 'bg-primary hover:bg-primary/90' 
                            : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                        }`}
                        onClick={() => handleGetStarted(plan.id)}
                        disabled={!!checkingOut}
                      >
                        {checkingOut === plan.id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            Opening Checkout...
                          </div>
                        ) : (
                          <>
                            Get Started
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Cancel anytime • No hidden fees
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Need help choosing? All plans include a 30-day money-back guarantee.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="ghost" size="sm">
              View Features Comparison
            </Button>
            <Button variant="ghost" size="sm">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;