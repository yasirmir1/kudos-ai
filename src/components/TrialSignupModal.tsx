import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Eye, EyeOff, Crown, Zap, Star } from 'lucide-react';

interface TrialSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: 'pass' | 'pass_plus';
}

export const TrialSignupModal: React.FC<TrialSignupModalProps> = ({
  isOpen,
  onClose,
  planId = 'pass_plus'
}) => {
  const { user, signUp, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  const [trialEligible, setTrialEligible] = useState<boolean | null>(null);

  const planDetails = {
    pass: {
      name: 'Pass',
      price: '£8/month',
      features: [
        'Daily performance snapshots',
        'Personalized progress analytics', 
        'Customized worksheets',
        'Topic-based insights'
      ]
    },
    pass_plus: {
      name: 'Pass Plus',
      price: '£15/month',
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

  const checkTrialEligibility = async (userEmail: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-trial-eligibility', {
        body: { email: userEmail }
      });
      
      if (error) {
        console.error('Error checking trial eligibility:', error);
        return true; // Default to eligible if we can't check
      }
      
      return data?.eligible ?? true;
    } catch (error) {
      console.error('Error checking trial eligibility:', error);
      return true; // Default to eligible if we can't check
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Reset states when email changes
    setHasExistingAccount(false);
    setTrialEligible(null);
    
    // Check if email is valid format
    if (newEmail.includes('@') && newEmail.includes('.')) {
      const eligible = await checkTrialEligibility(newEmail);
      setTrialEligible(eligible);
    }
  };

  const startTrialFlow = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      let currentUser = user;
      
      // If not logged in, try to sign up or sign in
      if (!currentUser) {
        if (hasExistingAccount) {
          // Try to sign in
          const { error: signInError } = await signIn(email, password);
          if (signInError) {
            toast.error('Invalid email or password');
            setIsLoading(false);
            return;
          }
        } else {
          // Try to sign up
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
        
        // Wait a moment for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Start the trial with Stripe
      const { data, error } = await supabase.functions.invoke('create-checkout-public', {
        body: {
          email,
          planId: `${planId}_monthly`,
          trial: true
        }
      });

      if (error) {
        toast.error('Failed to start trial. Please try again.');
        setIsLoading(false);
        return;
      }

      if (data?.url) {
        // Close modal and open Stripe checkout
        onClose();
        window.open(data.url, '_blank');
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Start Your Free Trial
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Plan Details */}
          <Card className="border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <Badge className="bg-primary text-primary-foreground">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">Free for 7 days</div>
                <div className="text-sm text-muted-foreground">then {plan.price} after</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
              
              <Separator className="my-4" />
              
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3" />
                  <span>No credit card required for trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  <span>Cancel anytime during trial</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signup Form */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  className="mt-1"
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
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
                    ? 'Subscribe Now' 
                    : hasExistingAccount 
                      ? 'Sign In & Start Trial'
                      : 'Create Account & Start Trial'
                  }
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
              {trialEligible !== false && (
                <span className="block mt-1">
                  Your trial will automatically start after account creation.
                </span>
              )}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};