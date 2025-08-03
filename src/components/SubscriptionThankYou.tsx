import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Settings, Zap, TrendingUp, Target, ExternalLink } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
              <CheckCircle className="relative h-20 w-20 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 text-foreground tracking-tight">
            Welcome to {planName}!
          </h1>
          
          <div className="space-y-3 max-w-2xl mx-auto">
            <p className="text-xl text-foreground leading-relaxed">
              Thank you for subscribing! Your learning journey just got a <span className="text-primary font-semibold">major upgrade</span>.
            </p>
            <p className="text-muted-foreground font-medium">
              You now have access to all premium features.
            </p>
          </div>
        </div>

        {/* Success Card */}
        <div className="max-w-3xl mx-auto">
          <Card className="relative bg-card border-2 transition-all duration-300 shadow-2xl border-primary/20 overflow-hidden">
            {/* Premium Badge */}
            <div className="absolute top-6 right-6">
              <Badge className="bg-primary text-primary-foreground hover:bg-primary hover:text-white border-primary/20 px-4 py-2 text-sm font-medium transition-colors">
                <Crown className="mr-2 h-4 w-4" />
                {planName} Subscriber
              </Badge>
            </div>
            
            <CardHeader className="pt-16 pb-8 px-10">
              <div className="text-center">
                <h3 className="text-4xl font-bold text-foreground mb-6">
                  You now have access to:
                </h3>
              </div>
            </CardHeader>

            <CardContent className="px-10 pb-10">
              {/* Features Grid */}
              <div className="space-y-6 mb-10">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-foreground font-semibold text-lg">{feature.text}</div>
                  </div>
                ))}
              </div>

              {/* Call to Action Buttons */}
              <div className="space-y-4 mb-8">
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
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Footer Note */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground text-center leading-relaxed">
                  You can manage your subscription, update payment methods, or make changes to your plan 
                  anytime in your{" "}
                  <button 
                    onClick={handleGoToProfile}
                    className="text-primary hover:underline font-medium transition-colors"
                  >
                    profile settings
                  </button>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};