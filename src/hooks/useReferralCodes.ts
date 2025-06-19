import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
  is_active: boolean;
  total_uses: number;
  total_commission_earned: number;
}

interface ReferralTransaction {
  id: string;
  referrer_id: string;
  referred_user_id?: string;
  referral_code: string;
  order_id: string;
  commission_amount: number;
  order_total: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
}

export const useUserReferralCode = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Real-time subscription for referral codes
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscription for referral codes, user:', user.id);

    const channel = supabase
      .channel('referral-codes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_codes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time referral code update:', payload);
          queryClient.invalidateQueries({ queryKey: ['user-referral-code', user.id] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up referral codes subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
  
  return useQuery({
    queryKey: ['user-referral-code', user?.id],
    queryFn: async (): Promise<ReferralCode | null> => {
      if (!user?.id) return null;

      console.log('Fetching referral code for user:', user.id);

      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching referral code:', error);
        throw error;
      }

      console.log('Referral code data:', data);
      return data as ReferralCode || null;
    },
    enabled: !!user?.id,
  });
};

export const useCreateReferralCode = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Creating referral code for user:', user.id);

      // Generate truly unique referral code
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      const userIdHash = user.id.replace(/-/g, '').substring(0, 6).toUpperCase();
      const code = `REF${userIdHash}${randomStr}`;

      console.log('Generated referral code:', code);

      // Check if code already exists and regenerate if needed
      let finalCode = code;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        const { data: existingCode } = await supabase
          .from('referral_codes')
          .select('code')
          .eq('code', finalCode)
          .single();

        if (!existingCode) {
          // Code is unique, break the loop
          break;
        }

        // Generate new code if collision detected
        const newRandomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        finalCode = `REF${userIdHash}${newRandomStr}`;
        attempts++;
        console.log(`Code collision detected, trying new code: ${finalCode}`);
      }

      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique referral code');
      }

      const { data, error } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          code: finalCode,
          is_active: true,
          total_uses: 0,
          total_commission_earned: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating referral code:', error);
        throw error;
      }

      console.log('Referral code created successfully:', data);
      return data as ReferralCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
    },
  });
};

export const useReferralTransactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Real-time subscription for referral transactions
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscription for referral transactions, user:', user.id);

    const channel = supabase
      .channel('referral-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_transactions',
          filter: `referrer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time referral transaction update:', payload);
          queryClient.invalidateQueries({ queryKey: ['referral-transactions', user.id] });
          // Also invalidate referral code to update stats
          queryClient.invalidateQueries({ queryKey: ['user-referral-code', user.id] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up referral transactions subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
  
  return useQuery({
    queryKey: ['referral-transactions', user?.id],
    queryFn: async (): Promise<ReferralTransaction[]> => {
      if (!user?.id) return [];

      console.log('Fetching referral transactions for user:', user.id);

      const { data, error } = await supabase
        .from('referral_transactions')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referral transactions:', error);
        throw error;
      }

      console.log('Referral transactions found:', data?.length || 0, 'transactions:', data);
      return (data as ReferralTransaction[]) || [];
    },
    enabled: !!user?.id,
  });
};

export const useValidateReferralCode = () => {
  return useMutation({
    mutationFn: async (code: string): Promise<ReferralCode | null> => {
      console.log('Validating referral code:', code);

      if (!code || code.trim().length === 0) {
        console.log('Empty referral code provided');
        return null;
      }

      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error validating referral code:', error);
        throw error;
      }

      console.log('Referral code validation result:', data);
      return data as ReferralCode || null;
    },
  });
};

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
