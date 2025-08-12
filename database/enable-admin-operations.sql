-- Enable Admin Operations for CRUD functionality
-- Run this SQL in your Supabase SQL Editor to fix admin create/delete issues

-- First, ensure the is_admin function exists and works properly
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

-- Enable admin policies for full CRUD operations

-- Categories: Admin can do everything
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert categories" ON categories FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can delete categories" ON categories FOR DELETE USING (is_admin(auth.uid()));

-- Products: Admin can do everything
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (is_admin(auth.uid()));

-- User profiles: Admin can view and update all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON user_profiles FOR UPDATE USING (is_admin(auth.uid()));

-- Reseller applications: Admin can view and update all
CREATE POLICY "Admins can view all applications" ON reseller_applications FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update applications" ON reseller_applications FOR UPDATE USING (is_admin(auth.uid()));

-- Orders: Admin can view and update all
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert orders" ON orders FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE USING (is_admin(auth.uid()));

-- Order items: Admin can manage all
CREATE POLICY "Admins can manage order items" ON order_items FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert order items" ON order_items FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can delete order items" ON order_items FOR DELETE USING (is_admin(auth.uid()));

-- Inventory logs: Admin can manage all
CREATE POLICY "Admins can manage inventory" ON inventory_logs FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert inventory" ON inventory_logs FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can delete inventory" ON inventory_logs FOR DELETE USING (is_admin(auth.uid()));

-- Alternative approach: Create a bypass function for admin operations
CREATE OR REPLACE FUNCTION bypass_rls_for_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if current user is admin
    IF is_admin(auth.uid()) THEN
        -- Temporarily disable RLS for this session
        PERFORM set_config('row_security', 'off', true);
        RETURN true;
    END IF;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION bypass_rls_for_admin() TO authenticated;

-- Create a function to create admin user if none exists
CREATE OR REPLACE FUNCTION create_admin_user(admin_email TEXT, admin_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- Insert admin user profile (this will work even with RLS)
    INSERT INTO user_profiles (id, email, full_name, role, is_approved)
    SELECT 
        auth.uid(),
        admin_email,
        admin_name,
        'admin'::user_role,
        true
    WHERE NOT EXISTS (
        SELECT 1 FROM user_profiles WHERE role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_admin_user(TEXT, TEXT) TO authenticated, anon;

-- Instructions:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. This will enable admin CRUD operations
-- 3. Make sure you have an admin user in your user_profiles table
-- 4. If you don't have an admin user, you can create one by calling:
--    SELECT create_admin_user('admin@example.com', 'Admin User');
-- 5. Then update the user's role to 'admin' manually in the database

COMMIT;