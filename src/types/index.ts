
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  created_at?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
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

export interface Prefecture {
  name: string;
  name_en: string;
}
