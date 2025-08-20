-- ===================================================================
-- ADD TEMPERATURE UNIT PREFERENCE AND UPDATE SESSIONS TABLE
-- ===================================================================
-- This migration adds temperature unit preference and updates the sessions table
-- Run this SQL in your Supabase SQL Editor

-- First, backup existing data (optional but recommended)
-- CREATE TABLE sessions_backup AS SELECT * FROM sessions;

-- Drop the existing sessions table (this will lose existing data)
DROP TABLE IF EXISTS public.sessions CASCADE;

-- Create the new sessions table with comprehensive fields
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
  total_session_inhalations INTEGER NOT NULL CHECK (total_session_inhalations > 0 AND total_session_inhalations <= 50),
  
  -- Unit and dosing (changed from material to unit for clarity)
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

-- ===================================================================
-- UPDATE USER_PREFERENCES TABLE
-- ===================================================================
-- Add temperature_unit column if it doesn't exist
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS temperature_unit TEXT DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit'));

-- Update existing records to have default temperature unit
UPDATE public.user_preferences 
SET temperature_unit = 'celsius' 
WHERE temperature_unit IS NULL;

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================
-- The sessions table now supports:
-- ✅ Rich session data collection
-- ✅ Temperature in both Celsius and Fahrenheit
-- ✅ Detailed unit and dosing information (changed from material)
-- ✅ Cannabinoid calculations
-- ✅ Effects tracking as an array
-- ✅ Session rating and notes
-- ✅ Proper validation constraints
-- ✅ Performance indexes
-- ✅ RLS policies maintained
-- 
-- User preferences now include:
-- ✅ Temperature unit preference (celsius/fahrenheit)
