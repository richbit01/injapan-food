/*
  # Complete Database Schema for Injapan Food

  1. New Tables
    - `products` - Product catalog with variants support
    - `profiles` - User profiles with Firebase integration
    - `orders` - Order management system
    - `orders_tracking` - Order tracking for admin
    - `admin_logs` - Admin activity logging
    - `recycle_bin` - Soft delete functionality
    - `app_settings` - Application configuration
    - `settings_history` - Settings change tracking
    - `variant_options` - Product variant templates
    - `referral_codes` - Referral system
    - `referral_transactions` - Referral commission tracking

  2. Security
    - Enable RLS on all tables
    - Create appropriate policies for each table
    - Admin role-based access control

  3. Storage
    - Create product-images bucket
    - Set up storage policies

  4. Functions
    - Admin role checking
    - Referral transaction management
    - Auto-update timestamps
*/

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  category text NOT NULL,
  image_url text,
  stock integer DEFAULT 0 NOT NULL,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  variants jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  phone text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  firebase_uid text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  total_price integer NOT NULL,
  customer_info jsonb NOT NULL,
  items jsonb NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders_tracking table
CREATE TABLE IF NOT EXISTS public.orders_tracking (
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

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create recycle_bin table
CREATE TABLE IF NOT EXISTS public.recycle_bin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_table text NOT NULL,
  original_id uuid NOT NULL,
  data jsonb NOT NULL,
  deleted_by uuid,
  deleted_at timestamptz DEFAULT now()
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create settings_history table
CREATE TABLE IF NOT EXISTS public.settings_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id text NOT NULL,
  old_value jsonb,
  new_value jsonb NOT NULL,
  changed_by uuid,
  changed_at timestamptz DEFAULT now(),
  notes text
);

-- Create variant_options table
CREATE TABLE IF NOT EXISTS public.variant_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  variant_name text NOT NULL,
  options jsonb DEFAULT '[]'::jsonb NOT NULL,
  is_required boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true NOT NULL,
  total_uses integer DEFAULT 0 NOT NULL,
  total_commission_earned numeric(10,2) DEFAULT 0 NOT NULL
);

