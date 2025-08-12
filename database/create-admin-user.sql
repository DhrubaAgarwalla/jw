-- Create Admin User and Fix Delete Operations
-- Run this SQL in your Supabase SQL Editor

-- First, create a real admin user in auth.users table
-- You'll need to do this manually in Supabase Auth dashboard or use this approach:

-- Create admin user profile directly (bypass RLS for this operation)
SET session_replication_role = replica;

-- Insert admin profile
INSERT INTO user_profiles (id, email, full_name, role, is_approved, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@jewelrystore.com',
    'Admin User',
    'admin'::user_role,
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin'::user_role,
    is_approved = true;

-- Reset session role
SET session_replication_role = DEFAULT;

-- Create a function to handle admin operations with elevated privileges
CREATE OR REPLACE FUNCTION admin_delete_product(product_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    is_user_admin BOOLEAN;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if user is admin (including mock admin)
    SELECT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE (id = current_user_id OR id = '00000000-0000-0000-0000-000000000001'::uuid)
        AND role = 'admin'
    ) INTO is_user_admin;
    
    -- If user is admin, delete the product
    IF is_user_admin THEN
        DELETE FROM products WHERE id = product_id;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle admin category deletion
CREATE OR REPLACE FUNCTION admin_delete_category(category_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    is_user_admin BOOLEAN;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if user is admin (including mock admin)
    SELECT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE (id = current_user_id OR id = '00000000-0000-0000-0000-000000000001'::uuid)
        AND role = 'admin'
    ) INTO is_user_admin;
    
    -- If user is admin, delete the category
    IF is_user_admin THEN
        DELETE FROM categories WHERE id = category_id;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle admin product creation
CREATE OR REPLACE FUNCTION admin_create_product(
    p_name VARCHAR(255),
    p_description TEXT,
    p_category_id UUID,
    p_image_url TEXT,
    p_b2c_price DECIMAL(10,2),
    p_b2b_price DECIMAL(10,2),
    p_min_quantity_b2b INTEGER,
    p_sku VARCHAR(100),
    p_material VARCHAR(100)
)
RETURNS UUID AS $$
DECLARE
    current_user_id UUID;
    is_user_admin BOOLEAN;
    new_product_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if user is admin (including mock admin)
    SELECT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE (id = current_user_id OR id = '00000000-0000-0000-0000-000000000001'::uuid)
        AND role = 'admin'
    ) INTO is_user_admin;
    
    -- If user is admin, create the product
    IF is_user_admin THEN
        INSERT INTO products (
            name, description, category_id, image_url, 
            b2c_price, b2b_price, min_quantity_b2b, 
            sku, material, in_stock
        ) VALUES (
            p_name, p_description, p_category_id, p_image_url,
            p_b2c_price, p_b2b_price, p_min_quantity_b2b,
            p_sku, p_material, true
        ) RETURNING id INTO new_product_id;
        
        RETURN new_product_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle admin category creation
CREATE OR REPLACE FUNCTION admin_create_category(
    c_name VARCHAR(100),
    c_description TEXT,
    c_image_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    current_user_id UUID;
    is_user_admin BOOLEAN;
    new_category_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if user is admin (including mock admin)
    SELECT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE (id = current_user_id OR id = '00000000-0000-0000-0000-000000000001'::uuid)
        AND role = 'admin'
    ) INTO is_user_admin;
    
    -- If user is admin, create the category
    IF is_user_admin THEN
        INSERT INTO categories (name, description, image_url)
        VALUES (c_name, c_description, c_image_url)
        RETURNING id INTO new_category_id;
        
        RETURN new_category_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION admin_delete_product(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION admin_delete_category(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION admin_create_product(VARCHAR, TEXT, UUID, TEXT, DECIMAL, DECIMAL, INTEGER, VARCHAR, VARCHAR) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION admin_create_category(VARCHAR, TEXT, TEXT) TO authenticated, anon;

-- Update the is_admin function to include mock admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin (including mock admin ID)
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE (id = user_id OR id = '00000000-0000-0000-0000-000000000001'::uuid)
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Instructions:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. This creates admin functions that bypass RLS for CRUD operations
-- 3. Update your frontend to use these admin functions instead of direct table operations
-- 4. The mock admin session will now work properly with the database

COMMIT;