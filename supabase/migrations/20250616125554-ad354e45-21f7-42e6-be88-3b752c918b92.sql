
-- Membuat tabel untuk menyimpan produk
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- harga dalam Yen
  category TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Membuat tabel profil pengguna (terpisah dari auth.users untuk keamanan)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Membuat tabel untuk menyimpan pesanan
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_price INTEGER NOT NULL, -- total harga dalam Yen
  customer_info JSONB NOT NULL, -- informasi pelanggan (nama, alamat, dll)
  items JSONB NOT NULL, -- detail item pesanan
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies untuk products (semua orang bisa melihat, hanya admin yang bisa mengelola)
CREATE POLICY "Semua orang dapat melihat produk" 
  ON public.products 
  FOR SELECT 
  USING (true);

CREATE POLICY "Hanya admin yang dapat mengelola produk" 
  ON public.products 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies untuk profiles (user hanya bisa melihat/edit profil sendiri)
CREATE POLICY "User dapat melihat profil sendiri" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "User dapat mengupdate profil sendiri" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admin dapat melihat semua profil" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies untuk orders (user hanya bisa melihat pesanan sendiri, admin bisa melihat semua)
CREATE POLICY "User dapat melihat pesanan sendiri" 
  ON public.orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "User dapat membuat pesanan" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin dapat melihat semua pesanan" 
  ON public.orders 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin dapat mengupdate pesanan" 
  ON public.orders 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger untuk otomatis membuat profil saat user baru mendaftar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert data produk default (11 produk sesuai permintaan)
INSERT INTO public.products (name, description, price, category, image_url) VALUES
('Kerupuk Seblak Kering', 'Kerupuk seblak kering dengan rasa pedas yang autentik', 800, 'Makanan Ringan', '/placeholder.svg'),
('Bon Cabe Level 50', 'Bumbu cabai level pedas maksimal untuk masakan Indonesia', 600, 'Bumbu Dapur', '/placeholder.svg'),
('Bon Cabe Level 10 & 30', 'Bumbu cabai dengan pilihan level pedas sedang', 500, 'Bumbu Dapur', '/placeholder.svg'),
('Cuanki Baraka', 'Makanan siap saji cuanki dengan kuah gurih', 1200, 'Makanan Siap Saji', '/placeholder.svg'),
('Seblak Baraka', 'Makanan siap saji seblak pedas ala Bandung', 1100, 'Makanan Siap Saji', '/placeholder.svg'),
('Basreng Pedas', 'Bakso goreng pedas khas Bandung', 700, 'Makanan Ringan', '/placeholder.svg'),
('Basreng Original', 'Bakso goreng original tanpa pedas', 650, 'Makanan Ringan', '/placeholder.svg'),
('Nangka Muda (Gori)', 'Nangka muda beku siap olah untuk sayur asem', 900, 'Bahan Masak Beku', '/placeholder.svg'),
('Pete Kupas Frozen', 'Pete kupas beku berkualitas tinggi', 1500, 'Bahan Masak Beku', '/placeholder.svg'),
('Daun Kemangi', 'Daun kemangi segar untuk lalapan dan masakan', 400, 'Sayur Segar/Beku', '/placeholder.svg'),
('Daun Singkong Frozen', 'Daun singkong beku siap masak', 600, 'Sayur Beku', '/placeholder.svg'),
('Daun Pepaya', 'Daun pepaya segar untuk sayur dan lalapan', 450, 'Sayur Segar/Beku', '/placeholder.svg');
