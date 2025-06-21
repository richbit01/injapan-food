// Setup database script - untuk membuat database baru yang bersih
import { supabase } from '@/integrations/supabase/client';

export const setupDatabase = async () => {
  console.log('🚀 Membuat database baru...');

  // 1. Create helper functions
  console.log('📝 Membuat helper functions...');
  
  const helperFunctions = `
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

    -- Trigger function for updated_at
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

  const { error: functionsError } = await supabase.rpc('exec_sql', { sql: helperFunctions });
  if (functionsError) {
    console.error('Error creating functions:', functionsError);
    throw functionsError;
  }

  // 2. Create tables
  console.log('📋 Membuat tabel...');
  
  const createTables = `
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
      user_id uuid,
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

    -- Admin logs table
    CREATE TABLE IF NOT EXISTS admin_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      admin_id uuid,
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
      deleted_by uuid,
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
      changed_by uuid,
      changed_at timestamptz DEFAULT now(),
      notes text
    );

    -- Referral codes table
    CREATE TABLE IF NOT EXISTS referral_codes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL,
      code text UNIQUE NOT NULL,
      created_at timestamptz DEFAULT now(),
      is_active boolean DEFAULT true,
      total_uses integer DEFAULT 0,
      total_commission_earned numeric(10,2) DEFAULT 0
    );

    -- Referral transactions table
    CREATE TABLE IF NOT EXISTS referral_transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      referrer_id uuid NOT NULL,
      referred_user_id uuid,
      referral_code text NOT NULL,
      order_id text NOT NULL,
      commission_amount numeric(10,2) NOT NULL,
      order_total numeric(10,2) NOT NULL,
      status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
      created_at timestamptz DEFAULT now(),
      confirmed_at timestamptz,
      confirmed_by uuid
    );
  `;

  const { error: tablesError } = await supabase.rpc('exec_sql', { sql: createTables });
  if (tablesError) {
    console.error('Error creating tables:', tablesError);
    throw tablesError;
  }

  // 3. Create indexes
  console.log('🔍 Membuat indexes...');
  
  const createIndexes = `
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
  `;

  const { error: indexesError } = await supabase.rpc('exec_sql', { sql: createIndexes });
  if (indexesError) {
    console.error('Error creating indexes:', indexesError);
    throw indexesError;
  }

  // 4. Enable RLS
  console.log('🔒 Mengaktifkan Row Level Security...');
  
  const enableRLS = `
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
  `;

  const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLS });
  if (rlsError) {
    console.error('Error enabling RLS:', rlsError);
    throw rlsError;
  }

  // 5. Create policies
  console.log('🛡️ Membuat security policies...');
  
  const createPolicies = `
    -- Products policies
    CREATE POLICY "Anyone can view products" ON products FOR SELECT TO public USING (true);
    CREATE POLICY "Admins can manage products" ON products FOR ALL TO public USING (is_admin());

    -- Profiles policies
    CREATE POLICY "Allow read access to profiles" ON profiles FOR SELECT TO public USING (true);
    CREATE POLICY "Allow profile creation" ON profiles FOR INSERT TO public WITH CHECK (true);
    CREATE POLICY "Allow profile updates" ON profiles FOR UPDATE TO public USING (true);

    -- Orders policies
    CREATE POLICY "Anyone can create orders" ON orders FOR INSERT TO public WITH CHECK (true);
    CREATE POLICY "Users can view orders" ON orders FOR SELECT TO public USING (true);

    -- App settings policies
    CREATE POLICY "Anyone can view app settings" ON app_settings FOR SELECT TO public USING (true);
    CREATE POLICY "Only admins can update app settings" ON app_settings FOR UPDATE TO public USING (is_admin());

    -- Variant options policies
    CREATE POLICY "Anyone can view variant options" ON variant_options FOR SELECT TO public USING (true);
    CREATE POLICY "Admins can manage variant options" ON variant_options FOR ALL TO public USING (is_admin());

    -- Orders tracking policies
    CREATE POLICY "Admins can manage orders tracking" ON orders_tracking FOR ALL TO public USING (is_admin());

    -- Admin logs policies
    CREATE POLICY "Admins can view logs" ON admin_logs FOR SELECT TO public USING (is_admin());
    CREATE POLICY "Admins can insert logs" ON admin_logs FOR INSERT TO public WITH CHECK (is_admin());

    -- Recycle bin policies
    CREATE POLICY "Admins can manage recycle bin" ON recycle_bin FOR ALL TO public USING (is_admin());

    -- Settings history policies
    CREATE POLICY "Admins can view settings history" ON settings_history FOR SELECT TO public USING (is_admin());
    CREATE POLICY "Admins can create settings history" ON settings_history FOR INSERT TO public WITH CHECK (is_admin());

    -- Referral codes policies
    CREATE POLICY "Anyone can view active referral codes" ON referral_codes FOR SELECT TO public USING (is_active = true);
    CREATE POLICY "Users can manage their referral codes" ON referral_codes FOR ALL TO public USING (true);

    -- Referral transactions policies
    CREATE POLICY "Users can view referral transactions" ON referral_transactions FOR SELECT TO public USING (true);
    CREATE POLICY "System can create referral transactions" ON referral_transactions FOR INSERT TO public WITH CHECK (true);
  `;

  const { error: policiesError } = await supabase.rpc('exec_sql', { sql: createPolicies });
  if (policiesError) {
    console.error('Error creating policies:', policiesError);
    throw policiesError;
  }

  // 6. Create triggers
  console.log('⚡ Membuat triggers...');
  
  const createTriggers = `
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
  `;

  const { error: triggersError } = await supabase.rpc('exec_sql', { sql: createTriggers });
  if (triggersError) {
    console.error('Error creating triggers:', triggersError);
    throw triggersError;
  }

  console.log('🎉 Database setup selesai!');
  return true;
};