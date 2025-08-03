-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  trial_days INTEGER DEFAULT 0,
  allows_daily_mode BOOLEAN DEFAULT false,
  allows_bootcamp BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert the two plans
INSERT INTO public.subscription_plans (id, name, description, price_monthly, features, trial_days, allows_daily_mode, allows_bootcamp) VALUES
('pass', 'Pass', 'Access to daily practice mode', 9.99, '["Daily practice mode", "Progress tracking", "Basic analytics"]', 30, true, false),
('pass_plus', 'Pass Plus', 'Full access to daily mode and bootcamp', 19.99, '["Daily practice mode", "Bootcamp access", "Advanced analytics", "Progress tracking", "Achievement system"]', 7, true, true);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES public.subscription_plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, expired, trial
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  is_trial BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscription exemptions table for admin overrides
CREATE TABLE public.subscription_exemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  exemption_type TEXT NOT NULL, -- 'full_access', 'extended_trial', 'free_plan'
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Insert exemption for the specified email
INSERT INTO public.subscription_exemptions (email, exemption_type, reason, is_active) 
VALUES ('yasirrmir@gmail.com', 'full_access', 'Admin exemption - full access to all features', true);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_exemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
FOR SELECT USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON public.user_subscriptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for subscription_exemptions (admin only, but users can check if they're exempted)
CREATE POLICY "Users can check their own exemptions" ON public.subscription_exemptions
FOR SELECT USING (
  auth.uid() = user_id OR 
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create function to check if user has access to a feature
CREATE OR REPLACE FUNCTION public.user_has_feature_access(feature_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  has_exemption BOOLEAN := false;
  has_active_subscription BOOLEAN := false;
  has_valid_trial BOOLEAN := false;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check for exemptions
  SELECT EXISTS(
    SELECT 1 FROM public.subscription_exemptions 
    WHERE (user_id = auth.uid() OR email = user_email)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  ) INTO has_exemption;
  
  IF has_exemption THEN
    RETURN true;
  END IF;
  
  -- Check for active subscription or valid trial
  IF feature_type = 'daily_mode' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.user_subscriptions us
      JOIN public.subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = auth.uid()
      AND sp.allows_daily_mode = true
      AND (
        (us.status = 'active' AND us.subscription_end_date > now()) OR
        (us.is_trial = true AND us.trial_end_date > now())
      )
    ) INTO has_active_subscription;
  ELSIF feature_type = 'bootcamp' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.user_subscriptions us
      JOIN public.subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = auth.uid()
      AND sp.allows_bootcamp = true
      AND (
        (us.status = 'active' AND us.subscription_end_date > now()) OR
        (us.is_trial = true AND us.trial_end_date > now())
      )
    ) INTO has_active_subscription;
  END IF;
  
  RETURN has_active_subscription;
END;
$$;

-- Create function to start a trial
CREATE OR REPLACE FUNCTION public.start_trial(plan_id_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_days INTEGER;
  user_email TEXT;
  has_exemption BOOLEAN := false;
  existing_trial BOOLEAN := false;
  result JSONB;
BEGIN
  -- Get user email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check for exemptions
  SELECT EXISTS(
    SELECT 1 FROM public.subscription_exemptions 
    WHERE (user_id = auth.uid() OR email = user_email)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  ) INTO has_exemption;
  
  IF has_exemption THEN
    RETURN jsonb_build_object('success', false, 'message', 'User already has full access');
  END IF;
  
  -- Check if user already has a trial for this plan
  SELECT EXISTS(
    SELECT 1 FROM public.user_subscriptions 
    WHERE user_id = auth.uid() 
    AND plan_id = plan_id_param
    AND is_trial = true
  ) INTO existing_trial;
  
  IF existing_trial THEN
    RETURN jsonb_build_object('success', false, 'message', 'Trial already used for this plan');
  END IF;
  
  -- Get trial days for the plan
  SELECT sp.trial_days INTO trial_days 
  FROM public.subscription_plans sp 
  WHERE sp.id = plan_id_param;
  
  IF trial_days IS NULL OR trial_days = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'No trial available for this plan');
  END IF;
  
  -- Create trial subscription
  INSERT INTO public.user_subscriptions 
  (user_id, plan_id, status, is_trial, trial_start_date, trial_end_date)
  VALUES (
    auth.uid(), 
    plan_id_param, 
    'trial', 
    true, 
    now(), 
    now() + (trial_days || ' days')::interval
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'message', 'Trial started successfully',
    'trial_days', trial_days,
    'trial_end_date', now() + (trial_days || ' days')::interval
  );
END;
$$;