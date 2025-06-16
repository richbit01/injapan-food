
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  variants?: ProductVariant[];
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  variant?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  items: OrderItem[];
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
  status: 'pending' | 'processing' | 'completed';
  created_at: string;
}

export interface OrderTracking {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminLog {
  id: string;
  admin_id?: string;
  action: string;
  target_type: string;
  target_id?: string;
  details?: any;
  created_at: string;
}

export interface RecycleBinItem {
  id: string;
  original_table: string;
  original_id: string;
  data: any;
  deleted_by?: string;
  deleted_at: string;
}

export interface Prefecture {
  name: string;
  name_en: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: Product[];
  totalOrders: number;
  criticalStockProducts: Product[];
}
