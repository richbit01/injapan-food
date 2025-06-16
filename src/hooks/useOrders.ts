
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data?.map(order => ({
        ...order,
        items: order.items as unknown as OrderItem[],
        customer_info: order.customer_info as Order['customer_info'],
        status: order.status as Order['status']
      })) || [];
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      items,
      totalPrice,
      customerInfo,
      userId
    }: {
      items: OrderItem[];
      totalPrice: number;
      customerInfo: any;
      userId?: string;
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: userId || null,
          total_price: totalPrice,
          customer_info: customerInfo,
          items: items as any,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
