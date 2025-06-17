
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  
  return useQuery({
    queryKey: ['user-referral-code', user?.id],
    queryFn: async (): Promise<ReferralCode | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('referral_codes' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching referral code:', error);
        throw error;
      }

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

      // Generate unique referral code
      const code = `REF${user.id.slice(0, 8).toUpperCase()}${Date.now().toString().slice(-4)}`;

      const { data, error } = await supabase
        .from('referral_codes' as any)
        .insert({
          user_id: user.id,
          code: code,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating referral code:', error);
        throw error;
      }

      return data as ReferralCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
    },
  });
};

export const useReferralTransactions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['referral-transactions', user?.id],
    queryFn: async (): Promise<ReferralTransaction[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('referral_transactions' as any)
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching referral transactions:', error);
        throw error;
      }

      return (data as ReferralTransaction[]) || [];
    },
    enabled: !!user?.id,
  });
};

export const useValidateReferralCode = () => {
  return useMutation({
    mutationFn: async (code: string): Promise<ReferralCode | null> => {
      const { data, error } = await supabase
        .from('referral_codes' as any)
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error validating referral code:', error);
        throw error;
      }

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
      // First get the referrer from the code
      const { data: codeData } = await supabase
        .from('referral_codes' as any)
        .select('user_id')
        .eq('code', referralCode)
        .eq('is_active', true)
        .single();

      if (!codeData) {
        throw new Error('Invalid referral code');
      }

      // Create the transaction
      const { data, error } = await supabase
        .from('referral_transactions' as any)
        .insert({
          referrer_id: codeData.user_id,
          referred_user_id: referredUserId || null,
          referral_code: referralCode,
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

      // Update referral code stats
      await supabase
        .from('referral_codes' as any)
        .update({
          total_uses: supabase.sql`total_uses + 1`,
          total_commission_earned: supabase.sql`total_commission_earned + ${commissionAmount}`
        })
        .eq('code', referralCode);

      return data as ReferralTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
    },
  });
};
