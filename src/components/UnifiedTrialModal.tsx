import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Eye, EyeOff, Crown, Zap, Star, Check } from 'lucide-react';

interface UnifiedTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: 'pass' | 'pass_plus';
  requiredFeature?: 'daily_mode' | 'bootcamp';
  mode?: 'signup' | 'upgrade';
}

export const UnifiedTrialModal: React.FC<UnifiedTrialModalProps> = ({
  isOpen,
  onClose,
  planId: initialPlanId = 'pass_plus',
  requiredFeature,
  mode = 'signup'
}) => {
  const { user, signUp, signIn } = useAuth();
  const { userState, createCheckoutSession } = useSubscription();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  const [trialEligible, setTrialEligible] = useState<boolean | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [planId, setPlanId] = useState<'pass' | 'pass_plus'>(initialPlanId);

  const planDetails = {
    pass: {
      name: 'Pass',
      monthlyPrice: 8,
      annualPrice: 59,
      features: [
        'Daily performance snapshots',
        'Personalized progress analytics', 
        'Customized worksheets',
        'Topic-based insights'
      ]
    },
    pass_plus: {
      name: 'Pass Plus',
      monthlyPrice: 15,
      annualPrice: 99,
      features: [
        'Everything in Pass',
        '52-week structured bootcamp',
        'Mock exam simulations',
        'Weekly performance monitoring',
        'Advanced analytics & reports'
      ]
    }
  };

  const plan = planDetails[planId];
  const currentPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const billingPeriod = isAnnual ? 'year' : 'month';

  const checkTrialEligibility = async (userEmail: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-trial-eligibility', {
        body: { email: userEmail }
      });
      
      if (error) {
        console.error('Error checking trial eligibility:', error);
        return true;
      }
      
      return data?.eligible ?? true;
    } catch (error) {
      console.error('Error checking trial eligibility:', error);
      return true;
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    setHasExistingAccount(false);
    setTrialEligible(null);
    
    if (newEmail.includes('@') && newEmail.includes('.')) {
      const eligible = await checkTrialEligibility(newEmail);
      setTrialEligible(eligible);
    }
  };

  const handleSubscribeClick = async () => {
    if (!user && mode === 'upgrade') {
      toast.error('Please sign in first');
      return;
    }

    try {
      const actualPlanId = isAnnual 
        ? `${planId}_annual` 
        : `${planId}_monthly`;
      
      const { url, error } = await createCheckoutSession(actualPlanId);
      
      if (error) {
        toast.error('Failed to start checkout process. Please try again.');
        return;
      }
      
      if (url) {
        onClose();
        window.open(url, '_blank');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const startTrialFlow = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      if (hasExistingAccount) {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          toast.error('Invalid email or password');
          setIsLoading(false);
          return;
        }
      } else {
        const { error: signUpError } = await signUp(email, password, '11+');
        if (signUpError) {
          if (signUpError.message?.includes('already registered')) {
            setHasExistingAccount(true);
            toast.error('Account already exists. Please sign in instead.');
            setIsLoading(false);
            return;
          }
          toast.error(signUpError.message || 'Failed to create account');
          setIsLoading(false);
          return;
        }
      }
      
      // Wait for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Use the unified checkout function with trial
      const actualPlanId = `${planId}_monthly`;
      const { url, error } = await createCheckoutSession(actualPlanId);

      if (error) {
        toast.error('Failed to start trial. Please try again.');
        setIsLoading(false);
        return;
      }

      if (url) {
        onClose();
        window.open(url, '_blank');
        toast.success('Redirecting to secure checkout...');
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show upgrade flow for existing authenticated users
  if (mode === 'upgrade' || user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {userState === 'expired' ? 'Choose Plan & Reactivate' : 'Choose Your Plan'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pass Plan */}
            <Card 
              className={`border-2 transition-all cursor-pointer ${planId === 'pass' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
              onClick={() => setPlanId('pass')}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Pass</CardTitle>
                  <Badge variant="outline">Essential</Badge>
                </div>
                
                <div className="flex items-center justify-center gap-4 mt-4">
                  <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Monthly
                  </span>
                  <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
                  <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Annual
                  </span>
                </div>

                <div className="text-center mt-4">
                  <div className="text-2xl font-bold">
                    £{isAnnual ? planDetails.pass.annualPrice : planDetails.pass.monthlyPrice}
                  </div>
                  <div className="text-sm text-muted-foreground">per {isAnnual ? 'year' : 'month'}</div>
                  {isAnnual && (
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Save £{planDetails.pass.monthlyPrice * 12 - planDetails.pass.annualPrice}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {planDetails.pass.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pass Plus Plan */}
            <Card 
              className={`border-2 transition-all cursor-pointer relative ${planId === 'pass_plus' ? 'border-primary bg-primary/5' : 'border-primary/50 hover:border-primary'}`}
              onClick={() => setPlanId('pass_plus')}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="pb-4 pt-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Pass Plus</CardTitle>
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                    Premium
                  </Badge>
                </div>
                
                <div className="flex items-center justify-center gap-4 mt-4">
                  <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Monthly
                  </span>
                  <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
                  <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Annual
                  </span>
                </div>

                <div className="text-center mt-4">
                  <div className="text-2xl font-bold">
                    £{isAnnual ? planDetails.pass_plus.annualPrice : planDetails.pass_plus.monthlyPrice}
                  </div>
                  <div className="text-sm text-muted-foreground">per {isAnnual ? 'year' : 'month'}</div>
                  {isAnnual && (
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Save £{planDetails.pass_plus.monthlyPrice * 12 - planDetails.pass_plus.annualPrice}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {planDetails.pass_plus.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mt-6">
            <Button
              onClick={handleSubscribeClick}
              className="px-8"
              size="lg"
            >
              {userState === 'expired' 
                ? `Reactivate ${planId === 'pass' ? 'Pass' : 'Pass Plus'} Now` 
                : `Subscribe to ${planId === 'pass' ? 'Pass' : 'Pass Plus'}`
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show signup flow for new users
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Start Your Free Trial
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-2">
            Get 7 days free access to {planId === 'pass_plus' ? 'Pass Plus' : 'Pass'} features
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trial Benefits */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold">{planId === 'pass_plus' ? 'Pass Plus' : 'Pass'} Trial</h3>
                  <p className="text-sm text-muted-foreground">7 days free, then {planId === 'pass_plus' ? '£15' : '£8'}/month</p>
                </div>
              </div>
              <div className="space-y-2">
                {(planId === 'pass_plus' ? planDetails.pass_plus : planDetails.pass).features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account Creation Form */}
          <div className="space-y-4">

            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email || user?.email || ''}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  className="mt-1"
                  disabled={!!user?.email}
                />
                {trialEligible === false && (
                  <p className="text-xs text-amber-600 mt-1">
                    This email has already used a trial. You can still subscribe directly.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {hasExistingAccount && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Account exists! Please enter your password to sign in and start your trial.
                </p>
              </div>
            )}

            <Button
              onClick={startTrialFlow}
              disabled={isLoading || !email || !password}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  {hasExistingAccount ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                <>
                  {trialEligible === false 
                    ? `Subscribe to ${planId === 'pass' ? 'Pass' : 'Pass Plus'} Now` 
                    : hasExistingAccount 
                      ? `Sign In & Start ${planId === 'pass' ? 'Pass' : 'Pass Plus'} Trial`
                      : `Start ${planId === 'pass' ? 'Pass' : 'Pass Plus'} Free Trial`
                  }
                </>
              )}
            </Button>

            <div className="space-y-2 text-xs text-muted-foreground text-center">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3" />
                  <span>No credit card required for trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  <span>Cancel anytime during trial</span>
                </div>
              </div>
              <p>
                By continuing, you agree to our Terms of Service and Privacy Policy.
                {trialEligible !== false && (
                  <span className="block mt-1">
                    Your trial will automatically start after account creation.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};