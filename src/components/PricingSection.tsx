import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSubscriptionState } from '@/hooks/useSubscriptionState';
import { useToast } from '@/hooks/use-toast';

interface PricingCardProps {
  planId: string;
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  trialDays?: number;
  isAnnual?: boolean;
}

const PricingCard = ({ planId, name, price, originalPrice, description, features, isPopular, trialDays, isAnnual }: PricingCardProps) => {
  const [loading, setLoading] = useState(false);
  const { createCheckoutSession } = useSubscriptionState();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const result = await createCheckoutSession(planId);
      if (result.url) {
        window.open(result.url, '_blank');
      } else if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative bg-card rounded-2xl border p-8 ${
      isPopular 
        ? 'border-primary shadow-learning scale-105' 
        : 'border-border hover:border-primary/20'
    } transition-all duration-300 hover:shadow-learning hover:-translate-y-1`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
          <Star className="h-3 w-3 mr-1" />
          Most Popular
        </Badge>
      )}
      
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        
        <div className="mb-6">
          <div className="flex items-baseline justify-center gap-2">
            {originalPrice && (
              <span className="text-lg text-muted-foreground line-through">{originalPrice}</span>
            )}
            <span className="text-4xl font-bold">{price}</span>
            <span className="text-muted-foreground">/{isAnnual ? 'year' : 'month'}</span>
          </div>
          {trialDays && (
            <p className="text-sm text-primary font-medium mt-2">
              {trialDays}-day free trial
            </p>
          )}
        </div>

        <Button 
          onClick={handleSubscribe}
          disabled={loading}
          className={`w-full mb-6 ${
            isPopular 
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
              : 'bg-background border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
          }`}
          size="lg"
        >
          {loading ? 'Starting...' : `Start ${trialDays}-Day Free Trial`}
        </Button>

        <div className="space-y-3 text-left">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const getPlans = (annual: boolean) => [
    {
      planId: annual ? 'pass_annual' : 'pass_monthly',
      name: 'Pass',
      price: annual ? '£59' : '£8',
      originalPrice: annual ? '£96' : undefined,
      description: 'Perfect for focused practice',
      trialDays: 30,
      isAnnual: annual,
      features: [
        'Unlimited daily practice questions',
        'Real-time progress tracking',
        'Personalized learning insights',
        'Topic-based analytics',
        'Mobile & desktop access',
        'Parent dashboard',
      ]
    },
    {
      planId: annual ? 'pass_plus_annual' : 'pass_plus_monthly',
      name: 'Pass Plus',
      price: annual ? '£99' : '£15',
      originalPrice: annual ? '£180' : undefined,
      description: 'Complete 11+ preparation',
      trialDays: 30,
      isPopular: true,
      isAnnual: annual,
      features: [
        'Everything in Pass',
        'Full bootcamp curriculum',
        'Mock exam simulations',
        'Advanced analytics & reports',
        'Personalized study plans',
        'Priority support',
        'Offline practice worksheets',
        'Achievement badges & rewards',
      ]
    }
  ];

  const plans = getPlans(isAnnual);

  return (
    <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-background to-muted/10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Start your 30-day free trial today. No credit card required.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
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
              <Badge variant="secondary" className="ml-2 bg-success/10 text-success">
                Save upto 45%
              </Badge>
            )}
          </div>
          
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium">
            <Check className="h-4 w-4" />
            Cancel anytime • No commitment • Full access during trial
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <PricingCard key={plan.planId} {...plan} />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Questions about pricing? 
            <a href="#" className="text-primary hover:underline ml-1">Contact our team</a>
          </p>
        </div>
      </div>
    </section>
  );
};