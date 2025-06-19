
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
      
      console.log('🔄 Creating referral transaction - Step by step process:');
      console.log('📋 Input data:', {
        referralCode: cleanCode,
        orderId,
        orderTotal,
        commissionAmount,
        referredUserId
      });

      // Get referrer info from referral code
      console.log('🔍 Step 1: Getting referrer info from referral code...');
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('user_id, is_active, code, total_uses, total_commission_earned')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        console.error('❌ Step 1 failed - Referral code not found or inactive:', {
          code: cleanCode,
          error: codeError,
          data: codeData
        });
        throw new Error('Referral code not found or inactive');
      }

      console.log('✅ Step 1 success - Referral code owner found:', {
        code: codeData.code,
        ownerId: codeData.user_id,
        currentUses: codeData.total_uses,
        currentCommission: codeData.total_commission_earned
      });

      // Prevent self-referral
      if (referredUserId && codeData.user_id === referredUserId) {
        console.error('❌ Step 2 failed - Self-referral attempt detected');
        throw new Error('Cannot use your own referral code');
      }

      console.log('✅ Step 2 success - Self-referral check passed');

      // Create the transaction record
      console.log('📝 Step 3: Creating referral transaction record...');
      const transactionData = {
        referrer_id: codeData.user_id,
        referred_user_id: referredUserId || null,
        referral_code: cleanCode,
        order_id: orderId,
        commission_amount: commissionAmount,
        order_total: orderTotal,
        status: 'pending' as const
      };

      console.log('📝 Transaction data to insert:', transactionData);

      const { data: transaction, error: transactionError } = await supabase
        .from('referral_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) {
        console.error('❌ Step 3 failed - Error creating referral transaction:', {
          error: transactionError,
          data: transactionData
        });
        throw new Error(`Failed to create referral transaction: ${transactionError.message}`);
      }

      console.log('✅ Step 3 success - Referral transaction created:', {
        transactionId: transaction.id,
        transactionData: transaction
      });

      // Update referral code statistics using the database function
      console.log('📊 Step 4: Updating referral code statistics...');
      const { data: statsResult, error: statsError } = await supabase.rpc('increment_referral_stats', {
        referral_code: cleanCode,
        commission_amount: commissionAmount
      });

      if (statsError) {
        console.error('❌ Step 4 warning - Error updating referral stats:', {
          error: statsError,
          code: cleanCode,
          commission: commissionAmount
        });
        console.warn('⚠️ Transaction created but stats update failed - this might need manual correction');
      } else {
        console.log('✅ Step 4 success - Referral statistics updated successfully:', {
          code: cleanCode,
          addedCommission: commissionAmount,
          result: statsResult
        });
      }

      // Verify the stats were updated by fetching the updated code
      console.log('🔍 Step 5: Verifying stats update...');
      const { data: updatedCode, error: verifyError } = await supabase
        .from('referral_codes')
        .select('total_uses, total_commission_earned')
        .eq('code', cleanCode)
        .single();

      if (verifyError) {
        console.warn('⚠️ Step 5 warning - Could not verify stats update:', verifyError);
      } else {
        console.log('✅ Step 5 success - Verified updated stats:', {
          code: cleanCode,
          newTotalUses: updatedCode.total_uses,
          newTotalCommission: updatedCode.total_commission_earned
        });
      }

      console.log('🎉 All steps completed successfully! Referral transaction fully processed.');
      return transaction as ReferralTransaction;
    },
    onSuccess: (data) => {
      console.log('🎯 Referral transaction mutation successful, invalidating queries...');
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });
      console.log('🔄 All queries invalidated, UI should refresh with new data');
    },
    onError: (error) => {
      console.error('💥 Referral transaction mutation failed:', error);
    }
  });
};
