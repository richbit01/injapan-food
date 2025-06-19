
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { Order } from '@/types';

export const usePendingOrders = () => {
  const queryClient = useQueryClient();

  // Enhanced real-time subscription for pending orders
  useEffect(() => {
    console.log('🔄 [ADMIN] Setting up pending orders subscription...');

    const channel = supabase
      .channel('pending-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: 'status=eq.pending'
        },
        (payload) => {
          console.log('📦 [ADMIN] Pending order update detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_transactions'
        },
        (payload) => {
          console.log('💰 [ADMIN] Referral transaction update detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
          queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 [ADMIN] Cleaning up pending orders subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['pending-orders'],
    queryFn: async (): Promise<Order[]> => {
      console.log('📦 [ADMIN] Fetching pending orders...');

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [ADMIN] Error fetching pending orders:', error);
        throw error;
      }

      // Get referral transactions for these orders
      const orderIds = orders?.map(order => order.id) || [];
      let referralTransactions: any[] = [];
      
      if (orderIds.length > 0) {
        const { data: transactions, error: transactionError } = await supabase
          .from('referral_transactions')
          .select(`
            *,
            referral_codes!inner(code, user_id)
          `)
          .in('order_id', orderIds)
          .eq('status', 'pending');

        if (transactionError) {
          console.error('❌ [ADMIN] Error fetching referral transactions:', transactionError);
        } else {
          referralTransactions = transactions || [];
        }
      }

      // Merge referral info with orders
      const ordersWithReferrals = (orders || []).map(order => ({
        ...order,
        items: order.items as any,
        customer_info: order.customer_info as any,
        status: order.status as Order['status'],
        referralTransaction: referralTransactions.find(t => t.order_id === order.id)
      }));

      console.log('✅ [ADMIN] Pending orders fetched:', {
        count: ordersWithReferrals.length,
        withReferrals: referralTransactions.length,
        timestamp: new Date().toISOString()
      });
      
      return ordersWithReferrals;
    },
    // Reduce stale time for more frequent updates
    staleTime: 1000, // 1 second
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};
