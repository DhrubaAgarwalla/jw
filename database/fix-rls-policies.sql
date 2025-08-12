-- Fix for Row Level Security Infinite Recursion Issue
-- Run this SQL in your Supabase SQL Editor AFTER running the main schema

-- Drop the problematic admin policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Categories are editable by admins" ON categories;
DROP POLICY IF EXISTS "Products are editable by admins" ON products;
DROP POLICY IF EXISTS "Admins can view all applications" ON reseller_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON reseller_applications;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Inventory logs for admins only" ON inventory_logs;

-- Add INSERT policy for user profiles
CREATE POLICY "Allow profile creation" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create simplified admin policies using service role bypass
-- Categories: Allow all operations for service role
CREATE POLICY "Service role can manage categories" ON categories FOR ALL USING (current_setting('role') = 'service_role');

-- Products: Allow all operations for service role
CREATE POLICY "Service role can manage products" ON products FOR ALL USING (current_setting('role') = 'service_role');

-- Reseller applications: Allow service role to manage all
CREATE POLICY "Service role can manage applications" ON reseller_applications FOR ALL USING (current_setting('role') = 'service_role');

-- Orders: Allow service role to manage all
CREATE POLICY "Service role can manage orders" ON orders FOR ALL USING (current_setting('role') = 'service_role');

-- Inventory logs: Allow service role only
CREATE POLICY "Service role can manage inventory" ON inventory_logs FOR ALL USING (current_setting('role') = 'service_role');

-- Alternative: Create a simple admin check function that doesn't cause recursion
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Use a direct query without RLS to avoid recursion
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated, anon;

-- Create admin policies using the function (optional - use only if service role approach doesn't work)
-- Uncomment these if you need admin policies through the web interface:

/*
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON user_profiles FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can view all applications" ON reseller_applications FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update applications" ON reseller_applications FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage inventory" ON inventory_logs FOR ALL USING (is_admin(auth.uid()));
*/

-- Instructions:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. This will fix the infinite recursion issue
-- 3. Admin operations should now use the service role key in your application
-- 4. If you need admin policies through the web interface, uncomment the policies at the bottom

COMMIT;