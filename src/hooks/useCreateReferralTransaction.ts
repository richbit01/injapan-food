
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReferralTransaction } from '@/types/referral';

export const useCreateReferralTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      referralCode,
      orderId,
      orderTotal,
      commissionAmount,
      referredUserId
    }: {
      referralCode: string;
      orderId: string;
      orderTotal: number;
      commissionAmount: number;
      referredUserId?: string;
    }) => {
      const cleanCode = referralCode.trim().toUpperCase();
      
      console.log('🔄 [REALTIME] Creating referral transaction:', {
        referralCode: cleanCode,
        orderId,
        orderTotal,
        commissionAmount,
        referredUserId,
        timestamp: new Date().toISOString()
      });

      // Get referrer info
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('user_id, is_active, code, total_uses, total_commission_earned')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        console.error('❌ [REALTIME] Referral code validation failed:', {
          code: cleanCode,
          error: codeError
        });
        throw new Error('Referral code not found or inactive');
      }

      // Prevent self-referral
      if (referredUserId && codeData.user_id === referredUserId) {
        console.error('❌ [REALTIME] Self-referral attempt blocked');
        throw new Error('Cannot use your own referral code');
      }

      // Create transaction record immediately
      const transactionData = {
        referrer_id: codeData.user_id,
        referred_user_id: referredUserId || null,
        referral_code: cleanCode,
        order_id: orderId,
        commission_amount: commissionAmount,
        order_total: orderTotal,
        status: 'pending' as const
      };

      console.log('📝 [REALTIME] Inserting transaction to database...');
      const { data: transaction, error: transactionError } = await supabase
        .from('referral_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) {
        console.error('❌ [REALTIME] Transaction creation failed:', {
          error: transactionError,
          data: transactionData
        });
        throw new Error(`Failed to create referral transaction: ${transactionError.message}`);
      }

      console.log('✅ [REALTIME] Transaction saved to database:', {
        transactionId: transaction.id,
        timestamp: new Date().toISOString()
      });

      // Update referral statistics immediately
      console.log('📊 [REALTIME] Updating referral statistics...');
      const { data: statsResult, error: statsError } = await supabase.rpc('increment_referral_stats', {
        referral_code: cleanCode,
        commission_amount: commissionAmount
      });

      if (statsError) {
        console.error('❌ [REALTIME] Stats update failed:', statsError);
        // Don't throw error here, transaction is already saved
        console.warn('⚠️ [REALTIME] Transaction saved but stats update failed');
      } else {
        console.log('✅ [REALTIME] Statistics updated successfully:', {
          code: cleanCode,
          addedCommission: commissionAmount,
          timestamp: new Date().toISOString()
        });
      }

      console.log('🎉 [REALTIME] Referral transaction completed successfully');
      return transaction as ReferralTransaction;
    },
    onSuccess: (data) => {
      console.log('🎯 [REALTIME] Transaction mutation successful, forcing immediate UI refresh...');
      
      // Force immediate invalidation of all related queries
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });
      
      // Also refresh orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      console.log('🔄 [REALTIME] All data invalidated for immediate UI updates');
    },
    onError: (error) => {
      console.error('💥 [REALTIME] Referral transaction mutation failed:', error);
    }
  });
};
