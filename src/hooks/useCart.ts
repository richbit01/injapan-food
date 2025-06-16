
import { useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { 
  getCartFromStorage, 
  addToCart as addToCartUtil, 
  removeFromCart as removeFromCartUtil,
  updateCartItemQuantity as updateCartItemQuantityUtil,
  clearCart as clearCartUtil,
  getCartTotal 
} from '@/utils/cart';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCart(getCartFromStorage());
    setLoading(false);
  }, []);

  const addToCart = (product: Product, quantity: number = 1) => {
    const updatedCart = addToCartUtil(product, quantity);
    setCart(updatedCart);
  };

  const removeFromCart = (itemId: string) => {
    const updatedCart = removeFromCartUtil(itemId);
    setCart(updatedCart);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const updatedCart = updateCartItemQuantityUtil(itemId, quantity);
    setCart(updatedCart);
  };

  const clearCart = () => {
    clearCartUtil();
    setCart([]);
  };

  const total = getCartTotal(cart);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    // Untuk kompatibilitas mundur
    items: cart,
    getTotalPrice: () => total
  };
};
