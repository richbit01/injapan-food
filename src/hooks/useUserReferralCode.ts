
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { ReferralCode } from '@/types/referral';

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
