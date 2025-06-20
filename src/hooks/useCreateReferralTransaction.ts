
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
      
      console.log('🔄 [REFERRAL] Creating pending referral transaction:', {
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
        .select('user_id, is_active, code')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        console.error('❌ [REFERRAL] Referral code validation failed:', {
          code: cleanCode,
          error: codeError
        });
        throw new Error('Referral code not found or inactive');
      }

      // Prevent self-referral
      if (referredUserId && codeData.user_id === referredUserId) {
        console.error('❌ [REFERRAL] Self-referral attempt blocked');
        throw new Error('Cannot use your own referral code');
      }

      // Create PENDING transaction record (no stats update)
      const transactionData = {
        referrer_id: codeData.user_id,
        referred_user_id: referredUserId || null,
        referral_code: cleanCode,
        order_id: orderId,
        commission_amount: commissionAmount,
        order_total: orderTotal,
        status: 'pending' as const // Wait for admin confirmation
      };

      console.log('📝 [REFERRAL] Inserting pending transaction to database...');
      const { data: transaction, error: transactionError } = await supabase
        .from('referral_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (transactionError) {
        console.error('❌ [REFERRAL] Transaction creation failed:', {
          error: transactionError,
          data: transactionData
        });
        throw new Error(`Failed to create referral transaction: ${transactionError.message}`);
      }

      console.log('✅ [REFERRAL] Pending transaction saved to database:', {
        transactionId: transaction.id,
        status: transaction.status,
        awaitingConfirmation: true,
        timestamp: new Date().toISOString()
      });

      // DO NOT update referral statistics yet - wait for admin confirmation
      console.log('⏳ [REFERRAL] Transaction created with pending status, awaiting admin confirmation');
      
      // Map the database response to match our ReferralTransaction type
      return {
        ...transaction,
        updated_at: transaction.created_at // Use created_at as fallback for updated_at
      } as ReferralTransaction;
    },
    onSuccess: (data) => {
      console.log('🎯 [REFERRAL] Pending transaction mutation successful:', {
        transactionId: data.id,
        status: data.status,
        timestamp: new Date().toISOString()
      });
      
      // Force immediate invalidation of all related queries
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      console.log('🔄 [REFERRAL] All data invalidated for pending transaction updates');
    },
    onError: (error) => {
      console.error('💥 [REFERRAL] Referral transaction mutation failed:', error);
    }
  });
};
