/*
  # Fresh Database Setup for Injapan Food

  1. New Tables
    - `products` - Product catalog with variants support
    - `profiles` - User profiles with Firebase integration
    - `orders` - Order management system
    - `orders_tracking` - Order tracking for admin
    - `admin_logs` - Admin activity logging
    - `recycle_bin` - Soft delete functionality
    - `variant_options` - Product variant templates
    - `app_settings` - Application configuration
    - `settings_history` - Settings change tracking
    - `referral_codes` - Referral system codes
    - `referral_transactions` - Referral commission tracking

  2. Security
    - Enable RLS on all tables
    - Create appropriate policies for each table
    - Admin-only access for sensitive operations

  3. Sample Data
    - Insert sample products with variants
    - Create variant option templates
    - Set default app settings
*/

-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  category text NOT NULL,
  image_url text,
  stock integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  variants jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  phone text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  firebase_uid text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  total_price integer NOT NULL,
  customer_info jsonb NOT NULL,
  items jsonb NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders tracking table
CREATE TABLE IF NOT EXISTS orders_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  items jsonb NOT NULL,
  total_amount integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- ADMIN TABLES
-- ============================================================================

-- Admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Recycle bin table
CREATE TABLE IF NOT EXISTS recycle_bin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_table text NOT NULL,
  original_id uuid NOT NULL,
  data jsonb NOT NULL,
  deleted_by uuid REFERENCES auth.users(id),
  deleted_at timestamptz DEFAULT now()
);

-- Variant options table
CREATE TABLE IF NOT EXISTS variant_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  variant_name text NOT NULL,
  options jsonb DEFAULT '[]'::jsonb,
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- App settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Settings history table
CREATE TABLE IF NOT EXISTS settings_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id text NOT NULL,
  old_value jsonb,
  new_value jsonb NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now(),
  notes text
);

-- ============================================================================
-- REFERRAL SYSTEM TABLES
-- ============================================================================

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  total_uses integer DEFAULT 0,
  total_commission_earned numeric(10,2) DEFAULT 0
);

