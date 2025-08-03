import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Zap, ExternalLink, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      navigate('/auth');
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
      displayName: 'Pass',
      monthlyPrice: '7.99'
    },
    {
      id: 'pass_plus',
      name: 'Pass Plus',
      displayName: 'Pass Plus', 
      monthlyPrice: '14.99'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-64 mx-auto" />
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2].map(i => (
              <div key={i} className="h-96 bg-muted rounded-lg" />
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
          <h1 className="text-5xl font-bold mb-3 text-foreground">
            Pricing
          </h1>
          <p className="max-w-3xl mx-auto leading-relaxed text-lg text-slate-800">
            Start your subscription now with <span className="text-primary font-semibold text-lg">secure Stripe payments</span>
          </p>
          <p className="text-muted-foreground mt-2 font-medium text-base my-[2px]">
            <span className="text-base text-slate-800 font-medium">No hidden fees, cancel anytime.</span>
          </p>
        </div>

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
              className="mt-3 w-full"
              onClick={handleManageSubscription}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Subscription
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16 mt-8">
          {plans.map(plan => {
            const isCurrentPlan = hasActiveSubscription() && getSubscriptionTier() === plan.name;
            const isPlusPlan = plan.id === 'pass_plus';
            const planDisplayName = plan.id === 'pass' ? 'Pass' : 'Pass Plus';
            const monthlyPrice = plan.monthlyPrice;
            
            return (
              <Card 
                key={plan.id} 
                className="relative bg-card border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 hover:border-primary/50 overflow-hidden flex flex-col h-full"
              >
                {/* Premium Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary hover:text-white border-primary/20 px-3 py-1 text-[11px] font-medium transition-colors">
                    {plan.id === 'pass' ? 'Basic' : 'Premium'}
                  </Badge>
                </div>
                
                <CardHeader className="pt-14 pb-6 px-8">
                  <CardTitle className="text-4xl font-bold text-foreground mb-4">
                    {planDisplayName}
                  </CardTitle>
                  
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-foreground">
                      £{monthlyPrice}/month
                    </div>
                    <div className="text-lg text-muted-foreground">
                      Billed monthly
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-8 pb-8 flex flex-col flex-1">
                  <div className="space-y-6 mb-8 flex-1">
                    {(plan.id === 'pass' ? [
                      {
                        title: "Daily Performance Snapshots",
                        description: "'Daily Mode' gives you a quick, clear view of your child's skills and understanding, so you always know where they stand."
                      },
                      {
                        title: "Personalized Progress Analytics",
                        description: "Stop guessing which topics to focus on. Our insights show you exactly where your child is improving and which areas need a little more practice."
                      },
                      {
                        title: "Customized Worksheets",
                        description: "Never run out of practice material. Generate unlimited worksheets tailored to your child's specific needs in seconds."
                      }
                    ] : [
                      {
                        title: "All features from Pass",
                        description: "Daily Performance Snapshots, Personalized Progress Analytics, and Customized Worksheets."
                      },
                      {
                        title: "The 52-Week Bootcamp",
                        description: "A complete, structured 11+ course with a personalized learning plan that adapts to your child's needs, taking them through the entire curriculum."
                      },
                      {
                        title: "Weekly Performance Monitoring",
                        description: "On top of the course, you'll get access to a weekly test that closely monitors your child's progress and helps you track their development over time."
                      },
                      {
                        title: "Realistic Mock Exams",
                        description: "Gain access to authentic GL and CEM style mock exams (50 questions over 60 minutes). Instantly marked, with a personalized report that provides detailed feedback and a roadmap for improvement."
                      }
                    ]).map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-foreground text-sm leading-relaxed">
                            {feature.title}
                          </div>
                          {feature.description && (
                            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {feature.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {isCurrentPlan ? (
                      <div className="space-y-3">
                        <Badge variant="secondary" className="w-full justify-center py-3 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                          Current Plan
                        </Badge>
                        <Button 
                          variant="outline" 
                          className="w-full py-3"
                          onClick={handleManageSubscription}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Subscription
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Button 
                          className="w-full py-4 font-semibold text-lg rounded-full transition-all duration-200 hover:scale-[1.02]" 
                          variant="default" 
                          onClick={() => handleGetStarted(plan.id)} 
                          disabled={checkingOut === plan.id}
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
                      </div>
                    )}
                    
                    {/* Small print */}
                    <p className="text-xs text-muted-foreground text-center leading-relaxed pt-4">
                      £{monthlyPrice} per month, cancel anytime. Secure payments via Stripe.{' '}
                      <span className="underline cursor-pointer hover:text-foreground transition-colors">
                        Terms apply.
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pricing;