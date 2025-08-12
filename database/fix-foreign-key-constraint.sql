-- Fix Foreign Key Constraint Issue for Reseller Applications
-- Run this SQL in your Supabase SQL Editor

-- The issue is that reviewed_by references auth.users(id) but the admin user doesn't exist in auth.users
-- We need to either:
-- 1. Make reviewed_by nullable and allow NULL values
-- 2. Create the admin user in auth.users
-- 3. Change the foreign key constraint

-- Option 1: Make reviewed_by nullable (recommended)
ALTER TABLE reseller_applications 
ALTER COLUMN reviewed_by DROP NOT NULL;

-- Option 2: Drop the foreign key constraint temporarily
ALTER TABLE reseller_applications 
DROP CONSTRAINT IF EXISTS reseller_applications_reviewed_by_fkey;

-- Add a new constraint that allows NULL values
ALTER TABLE reseller_applications 
ADD CONSTRAINT reseller_applications_reviewed_by_fkey 
FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update the updateApplicationStatus function to handle admin user properly
CREATE OR REPLACE FUNCTION update_application_status_safe(
    application_id UUID,
    new_status application_status,
    reviewer_id UUID DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    company_name VARCHAR(255),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    business_address JSONB,
    business_type VARCHAR(100),
    years_in_business VARCHAR(50),
    tax_id VARCHAR(100),
    website VARCHAR(255),
    expected_monthly_volume VARCHAR(50),
    business_description TEXT,
    trade_references TEXT,
    status application_status,
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    app_record RECORD;
BEGIN
    -- Update the application status
    UPDATE reseller_applications 
    SET 
        status = new_status,
        reviewed_by = CASE 
            WHEN reviewer_id = '00000000-0000-0000-0000-000000000001'::uuid THEN NULL
            ELSE reviewer_id
        END,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE reseller_applications.id = application_id
    RETURNING * INTO app_record;
    
    -- If approved, activate the user's B2B account
    IF new_status = 'approved' AND app_record.user_id IS NOT NULL THEN
        -- Update user profile
        UPDATE user_profiles 
        SET 
            role = 'b2b',
            is_approved = true,
            company_name = app_record.company_name,
            updated_at = NOW()
        WHERE user_profiles.id = app_record.user_id;
        
        -- Confirm email for B2B users (since manual approval replaces email verification)
        UPDATE auth.users 
        SET 
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = app_record.user_id AND email_confirmed_at IS NULL;
    END IF;
    
    -- Return the updated record
    RETURN QUERY
    SELECT 
        app_record.id,
        app_record.user_id,
        app_record.company_name,
        app_record.contact_person,
        app_record.email,
        app_record.phone,
        app_record.business_address,
        app_record.business_type,
        app_record.years_in_business,
        app_record.tax_id,
        app_record.website,
        app_record.expected_monthly_volume,
        app_record.business_description,
        app_record.trade_references,
        app_record.status,
        app_record.reviewed_by,
        app_record.reviewed_at,
        app_record.created_at,
        app_record.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_application_status_safe(UUID, application_status, UUID) TO authenticated, anon;

-- Alternative: Create a mock admin user in auth.users if needed
-- This is commented out as it requires superuser privileges
/*
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@jewelrystore.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    'authenticated'
) ON CONFLICT (id) DO NOTHING;
*/

-- Instructions:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. This will fix the foreign key constraint issue
-- 3. The reviewed_by field will now accept NULL values for admin operations
-- 4. The new function handles admin operations safely

COMMIT;