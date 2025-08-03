import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Settings, Zap, TrendingUp, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionThankYouProps {
  planType?: 'pass' | 'pass_plus';
}

export const SubscriptionThankYou: React.FC<SubscriptionThankYouProps> = ({ 
  planType = 'pass_plus' 
}) => {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const passFeatures = [
    { icon: Zap, text: "Daily Performance Snapshots" },
    { icon: TrendingUp, text: "Personalized Progress Analytics" },
    { icon: Target, text: "Customized Worksheets" },
  ];

  const passPlusFeatures = [
    { icon: Crown, text: "The 52-Week Bootcamp" },
    { icon: Target, text: "Realistic Mock Exams" },
    { icon: TrendingUp, text: "Weekly Performance Monitoring" },
    { icon: Zap, text: "All Pass features included" },
  ];

  const features = planType === 'pass_plus' ? passPlusFeatures : passFeatures;
  const planName = planType === 'pass_plus' ? 'Pass Plus' : 'Pass';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center shadow-2xl border-2 border-primary/20">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
            <CheckCircle className="relative h-20 w-20 text-green-500" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to {planName}!
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Thank you for subscribing! Your learning journey just got a major upgrade.
        </p>

        {/* Plan Badge */}
        <div className="flex justify-center mb-8">
          <Badge className="px-6 py-3 text-lg font-semibold bg-primary text-primary-foreground">
            <Crown className="mr-2 h-5 w-5" />
            {planName} Subscriber
          </Badge>
        </div>

        {/* Features List */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">
            You now have access to:
          </h3>
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center space-x-3 p-3 rounded-lg bg-primary/5">
                <feature.icon className="h-6 w-6 text-primary flex-shrink-0" />
                <span className="text-foreground font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleGoToDashboard}
            size="lg"
            className="w-full py-4 text-lg font-semibold rounded-full transition-all duration-200 hover:scale-[1.02]"
          >
            Start Learning Now
          </Button>
          
          <Button
            onClick={handleGoToProfile}
            variant="outline"
            size="lg"
            className="w-full py-4 text-lg font-semibold rounded-full transition-all duration-200 hover:scale-[1.02]"
          >
            <Settings className="mr-2 h-5 w-5" />
            Manage Subscription
          </Button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            You can manage your subscription, update payment methods, or make changes to your plan 
            anytime in your{" "}
            <button 
              onClick={handleGoToProfile}
              className="text-primary hover:underline font-medium"
            >
              profile settings
            </button>
            .
          </p>
        </div>
      </Card>
    </div>
  );
};