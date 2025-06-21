/*
  # Safe Schema Update for Injapan Food Database

  1. Tables
    - Safely add missing columns if they don't exist
    - Update existing tables without conflicts
    - Ensure all required indexes and constraints are in place

  2. Security
    - Enable RLS on all tables
    - Create comprehensive policies for data access
    - Ensure admin functions work correctly

  3. Data
    - Insert sample data safely
    - Add variant options templates
    - Set up default app settings
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
-- SAFELY ADD MISSING COLUMNS
-- ============================================================================

-- Add firebase_uid to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'firebase_uid'
  ) THEN
    ALTER TABLE profiles ADD COLUMN firebase_uid text UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON profiles(firebase_uid);
  END IF;
END $$;

-- Add variants to products if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'variants'
  ) THEN
    ALTER TABLE products ADD COLUMN variants jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ============================================================================
-- CREATE MISSING TABLES
-- ============================================================================

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
-- CREATE MISSING INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON referral_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_referrer ON referral_transactions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_order ON referral_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_status ON referral_transactions(status);

-- ============================================================================
-- ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE POLICIES FOR NEW TABLES
-- ============================================================================

-- App settings policies
DROP POLICY IF EXISTS "Anyone can view app settings" ON app_settings;
DROP POLICY IF EXISTS "Only admins can update app settings" ON app_settings;

CREATE POLICY "Anyone can view app settings" ON app_settings FOR SELECT TO public USING (true);
CREATE POLICY "Only admins can update app settings" ON app_settings FOR UPDATE TO public USING (is_admin());

-- Settings history policies
DROP POLICY IF EXISTS "Only admins can view settings history" ON settings_history;
DROP POLICY IF EXISTS "Only admins can create settings history" ON settings_history;

CREATE POLICY "Only admins can view settings history" ON settings_history FOR SELECT TO public USING (is_admin());
CREATE POLICY "Only admins can create settings history" ON settings_history FOR INSERT TO public WITH CHECK (is_admin());

-- Referral codes policies
DROP POLICY IF EXISTS "Users can view their own referral codes" ON referral_codes;
DROP POLICY IF EXISTS "Users can create their own referral codes" ON referral_codes;
DROP POLICY IF EXISTS "Users can update their own referral codes" ON referral_codes;
DROP POLICY IF EXISTS "Anyone can view active referral codes for validation" ON referral_codes;

CREATE POLICY "Users can view their own referral codes" ON referral_codes FOR SELECT TO public USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own referral codes" ON referral_codes FOR INSERT TO public WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own referral codes" ON referral_codes FOR UPDATE TO public USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active referral codes for validation" ON referral_codes FOR SELECT TO public USING (is_active = true);

-- Referral transactions policies
DROP POLICY IF EXISTS "Users can view their own referral transactions" ON referral_transactions;
DROP POLICY IF EXISTS "System can create referral transactions" ON referral_transactions;

CREATE POLICY "Users can view their own referral transactions" ON referral_transactions FOR SELECT TO public USING (auth.uid() = referrer_id);
CREATE POLICY "System can create referral transactions" ON referral_transactions FOR INSERT TO public WITH CHECK (true);

-- ============================================================================
-- CREATE TRIGGERS FOR NEW TABLES
-- ============================================================================

-- App settings trigger
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
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
-- INSERT DEFAULT DATA SAFELY
-- ============================================================================

-- Insert default app settings
INSERT INTO app_settings (id, value, description) VALUES
('referral_commission_rate', '{"rate": 3}', 'Persentase komisi referral (dalam persen)'),
('site_name', '{"name": "Injapan Food"}', 'Nama website'),
('contact_whatsapp', '{"number": "+6285155452259"}', 'Nomor WhatsApp customer service'),
('shipping_info', '{"text": "Pengiriman ke seluruh Jepang 2-5 hari kerja"}', 'Informasi pengiriman')
ON CONFLICT (id) DO NOTHING;

-- Insert variant options templates (only if table exists and is empty)
INSERT INTO variant_options (category, variant_name, options, is_required) 
SELECT * FROM (VALUES
  ('Kerupuk', 'rasa', '["Original", "Pedas", "BBQ", "Balado", "Keju"]'::jsonb, true),
  ('Kerupuk', 'gram', '["100g", "250g", "500g", "1kg"]'::jsonb, true),
  ('Bon Cabe', 'level', '["10", "30", "50"]'::jsonb, true),
  ('Bon Cabe', 'gram', '["40g", "80g", "160g"]'::jsonb, true),
  ('Makanan Ringan', 'rasa', '["Original", "Pedas", "BBQ", "Balado", "Keju", "Jagung Bakar"]'::jsonb, false),
  ('Makanan Ringan', 'gram', '["100g", "250g", "500g"]'::jsonb, false),
  ('Bumbu Dapur', 'kemasan', '["Sachet", "Botol", "Pouch"]'::jsonb, false),
  ('Bumbu Dapur', 'gram', '["20g", "40g", "80g", "160g", "250g"]'::jsonb, false),
  ('Makanan Siap Saji', 'porsi', '["1 porsi", "2 porsi", "Family Pack"]'::jsonb, false),
  ('Makanan Siap Saji', 'level_pedas', '["Tidak Pedas", "Sedang", "Pedas", "Extra Pedas"]'::jsonb, false),
  ('Bahan Masak Beku', 'jenis', '["Utuh", "Potong", "Parut"]'::jsonb, false),
  ('Bahan Masak Beku', 'berat', '["250g", "500g", "1kg"]'::jsonb, false),
  ('Bahan Masak Beku', 'kemasan', '["Plastik", "Vacuum"]'::jsonb, false),
  ('Sayur Segar/Beku', 'jenis', '["Segar", "Beku"]'::jsonb, false),
  ('Sayur Segar/Beku', 'kondisi', '["Utuh", "Potong", "Cuci Bersih"]'::jsonb, false),
  ('Sayur Segar/Beku', 'berat', '["100g", "250g", "500g"]'::jsonb, false),
  ('Sayur Segar/Beku', 'kemasan', '["Plastik", "Styrofoam"]'::jsonb, false),
  ('Sayur Beku', 'kondisi', '["Utuh", "Potong", "Cuci Bersih"]'::jsonb, false),
  ('Sayur Beku', 'berat', '["250g", "500g", "1kg"]'::jsonb, false),
  ('Sayur Beku', 'kemasan', '["Plastik", "Vacuum"]'::jsonb, false)
) AS t(category, variant_name, options, is_required)
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'variant_options')
ON CONFLICT DO NOTHING;

-- Insert sample products (only if products table has less than 5 products)
INSERT INTO products (name, description, price, category, image_url, stock, status, variants) 
SELECT * FROM (VALUES
  ('Kerupuk Seblak Kering', 'Kerupuk khas Bandung yang gurih dan renyah, cocok untuk camilan atau lauk pendamping.', 480, 'Makanan Ringan', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 25, 'active', '[{"id": "v1", "name": "Original - 250g", "price": 0, "stock": 15}, {"id": "v2", "name": "Pedas - 250g", "price": 50, "stock": 10}]'::jsonb),
  ('Bon Cabe Level 50', 'Bumbu tabur pedas level ekstrim untuk pecinta makanan super pedas.', 380, 'Bumbu Dapur', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 15, 'active', '[{"id": "v1", "name": "Level 10 - 40g", "price": -60, "stock": 20}, {"id": "v2", "name": "Level 30 - 40g", "price": -30, "stock": 15}, {"id": "v3", "name": "Level 50 - 40g", "price": 0, "stock": 10}]'::jsonb),
  ('Cuanki Baraka', 'Makanan siap saji khas Bandung dengan kuah yang gurih dan bakso yang kenyal.', 720, 'Makanan Siap Saji', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 12, 'active', '[]'::jsonb),
  ('Seblak Baraka', 'Seblak instant dengan rasa autentik dan tingkat kepedasan yang pas.', 680, 'Makanan Siap Saji', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 0, 'out_of_stock', '[]'::jsonb),
  ('Basreng Pedas', 'Bakso goreng kering dengan rasa pedas yang renyah dan gurih.', 420, 'Makanan Ringan', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 18, 'active', '[{"id": "v1", "name": "Original - 100g", "price": -50, "stock": 25}, {"id": "v2", "name": "Pedas - 100g", "price": 0, "stock": 18}]'::jsonb),
  ('Nangka Muda (Gori)', 'Nangka muda beku siap olah untuk berbagai masakan tradisional Indonesia.', 580, 'Bahan Masak Beku', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 3, 'active', '[]'::jsonb),
  ('Pete Kupas Frozen', 'Pete kupas beku yang praktis, siap digunakan untuk masakan favorit.', 640, 'Bahan Masak Beku', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 7, 'active', '[]'::jsonb),
  ('Daun Kemangi', 'Daun kemangi segar untuk melengkapi lalapan dan masakan tradisional.', 320, 'Sayur Segar/Beku', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 22, 'active', '[]'::jsonb),
  ('Daun Singkong Frozen', 'Daun singkong beku yang siap diolah menjadi berbagai masakan lezat.', 380, 'Sayur Beku', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 4, 'active', '[]'::jsonb),
  ('Daun Pepaya', 'Daun pepaya segar untuk lalapan atau direbus sebagai sayuran sehat.', 280, 'Sayur Segar/Beku', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 14, 'inactive', '[]'::jsonb),
  ('Sambal Terasi Pedas', 'Sambal terasi autentik dengan rasa pedas yang menggugah selera.', 450, 'Bumbu Dapur', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 20, 'active', '[]'::jsonb),
  ('Rendang Instant', 'Rendang siap saji dengan bumbu rempah pilihan, cita rasa autentik Padang.', 850, 'Makanan Siap Saji', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 8, 'active', '[]'::jsonb)
) AS t(name, description, price, category, image_url, stock, status, variants)
WHERE (SELECT COUNT(*) FROM products) < 5
ON CONFLICT DO NOTHING;