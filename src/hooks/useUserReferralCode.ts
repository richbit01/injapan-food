
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { ReferralCode } from '@/types/referral';

export const useUserReferralCode = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Enhanced real-time subscription for user referral data
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔄 [REALTIME] Setting up user referral subscriptions for user:', user.id);

    const channel = supabase
      .channel('user-referral-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_codes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📊 [REALTIME] User referral code update:', payload);
          queryClient.invalidateQueries({ queryKey: ['user-referral-code', user.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_transactions',
          filter: `referrer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('💰 [REALTIME] User referral transaction update:', payload);
          queryClient.invalidateQueries({ queryKey: ['user-referral-code', user.id] });
          queryClient.invalidateQueries({ queryKey: ['referral-transactions', user.id] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 [REALTIME] Cleaning up user referral subscriptions');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
  
  return useQuery({
    queryKey: ['user-referral-code', user?.id],
    queryFn: async (): Promise<ReferralCode | null> => {
      if (!user?.id) return null;

      console.log('📊 [REALTIME] Fetching user referral code for:', user.id);

      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('❌ [REALTIME] Error fetching referral code:', error);
        throw error;
      }

      console.log('✅ [REALTIME] User referral code fetched:', {
        hasCode: !!data,
        code: data?.code,
        totalUses: data?.total_uses,
        totalCommission: data?.total_commission_earned,
        timestamp: new Date().toISOString()
      });
      
      return data as ReferralCode || null;
    },
    enabled: !!user?.id,
    // Reduce stale time for more frequent updates
    staleTime: 1000, // 1 second
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};
