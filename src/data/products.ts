
import { Product } from '@/types';

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Kerupuk Seblak Kering',
    description: 'Kerupuk khas Bandung yang gurih dan renyah, cocok untuk camilan atau lauk pendamping.',
    price: 480,
    category: 'Makanan Ringan',
    image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop&crop=center',
    stock: 25,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: []
  },
  {
    id: '2',
    name: 'Bon Cabe Level 50',
    description: 'Bumbu tabur pedas level ekstrim untuk pecinta makanan super pedas.',
    price: 380,
    category: 'Bumbu Dapur',
    image_url: 'https://images.unsplash.com/photo-1498936178812-4b2e558d2937?w=400&h=300&fit=crop&crop=center',
    stock: 15,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: [
      { id: 'v1', name: 'Level 10', price: 320, stock: 20 },
      { id: 'v2', name: 'Level 30', price: 350, stock: 15 },
      { id: 'v3', name: 'Level 50', price: 380, stock: 10 }
    ]
  },
  {
    id: '3',
    name: 'Bon Cabe Level 10 & 30',
    description: 'Paket bumbu tabur pedas level sedang, pas untuk yang baru mencoba makanan pedas.',
    price: 620,
    category: 'Bumbu Dapur',
    image_url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop&crop=center',
    stock: 8,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: []
  },
  {
    id: '4',
    name: 'Cuanki Baraka',
    description: 'Makanan siap saji khas Bandung dengan kuah yang gurih dan bakso yang kenyal.',
    price: 720,
    category: 'Makanan Siap Saji',
    image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop&crop=center',
    stock: 12,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: []
  },
  {
    id: '5',
    name: 'Seblak Baraka',
    description: 'Seblak instant dengan rasa autentik dan tingkat kepedasan yang pas.',
    price: 680,
    category: 'Makanan Siap Saji',
    image_url: 'https://images.unsplash.com/photo-1498936178812-4b2e558d2937?w=400&h=300&fit=crop&crop=center',
    stock: 0,
    status: 'out_of_stock',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: []
  },
  {
    id: '6',
    name: 'Basreng Pedas / Original',
    description: 'Bakso goreng kering dengan pilihan rasa pedas dan original yang renyah.',
    price: 420,
    category: 'Makanan Ringan',
    image_url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop&crop=center',
    stock: 18,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: []
  },
  {
    id: '7',
    name: 'Nangka Muda (Gori)',
    description: 'Nangka muda beku siap olah untuk berbagai masakan tradisional Indonesia.',
    price: 580,
    category: 'Bahan Masak Beku',
    image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop&crop=center',
    stock: 3,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: []
  },
  {
    id: '8',
    name: 'Pete Kupas Frozen',
    description: 'Pete kupas beku yang praktis, siap digunakan untuk masakan favorit.',
    price: 640,
    category: 'Bahan Masak Beku',
    image_url: 'https://images.unsplash.com/photo-1498936178812-4b2e558d2937?w=400&h=300&fit=crop&crop=center',
    stock: 7,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: []
  },
  {
    id: '9',
    name: 'Daun Kemangi',
    description: 'Daun kemangi segar untuk melengkapi lalapan dan masakan tradisional.',
    price: 320,
    category: 'Sayur Segar/Beku',
    image_url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop&crop=center',
    stock: 22,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: []
  },
  {
    id: '10',
    name: 'Daun Singkong Frozen',
    description: 'Daun singkong beku yang siap diolah menjadi berbagai masakan lezat.',
    price: 380,
    category: 'Sayur Beku',
    image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop&crop=center',
    stock: 4,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: []
  },
  {
    id: '11',
    name: 'Daun Pepaya',
    description: 'Daun pepaya segar untuk lalapan atau direbus sebagai sayuran sehat.',
    price: 280,
    category: 'Sayur Segar/Beku',
    image_url: 'https://images.unsplash.com/photo-1498936178812-4b2e558d2937?w=400&h=300&fit=crop&crop=center',
    stock: 14,
    status: 'inactive',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    variants: []
  },
];

export const categories = [
  'Makanan Ringan',
  'Bumbu Dapur',
  'Makanan Siap Saji',
  'Bahan Masak Beku',
  'Sayur Segar/Beku',
  'Sayur Beku'
];
