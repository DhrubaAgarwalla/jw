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