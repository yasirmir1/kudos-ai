import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Zap, ExternalLink, Settings, Clock, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { SubscriptionThankYou } from '@/components/SubscriptionThankYou';
import { useTrialModal } from '@/contexts/TrialModalContext';

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    subscriber,
    subscriptions,
    loading,
    hasActiveSubscription,
    hasActiveStripeSubscription,
    isTrialActive,
    getSubscriptionTier,
    getTrialDaysRemaining,
    hasUsedTrial,
    createCheckoutSession,
    openCustomerPortal,
    refetch
  } = useSubscription();
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [subscribedPlan, setSubscribedPlan] = useState<'pass' | 'pass_plus'>('pass_plus');
  const { openTrialModal } = useTrialModal();

  useEffect(() => {
    // Check for success/cancel parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      // Show thank you component instead of toast
      setShowThankYou(true);
      refetch();
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('canceled')) {
      toast.error('Payment was canceled.');
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refetch]);
  const handleGetStarted = async (planId: string, isAnnual: boolean = false) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Map plan ID to include billing period
    const actualPlanId = planId === 'pass' 
      ? (isAnnual ? 'pass_annual' : 'pass_monthly')
      : planId === 'pass_plus'
        ? (isAnnual ? 'pass_plus_annual' : 'pass_plus_monthly') 
        : planId;
    
    setCheckingOut(actualPlanId);
    try {
      const { url } = await createCheckoutSession(actualPlanId);
      // Open Stripe checkout in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setCheckingOut(null);
    }
  };
  const handleStartTrial = (planId: string) => {
    const basePlanId = planId === 'pass' ? 'pass' : 'pass_plus';
    openTrialModal({ 
      planId: basePlanId, 
      mode: user ? 'upgrade' : 'signup' 
    });
  };
  const handleManageSubscription = async () => {
    try {
      const {
        url
      } = await openCustomerPortal();
      // Open customer portal in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription management');
    }
  };
  const plans = [{
    id: 'pass',
    name: 'Pass',
    displayName: 'Pass',
    monthlyPrice: '8',
    annualPrice: '59'
  }, {
    id: 'pass_plus',
    name: 'Pass Plus',
    displayName: 'Pass Plus',
    monthlyPrice: '15',
    annualPrice: '99'
  }];
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  const getUserSubscriptionForPlan = (planId: string) => {
    return subscriptions.find(sub => sub.plan_id === planId && (sub.status === 'active' || sub.status === 'trial'));
  };
  const isTrialActivePlan = (planId: string) => {
    const userSub = getUserSubscriptionForPlan(planId);
    return userSub?.is_trial && userSub.trial_end_date && new Date(userSub.trial_end_date) > new Date();
  };
  if (loading) {
    return <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-64 mx-auto" />
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2].map(i => <div key={i} className="h-96 bg-muted rounded-lg" />)}
          </div>
        </div>
      </div>;
  }

  // Show thank you component after successful payment
  if (showThankYou) {
    return <SubscriptionThankYou planType={subscribedPlan} />;
  }

  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 text-foreground tracking-tight">
            Pricing
          </h1>
          <div className="space-y-3 max-w-2xl mx-auto">
            <p className="text-xl text-foreground leading-relaxed">
              Start your free trial now, <span className="text-primary font-semibold">no credit card needed</span>
            </p>
            <p className="text-muted-foreground font-medium">
              No hidden fees, cancel anytime.
            </p>
          </div>
        </div>

        {/* Trial Warning */}
        {user && isTrialActive && getTrialDaysRemaining() <= 3 && <div className="bg-warning/10 border-warning border-l-4 p-4 mb-12 max-w-4xl mx-auto rounded">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-warning mr-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">
                  Trial Ending Soon
                </p>
                <p className="text-sm text-muted-foreground">
                  Your trial ends in {getTrialDaysRemaining()} day(s). Upgrade now to continue access.
                </p>
              </div>
            </div>
          </div>}

        {/* Billing Toggle */}
        <div className="flex flex-col items-center justify-center mb-12 space-y-6">
          <div className="bg-muted/80 rounded-xl p-1.5 flex items-center border border-border/50 shadow-sm">
            <button className={`px-8 py-2 rounded-lg text-sm font-semibold transition-all duration-200 min-w-[120px] ${!isAnnual ? 'bg-background text-foreground shadow-md border border-border/50' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setIsAnnual(false)}>
              Monthly
            </button>
            <button className={`px-8 py-2 rounded-lg text-sm font-semibold transition-all duration-200 min-w-[120px] ${isAnnual ? 'bg-background text-foreground shadow-md border border-border/50' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setIsAnnual(true)}>
              Annual
            </button>
          </div>
          
          {/* Savings text below toggle */}
          <div className="relative">
            <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
              💰 Save up to 63% with Annual
            </span>
          </div>
        </div>

        {/* Subscription Status */}
        {user && hasActiveSubscription && <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto mb-8">
            <div className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">
                Current Plan: {getSubscriptionTier}
                {isTrialActive && ' (Trial)'}
              </span>
            </div>
            {hasActiveStripeSubscription && <Button variant="outline" size="sm" className="mt-3 w-full" onClick={handleManageSubscription}>
                <Settings className="w-4 h-4 mr-2" />
                Manage Subscription
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>}
          </div>}

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16 mt-8">
          {plans.map(plan => {
          const userSub = getUserSubscriptionForPlan(plan.id);
          const isCurrentPlan = !!userSub;
          const isCurrentTrialActive = isTrialActivePlan(plan.id);
          const hasUsedTrialForPlan = hasUsedTrial(plan.id);
          const isPlusPlan = plan.id === 'pass_plus';
          const planDisplayName = plan.displayName;
          const currentPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const billingPeriod = isAnnual ? 'year' : 'month';
          const monthlyEquivalent = isAnnual ? (parseInt(plan.annualPrice) / 12).toFixed(0) : plan.monthlyPrice;
          return <Card key={plan.id} className="relative bg-card border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 hover:border-primary/50 overflow-hidden flex flex-col h-full">
                {/* Premium Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary hover:text-white border-primary/20 px-3 py-1 text-[11px] font-medium transition-colors">
                    {plan.id === 'pass' ? 'Basic' : 'Premium'}
                  </Badge>
                </div>

                {/* Trial Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-accent/20 text-accent-foreground px-3 py-1 text-xs font-medium">
                    Free 7 day trial
                  </Badge>
                </div>
                
                <CardHeader className="pt-14 pb-6 px-8">
                  <CardTitle className="text-4xl font-bold text-foreground mb-4">
                    {planDisplayName}
                  </CardTitle>
                  
                    <div className="space-y-2">
                     <div className="text-3xl font-bold text-foreground">
                       {isAnnual ? 'Free for 7 days' : 'Free for 7 days'}
                     </div>
                     <div className="text-lg text-muted-foreground">
                       {isAnnual ? <>£{currentPrice}/year (£{monthlyEquivalent}/month)</> : <>£{currentPrice}/{billingPeriod} after</>}
                     </div>
                     {!isAnnual && <div className="text-sm text-muted-foreground">
                         Or £{plan.annualPrice}/year (save £{(parseInt(plan.monthlyPrice) * 12 - parseInt(plan.annualPrice)).toFixed(0)})
                       </div>}
                   </div>
                </CardHeader>

                <CardContent className="px-8 pb-8 flex flex-col flex-1">
                  <div className="space-y-6 mb-8 flex-1">
                    {(plan.id === 'pass' ? [{
                  title: "Daily Performance Snapshots",
                  description: "'Daily Mode' gives you a quick, clear view of your child's skills and understanding, so you always know where they stand."
                }, {
                  title: "Personalized Progress Analytics",
                  description: "Stop guessing which topics to focus on. Our insights show you exactly where your child is improving and which areas need a little more practice."
                }, {
                  title: "Customized Worksheets",
                  description: "Never run out of practice material. Generate unlimited worksheets tailored to your child's specific needs in seconds."
                }] : [{
                  title: "All features from Pass",
                  description: "Daily Performance Snapshots, Personalized Progress Analytics, and Customized Worksheets."
                }, {
                  title: "The 52-Week Bootcamp",
                  description: "A complete, structured 11+ course with a personalized learning plan that adapts to your child's needs, taking them through the entire curriculum."
                }, {
                  title: "Weekly Performance Monitoring",
                  description: "On top of the course, you'll get access to a weekly test that closely monitors your child's progress and helps you track their development over time."
                }, {
                  title: "Realistic Mock Exams",
                  description: "Gain access to authentic GL and CEM style mock exams (50 questions over 60 minutes). Instantly marked, with a personalized report that provides detailed feedback and a roadmap for improvement."
                }]).map((feature, index) => <div key={index} className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-foreground text-sm leading-relaxed">
                            {feature.title}
                          </div>
                          {feature.description && <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {feature.description}
                            </div>}
                        </div>
                      </div>)}
                  </div>

                  <div className="space-y-4">
                    {isCurrentPlan ? <div className="space-y-3">
                        <Badge variant="secondary" className="w-full justify-center py-3 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                          {isCurrentTrialActive ? 'Trial Active' : 'Current Plan'}
                        </Badge>
                        {isCurrentTrialActive && userSub?.trial_end_date && <p className="text-xs text-center text-muted-foreground">
                            Trial ends {formatDate(userSub.trial_end_date)}
                          </p>}
                        {!isCurrentTrialActive && userSub?.subscription_end_date && <p className="text-xs text-center text-muted-foreground">
                            Renews {formatDate(userSub.subscription_end_date)}
                          </p>}
                        {/* Show upgrade option for trial users */}
                        {isCurrentTrialActive && <Button className="w-full py-3 font-semibold text-sm rounded-full transition-all duration-200 hover:scale-[1.02]" variant="outline" onClick={() => handleGetStarted(plan.id, isAnnual)} disabled={checkingOut === plan.id}>
                            {checkingOut === plan.id ? <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Upgrading...
                              </div> : <>
                                Upgrade to Paid Plan
                                <ExternalLink className="w-4 h-4 ml-2" />
                              </>}
                          </Button>}
                      </div> : <div className="space-y-4">
                        {/* Trial button */}
                        {!hasUsedTrialForPlan && <Button 
                            className="w-full py-4 font-semibold text-lg rounded-full transition-all duration-200 hover:scale-[1.02]" 
                            variant="default" 
                            onClick={() => handleStartTrial(plan.id)}
                          >
                            {user ? 'Start trial now, no credit card needed' : 'Start Free Trial'}
                          </Button>}
                        
                        {/* Paid subscription button */}
                        <Button className="w-full py-4 font-semibold text-lg rounded-full transition-all duration-200 hover:scale-[1.02]" variant={hasUsedTrialForPlan ? "default" : "outline"} onClick={() => handleGetStarted(plan.id, isAnnual)} disabled={checkingOut === plan.id}>
                          {checkingOut === plan.id ? <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Opening Checkout...
                            </div> : <>
                              {hasUsedTrialForPlan ? 'Subscribe Now' : 'Or Subscribe Directly'}
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </>}
                        </Button>
                        
                        {hasUsedTrialForPlan && <p className="text-xs text-center text-muted-foreground bg-muted/50 rounded-md py-2 px-3">
                            Trial already used for this plan
                          </p>}
                      </div>}
                    
                     {/* Small print */}
                     <p className="text-xs text-muted-foreground text-center leading-relaxed pt-4">
                       Free 7 day trial, then £{currentPrice} per {billingPeriod} after. Offer only available if you haven't tried Premium before.{' '}
                       <span className="underline cursor-pointer hover:text-foreground transition-colors">
                         Terms apply.
                       </span>
                     </p>
                  </div>
                </CardContent>
              </Card>;
        })}
        </div>
        
      </div>
    </div>;
};
export default Pricing;