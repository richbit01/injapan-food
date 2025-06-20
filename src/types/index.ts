
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface Order {
  id: string;
  user_id?: string;
  total_price: number;
  customer_info: {
    name: string;
    email: string;
    prefecture: string;
    postal_code: string;
    address: string;
    phone: string;
    notes?: string;
  };
  items: CartItem[];
  status: 'pending' | 'processing' | 'completed' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  referralTransaction?: {
    id: string;
    referral_code: string;
    commission_amount: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    referrer_id: string;
    referral_codes?: {
      code: string;
      user_id: string;
    };
  };
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export interface OrderTracking {
  id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface Prefecture {
  name: string;
  name_en: string;
  code?: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: Product[];
  outOfStockProducts: number;
  criticalStockProducts: Product[];
  totalCategories: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  created_at: string;
}

export interface RecycleBinItem {
  id: string;
  original_table: string;
  original_id: string;
  data: any;
  deleted_by: string;
  deleted_at: string;
}

export interface ReferralTransaction {
  id: string;
  referral_code: string;
  commission_amount: number;
  order_id: string;
  order_total: number;
  referrer_id: string;
  referred_user_id: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
}
