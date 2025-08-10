-- ===================================================================
-- SUPABASE AUTHENTICATION SETUP
-- ===================================================================
-- Run these SQL commands in your Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/cppbdcylcwpjuhyxiwud

-- Enable Row Level Security on auth.users (should already be enabled)
-- This ensures users can only access their own data

-- ===================================================================
-- 1. USER PROFILES TABLE
-- ===================================================================
-- Create profiles table that extends auth.users
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

-- Create policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ===================================================================
-- 2. USER SESSIONS TABLE
-- ===================================================================
-- Store user dosing sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vape_type TEXT NOT NULL,
  strain TEXT NOT NULL,
  thc_percentage NUMERIC NOT NULL CHECK (thc_percentage >= 0 AND thc_percentage <= 100),
  cbd_percentage NUMERIC NOT NULL CHECK (cbd_percentage >= 0 AND cbd_percentage <= 100),
  dose_amount NUMERIC NOT NULL CHECK (dose_amount > 0),
  dose_unit TEXT NOT NULL CHECK (dose_unit IN ('mg', 'ml', 'inhalations', 'capsules')),
  effects TEXT,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- ===================================================================
-- 3. USER PREFERENCES TABLE
-- ===================================================================
-- Store user-specific preferences and settings
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

-- Create policies for user_preferences table
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ===================================================================
-- 4. FUNCTIONS AND TRIGGERS
-- ===================================================================

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

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for user_preferences updated_at
DROP TRIGGER IF EXISTS on_user_preferences_updated ON public.user_preferences;
CREATE TRIGGER on_user_preferences_updated
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===================================================================
-- 5. AUTOMATIC PROFILE CREATION
-- ===================================================================
-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
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

-- ===================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- ===================================================================
-- SETUP COMPLETE
-- ===================================================================
-- Your Supabase authentication is now configured with:
-- ✅ User profiles table with RLS
-- ✅ Sessions tracking table with RLS  
-- ✅ User preferences table with RLS
-- ✅ Automatic profile creation on signup
-- ✅ Updated timestamp triggers
-- ✅ Performance indexes
-- 
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Test authentication in your app
-- 3. Verify RLS policies are working
