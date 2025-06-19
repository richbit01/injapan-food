
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

      console.log(`🔄 [ADMIN] Confirming order:`, {
        orderId,
        adminId: user.id,
        timestamp: new Date().toISOString()
      });

      // Step 1: Update order status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) {
        console.error(`❌ [ADMIN] Failed to update order status:`, orderError);
        throw new Error(`Failed to confirm order: ${orderError.message}`);
      }

      console.log(`✅ [ADMIN] Order status updated to confirmed:`, {
        orderId: order.id,
        newStatus: order.status
      });

      // Step 2: Confirm referral transaction if exists
      if (referralTransactionId) {
        try {
          const { error: confirmError } = await supabase.rpc('confirm_referral_transaction', {
            transaction_id: referralTransactionId,
            admin_id: user.id
          });

          if (confirmError) {
            console.error('❌ [ADMIN] Failed to confirm referral transaction:', confirmError);
            throw confirmError;
          }

          console.log('✅ [ADMIN] Referral transaction confirmed:', {
            transactionId: referralTransactionId
          });
        } catch (referralError) {
          console.error(`❌ [ADMIN] Referral transaction confirmation failed:`, referralError);
          console.warn(`⚠️ [ADMIN] Order confirmed but referral processing failed`);
        }
      }

      console.log(`🎉 [ADMIN] Order confirmation completed successfully:`, {
        orderId: order.id,
        finalStatus: order.status
      });

      return order;
    },
    onSuccess: (order) => {
      console.log(`🎯 [ADMIN] Order confirmation mutation successful:`, {
        orderId: order.id,
        status: order.status
      });
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      
      console.log('🔄 [ADMIN] All data refreshed after order confirmation');
    },
    onError: (error) => {
      console.error(`💥 [ADMIN] Order confirmation failed:`, error);
    }
  });

  const cancelOrder = useMutation({
    mutationFn: async ({ orderId, referralTransactionId }: { orderId: string; referralTransactionId?: string }) => {
      if (!user?.id) {
        throw new Error('Admin authentication required');
      }

      console.log(`🔄 [ADMIN] Cancelling order:`, {
        orderId,
        adminId: user.id,
        timestamp: new Date().toISOString()
      });

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
        console.error(`❌ [ADMIN] Failed to update order status:`, orderError);
        throw new Error(`Failed to cancel order: ${orderError.message}`);
      }

      console.log(`✅ [ADMIN] Order status updated to cancelled:`, {
        orderId: order.id,
        newStatus: order.status
      });

      // Step 2: Cancel referral transaction if exists
      if (referralTransactionId) {
        try {
          const { error: cancelError } = await supabase.rpc('cancel_referral_transaction', {
            transaction_id: referralTransactionId,
            admin_id: user.id
          });

          if (cancelError) {
            console.error('❌ [ADMIN] Failed to cancel referral transaction:', cancelError);
            throw cancelError;
          }

          console.log('✅ [ADMIN] Referral transaction cancelled:', {
            transactionId: referralTransactionId
          });
        } catch (referralError) {
          console.error(`❌ [ADMIN] Referral transaction cancellation failed:`, referralError);
          console.warn(`⚠️ [ADMIN] Order cancelled but referral processing failed`);
        }
      }

      console.log(`🎉 [ADMIN] Order cancellation completed successfully:`, {
        orderId: order.id,
        finalStatus: order.status
      });

      return order;
    },
    onSuccess: (order) => {
      console.log(`🎯 [ADMIN] Order cancellation mutation successful:`, {
        orderId: order.id,
        status: order.status
      });
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      
      console.log('🔄 [ADMIN] All data refreshed after order cancellation');
    },
    onError: (error) => {
      console.error(`💥 [ADMIN] Order cancellation failed:`, error);
    }
  });

  return {
    confirmOrder: confirmOrder.mutateAsync,
    cancelOrder: cancelOrder.mutateAsync,
    isLoading: confirmOrder.isPending || cancelOrder.isPending
  };
};
