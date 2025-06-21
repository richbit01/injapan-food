// Insert sample data
import { supabase } from '@/integrations/supabase/client';

export const insertSampleData = async () => {
  console.log('📦 Menambahkan data sample...');

  // 1. Insert app settings
  const appSettings = [
    {
      id: 'referral_commission_rate',
      value: { rate: 3 },
      description: 'Persentase komisi referral (dalam persen)'
    },
    {
      id: 'site_name',
      value: { name: 'Injapan Food' },
      description: 'Nama website'
    },
    {
      id: 'contact_whatsapp',
      value: { number: '+6285155452259' },
      description: 'Nomor WhatsApp customer service'
    },
    {
      id: 'shipping_info',
      value: { text: 'Pengiriman ke seluruh Jepang 2-5 hari kerja' },
      description: 'Informasi pengiriman'
    }
  ];

  const { error: settingsError } = await supabase
    .from('app_settings')
    .upsert(appSettings);

  if (settingsError) {
    console.error('Error inserting app settings:', settingsError);
    throw settingsError;
  }

  // 2. Insert variant options
  const variantOptions = [
    { category: 'Kerupuk', variant_name: 'rasa', options: ['Original', 'Pedas', 'BBQ', 'Balado', 'Keju'], is_required: true },
    { category: 'Kerupuk', variant_name: 'gram', options: ['100g', '250g', '500g', '1kg'], is_required: true },
    { category: 'Bon Cabe', variant_name: 'level', options: ['10', '30', '50'], is_required: true },
    { category: 'Bon Cabe', variant_name: 'gram', options: ['40g', '80g', '160g'], is_required: true },
    { category: 'Makanan Ringan', variant_name: 'rasa', options: ['Original', 'Pedas', 'BBQ', 'Balado', 'Keju', 'Jagung Bakar'], is_required: false },
    { category: 'Makanan Ringan', variant_name: 'gram', options: ['100g', '250g', '500g'], is_required: false },
    { category: 'Bumbu Dapur', variant_name: 'kemasan', options: ['Sachet', 'Botol', 'Pouch'], is_required: false },
    { category: 'Bumbu Dapur', variant_name: 'gram', options: ['20g', '40g', '80g', '160g', '250g'], is_required: false },
    { category: 'Makanan Siap Saji', variant_name: 'porsi', options: ['1 porsi', '2 porsi', 'Family Pack'], is_required: false },
    { category: 'Makanan Siap Saji', variant_name: 'level_pedas', options: ['Tidak Pedas', 'Sedang', 'Pedas', 'Extra Pedas'], is_required: false },
    { category: 'Bahan Masak Beku', variant_name: 'jenis', options: ['Utuh', 'Potong', 'Parut'], is_required: false },
    { category: 'Bahan Masak Beku', variant_name: 'berat', options: ['250g', '500g', '1kg'], is_required: false },
    { category: 'Bahan Masak Beku', variant_name: 'kemasan', options: ['Plastik', 'Vacuum'], is_required: false },
    { category: 'Sayur Segar/Beku', variant_name: 'jenis', options: ['Segar', 'Beku'], is_required: false },
    { category: 'Sayur Segar/Beku', variant_name: 'kondisi', options: ['Utuh', 'Potong', 'Cuci Bersih'], is_required: false },
    { category: 'Sayur Segar/Beku', variant_name: 'berat', options: ['100g', '250g', '500g'], is_required: false },
    { category: 'Sayur Segar/Beku', variant_name: 'kemasan', options: ['Plastik', 'Styrofoam'], is_required: false },
    { category: 'Sayur Beku', variant_name: 'kondisi', options: ['Utuh', 'Potong', 'Cuci Bersih'], is_required: false },
    { category: 'Sayur Beku', variant_name: 'berat', options: ['250g', '500g', '1kg'], is_required: false },
    { category: 'Sayur Beku', variant_name: 'kemasan', options: ['Plastik', 'Vacuum'], is_required: false }
  ];

  const { error: variantsError } = await supabase
    .from('variant_options')
    .upsert(variantOptions);

  if (variantsError) {
    console.error('Error inserting variant options:', variantsError);
    throw variantsError;
  }

  // 3. Insert sample products
  const products = [
    {
      name: 'Kerupuk Seblak Kering',
      description: 'Kerupuk khas Bandung yang gurih dan renyah, cocok untuk camilan atau lauk pendamping.',
      price: 480,
      category: 'Makanan Ringan',
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      stock: 25,
      status: 'active',
      variants: [
        { id: 'v1', name: 'Original - 250g', price: 0, stock: 15 },
        { id: 'v2', name: 'Pedas - 250g', price: 50, stock: 10 }
      ]
    },
    {
      name: 'Bon Cabe Level 50',
      description: 'Bumbu tabur pedas level ekstrim untuk pecinta makanan super pedas.',
      price: 380,
      category: 'Bumbu Dapur',
      image_url: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg',
      stock: 15,
      status: 'active',
      variants: [
        { id: 'v1', name: 'Level 10 - 40g', price: -60, stock: 20 },
        { id: 'v2', name: 'Level 30 - 40g', price: -30, stock: 15 },
        { id: 'v3', name: 'Level 50 - 40g', price: 0, stock: 10 }
      ]
    },
    {
      name: 'Cuanki Baraka',
      description: 'Makanan siap saji khas Bandung dengan kuah yang gurih dan bakso yang kenyal.',
      price: 720,
      category: 'Makanan Siap Saji',
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      stock: 12,
      status: 'active',
      variants: []
    },
    {
      name: 'Seblak Baraka',
      description: 'Seblak instant dengan rasa autentik dan tingkat kepedasan yang pas.',
      price: 680,
      category: 'Makanan Siap Saji',
      image_url: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg',
      stock: 0,
      status: 'out_of_stock',
      variants: []
    },
    {
      name: 'Basreng Pedas',
      description: 'Bakso goreng kering dengan rasa pedas yang renyah dan gurih.',
      price: 420,
      category: 'Makanan Ringan',
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      stock: 18,
      status: 'active',
      variants: [
        { id: 'v1', name: 'Original - 100g', price: -50, stock: 25 },
        { id: 'v2', name: 'Pedas - 100g', price: 0, stock: 18 }
      ]
    },
    {
      name: 'Nangka Muda (Gori)',
      description: 'Nangka muda beku siap olah untuk berbagai masakan tradisional Indonesia.',
      price: 580,
      category: 'Bahan Masak Beku',
      image_url: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg',
      stock: 3,
      status: 'active',
      variants: []
    },
    {
      name: 'Pete Kupas Frozen',
      description: 'Pete kupas beku yang praktis, siap digunakan untuk masakan favorit.',
      price: 640,
      category: 'Bahan Masak Beku',
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      stock: 7,
      status: 'active',
      variants: []
    },
    {
      name: 'Daun Kemangi',
      description: 'Daun kemangi segar untuk melengkapi lalapan dan masakan tradisional.',
      price: 320,
      category: 'Sayur Segar/Beku',
      image_url: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg',
      stock: 22,
      status: 'active',
      variants: []
    },
    {
      name: 'Daun Singkong Frozen',
      description: 'Daun singkong beku yang siap diolah menjadi berbagai masakan lezat.',
      price: 380,
      category: 'Sayur Beku',
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      stock: 4,
      status: 'active',
      variants: []
    },
    {
      name: 'Daun Pepaya',
      description: 'Daun pepaya segar untuk lalapan atau direbus sebagai sayuran sehat.',
      price: 280,
      category: 'Sayur Segar/Beku',
      image_url: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg',
      stock: 14,
      status: 'inactive',
      variants: []
    },
    {
      name: 'Sambal Terasi Pedas',
      description: 'Sambal terasi autentik dengan rasa pedas yang menggugah selera.',
      price: 450,
      category: 'Bumbu Dapur',
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
      stock: 20,
      status: 'active',
      variants: []
    },
    {
      name: 'Rendang Instant',
      description: 'Rendang siap saji dengan bumbu rempah pilihan, cita rasa autentik Padang.',
      price: 850,
      category: 'Makanan Siap Saji',
      image_url: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg',
      stock: 8,
      status: 'active',
      variants: []
    }
  ];

  const { error: productsError } = await supabase
    .from('products')
    .upsert(products);

  if (productsError) {
    console.error('Error inserting products:', productsError);
    throw productsError;
  }

  console.log('✅ Sample data berhasil ditambahkan!');
  return true;
};