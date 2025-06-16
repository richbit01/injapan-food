
-- First, drop ALL existing policies to avoid conflicts
DO $$ 
BEGIN
    -- Drop all policies from products table
    DROP POLICY IF EXISTS "Semua orang dapat melihat produk" ON public.products;
    DROP POLICY IF EXISTS "Hanya admin yang dapat mengelola produk" ON public.products;
    
    -- Drop all policies from profiles table  
    DROP POLICY IF EXISTS "User dapat melihat profil sendiri" ON public.profiles;
    DROP POLICY IF EXISTS "User dapat mengupdate profil sendiri" ON public.profiles;
    DROP POLICY IF EXISTS "Admin dapat melihat semua profil" ON public.profiles;
    
    -- Drop all policies from orders table
    DROP POLICY IF EXISTS "User dapat melihat pesanan sendiri" ON public.orders;
    DROP POLICY IF EXISTS "User dapat membuat pesanan" ON public.orders;
    DROP POLICY IF EXISTS "Admin dapat melihat semua pesanan" ON public.orders;
    DROP POLICY IF EXISTS "Admin dapat mengupdate pesanan" ON public.orders;
    DROP POLICY IF EXISTS "Guest dapat membuat pesanan" ON public.orders;
END $$;

-- Create a simple function to check admin role (avoiding recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin',
    false
  );
$$;

-- Simple policies for products (public read, admin write)
CREATE POLICY "Anyone can view products" 
  ON public.products 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage products" 
  ON public.products 
  FOR ALL 
  USING (public.is_admin());

-- Simple policies for profiles (users see own, admins see all)
CREATE POLICY "Users see own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Simple policies for orders
CREATE POLICY "Users see own orders" 
  ON public.orders 
  FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Anyone can create orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can update orders" 
  ON public.orders 
  FOR UPDATE 
  USING (public.is_admin());
