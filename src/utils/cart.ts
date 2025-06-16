
import { CartItem, Product } from '@/types';

export const getCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('injapan-cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveCartToStorage = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('injapan-cart', JSON.stringify(cart));
};

export const addToCart = (product: Product, quantity: number = 1): CartItem[] => {
  const currentCart = getCartFromStorage();
  const existingItemIndex = currentCart.findIndex(item => item.product.id === product.id);

  let updatedCart: CartItem[];
  
  if (existingItemIndex > -1) {
    updatedCart = currentCart.map((item, index) => 
      index === existingItemIndex 
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  } else {
    const newItem: CartItem = {
      id: `cart-${product.id}-${Date.now()}`,
      product,
      quantity
    };
    updatedCart = [...currentCart, newItem];
  }

  saveCartToStorage(updatedCart);
  return updatedCart;
};

export const removeFromCart = (itemId: string): CartItem[] => {
  const currentCart = getCartFromStorage();
  const updatedCart = currentCart.filter(item => item.id !== itemId);
  saveCartToStorage(updatedCart);
  return updatedCart;
};

export const updateCartItemQuantity = (itemId: string, quantity: number): CartItem[] => {
  const currentCart = getCartFromStorage();
  const updatedCart = currentCart.map(item => 
    item.id === itemId ? { ...item, quantity } : item
  ).filter(item => item.quantity > 0);
  
  saveCartToStorage(updatedCart);
  return updatedCart;
};

export const clearCart = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('injapan-cart');
};

export const getCartTotal = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0
  }).format(price);
};
