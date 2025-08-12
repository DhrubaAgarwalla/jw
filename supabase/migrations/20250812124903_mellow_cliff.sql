/*
  # Initial Schema for Jewelry Store

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category_id` (uuid, foreign key)
      - `image_url` (text)
      - `b2c_price` (decimal)
      - `b2b_price` (decimal)
      - `min_quantity_b2b` (integer)
      - `in_stock` (boolean)
      - `created_at` (timestamp)
    - `reseller_applications`
      - `id` (uuid, primary key)
      - `company_name` (text)
      - `contact_person` (text)
      - `email` (text)
      - `phone` (text)
      - `business_address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `business_type` (text)
      - `years_in_business` (text)
      - `tax_id` (text)
      - `website` (text)
      - `expected_monthly_volume` (text)
      - `business_description` (text)
      - `references` (text)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
    - `b2b_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `company_name` (text)
      - `application_id` (uuid, references reseller_applications)
      - `approved` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to products and categories
    - Add policies for authenticated users to manage their data
    - Add policies for admin users to manage everything
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  b2c_price decimal(10,2) NOT NULL,
  b2b_price decimal(10,2) NOT NULL,
  min_quantity_b2b integer DEFAULT 1,
  in_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create reseller applications table
CREATE TABLE IF NOT EXISTS reseller_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  business_address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  business_type text NOT NULL,
  years_in_business text NOT NULL,
  tax_id text NOT NULL,
  website text DEFAULT '',
  expected_monthly_volume text NOT NULL,
  business_description text NOT NULL,
  references text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Create B2B users table
CREATE TABLE IF NOT EXISTS b2b_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  application_id uuid REFERENCES reseller_applications(id),
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseller_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE b2b_users ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Reseller applications policies
CREATE POLICY "Anyone can create applications"
  ON reseller_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can read all applications"
  ON reseller_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update applications"
  ON reseller_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- B2B users policies
CREATE POLICY "B2B users can read own data"
  ON b2b_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage B2B users"
  ON b2b_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert initial categories
INSERT INTO categories (name) VALUES 
  ('Rings'),
  ('Necklaces'),
  ('Earrings'),
  ('Bracelets')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
DO $$
DECLARE
  rings_id uuid;
  necklaces_id uuid;
  earrings_id uuid;
  bracelets_id uuid;
BEGIN
  SELECT id INTO rings_id FROM categories WHERE name = 'Rings';
  SELECT id INTO necklaces_id FROM categories WHERE name = 'Necklaces';
  SELECT id INTO earrings_id FROM categories WHERE name = 'Earrings';
  SELECT id INTO bracelets_id FROM categories WHERE name = 'Bracelets';

  INSERT INTO products (name, description, category_id, image_url, b2c_price, b2b_price, min_quantity_b2b) VALUES
    ('Diamond Solitaire Ring', 'Elegant 1-carat diamond solitaire ring in 18k white gold', rings_id, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', 2500.00, 1800.00, 2),
    ('Wedding Band Set', 'Matching his and hers wedding bands in platinum', rings_id, 'https://images.unsplash.com/photo-1544376664-80b17f09d399?w=400', 1500.00, 1100.00, 2),
    ('Pearl Necklace', 'Classic freshwater pearl necklace with sterling silver clasp', necklaces_id, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 450.00, 320.00, 5),
    ('Sapphire Pendant', 'Blue sapphire pendant with diamond accents on white gold chain', necklaces_id, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', 800.00, 580.00, 4),
    ('Gold Hoop Earrings', 'Classic 14k gold hoop earrings, perfect for everyday wear', earrings_id, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 180.00, 130.00, 10),
    ('Emerald Tennis Bracelet', 'Stunning emerald tennis bracelet in 18k yellow gold', bracelets_id, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', 1200.00, 850.00, 3);
END $$;