# Database Structure Check - Injapan Food

## Tables Created

### 1. **products** - Tabel Produk
- `id` (UUID, Primary Key)
- `name` (TEXT, NOT NULL) - Nama produk
- `description` (TEXT) - Deskripsi produk
- `price` (INTEGER, NOT NULL) - Harga dalam Yen
- `category` (TEXT, NOT NULL) - Kategori produk
- `image_url` (TEXT) - URL gambar produk
- `stock` (INTEGER, DEFAULT 0) - Stok produk
- `status` (TEXT, DEFAULT 'active') - Status: active/inactive/out_of_stock
- `variants` (JSONB, DEFAULT '[]') - Varian produk dalam format JSON
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

### 2. **profiles** - Profil Pengguna
- `id` (UUID, Primary Key)
- `full_name` (TEXT) - Nama lengkap
- `phone` (TEXT) - Nomor telepon
- `role` (TEXT, DEFAULT 'user') - Role: user/admin
- `firebase_uid` (TEXT, UNIQUE) - Firebase Authentication UID
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

### 3. **orders** - Pesanan
- `id` (UUID, Primary Key)
- `user_id` (UUID) - ID pengguna (nullable untuk guest orders)
- `total_price` (INTEGER, NOT NULL) - Total harga dalam Yen
- `customer_info` (JSONB, NOT NULL) - Info pelanggan (nama, alamat, dll)
- `items` (JSONB, NOT NULL) - Detail item pesanan
- `status` (TEXT, DEFAULT 'pending') - Status: pending/processing/completed
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

### 4. **orders_tracking** - Tracking Pesanan
- `id` (UUID, Primary Key)
- `customer_name` (TEXT, NOT NULL)
- `customer_email` (TEXT)
- `customer_phone` (TEXT)
- `items` (JSONB, NOT NULL)
- `total_amount` (INTEGER, NOT NULL)
- `status` (TEXT, DEFAULT 'pending')
- `notes` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

### 5. **admin_logs** - Log Aktivitas Admin
- `id` (UUID, Primary Key)
- `admin_id` (UUID) - ID admin
- `action` (TEXT, NOT NULL) - Aksi yang dilakukan
- `target_type` (TEXT, NOT NULL) - Tipe target (product, order, dll)
- `target_id` (TEXT) - ID target
- `details` (JSONB) - Detail tambahan
- `created_at` (TIMESTAMP WITH TIME ZONE)

### 6. **recycle_bin** - Tempat Sampah (Soft Delete)
- `id` (UUID, Primary Key)
- `original_table` (TEXT, NOT NULL) - Tabel asal
- `original_id` (UUID, NOT NULL) - ID asli
- `data` (JSONB, NOT NULL) - Data yang dihapus
- `deleted_by` (UUID) - ID yang menghapus
- `deleted_at` (TIMESTAMP WITH TIME ZONE)

### 7. **app_settings** - Pengaturan Aplikasi
- `id` (TEXT, Primary Key)
- `value` (JSONB, NOT NULL) - Nilai pengaturan
- `description` (TEXT) - Deskripsi pengaturan
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

### 8. **settings_history** - Riwayat Perubahan Pengaturan
- `id` (UUID, Primary Key)
- `setting_id` (TEXT, NOT NULL)
- `old_value` (JSONB) - Nilai lama
- `new_value` (JSONB, NOT NULL) - Nilai baru
- `changed_by` (UUID) - ID yang mengubah
- `changed_at` (TIMESTAMP WITH TIME ZONE)
- `notes` (TEXT) - Catatan

### 9. **variant_options** - Template Varian Produk
- `id` (UUID, Primary Key)
- `category` (TEXT, NOT NULL) - Kategori produk
- `variant_name` (TEXT, NOT NULL) - Nama varian (rasa, level, gram, dll)
- `options` (JSONB, NOT NULL) - Array opsi varian
- `is_required` (BOOLEAN, DEFAULT false) - Apakah wajib dipilih
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

## Storage Buckets

### **product-images**
- Public bucket untuk menyimpan gambar produk
- File size limit: 5MB
- Allowed types: JPEG, PNG, WebP, GIF

## Row Level Security (RLS)

Semua tabel menggunakan RLS dengan policies:
- **Products**: Public read, admin write
- **Profiles**: Users see own profile, admins see all
- **Orders**: Users see own orders, admins see all
- **Admin tables**: Only admins can access
- **Storage**: Authenticated users can upload images

## Functions

1. **is_admin()** - Mengecek apakah user adalah admin
2. **handle_new_user()** - Trigger untuk membuat profil saat user baru
3. **update_updated_at_column()** - Trigger untuk update timestamp
4. **confirm_referral_transaction()** - Konfirmasi transaksi referral
5. **cancel_referral_transaction()** - Batalkan transaksi referral

## Sample Data

Database sudah berisi 12 produk sample dengan berbagai kategori:
- Makanan Ringan (Kerupuk, Basreng)
- Bumbu Dapur (Bon Cabe)
- Makanan Siap Saji (Cuanki, Seblak)
- Bahan Masak Beku (Nangka Muda, Pete)
- Sayur Segar/Beku (Daun Kemangi, Daun Pepaya)

## Variant Options Data

Template varian sudah dibuat untuk berbagai kategori:
- **Kerupuk**: rasa (Original, Pedas, BBQ, Balado), gram (100g, 250g, 500g)
- **Bon Cabe**: level (10, 30, 50), gram (40g, 80g, 160g)
- **Makanan Ringan**: rasa, gram
- **Bumbu Dapur**: kemasan, gram
- **Makanan Siap Saji**: porsi, level_pedas
- **Bahan Masak Beku**: jenis, berat, kemasan
- **Sayur**: jenis, kondisi, berat, kemasan

## Status Database

✅ **Database sudah siap digunakan** dengan:
- Struktur tabel lengkap
- RLS policies terkonfigurasi
- Sample data tersedia
- Storage bucket untuk gambar
- Template varian produk
- Functions dan triggers aktif

Database Supabase Anda sudah dalam kondisi baik dan siap untuk production!