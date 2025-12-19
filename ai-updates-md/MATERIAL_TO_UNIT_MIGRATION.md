# Material to Unit Migration Guide

## Overview

This document outlines the comprehensive changes made to fix two critical issues:

1. **Temperature data not being stored** - Fixed temperature conversion and storage logic
2. **Field naming clarity** - Changed `material` to `unit` throughout the system for better clarity

## Issues Fixed

### 1. Temperature Data Not Being Stored

**Problem**: The `temperature_celsius` field was not receiving data because the temperature conversion logic was flawed.

**Root Cause**: The original logic tried to guess the temperature unit based on value ranges (150-230 = Celsius, 300-450 = Fahrenheit), which was unreliable.

**Solution**:

- Added `temperatureUnit` parameter to `createSession` method
- Temperature is now stored based on the user's selected unit preference
- Both Celsius and Fahrenheit values are stored for each session
- Proper conversion between units is performed

### 2. Field Naming Clarity

**Problem**: The field name `material` was confusing and unclear about what it represents.

**Solution**: Changed `material` to `unit` throughout the system for better clarity.

## Database Schema Changes

### Sessions Table

- `material_type` → `unit_type`
- `material_amount` → `unit_amount`
- `material_capacity_grams` → `unit_capacity_grams`

### User Preferences Table

- Added `temperature_unit` field with default value 'celsius'

## Code Changes Made

### 1. Database Types (`src/lib/database.types.ts`)

- Updated all field references from `material_*` to `unit_*`
- Updated Row, Insert, and Update interfaces

### 2. Session Service (`src/lib/sessionService.ts`)

- Updated `SessionFormData` interface: `material` → `unit`, `materialAmount` → `unitAmount`
- Added `temperatureUnit` parameter to `createSession` method
- Fixed temperature conversion logic
- Updated validation error messages
- Updated database field mappings

### 3. Utility Functions (`src/lib/new-session.ts`)

- `getMaterialPlaceholder` → `getUnitPlaceholder`
- `getMaterialMax` → `getUnitMax`
- `getMaterialUnitLabel` → `getUnitLabel`
- Updated all function signatures and internal logic

### 4. Components

- **ConsumptionMethod.tsx**: Updated all references from `material` to `unit`
- **InhalationsSummary.tsx**: Updated field references and function calls
- **DosageBreakdown.tsx**: Updated all field references and calculations
- **new-session-form.tsx**: Updated form state and validation logic

## Migration Steps

### 1. Database Migration

Run the SQL script `add_temperature_unit_preference.sql` in your Supabase SQL Editor:

```sql
-- This will:
-- 1. Drop and recreate the sessions table with new schema
-- 2. Add temperature_unit to user_preferences
-- 3. Set up proper indexes and RLS policies
```

**⚠️ Warning**: This migration will drop the existing sessions table. Make sure to backup any important data first.

### 2. Code Deployment

Deploy the updated code with all the field name changes.

### 3. Testing

- Test form submission with temperature data
- Verify both Celsius and Fahrenheit values are stored
- Confirm all unit-related functionality works correctly

## Benefits of Changes

### 1. Temperature Fix

- ✅ Temperature data is now properly stored
- ✅ Both units are available for display
- ✅ Accurate conversion between units
- ✅ User preference is respected

### 2. Field Naming

- ✅ Clearer, more intuitive field names
- ✅ Better code readability
- ✅ Consistent terminology throughout
- ✅ Easier to understand for new developers

## Breaking Changes

### Database

- Existing sessions table will be dropped and recreated
- All existing session data will be lost

### API

- `createSession` method now requires `temperatureUnit` parameter
- Field names in `SessionFormData` have changed

### Frontend

- Form field names have changed from `material` to `unit`
- Component props and state management updated

## Rollback Plan

If issues arise, you can:

1. **Database**: Restore from backup if you created one
2. **Code**: Revert to previous commit before these changes
3. **Gradual Rollout**: Test with a subset of users first

## Testing Checklist

- [ ] Temperature input works in both Celsius and Fahrenheit
- [ ] Temperature data is stored in database
- [ ] Unit selection (capsule/chamber) works correctly
- [ ] Unit amount input works correctly
- [ ] Form validation works with new field names
- [ ] All calculations use correct field references
- [ ] Database queries work with new schema
- [ ] No console errors in browser
- [ ] Form submission completes successfully

## Future Considerations

1. **Data Migration**: If you need to preserve existing data, create a more sophisticated migration script
2. **API Versioning**: Consider versioning your API to handle both old and new field names
3. **User Communication**: Inform users about the changes and any data loss
4. **Monitoring**: Watch for any errors or issues after deployment

## Support

If you encounter any issues during migration:

1. Check the browser console for JavaScript errors
2. Verify the database schema matches the expected structure
3. Ensure all code changes have been deployed
4. Test with a fresh database if possible
