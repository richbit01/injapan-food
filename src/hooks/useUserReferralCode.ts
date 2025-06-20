
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { ReferralCode } from '@/types/referral';

export const useUserReferralCode = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Optimized real-time subscription for user referral data
  useEffect(() => {
    if (!user?.id) return;

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
          queryClient.invalidateQueries({ queryKey: ['user-referral-code', user.id] });
          queryClient.invalidateQueries({ queryKey: ['referral-transactions', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
  
  return useQuery({
    queryKey: ['user-referral-code', user?.id],
    queryFn: async (): Promise<ReferralCode | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        throw error;
      }
      
      return data as ReferralCode || null;
    },
    enabled: !!user?.id,
    // Optimized caching - less frequent updates
    staleTime: 1000 * 60 * 3, // 3 minutes
    refetchInterval: 1000 * 60, // Refetch every 1 minute instead of 5 seconds
  });
};
