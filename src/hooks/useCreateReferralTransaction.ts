
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
      console.log('Creating referral transaction:', {
        referralCode,
        orderId,
        orderTotal,
        commissionAmount,
        referredUserId
      });

      // First validate the referral code and get the referrer
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('user_id, is_active')
        .eq('code', referralCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        console.error('Invalid referral code:', codeError);
        throw new Error('Invalid referral code');
      }

      console.log('Referral code owner:', codeData.user_id);

      // Prevent self-referral
      if (referredUserId && codeData.user_id === referredUserId) {
        console.error('Self-referral attempt detected');
        throw new Error('Cannot use your own referral code');
      }

      // Create the transaction
      const { data, error } = await supabase
        .from('referral_transactions')
        .insert({
          referrer_id: codeData.user_id,
          referred_user_id: referredUserId || null,
          referral_code: referralCode.trim().toUpperCase(),
          order_id: orderId,
          commission_amount: commissionAmount,
          order_total: orderTotal,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating referral transaction:', error);
        throw error;
      }

      console.log('Referral transaction created successfully:', data);

      // Update referral code stats using the database function
      console.log('Updating referral stats for code:', referralCode.trim().toUpperCase());
      const { error: statsError } = await supabase.rpc('increment_referral_stats', {
        referral_code: referralCode.trim().toUpperCase(),
        commission_amount: commissionAmount
      });

      if (statsError) {
        console.error('Error updating referral stats:', statsError);
        // Don't throw here as the main transaction was successful
      } else {
        console.log('Referral stats updated successfully');
      }

      return data as ReferralTransaction;
    },
    onSuccess: (data) => {
      console.log('Referral transaction mutation successful, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });
    },
  });
};
