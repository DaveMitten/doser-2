-- Add temperature_unit field to user_preferences table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.user_preferences 
ADD COLUMN temperature_unit TEXT DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit'));

-- Update existing records to have celsius as default
UPDATE public.user_preferences SET temperature_unit = 'celsius' WHERE temperature_unit IS NULL;
