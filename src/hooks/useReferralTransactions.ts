
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { ReferralTransaction } from '@/types/referral';

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
