
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useConfirmOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const confirmOrder = useMutation({
    mutationFn: async ({ orderId, action }: { orderId: string; action: 'confirm' | 'cancel' }) => {
      if (!user?.id) {
        throw new Error('Admin authentication required');
      }

      console.log(`🔄 [ADMIN] ${action === 'confirm' ? 'Confirming' : 'Cancelling'} order:`, {
        orderId,
        adminId: user.id,
        timestamp: new Date().toISOString()
      });

      // Step 1: Update order status
      const newOrderStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: newOrderStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (orderError) {
        console.error(`❌ [ADMIN] Failed to update order status:`, orderError);
        throw new Error(`Failed to ${action} order: ${orderError.message}`);
      }

      console.log(`✅ [ADMIN] Order status updated to ${newOrderStatus}:`, {
        orderId: order.id,
        newStatus: order.status
      });

      // Step 2: Handle referral transactions for this order
      const { data: referralTransactions, error: transactionError } = await supabase
        .from('referral_transactions')
        .select('*')
        .eq('order_id', orderId)
        .eq('status', 'pending');

      if (transactionError) {
        console.error('❌ [ADMIN] Failed to fetch referral transactions:', transactionError);
        // Don't fail the order confirmation if referral processing fails
        console.warn('⚠️ [ADMIN] Order confirmed but referral processing failed');
        return order;
      }

      if (referralTransactions && referralTransactions.length > 0) {
        for (const transaction of referralTransactions) {
          try {
            if (action === 'confirm') {
              // Confirm the referral transaction and update stats
              const { error: confirmError } = await supabase.rpc('confirm_referral_transaction', {
                transaction_id: transaction.id,
                admin_id: user.id
              });

              if (confirmError) {
                console.error('❌ [ADMIN] Failed to confirm referral transaction:', confirmError);
                throw confirmError;
              }

              console.log('✅ [ADMIN] Referral transaction confirmed:', {
                transactionId: transaction.id,
                referralCode: transaction.referral_code,
                commissionAmount: transaction.commission_amount,
                referrerId: transaction.referrer_id
              });
            } else {
              // Cancel the referral transaction
              const { error: cancelError } = await supabase.rpc('cancel_referral_transaction', {
                transaction_id: transaction.id,
                admin_id: user.id
              });

              if (cancelError) {
                console.error('❌ [ADMIN] Failed to cancel referral transaction:', cancelError);
                throw cancelError;
              }

              console.log('✅ [ADMIN] Referral transaction cancelled:', {
                transactionId: transaction.id,
                referralCode: transaction.referral_code
              });
            }
          } catch (referralError) {
            console.error(`❌ [ADMIN] Referral transaction ${action} failed:`, referralError);
            // Continue with other transactions even if one fails
            console.warn(`⚠️ [ADMIN] Failed to ${action} referral transaction ${transaction.id}, continuing...`);
          }
        }
      }

      console.log(`🎉 [ADMIN] Order ${action} completed successfully:`, {
        orderId: order.id,
        finalStatus: order.status,
        referralTransactionsProcessed: referralTransactions?.length || 0
      });

      return order;
    },
    onSuccess: (order, variables) => {
      console.log(`🎯 [ADMIN] Order ${variables.action} mutation successful:`, {
        orderId: order.id,
        status: order.status,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate all relevant queries for immediate UI updates
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-history'] });
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });
      
      console.log('🔄 [ADMIN] All data refreshed after order confirmation');
    },
    onError: (error, variables) => {
      console.error(`💥 [ADMIN] Order ${variables.action} failed:`, error);
    }
  });

  return {
    confirmOrder: confirmOrder.mutateAsync,
    isConfirming: confirmOrder.isPending
  };
};
