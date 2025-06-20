
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useConfirmOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const confirmOrder = useMutation({
    mutationFn: async ({ orderId, referralTransactionId }: { orderId: string; referralTransactionId?: string }) => {
      if (!user?.id) {
        throw new Error('Admin authentication required');
      }

      // Step 1: Update order status to 'completed'
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to confirm order: ${orderError.message}`);
      }

      // Step 2: Confirm referral transaction if exists
      if (referralTransactionId) {
        try {
          const { error: confirmError } = await supabase.rpc('confirm_referral_transaction', {
            transaction_id: referralTransactionId,
            admin_id: user.id
          });

          if (confirmError) {
            throw confirmError;
          }
        } catch (referralError) {
          // Continue even if referral processing fails
        }
      }

      return order;
    },
    onSuccess: (order) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
    },
    onError: (error) => {
      console.error('Order confirmation failed:', error);
    }
  });

  const cancelOrder = useMutation({
    mutationFn: async ({ orderId, referralTransactionId }: { orderId: string; referralTransactionId?: string }) => {
      if (!user?.id) {
        throw new Error('Admin authentication required');
      }

      // Step 1: Update order status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to cancel order: ${orderError.message}`);
      }

      // Step 2: Cancel referral transaction if exists
      if (referralTransactionId) {
        try {
          const { error: cancelError } = await supabase.rpc('cancel_referral_transaction', {
            transaction_id: referralTransactionId,
            admin_id: user.id
          });

          if (cancelError) {
            throw cancelError;
          }
        } catch (referralError) {
          // Continue even if referral processing fails
        }
      }

      return order;
    },
    onSuccess: (order) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
    },
    onError: (error) => {
      console.error('Order cancellation failed:', error);
    }
  });

  return {
    confirmOrder: confirmOrder.mutateAsync,
    cancelOrder: cancelOrder.mutateAsync,
    isLoading: confirmOrder.isPending || cancelOrder.isPending
  };
};
