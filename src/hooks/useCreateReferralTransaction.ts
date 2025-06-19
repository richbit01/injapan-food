
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
      
      console.log('🔍 Creating referral transaction:', {
        referralCode: cleanCode,
        orderId,
        orderTotal,
        commissionAmount,
        referredUserId
      });

      // First validate the referral code and get the referrer
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('user_id, is_active, code')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (codeError) {
        console.error('❌ Referral code validation error:', codeError);
        throw new Error(`Invalid referral code: ${codeError.message}`);
      }

      if (!codeData) {
        console.error('❌ Referral code not found:', cleanCode);
        throw new Error('Referral code not found or inactive');
      }

      console.log('✅ Referral code validated:', {
        code: codeData.code,
        ownerId: codeData.user_id,
        isActive: codeData.is_active
      });

      // Prevent self-referral
      if (referredUserId && codeData.user_id === referredUserId) {
        console.error('❌ Self-referral attempt detected');
        throw new Error('Cannot use your own referral code');
      }

      // Create the transaction
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

      console.log('✅ Referral transaction created:', transaction.id);

      // Update referral code stats using the database function
      console.log('📊 Updating referral stats for code:', cleanCode);
      const { error: statsError } = await supabase.rpc('increment_referral_stats', {
        referral_code: cleanCode,
        commission_amount: commissionAmount
      });

      if (statsError) {
        console.error('❌ Error updating referral stats:', statsError);
        // Don't throw here as the main transaction was successful
        console.warn('⚠️ Stats update failed but transaction recorded');
      } else {
        console.log('✅ Referral stats updated successfully');
      }

      return transaction as ReferralTransaction;
    },
    onSuccess: (data) => {
      console.log('🎯 Referral transaction mutation successful, invalidating queries...');
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
