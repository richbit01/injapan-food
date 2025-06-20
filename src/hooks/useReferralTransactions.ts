
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { ReferralTransaction } from '@/types/referral';

export const useReferralTransactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Optimized real-time subscription for referral transactions
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('user-transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_transactions',
          filter: `referrer_id=eq.${user.id}`
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['referral-transactions', user.id] });
          queryClient.invalidateQueries({ queryKey: ['user-referral-code', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
  
  return useQuery({
    queryKey: ['referral-transactions', user?.id],
    queryFn: async (): Promise<ReferralTransaction[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('referral_transactions')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      // Map the database response to match our ReferralTransaction type
      return (data || []).map(transaction => ({
        ...transaction,
        updated_at: transaction.confirmed_at || transaction.created_at
      })) as ReferralTransaction[];
    },
    enabled: !!user?.id,
    // Optimized caching - less frequent updates
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 30, // Refetch every 30 seconds instead of 3 seconds
  });
};
