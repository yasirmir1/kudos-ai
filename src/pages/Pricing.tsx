import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  features: any;
  trial_days: number;
  allows_daily_mode: boolean;
  allows_bootcamp: boolean;
}
interface TrialResult {
  success: boolean;
  message: string;
  trial_days?: number;
  trial_end_date?: string;
}
interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  is_trial: boolean;
  trial_end_date: string | null;
  subscription_end_date: string | null;
}
export default function Pricing() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingTrial, setStartingTrial] = useState<string | null>(null);
  useEffect(() => {
    fetchPlans();
    if (user) {
      fetchUserSubscriptions();
    }
  }, [user]);
  const fetchPlans = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('subscription_plans').select('*').order('price_monthly');
      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };
  const fetchUserSubscriptions = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('user_subscriptions').select('*').eq('user_id', user?.id);
      if (error) throw error;
      setUserSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
    }
  };
  const startTrial = async (planId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setStartingTrial(planId);
    try {
      const {
        data,
        error
      } = await supabase.rpc('start_trial', {
        plan_id_param: planId
      });
      if (error) throw error;
      const result = data as unknown as TrialResult;
      if (result.success) {
        toast.success(`${result.trial_days}-day trial started successfully!`);
        fetchUserSubscriptions();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      toast.error('Failed to start trial');
    } finally {
      setStartingTrial(null);
    }
  };
  const getUserSubscriptionForPlan = (planId: string) => {
    return userSubscriptions.find(sub => sub.plan_id === planId && (sub.status === 'active' || sub.status === 'trial'));
  };
  const isTrialActive = (subscription: UserSubscription) => {
    if (!subscription?.is_trial || !subscription.trial_end_date) return false;
    return new Date(subscription.trial_end_date) > new Date();
  };
  const hasUsedTrial = (planId: string) => {
    return userSubscriptions.some(sub => sub.plan_id === planId && sub.is_trial);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-3 text-foreground">
            Pricing
          </h1>
          <p className="max-w-3xl mx-auto leading-relaxed text-lg text-slate-800">
            Start your free trial now, <span className="text-primary font-semibold text-lg">no credit card needed</span>
          </p>
          <p className="text-muted-foreground mt-2 font-medium text-base my-[4px]">
            <span className="text-base text-slate-800 font-medium">No hidden fees, cancel anytime.</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {plans.map(plan => {
          const userSub = getUserSubscriptionForPlan(plan.id);
          const isCurrentPlan = !!userSub;
          const isTrialActivePlan = userSub && isTrialActive(userSub);
          const hasUsedTrialForPlan = hasUsedTrial(plan.id);
          const isPlusPlan = plan.id === 'pass_plus';
          return <Card key={plan.id} className={`relative bg-white dark:bg-card border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isPlusPlan ? 'border-primary shadow-lg scale-[1.02]' : 'border-border/50 hover:border-primary/50'}`}>
                {isPlusPlan && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1 text-sm font-semibold shadow-lg rounded-full">
                      Popular
                    </Badge>
                  </div>}
                
                <CardHeader className="text-center pb-6 pt-8">
                  <CardTitle className="text-3xl font-bold text-foreground mb-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-lg text-muted-foreground mb-6">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-6">
                    {plan.trial_days > 0 ? <div className="space-y-1">
                        <div className="text-lg text-muted-foreground line-through">
                          £{plan.id === 'pass' ? '7.99' : '14.99'}/User
                        </div>
                        <div className="text-4xl font-bold text-primary">£0*</div>
                        <div className="text-sm text-muted-foreground">
                          *For the first {plan.trial_days} days
                        </div>
                      </div> : <div>
                        <span className="text-4xl font-bold text-foreground">
                          £{plan.id === 'pass' ? '7.99' : '14.99'}
                        </span>
                        <span className="text-muted-foreground text-lg">/User</span>
                      </div>}
                  </div>
                  
                  {plan.trial_days > 0 && <div className="flex items-center justify-center text-sm text-primary mt-4 font-semibold bg-primary/10 rounded-full px-4 py-2">
                      <Clock className="w-4 h-4 mr-2" />
                      {plan.trial_days}-day FREE trial
                    </div>}
                </CardHeader>

                <CardContent className="space-y-6 pb-8">
                  <div className="space-y-4">
                    {plan.features.map((feature, index) => <div key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                      </div>)}
                  </div>

                  <div className="pt-4">
                    {isCurrentPlan ? <div className="space-y-3">
                        <Badge variant="secondary" className="w-full justify-center py-3 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                          {isTrialActivePlan ? 'Trial Active' : 'Current Plan'}
                        </Badge>
                        {isTrialActivePlan && userSub?.trial_end_date && <p className="text-xs text-center text-muted-foreground">
                            Trial ends {formatDate(userSub.trial_end_date)}
                          </p>}
                        {!isTrialActivePlan && userSub?.subscription_end_date && <p className="text-xs text-center text-muted-foreground">
                            Renews {formatDate(userSub.subscription_end_date)}
                          </p>}
                      </div> : <div className="space-y-3">
                        {plan.trial_days > 0 && !hasUsedTrialForPlan && <Button className="w-full py-3 font-semibold transition-all duration-200 hover:scale-[1.02]" variant={isPlusPlan ? "default" : "outline"} onClick={() => startTrial(plan.id)} disabled={startingTrial === plan.id}>
                            {startingTrial === plan.id ? <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Starting Trial...
                              </div> : `Start Free Trial`}
                          </Button>}
                        <Button className="w-full py-3 font-semibold transition-all duration-200 hover:scale-[1.02]" variant={isPlusPlan && plan.trial_days === 0 ? "default" : "secondary"} onClick={() => toast.info('Subscription flow coming soon!')}>
                          Get Started
                        </Button>
                        {hasUsedTrialForPlan && <p className="text-xs text-center text-muted-foreground bg-muted/50 rounded-md py-2 px-3">
                            Trial already used for this plan
                          </p>}
                      </div>}
                  </div>
                </CardContent>
              </Card>;
        })}
        </div>

        <div className="text-center bg-muted/30 rounded-lg p-6 max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground">
            All plans include access to our core features. No hidden fees. Cancel anytime.
          </p>
        </div>
      </div>
    </div>;
}