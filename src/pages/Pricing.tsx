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

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map(plan => {
          const userSub = getUserSubscriptionForPlan(plan.id);
          const isCurrentPlan = !!userSub;
          const isTrialActivePlan = userSub && isTrialActive(userSub);
          const hasUsedTrialForPlan = hasUsedTrial(plan.id);
          const isPlusPlan = plan.id === 'pass_plus';
          const planDisplayName = plan.id === 'pass' ? 'Pass' : 'Pass Plus';
          const monthlyPrice = plan.id === 'pass' ? '7.99' : '14.99';
          return <Card key={plan.id} className="relative bg-card border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 hover:border-primary/50 overflow-hidden">
                {/* Premium Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-medium">
                    30 Day Free Trial
                  </Badge>
                </div>

                {/* Trial Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-accent/20 text-accent-foreground px-3 py-1 text-xs font-medium">
                    £0 for 1 month
                  </Badge>
                </div>
                
                <CardHeader className="pt-16 pb-8 px-8">
                  <CardTitle className="text-4xl font-bold text-foreground mb-4 my-[10px]">
                    {planDisplayName}
                  </CardTitle>
                  
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-foreground">
                      £0 for 1 month
                    </div>
                    <div className="text-lg text-muted-foreground">
                      £{monthlyPrice}/month after
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => <div key={index} className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                        <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                      </div>)}
                  </div>

                  <div className="space-y-4">
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
                      </div> : <div className="space-y-4">
                        {plan.trial_days > 0 && !hasUsedTrialForPlan && <Button className="w-full py-4 font-semibold text-lg rounded-full transition-all duration-200 hover:scale-[1.02]" variant="default" onClick={() => startTrial(plan.id)} disabled={startingTrial === plan.id}>
                            {startingTrial === plan.id ? <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Starting Trial...
                              </div> : `Try 1 month for £0`}
                          </Button>}
                        
                        {(!plan.trial_days || hasUsedTrialForPlan) && <Button className="w-full py-4 font-semibold text-lg rounded-full transition-all duration-200 hover:scale-[1.02]" variant="outline" onClick={() => toast.info('Subscription flow coming soon!')}>
                            Get Started
                          </Button>}
                        
                        {hasUsedTrialForPlan && <p className="text-xs text-center text-muted-foreground bg-muted/50 rounded-md py-2 px-3">
                            Trial already used for this plan
                          </p>}
                      </div>}
                    
                    {/* Small print */}
                    <p className="text-xs text-muted-foreground text-center leading-relaxed pt-4">
                      £0 for 1 month, then £{monthlyPrice} per month after. Offer only available if you haven't tried Premium before. 
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
}