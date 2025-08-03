-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  monthly_price TEXT NOT NULL,
  annual_price TEXT NOT NULL,
  trial_days INTEGER DEFAULT 0,
  allows_daily_mode BOOLEAN DEFAULT false,
  allows_bootcamp BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert subscription plans
INSERT INTO public.subscription_plans (id, name, description, monthly_price, annual_price, trial_days, allows_daily_mode, allows_bootcamp, features) VALUES 
('trial', 'Free Trial', '30-day trial with full access', '0', '0', 30, true, true, '["daily_mode", "bootcamp", "analytics", "unlimited_questions"]'),
('pass', 'Pass', 'Access to daily mode learning', '9.99', '99.99', 0, true, false, '["daily_mode", "analytics", "unlimited_questions"]'),
('pass_plus', 'Pass Plus', 'Access to daily mode and bootcamp', '19.99', '199.99', 0, true, true, '["daily_mode", "bootcamp", "analytics", "unlimited_questions", "mock_exams", "progress_tracking"]');

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, trial, expired, cancelled
  is_trial BOOLEAN DEFAULT false,
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subscription exemptions table for special access
CREATE TABLE public.subscription_exemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_exemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for subscription_exemptions  
CREATE POLICY "Users can view their own exemptions" ON public.subscription_exemptions
  FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

-- Edge functions can manage all subscription data
CREATE POLICY "Service role can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (true);

CREATE POLICY "Service role can manage exemptions" ON public.subscription_exemptions
  FOR ALL USING (true);

-- Create function to automatically start trial on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert trial subscription for new user
  INSERT INTO public.user_subscriptions (
    user_id, 
    plan_id, 
    status, 
    is_trial, 
    trial_start_date, 
    trial_end_date
  ) VALUES (
    NEW.id, 
    'trial', 
    'trial', 
    true, 
    now(), 
    now() + interval '30 days'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to start trial on user signup
CREATE TRIGGER on_auth_user_created_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_trial();

-- Update triggers for timestamp updates
CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();

CREATE TRIGGER update_subscription_exemptions_updated_at
  BEFORE UPDATE ON public.subscription_exemptions
  FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();