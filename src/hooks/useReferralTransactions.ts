
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { ReferralTransaction } from '@/types/referral';

export const useReferralTransactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Enhanced real-time subscription for referral transactions
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔄 [REALTIME] Setting up referral transactions subscription for user:', user.id);

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
          console.log('💰 [REALTIME] User transaction update detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['referral-transactions', user.id] });
          // Also update referral code stats
          queryClient.invalidateQueries({ queryKey: ['user-referral-code', user.id] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 [REALTIME] Cleaning up transactions subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
  
  return useQuery({
    queryKey: ['referral-transactions', user?.id],
    queryFn: async (): Promise<ReferralTransaction[]> => {
      if (!user?.id) return [];

      console.log('💰 [REALTIME] Fetching referral transactions for user:', user.id);

      const { data, error } = await supabase
        .from('referral_transactions')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [REALTIME] Error fetching referral transactions:', error);
        throw error;
      }

      console.log('✅ [REALTIME] Referral transactions fetched:', {
        count: data?.length || 0,
        transactions: data,
        timestamp: new Date().toISOString()
      });
      
      // Map the database response to match our ReferralTransaction type
      return (data || []).map(transaction => ({
        ...transaction,
        updated_at: transaction.confirmed_at || transaction.created_at
      })) as ReferralTransaction[];
    },
    enabled: !!user?.id,
    // Reduce stale time for more frequent updates
    staleTime: 1000, // 1 second
    refetchInterval: 3000, // Refetch every 3 seconds
  });
};
