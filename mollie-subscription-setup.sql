-- MOLLIE SUBSCRIPTION SETUP
-- Add this to your existing Supabase setup
-- Run this SQL in your Supabase SQL Editor

-- 1. USER SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('starter', 'pro', 'expert')),
  mollie_customer_id TEXT,
  mollie_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SUBSCRIPTION PAYMENTS TABLE (for tracking payment history)
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE CASCADE NOT NULL,
  mollie_payment_id TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'canceled', 'expired')),
  payment_method TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- 3. SUBSCRIPTION FEATURES TABLE (for feature access control)
CREATE TABLE IF NOT EXISTS public.subscription_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('starter', 'pro', 'expert')),
  feature_key TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY POLICIES
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;

-- User subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscriptions" ON public.user_subscriptions 
  FOR INSERT WITH CHECK (true);

-- Subscription payments policies
CREATE POLICY "Users can view their own payments" ON public.subscription_payments 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage payments" ON public.subscription_payments 
  FOR ALL USING (true);

-- Subscription features policies (public read)
CREATE POLICY "Anyone can view features" ON public.subscription_features 
  FOR SELECT USING (true);

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_user_id ON public.subscription_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON public.subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_mollie_payment_id ON public.subscription_payments(mollie_payment_id);
CREATE INDEX IF NOT EXISTS idx_subscription_features_plan_id ON public.subscription_features(plan_id);

-- 6. TRIGGERS
-- Update trigger for user_subscriptions
DROP TRIGGER IF EXISTS on_user_subscriptions_updated ON public.user_subscriptions;
CREATE TRIGGER on_user_subscriptions_updated 
  BEFORE UPDATE ON public.user_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. INSERT DEFAULT SUBSCRIPTION FEATURES
INSERT INTO public.subscription_features (plan_id, feature_key, feature_name, description, is_enabled) VALUES
-- Starter plan features
('starter', 'basic_calculator', 'Basic Dosage Calculator', 'Basic THC/CBD dosage calculations', true),
('starter', 'safety_guidelines', 'Safety Guidelines', 'Basic safety information and guidelines', true),
('starter', 'limited_calculations', 'Limited Calculations', '5 calculations per day limit', true),
('starter', 'basic_profiles', 'Basic Vaporizer Profiles', 'Standard vaporizer device profiles', true),

-- Pro plan features (includes all starter features)
('pro', 'basic_calculator', 'Basic Dosage Calculator', 'Basic THC/CBD dosage calculations', true),
('pro', 'safety_guidelines', 'Safety Guidelines', 'Basic safety information and guidelines', true),
('pro', 'unlimited_calculations', 'Unlimited Calculations', 'No daily calculation limits', true),
('pro', 'session_tracking', 'Session Tracking', 'Track and store dosing sessions', true),
('pro', 'tolerance_monitoring', 'Tolerance Monitoring', 'Monitor tolerance changes over time', true),
('pro', 'custom_profiles', 'Custom Vaporizer Profiles', 'Create custom device profiles', true),
('pro', 'weekly_insights', 'Weekly Insights', 'Weekly usage and tolerance insights', true),
('pro', 'basic_ai', 'Basic AI Recommendations', 'AI-powered dosage recommendations', true),

-- Expert plan features (includes all pro features)
('expert', 'basic_calculator', 'Basic Dosage Calculator', 'Basic THC/CBD dosage calculations', true),
('expert', 'safety_guidelines', 'Safety Guidelines', 'Basic safety information and guidelines', true),
('expert', 'unlimited_calculations', 'Unlimited Calculations', 'No daily calculation limits', true),
('expert', 'session_tracking', 'Session Tracking', 'Track and store dosing sessions', true),
('expert', 'tolerance_monitoring', 'Tolerance Monitoring', 'Monitor tolerance changes over time', true),
('expert', 'custom_profiles', 'Custom Vaporizer Profiles', 'Create custom device profiles', true),
('expert', 'weekly_insights', 'Weekly Insights', 'Weekly usage and tolerance insights', true),
('expert', 'basic_ai', 'Basic AI Recommendations', 'AI-powered dosage recommendations', true),
('expert', 'advanced_ai', 'Advanced AI Recommendations', 'Advanced AI with medical condition profiles', true),
('expert', 'medical_profiles', 'Medical Condition Profiles', 'Specialized profiles for medical conditions', true),
('expert', 'detailed_analytics', 'Detailed Analytics & Reports', 'Comprehensive usage analytics and reports', true),
('expert', 'data_export', 'Data Export', 'Export data in PDF/CSV formats', true),
('expert', 'priority_support', 'Priority Support', 'Priority customer support', true),
('expert', 'batch_calculations', 'Batch Calculations', 'Calculate multiple doses at once', true)
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- 8. FUNCTIONS
-- Function to check if user has feature access
CREATE OR REPLACE FUNCTION public.user_has_feature(user_id UUID, feature_key TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan TEXT;
  feature_enabled BOOLEAN;
BEGIN
  -- Get user's current plan
  SELECT plan_id INTO user_plan
  FROM public.user_subscriptions
  WHERE user_id = user_has_feature.user_id
    AND status IN ('active', 'trialing');
  
  -- If no active subscription, return false
  IF user_plan IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if feature is enabled for the plan
  SELECT is_enabled INTO feature_enabled
  FROM public.subscription_features
  WHERE plan_id = user_plan
    AND feature_key = user_has_feature.feature_key;
  
  -- Return true if feature is enabled, false otherwise
  RETURN COALESCE(feature_enabled, FALSE);
END;
$$;

-- Function to get user's subscription status
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(user_id UUID)
RETURNS TABLE(
  plan_id TEXT,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.plan_id,
    us.status,
    us.current_period_end,
    us.trial_end,
    us.cancel_at_period_end
  FROM public.user_subscriptions us
  WHERE us.user_id = get_user_subscription_status.user_id;
END;
$$;
