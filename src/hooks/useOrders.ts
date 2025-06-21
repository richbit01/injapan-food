import { useState, useEffect } from 'react';
import { Order } from '@/types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading orders
    setTimeout(() => {
      setOrders([]); // No orders for demo
      setIsLoading(false);
    }, 500);
  }, []);

  return {
    data: orders,
    isLoading,
    error: null
  };
};

export const useCreateOrder = () => {
  return {
    mutate: async (orderData: any) => {
      // Simulate order creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Order created:', orderData);
    },
    isPending: false,
    isError: false,
    error: null
  };
};