-- Create referral_transactions table
CREATE TABLE IF NOT EXISTS public.referral_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid,
  referral_code text NOT NULL,
  order_id text NOT NULL,
  commission_amount numeric(10,2) NOT NULL,
  order_total numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  confirmed_by uuid REFERENCES public.profiles(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON public.profiles(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON public.referral_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_referrer ON public.referral_transactions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_status ON public.referral_transactions(status);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_order ON public.referral_transactions(order_id);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycle_bin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variant_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;

-- Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
CREATE TRIGGER update_orders_tracking_updated_at 
  BEFORE UPDATE ON public.orders_tracking 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_variant_options_updated_at
  BEFORE UPDATE ON public.variant_options
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for products
CREATE POLICY "Anyone can view products" 
  ON public.products FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage products" 
  ON public.products FOR ALL 
  USING (public.is_admin());

-- RLS Policies for profiles
CREATE POLICY "Allow read access to profiles" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Allow profile creation" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow profile updates" 
  ON public.profiles FOR UPDATE 
  USING (true);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders or admins can view all" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

CREATE POLICY "Anyone can create orders (authenticated or guest)" 
  ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can update any order" 
  ON public.orders FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete orders" 
  ON public.orders FOR DELETE 
  USING (public.is_admin());

-- RLS Policies for orders_tracking
CREATE POLICY "Admins can view all orders" 
  ON public.orders_tracking FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Admins can insert orders" 
  ON public.orders_tracking FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Admins can update orders" 
  ON public.orders_tracking FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- RLS Policies for admin_logs
CREATE POLICY "Admins can view logs" 
  ON public.admin_logs FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins can insert logs" 
  ON public.admin_logs FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- RLS Policies for recycle_bin
CREATE POLICY "Admins can view recycle bin" 
  ON public.recycle_bin FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Admins can insert to recycle bin" 
  ON public.recycle_bin FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Admins can delete from recycle bin" 
  ON public.recycle_bin FOR DELETE 
  USING (public.is_admin());

-- RLS Policies for app_settings
CREATE POLICY "Anyone can view app settings" 
  ON public.app_settings FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can update app settings" 
  ON public.app_settings FOR UPDATE 
  USING (public.is_admin());

-- RLS Policies for settings_history
CREATE POLICY "Only admins can view settings history" 
  ON public.settings_history FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "Only admins can create settings history" 
  ON public.settings_history FOR INSERT 
  WITH CHECK (public.is_admin());

-- RLS Policies for variant_options
CREATE POLICY "Admin can manage variant options" 
  ON public.variant_options FOR ALL 
  USING (true);

-- RLS Policies for referral_codes
CREATE POLICY "Anyone can view active referral codes for validation" 
  ON public.referral_codes FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Users can create their own referral codes" 
  ON public.referral_codes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes" 
  ON public.referral_codes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own referral codes" 
  ON public.referral_codes FOR SELECT 
  USING (auth.uid() = user_id);

-- RLS Policies for referral_transactions
CREATE POLICY "Users can view their own referral transactions" 
  ON public.referral_transactions FOR SELECT 
  USING (auth.uid() = referrer_id);

CREATE POLICY "System can create referral transactions" 
  ON public.referral_transactions FOR INSERT 
  WITH CHECK (true);

-- Insert default app settings
INSERT INTO public.app_settings (id, value, description) 
VALUES ('referral_commission_rate', '{"rate": 3}', 'Referral commission rate in percentage')
ON CONFLICT (id) DO NOTHING;

-- Insert variant options for different categories
INSERT INTO public.variant_options (category, variant_name, options, is_required) VALUES 
('Kerupuk', 'rasa', '["Original", "Pedas", "BBQ", "Balado"]', true),
('Kerupuk', 'gram', '["100g", "250g", "500g"]', true),
('Bon Cabe', 'level', '["Level 10", "Level 30", "Level 50"]', true),
('Bon Cabe', 'gram', '["40g", "80g", "160g"]', true),
('Makanan Ringan', 'rasa', '["Original", "Pedas", "Manis", "Asin"]', false),
('Makanan Ringan', 'gram', '["50g", "100g", "200g"]', false),
('Bumbu Dapur', 'kemasan', '["Sachet", "Botol", "Refill"]', false),
('Bumbu Dapur', 'gram', '["20g", "50g", "100g", "250g"]', true),
('Makanan Siap Saji', 'porsi', '["1 Porsi", "2 Porsi", "Family Pack"]', false),
('Makanan Siap Saji', 'level_pedas', '["Tidak Pedas", "Sedang", "Pedas", "Extra Pedas"]', false),
('Bahan Masak Beku', 'jenis', '["Daging Sapi", "Daging Ayam", "Seafood", "Nugget", "Sosis", "Bakso"]', true),
('Bahan Masak Beku', 'berat', '["250g", "500g", "1kg", "2kg"]', true),
('Bahan Masak Beku', 'kemasan', '["Plastik Vacuum", "Box Styrofoam", "Kantong Plastik"]', false),
('Sayur Segar/Beku', 'jenis', '["Bayam", "Kangkung", "Sawi", "Brokoli", "Wortel", "Kentang", "Bawang Merah", "Bawang Putih"]', true),
('Sayur Segar/Beku', 'kondisi', '["Segar", "Beku"]', true),
('Sayur Segar/Beku', 'berat', '["250g", "500g", "1kg"]', true),
('Sayur Segar/Beku', 'kemasan', '["Plastik", "Kantong Jaring", "Box"]', false),
('Sayur Beku', 'jenis', '["Mixed Vegetables", "Corn", "Green Beans", "Edamame", "Spinach", "Broccoli"]', true),
('Sayur Beku', 'berat', '["300g", "500g", "1kg"]', true),
('Sayur Beku', 'kemasan', '["Plastik Vacuum", "Box Karton"]', false)
ON CONFLICT DO NOTHING;

-- Create referral management functions
CREATE OR REPLACE FUNCTION public.confirm_referral_transaction(
  transaction_id UUID,
  admin_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record RECORD;
BEGIN
  SELECT * INTO transaction_record
  FROM public.referral_transactions
  WHERE id = transaction_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;
  
  UPDATE public.referral_transactions
  SET 
    status = 'paid',
    confirmed_at = NOW(),
    confirmed_by = admin_id
  WHERE id = transaction_id;
  
  UPDATE public.referral_codes
  SET 
    total_uses = total_uses + 1,
    total_commission_earned = total_commission_earned + transaction_record.commission_amount
  WHERE code = transaction_record.referral_code AND is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_referral_transaction(
  transaction_id UUID,
  admin_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.referral_transactions
  SET 
    status = 'cancelled',
    confirmed_at = NOW(),
    confirmed_by = admin_id
  WHERE id = transaction_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_referral_stats(
  referral_code TEXT,
  commission_amount NUMERIC
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.referral_codes
  SET 
    total_uses = total_uses + 1,
    total_commission_earned = total_commission_earned + commission_amount
  WHERE code = referral_code AND is_active = true;
END;
$$;

-- Insert sample products
INSERT INTO public.products (name, description, price, category, image_url, stock, status) VALUES
('Kerupuk Seblak Kering', 'Kerupuk khas Bandung yang gurih dan renyah, cocok untuk camilan atau lauk pendamping.', 480, 'Makanan Ringan', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 25, 'active'),
('Bon Cabe Level 50', 'Bumbu tabur pedas level ekstrim untuk pecinta makanan super pedas.', 380, 'Bumbu Dapur', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 15, 'active'),
('Bon Cabe Level 10 & 30', 'Paket bumbu tabur pedas level sedang, pas untuk yang baru mencoba makanan pedas.', 620, 'Bumbu Dapur', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 8, 'active'),
('Cuanki Baraka', 'Makanan siap saji khas Bandung dengan kuah yang gurih dan bakso yang kenyal.', 720, 'Makanan Siap Saji', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 12, 'active'),
('Seblak Baraka', 'Seblak instant dengan rasa autentik dan tingkat kepedasan yang pas.', 680, 'Makanan Siap Saji', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 0, 'out_of_stock'),
('Basreng Pedas / Original', 'Bakso goreng kering dengan pilihan rasa pedas dan original yang renyah.', 420, 'Makanan Ringan', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 18, 'active'),
('Nangka Muda (Gori)', 'Nangka muda beku siap olah untuk berbagai masakan tradisional Indonesia.', 580, 'Bahan Masak Beku', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 3, 'active'),
('Pete Kupas Frozen', 'Pete kupas beku yang praktis, siap digunakan untuk masakan favorit.', 640, 'Bahan Masak Beku', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 7, 'active'),
('Daun Kemangi', 'Daun kemangi segar untuk melengkapi lalapan dan masakan tradisional.', 320, 'Sayur Segar/Beku', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 22, 'active'),
('Daun Singkong Frozen', 'Daun singkong beku yang siap diolah menjadi berbagai masakan lezat.', 380, 'Sayur Beku', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 4, 'active'),
('Daun Pepaya', 'Daun pepaya segar untuk lalapan atau direbus sebagai sayuran sehat.', 280, 'Sayur Segar/Beku', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', 14, 'inactive'),
('Mie Instan Indomie', 'Mie instan rasa ayam bawang yang legendaris dan disukai semua kalangan.', 150, 'Makanan Siap Saji', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg', 50, 'active')
ON CONFLICT DO NOTHING;