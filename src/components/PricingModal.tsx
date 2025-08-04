import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSubscriptionState } from '@/hooks/useSubscriptionState';
import { Check, Crown, Star, Zap, Target, Calendar, TrendingUp, Award } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightPlan?: 'pass' | 'pass_plus';
  requiredFeature?: 'daily_mode' | 'bootcamp';
}

export const PricingModal: React.FC<PricingModalProps> = ({ 
  isOpen, 
  onClose, 
  highlightPlan,
  requiredFeature 
}) => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { createCheckoutSession, startTrial, userState } = useSubscriptionState();

  const handlePlanSelect = async (planId: string) => {
    // Determine actual plan ID based on annual toggle
    const actualPlanId = planId === 'pass' 
      ? (isAnnual ? 'pass_annual' : 'pass_monthly')
      : planId === 'pass_plus'
        ? (isAnnual ? 'pass_plus_annual' : 'pass_plus_monthly')
        : planId;

    if (userState === 'no_access' && actualPlanId !== 'trial') {
      // Start trial first for new users
      const trialResult = await startTrial(actualPlanId);
      if (trialResult.success) {
        onClose();
        return;
      }
    }

    try {
      const data = await createCheckoutSession(actualPlanId);
      if (data?.url) {
        window.open(data.url, '_blank');
        onClose();
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  const plans = [
    {
      id: 'pass',
      name: 'Pass',
      description: 'Perfect for daily practice',
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      features: [
        'Daily practice mode',
        'Progress tracking',
        'Performance analytics',
        'Unlimited questions',
        'Study streaks',
        'Mobile access'
      ],
      icon: <Calendar className="h-6 w-6" />,
      color: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'pass_plus',
      name: 'Pass Plus',
      description: 'Complete learning experience',
      monthlyPrice: 19.99,
      annualPrice: 199.99,
      popular: true,
      features: [
        'Everything in Pass',
        'Bootcamp access',
        'Mock exams',
        'Advanced analytics',
        'Learning paths',
        'Achievement system',
        'Priority support'
      ],
      icon: <Crown className="h-6 w-6" />,
      color: 'border-purple-200 bg-purple-50 dark:bg-purple-950/20',
      buttonColor: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const getRecommendedText = () => {
    if (requiredFeature === 'bootcamp') {
      return 'Recommended for Bootcamp access';
    }
    return 'Most popular choice';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Upgrade Your Learning
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {requiredFeature === 'bootcamp' 
              ? 'Unlock Bootcamp features with structured learning paths and mock exams'
              : 'Choose the perfect plan to accelerate your learning journey'
            }
          </DialogDescription>

          {/* Trial Notice */}
          {userState === 'no_access' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Start with a 30-day free trial - no credit card required!
                </span>
              </div>
            </div>
          )}

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mt-6 p-4 bg-muted/50 rounded-lg">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch 
              checked={isAnnual} 
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Save 16%
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan) => {
            const isHighlighted = highlightPlan === plan.id || 
              (requiredFeature === 'bootcamp' && plan.id === 'pass_plus') ||
              (!highlightPlan && plan.popular);
            
            const currentPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const billingPeriod = isAnnual ? 'year' : 'month';
            const monthlyEquivalent = isAnnual ? (plan.annualPrice / 12).toFixed(2) : plan.monthlyPrice;

            return (
              <Card 
                key={plan.id} 
                className={`relative transition-all duration-200 hover:shadow-lg ${
                  isHighlighted 
                    ? 'border-primary shadow-md scale-105 ring-2 ring-primary/20' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      {getRecommendedText()}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto p-3 rounded-full w-fit ${plan.color}`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                  
                  <div className="space-y-2 mt-4">
                    <div className="text-3xl font-bold text-foreground">
                      {userState === 'no_access' ? 'Free for 30 days' : `£${currentPrice}`}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {userState === 'no_access' 
                        ? `£${currentPrice}/${billingPeriod} after trial`
                        : isAnnual 
                          ? `per year (£${monthlyEquivalent}/month)`
                          : `per ${billingPeriod}`
                      }
                    </div>
                    {!isAnnual && isAnnual !== undefined && (
                      <div className="text-sm text-muted-foreground">
                        Or £{plan.annualPrice}/year (save £{(plan.monthlyPrice * 12 - plan.annualPrice).toFixed(0)})
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full h-12 text-base font-semibold ${
                      isHighlighted 
                        ? plan.buttonColor
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                    size="lg"
                  >
                    {userState === 'no_access' ? 'Start Free Trial' : 'Upgrade Now'}
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold text-center mb-4">What's included</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <Target className="h-8 w-8 text-primary mx-auto" />
              <h4 className="font-medium">Adaptive Learning</h4>
              <p className="text-xs text-muted-foreground">Questions adapt to your skill level</p>
            </div>
            <div className="space-y-2">
              <TrendingUp className="h-8 w-8 text-primary mx-auto" />
              <h4 className="font-medium">Progress Tracking</h4>
              <p className="text-xs text-muted-foreground">Detailed analytics and insights</p>
            </div>
            <div className="space-y-2">
              <Award className="h-8 w-8 text-primary mx-auto" />
              <h4 className="font-medium">Achievement System</h4>
              <p className="text-xs text-muted-foreground">Earn badges and celebrate milestones</p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t">
          Cancel anytime • No hidden fees • 30-day money-back guarantee
        </div>
      </DialogContent>
    </Dialog>
  );
};