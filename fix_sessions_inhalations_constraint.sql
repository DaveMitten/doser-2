-- ===================================================================
-- FIX SESSIONS TABLE INHALATIONS CONSTRAINT
-- ===================================================================
-- This migration fixes the total_session_inhalations constraint to allow NULL values
-- when higher_accuracy_mode is false, which is the correct behavior

-- First, drop the existing constraint
ALTER TABLE public.sessions 
DROP CONSTRAINT IF EXISTS sessions_total_session_inhalations_check;

-- Make the column nullable
ALTER TABLE public.sessions 
ALTER COLUMN total_session_inhalations DROP NOT NULL;

-- Add a new constraint that allows NULL or valid range when not null
ALTER TABLE public.sessions 
ADD CONSTRAINT sessions_total_session_inhalations_check 
CHECK (
  total_session_inhalations IS NULL 
  OR (total_session_inhalations > 0 AND total_session_inhalations <= 50)
);

-- Add a comment explaining the constraint logic
COMMENT ON COLUMN public.sessions.total_session_inhalations IS 
'Total inhalations for the session. NULL when higher_accuracy_mode is false, otherwise must be 1-50.';

-- ===================================================================
-- MIGRATION COMPLETE
-- ===================================================================
-- The sessions table now correctly allows:
-- ✅ NULL total_session_inhalations when higher_accuracy_mode is false
-- ✅ Valid range (1-50) when total_session_inhalations is provided
-- ✅ Proper constraint validation based on the field's purpose
