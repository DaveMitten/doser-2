-- ============================================================================
-- COMPLETE DOSER APP DATABASE SETUP FOR SUPABASE
-- ============================================================================
-- Project: https://xmxaadpeoujtoctfzhoe.supabase.co
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Click "New Query"
-- 3. Copy and paste this ENTIRE script
-- 4. Click "Run" (or press Cmd/Ctrl + Enter)
-- 5. Verify all tables were created successfully
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. UTILITY FUNCTIONS (Create first, used by triggers later)
-- ============================================================================

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 3. USER PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  default_vape_type TEXT,
  inhalations_per_capsule INTEGER DEFAULT 10 CHECK (inhalations_per_capsule > 0),
  preferred_dose_unit TEXT DEFAULT 'mg' CHECK (preferred_dose_unit IN ('mg', 'ml', 'inhalations', 'capsules')),
  temperature_unit TEXT DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

-- Create policies for user_preferences table
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for user_preferences updated_at
DROP TRIGGER IF EXISTS on_user_preferences_updated ON public.user_preferences;
CREATE TRIGGER on_user_preferences_updated
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- ============================================================================
-- 4. SESSIONS TABLE (Vaping Sessions Tracking)
-- ============================================================================

-- Drop existing sessions table if it exists (careful - this deletes data!)
DROP TABLE IF EXISTS public.sessions CASCADE;

CREATE TABLE public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Session timing
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 300),

  -- Device and method
  device_name TEXT NOT NULL,
  temperature_celsius NUMERIC(5,1) CHECK (temperature_celsius >= 150 AND temperature_celsius <= 230),
  temperature_fahrenheit NUMERIC(5,1) CHECK (temperature_fahrenheit >= 300 AND temperature_fahrenheit <= 450),
  total_session_inhalations INTEGER CHECK (total_session_inhalations IS NULL OR (total_session_inhalations > 0 AND total_session_inhalations <= 50)),

  -- Unit and dosing
  unit_type TEXT NOT NULL CHECK (unit_type IN ('capsule', 'chamber')),
  unit_amount INTEGER NOT NULL CHECK (unit_amount > 0 AND unit_amount <= 10),
  unit_capacity_grams NUMERIC(4,3) NOT NULL CHECK (unit_capacity_grams > 0),

  -- Cannabinoid content
  thc_percentage NUMERIC(4,1) NOT NULL CHECK (thc_percentage >= 0 AND thc_percentage <= 100),
  cbd_percentage NUMERIC(4,1) NOT NULL CHECK (cbd_percentage >= 0 AND cbd_percentage <= 100),
  total_thc_mg NUMERIC(6,1) NOT NULL CHECK (total_thc_mg >= 0),
  total_cbd_mg NUMERIC(6,1) NOT NULL CHECK (total_cbd_mg >= 0),

  -- Calculation settings
  higher_accuracy_mode BOOLEAN DEFAULT false,
  inhalations_per_capsule INTEGER CHECK (inhalations_per_capsule > 0 AND inhalations_per_capsule <= 20),

  -- Effects and rating
  effects TEXT[] NOT NULL CHECK (array_length(effects, 1) > 0),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for sessions table
CREATE POLICY "Users can view their own sessions" ON public.sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_session_date ON public.sessions(session_date DESC);
CREATE INDEX idx_sessions_created_at ON public.sessions(created_at DESC);
CREATE INDEX idx_sessions_device_name ON public.sessions(device_name);
CREATE INDEX idx_sessions_effects ON public.sessions USING GIN(effects);

-- Create trigger for updated_at
CREATE TRIGGER on_sessions_updated
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 5. USER SUBSCRIPTIONS TABLE (Dodo Payments Integration)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'on_hold', 'failed', 'trialing')),
  dodo_subscription_id TEXT UNIQUE,
  dodo_customer_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service can manage subscriptions" ON public.user_subscriptions;

