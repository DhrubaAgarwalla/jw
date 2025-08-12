-- Jewelry Store Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'b2b', 'customer');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    additional_images TEXT[], -- Array of image URLs
    b2c_price DECIMAL(10,2) NOT NULL,
    b2b_price DECIMAL(10,2) NOT NULL,
    min_quantity_b2b INTEGER DEFAULT 1,
    in_stock BOOLEAN DEFAULT true,
    sku VARCHAR(100) UNIQUE,
    weight DECIMAL(8,2), -- in grams
    dimensions JSONB, -- {"length": 10, "width": 5, "height": 2}
    material VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role user_role DEFAULT 'customer',
    company_name VARCHAR(255),
    phone VARCHAR(20),
    address JSONB, -- {"street": "", "city": "", "state": "", "zip": "", "country": ""}
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reseller applications table
CREATE TABLE reseller_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    business_address JSONB NOT NULL,
    business_type VARCHAR(100) NOT NULL,
    years_in_business VARCHAR(50) NOT NULL,
    tax_id VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    expected_monthly_volume VARCHAR(50) NOT NULL,
    business_description TEXT NOT NULL,
    trade_references TEXT,
    status application_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_info JSONB NOT NULL, -- {"name": "", "email": "", "phone": "", "address": {}}
    items JSONB NOT NULL, -- Array of order items
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    shipping DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pending',
    is_b2b BOOLEAN DEFAULT false,
    notes TEXT,
    whatsapp_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table (for better querying)
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart table (for persistent carts)
CREATE TABLE cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest users
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id),
    UNIQUE(session_id, product_id)
);

-- Inventory tracking
CREATE TABLE inventory_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL, -- 'sale', 'restock', 'adjustment'
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER,
    new_stock INTEGER,
    reference_id UUID, -- order_id or other reference
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_session ON cart_items(session_id);
CREATE INDEX idx_reseller_applications_status ON reseller_applications(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reseller_applications_updated_at BEFORE UPDATE ON reseller_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Categories: Public read, admin write
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories are editable by admins" ON categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- Products: Public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are editable by admins" ON products FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- User profiles: Users can view/edit their own, admins can view/edit all
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);
CREATE POLICY "Admins can update all profiles" ON user_profiles FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- Reseller applications: Users can create/view their own, admins can view/edit all
ALTER TABLE reseller_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create applications" ON reseller_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own applications" ON reseller_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all applications" ON reseller_applications FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);
CREATE POLICY "Admins can update applications" ON reseller_applications FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- Orders: Users can view their own, admins can view all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- Order items: Same as orders
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items follow order policies" ON order_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        ))
    )
);

-- Cart items: Users can manage their own cart
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Guest carts by session" ON cart_items FOR ALL USING (user_id IS NULL AND session_id IS NOT NULL);

-- Inventory logs: Admins only
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inventory logs for admins only" ON inventory_logs FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- Insert sample data

-- Sample categories
INSERT INTO categories (name, description) VALUES 
('Rings', 'Beautiful rings for every occasion'),
('Necklaces', 'Elegant necklaces and pendants'),
('Earrings', 'Stunning earrings collection'),
('Bracelets', 'Charming bracelets and bangles'),
('Watches', 'Luxury timepieces');

-- Sample products
INSERT INTO products (name, description, category_id, image_url, b2c_price, b2b_price, min_quantity_b2b, sku, material) 
SELECT 
    'Diamond Solitaire Ring',
    'Elegant 1-carat diamond solitaire ring in 18k white gold',
    c.id,
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
    2500.00,
    1800.00,
    2,
    'DSR-001',
    '18k White Gold, Diamond'
FROM categories c WHERE c.name = 'Rings';

INSERT INTO products (name, description, category_id, image_url, b2c_price, b2b_price, min_quantity_b2b, sku, material) 
SELECT 
    'Pearl Necklace',
    'Classic freshwater pearl necklace with sterling silver clasp',
    c.id,
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    450.00,
    320.00,
    5,
    'PN-001',
    'Sterling Silver, Freshwater Pearls'
FROM categories c WHERE c.name = 'Necklaces';

INSERT INTO products (name, description, category_id, image_url, b2c_price, b2b_price, min_quantity_b2b, sku, material) 
SELECT 
    'Gold Hoop Earrings',
    'Classic 14k gold hoop earrings, perfect for everyday wear',
    c.id,
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
    180.00,
    130.00,
    10,
    'GHE-001',
    '14k Gold'
FROM categories c WHERE c.name = 'Earrings';

INSERT INTO products (name, description, category_id, image_url, b2c_price, b2b_price, min_quantity_b2b, sku, material) 
SELECT 
    'Emerald Tennis Bracelet',
    'Stunning emerald tennis bracelet in 18k yellow gold',
    c.id,
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
    1200.00,
    850.00,
    3,
    'ETB-001',
    '18k Yellow Gold, Emeralds'
FROM categories c WHERE c.name = 'Bracelets';

INSERT INTO products (name, description, category_id, image_url, b2c_price, b2b_price, min_quantity_b2b, sku, material) 
SELECT 
    'Sapphire Pendant',
    'Blue sapphire pendant with diamond accents on white gold chain',
    c.id,
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    800.00,
    580.00,
    4,
    'SP-001',
    '18k White Gold, Sapphire, Diamonds'
FROM categories c WHERE c.name = 'Necklaces';

INSERT INTO products (name, description, category_id, image_url, b2c_price, b2b_price, min_quantity_b2b, sku, material) 
SELECT 
    'Wedding Band Set',
    'Matching his and hers wedding bands in platinum',
    c.id,
    'https://images.unsplash.com/photo-1544376664-80b17f09d399?w=400',
    1500.00,
    1100.00,
    2,
    'WBS-001',
    'Platinum'
FROM categories c WHERE c.name = 'Rings';

-- Create storage buckets (Run these in Supabase Dashboard -> Storage)
-- You'll need to create these buckets manually in Supabase Dashboard:
-- 1. product-images (public)
-- 2. category-images (public)
-- 3. user-uploads (private)

-- Storage policies will be created automatically when you create the buckets
-- Make sure to set the buckets as public for product and category images

-- Functions for order number generation
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get current date in YYYYMMDD format
    new_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-';
    
    -- Get count of orders today
    SELECT COUNT(*) + 1 INTO counter
    FROM orders 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Pad with zeros to make it 4 digits
    new_number := new_number || LPAD(counter::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Enable realtime for specific tables (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;

COMMIT;

-- Instructions:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Create storage buckets in Supabase Dashboard:
--    - product-images (public)
--    - category-images (public) 
--    - user-uploads (private)
-- 3. Update your environment variables with Supabase credentials
-- 4. The sample data will be inserted automatically