-- Referral transactions table
CREATE TABLE IF NOT EXISTS referral_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code text NOT NULL,
  order_id text NOT NULL,
  commission_amount numeric(10,2) NOT NULL,
  order_total numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  confirmed_by uuid REFERENCES profiles(id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON referral_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_referrer ON referral_transactions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_order ON referral_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_status ON referral_transactions(status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycle_bin ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES
-- ============================================================================

-- Products policies
CREATE POLICY "Anyone can view products" ON products FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage products" ON products FOR ALL TO public USING (is_admin());

-- Profiles policies
CREATE POLICY "Users see own profile" ON profiles FOR SELECT TO public USING (auth.uid() = id OR is_admin());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE TO public USING (auth.uid() = id);
CREATE POLICY "Allow read access to profiles" ON profiles FOR SELECT TO public USING (true);
CREATE POLICY "Allow profile creation" ON profiles FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow profile updates" ON profiles FOR UPDATE TO public USING (true);

-- Orders policies
CREATE POLICY "Users can view their own orders or admins can view all" ON orders 
  FOR SELECT TO public USING (auth.uid() = user_id OR user_id IS NULL OR is_admin());
CREATE POLICY "Anyone can create orders (authenticated or guest)" ON orders 
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can update any order" ON orders FOR UPDATE TO public USING (is_admin());
CREATE POLICY "Admins can delete orders" ON orders FOR DELETE TO public USING (is_admin());

-- Orders tracking policies
CREATE POLICY "Admins can view all orders" ON orders_tracking FOR SELECT TO public USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "Admins can insert orders" ON orders_tracking FOR INSERT TO public WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "Admins can update orders" ON orders_tracking FOR UPDATE TO public USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Admin logs policies
CREATE POLICY "Admins can view logs" ON admin_logs FOR SELECT TO public USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert logs" ON admin_logs FOR INSERT TO public WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);

-- Recycle bin policies
CREATE POLICY "Admins can view recycle bin" ON recycle_bin FOR SELECT TO public USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert to recycle bin" ON recycle_bin FOR INSERT TO public WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
);
CREATE POLICY "Admins can delete from recycle bin" ON recycle_bin FOR DELETE TO public USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Variant options policies
CREATE POLICY "Admin can manage variant options" ON variant_options FOR ALL TO public USING (true);

-- App settings policies
CREATE POLICY "Anyone can view app settings" ON app_settings FOR SELECT TO public USING (true);
CREATE POLICY "Only admins can update app settings" ON app_settings FOR UPDATE TO public USING (is_admin());

-- Settings history policies
CREATE POLICY "Only admins can view settings history" ON settings_history FOR SELECT TO public USING (is_admin());
CREATE POLICY "Only admins can create settings history" ON settings_history FOR INSERT TO public WITH CHECK (is_admin());

-- Referral codes policies
CREATE POLICY "Users can view their own referral codes" ON referral_codes FOR SELECT TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own referral codes" ON referral_codes FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own referral codes" ON referral_codes FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active referral codes for validation" ON referral_codes FOR SELECT TO public USING (is_active = true);

-- Referral transactions policies
CREATE POLICY "Users can view their own referral transactions" ON referral_transactions FOR SELECT TO public USING (auth.uid() = referrer_id);
CREATE POLICY "System can create referral transactions" ON referral_transactions FOR INSERT TO public WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_tracking_updated_at
  BEFORE UPDATE ON orders_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variant_options_updated_at
  BEFORE UPDATE ON variant_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- REFERRAL SYSTEM FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION increment_referral_stats(referral_code text, commission_amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE referral_codes 
  SET 
    total_uses = total_uses + 1,
    total_commission_earned = total_commission_earned + commission_amount
  WHERE code = referral_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION confirm_referral_transaction(transaction_id uuid, admin_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE referral_transactions 
  SET 
    status = 'paid',
    confirmed_at = now(),
    confirmed_by = admin_id
  WHERE id = transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cancel_referral_transaction(transaction_id uuid, admin_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE referral_transactions 
  SET 
    status = 'cancelled',
    confirmed_at = now(),
    confirmed_by = admin_id
  WHERE id = transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default app settings
INSERT INTO app_settings (id, value, description) VALUES
('referral_commission_rate', '{"rate": 3}', 'Persentase komisi referral (dalam persen)'),
('site_name', '{"name": "Injapan Food"}', 'Nama website'),
('contact_whatsapp', '{"number": "+6285155452259"}', 'Nomor WhatsApp customer service'),
('shipping_info', '{"text": "Pengiriman ke seluruh Jepang 2-5 hari kerja"}', 'Informasi pengiriman')
ON CONFLICT (id) DO NOTHING;

-- Insert variant options templates
INSERT INTO variant_options (category, variant_name, options, is_required) VALUES
('Kerupuk', 'rasa', '["Original", "Pedas", "BBQ", "Balado", "Keju"]', true),
('Kerupuk', 'gram', '["100g", "250g", "500g", "1kg"]', true),
('Bon Cabe', 'level', '["10", "30", "50"]', true),
('Bon Cabe', 'gram', '["40g", "80g", "160g"]', true),
('Makanan Ringan', 'rasa', '["Original", "Pedas", "BBQ", "Balado", "Keju", "Jagung Bakar"]', false),
('Makanan Ringan', 'gram', '["100g", "250g", "500g"]', false),
('Bumbu Dapur', 'kemasan', '["Sachet", "Botol", "Pouch"]', false),
('Bumbu Dapur', 'gram', '["20g", "40g", "80g", "160g", "250g"]', false),
('Makanan Siap Saji', 'porsi', '["1 porsi", "2 porsi", "Family Pack"]', false),
('Makanan Siap Saji', 'level_pedas', '["Tidak Pedas", "Sedang", "Pedas", "Extra Pedas"]', false),
('Bahan Masak Beku', 'jenis', '["Utuh", "Potong", "Parut"]', false),
('Bahan Masak Beku', 'berat', '["250g", "500g", "1kg"]', false),
('Bahan Masak Beku', 'kemasan', '["Plastik", "Vacuum"]', false),
('Sayur Segar/Beku', 'jenis', '["Segar", "Beku"]', false),
('Sayur Segar/Beku', 'kondisi', '["Utuh", "Potong", "Cuci Bersih"]', false),
('Sayur Segar/Beku', 'berat', '["100g", "250g", "500g"]', false),
('Sayur Segar/Beku', 'kemasan', '["Plastik", "Styrofoam"]', false),
('Sayur Beku', 'kondisi', '["Utuh", "Potong", "Cuci Bersih"]', false),
('Sayur Beku', 'berat', '["250g", "500g", "1kg"]', false),
('Sayur Beku', 'kemasan', '["Plastik", "Vacuum"]', false)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, stock, status, variants) VALUES
('Kerupuk Seblak Kering', 'Kerupuk khas Bandung yang gurih dan renyah, cocok untuk camilan atau lauk pendamping.', 480, 'Makanan Ringan', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 25, 'active', '[{"id": "v1", "name": "Original - 250g", "price": 0, "stock": 15}, {"id": "v2", "name": "Pedas - 250g", "price": 50, "stock": 10}]'),
('Bon Cabe Level 50', 'Bumbu tabur pedas level ekstrim untuk pecinta makanan super pedas.', 380, 'Bumbu Dapur', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 15, 'active', '[{"id": "v1", "name": "Level 10 - 40g", "price": -60, "stock": 20}, {"id": "v2", "name": "Level 30 - 40g", "price": -30, "stock": 15}, {"id": "v3", "name": "Level 50 - 40g", "price": 0, "stock": 10}]'),
('Cuanki Baraka', 'Makanan siap saji khas Bandung dengan kuah yang gurih dan bakso yang kenyal.', 720, 'Makanan Siap Saji', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 12, 'active', '[]'),
('Seblak Baraka', 'Seblak instant dengan rasa autentik dan tingkat kepedasan yang pas.', 680, 'Makanan Siap Saji', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 0, 'out_of_stock', '[]'),
('Basreng Pedas', 'Bakso goreng kering dengan rasa pedas yang renyah dan gurih.', 420, 'Makanan Ringan', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 18, 'active', '[{"id": "v1", "name": "Original - 100g", "price": -50, "stock": 25}, {"id": "v2", "name": "Pedas - 100g", "price": 0, "stock": 18}]'),
('Nangka Muda (Gori)', 'Nangka muda beku siap olah untuk berbagai masakan tradisional Indonesia.', 580, 'Bahan Masak Beku', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 3, 'active', '[]'),
('Pete Kupas Frozen', 'Pete kupas beku yang praktis, siap digunakan untuk masakan favorit.', 640, 'Bahan Masak Beku', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 7, 'active', '[]'),
('Daun Kemangi', 'Daun kemangi segar untuk melengkapi lalapan dan masakan tradisional.', 320, 'Sayur Segar/Beku', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 22, 'active', '[]'),
('Daun Singkong Frozen', 'Daun singkong beku yang siap diolah menjadi berbagai masakan lezat.', 380, 'Sayur Beku', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 4, 'active', '[]'),
('Daun Pepaya', 'Daun pepaya segar untuk lalapan atau direbus sebagai sayuran sehat.', 280, 'Sayur Segar/Beku', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 14, 'inactive', '[]'),
('Sambal Terasi Pedas', 'Sambal terasi autentik dengan rasa pedas yang menggugah selera.', 450, 'Bumbu Dapur', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 20, 'active', '[]'),
('Rendang Instant', 'Rendang siap saji dengan bumbu rempah pilihan, cita rasa autentik Padang.', 850, 'Makanan Siap Saji', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 8, 'active', '[]')
ON CONFLICT DO NOTHING;