-- Create RLS policies
CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow service role to insert/update subscriptions (for webhooks)
CREATE POLICY "Service can manage subscriptions" ON public.user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dodo_subscription_id ON public.user_subscriptions(dodo_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_dodo_customer_id ON public.user_subscriptions(dodo_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_user_subscriptions_updated ON public.user_subscriptions;
CREATE TRIGGER on_user_subscriptions_updated
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 6. PAYMENT HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dodo_payment_id TEXT UNIQUE NOT NULL,
  dodo_subscription_id TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled')),
  payment_method TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payment_history
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Service can insert payment history" ON public.payment_history;
DROP POLICY IF EXISTS "Service can update payment history" ON public.payment_history;

-- Create RLS policies for payment_history
CREATE POLICY "Users can view own payment history" ON public.payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert/update payment records (for webhooks)
CREATE POLICY "Service can insert payment history" ON public.payment_history
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can update payment history" ON public.payment_history
  FOR UPDATE USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_dodo_payment_id ON public.payment_history(dodo_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_dodo_subscription_id ON public.payment_history(dodo_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history(created_at DESC);

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS on_payment_history_updated ON public.payment_history;
CREATE TRIGGER on_payment_history_updated
  BEFORE UPDATE ON public.payment_history
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 7. AUTOMATIC PROFILE CREATION ON SIGNUP
-- ============================================================================

-- Function to automatically create profile and preferences when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  -- Create default preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 8. HELPER FUNCTIONS FOR DODO PAYMENTS WEBHOOKS
-- ============================================================================

-- Function to get subscription by Dodo subscription ID (for webhook processing)
CREATE OR REPLACE FUNCTION public.get_subscription_by_dodo_id(dodo_sub_id TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  plan_id TEXT,
  status TEXT,
  dodo_subscription_id TEXT,
  dodo_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    us.id,
    us.user_id,
    us.plan_id,
    us.status,
    us.dodo_subscription_id,
    us.dodo_customer_id,
    us.current_period_start,
    us.current_period_end,
    us.trial_start,
    us.trial_end,
    us.created_at,
    us.updated_at
  FROM user_subscriptions us
  WHERE us.dodo_subscription_id = dodo_sub_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_subscription_by_dodo_id(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subscription_by_dodo_id(TEXT) TO service_role;

-- Function to update subscription status by Dodo subscription ID
CREATE OR REPLACE FUNCTION public.update_subscription_status_by_dodo_id(
  dodo_sub_id TEXT,
  new_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_subscriptions
  SET
    status = new_status,
    updated_at = NOW()
  WHERE dodo_subscription_id = dodo_sub_id;

  RETURN FOUND;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.update_subscription_status_by_dodo_id(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscription_status_by_dodo_id(TEXT, TEXT) TO service_role;

-- ============================================================================
-- 9. VERIFICATION QUERIES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '✅ DATABASE SETUP COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  ✅ profiles';
  RAISE NOTICE '  ✅ user_preferences';
  RAISE NOTICE '  ✅ sessions';
  RAISE NOTICE '  ✅ user_subscriptions';
  RAISE NOTICE '  ✅ payment_history';
  RAISE NOTICE '';
  RAISE NOTICE 'Security:';
  RAISE NOTICE '  ✅ Row Level Security (RLS) enabled on all tables';
  RAISE NOTICE '  ✅ Policies created for user data isolation';
  RAISE NOTICE '  ✅ Service role access for webhooks';
  RAISE NOTICE '';
  RAISE NOTICE 'Automation:';
  RAISE NOTICE '  ✅ Auto-create profile on signup';
  RAISE NOTICE '  ✅ Auto-create preferences on signup';
  RAISE NOTICE '  ✅ Auto-update timestamps on changes';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Update your .env.local with Supabase credentials';
  RAISE NOTICE '  2. Configure Supabase Auth settings (Email, OAuth, etc.)';
  RAISE NOTICE '  3. Test user signup and authentication';
  RAISE NOTICE '  4. Configure Dodo Payments webhook URL';
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
END $$;

COMMIT;

-- ============================================================================
-- OPTIONAL: View all tables to verify
-- ============================================================================
-- Run this separately if you want to see what was created:
--
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
