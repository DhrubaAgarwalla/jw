-- Fix Reseller Applications RLS Policy
-- Run this SQL in your Supabase SQL Editor

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can create applications" ON reseller_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON reseller_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON reseller_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON reseller_applications;

-- Create permissive policies for reseller applications

-- Allow anyone to create reseller applications
CREATE POLICY "Allow reseller application creation" ON reseller_applications
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own applications
CREATE POLICY "Users can view own applications" ON reseller_applications
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = '00000000-0000-0000-0000-000000000001'::uuid
    );

-- Allow admins to view all applications
CREATE POLICY "Admins can view all applications" ON reseller_applications
    FOR SELECT USING (
        auth.uid() = '00000000-0000-0000-0000-000000000001'::uuid OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to update applications
CREATE POLICY "Admins can update applications" ON reseller_applications
    FOR UPDATE USING (
        auth.uid() = '00000000-0000-0000-0000-000000000001'::uuid OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create a function to handle reseller application creation with proper auth context
CREATE OR REPLACE FUNCTION create_reseller_application(
    p_user_id UUID,
    p_company_name VARCHAR(255),
    p_contact_person VARCHAR(255),
    p_email VARCHAR(255),
    p_phone VARCHAR(20),
    p_business_address JSONB,
    p_business_type VARCHAR(100),
    p_years_in_business VARCHAR(50),
    p_tax_id VARCHAR(100),
    p_website VARCHAR(255),
    p_expected_monthly_volume VARCHAR(50),
    p_business_description TEXT,
    p_trade_references TEXT
)
RETURNS UUID AS $$
DECLARE
    new_application_id UUID;
BEGIN
    -- Insert the reseller application
    INSERT INTO reseller_applications (
        user_id,
        company_name,
        contact_person,
        email,
        phone,
        business_address,
        business_type,
        years_in_business,
        tax_id,
        website,
        expected_monthly_volume,
        business_description,
        trade_references,
        status
    ) VALUES (
        p_user_id,
        p_company_name,
        p_contact_person,
        p_email,
        p_phone,
        p_business_address,
        p_business_type,
        p_years_in_business,
        p_tax_id,
        p_website,
        p_expected_monthly_volume,
        p_business_description,
        p_trade_references,
        'pending'
    ) RETURNING id INTO new_application_id;
    
    RETURN new_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_reseller_application(
    UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, JSONB, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, TEXT, TEXT
) TO authenticated, anon;

-- Alternative: Temporarily disable RLS for reseller_applications if above doesn't work
-- Uncomment the line below if the policies still don't work
-- ALTER TABLE reseller_applications DISABLE ROW LEVEL SECURITY;

-- Instructions:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. This will fix the RLS policies for reseller applications
-- 3. Users should now be able to create reseller applications
-- 4. If it still doesn't work, uncomment the line that disables RLS

COMMIT;