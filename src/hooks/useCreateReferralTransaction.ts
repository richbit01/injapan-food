
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
      
      console.log('🔄 Creating referral transaction with data:', {
        referralCode: cleanCode,
        orderId,
        orderTotal,
        commissionAmount,
        referredUserId
      });

      // Get referrer info from referral code
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('user_id, is_active, code')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        console.error('❌ Referral code not found or inactive:', codeError);
        throw new Error('Referral code not found or inactive');
      }

      console.log('✅ Referral code owner found:', codeData.user_id);

      // Prevent self-referral
      if (referredUserId && codeData.user_id === referredUserId) {
        console.error('❌ Self-referral attempt detected');
        throw new Error('Cannot use your own referral code');
      }

      // Create the transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('referral_transactions')
        .insert({
          referrer_id: codeData.user_id,
          referred_user_id: referredUserId || null,
          referral_code: cleanCode,
          order_id: orderId,
          commission_amount: commissionAmount,
          order_total: orderTotal,
          status: 'pending'
        })
        .select()
        .single();

      if (transactionError) {
        console.error('❌ Error creating referral transaction:', transactionError);
        throw new Error(`Failed to create referral transaction: ${transactionError.message}`);
      }

      console.log('✅ Referral transaction created with ID:', transaction.id);

      // Update referral code statistics
      console.log('📊 Updating referral code statistics...');
      const { error: statsError } = await supabase.rpc('increment_referral_stats', {
        referral_code: cleanCode,
        commission_amount: commissionAmount
      });

      if (statsError) {
        console.error('❌ Error updating referral stats:', statsError);
        console.warn('⚠️ Transaction created but stats update failed');
      } else {
        console.log('✅ Referral statistics updated successfully');
      }

      return transaction as ReferralTransaction;
    },
    onSuccess: (data) => {
      console.log('🎯 Referral transaction mutation successful');
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });
    },
    onError: (error) => {
      console.error('💥 Referral transaction mutation failed:', error);
    }
  });
};
