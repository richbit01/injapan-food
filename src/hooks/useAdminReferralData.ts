
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

interface ReferrerSummary {
  user_id: string;
  referral_code: string;
  total_uses: number;
  total_commission_earned: number;
  user_name?: string;
  user_email?: string;
}

interface ReferralDetail {
  id: string;
  referred_user_id: string | null;
  order_id: string;
  commission_amount: number;
  order_total: number;
  created_at: string;
  referred_user_email?: string;
}

export const useAdminReferrerSummary = () => {
  const queryClient = useQueryClient();

  // Enhanced real-time subscription for admin dashboard
  useEffect(() => {
    console.log('🔄 [REALTIME] Setting up admin real-time subscriptions...');
    
    const channel = supabase
      .channel('admin-referral-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_codes'
        },
        (payload) => {
          console.log('📊 [REALTIME] Referral codes update detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referral_transactions'
        },
        (payload) => {
          console.log('💰 [REALTIME] Referral transaction update detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
          queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('📦 [REALTIME] Order update detected:', payload);
          // Refresh admin data when new orders come in
          queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 [REALTIME] Cleaning up admin subscriptions');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-referrer-summary'],
    queryFn: async (): Promise<ReferrerSummary[]> => {
      console.log('📊 [REALTIME] Fetching admin referrer summary...');

      // Get all referral codes with their stats
      const { data: referralCodes, error: codesError } = await supabase
        .from('referral_codes')
        .select(`
          user_id,
          code,
          total_uses,
          total_commission_earned
        `)
        .gt('total_uses', 0)
        .order('total_commission_earned', { ascending: false });

      if (codesError) {
        console.error('❌ [REALTIME] Error fetching referral codes:', codesError);
        throw codesError;
      }

      if (!referralCodes || referralCodes.length === 0) {
        console.log('ℹ️ [REALTIME] No referral data found');
        return [];
      }

      // Get user details
      const userIds = referralCodes.map(code => code.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ [REALTIME] Error fetching user profiles:', profilesError);
        throw profilesError;
      }

      const result: ReferrerSummary[] = referralCodes.map(code => {
        const profile = profiles?.find(p => p.id === code.user_id);
        return {
          user_id: code.user_id,
          referral_code: code.code,
          total_uses: code.total_uses,
          total_commission_earned: code.total_commission_earned,
          user_name: profile?.full_name || 'Unknown User',
          user_email: code.code
        };
      });

      console.log('✅ [REALTIME] Admin referrer summary fetched:', {
        count: result.length,
        timestamp: new Date().toISOString()
      });
      
      return result;
    },
    // Reduce stale time for more frequent updates
    staleTime: 1000, // 1 second
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

export const useAdminReferralDetails = (referrerUserId: string | null) => {
  return useQuery({
    queryKey: ['admin-referral-details', referrerUserId],
    queryFn: async (): Promise<ReferralDetail[]> => {
      if (!referrerUserId) return [];

      console.log('📋 [REALTIME] Fetching referral details for user:', referrerUserId);

      const { data: transactions, error } = await supabase
        .from('referral_transactions')
        .select(`
          id,
          referred_user_id,
          order_id,
          commission_amount,
          order_total,
          created_at
        `)
        .eq('referrer_id', referrerUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [REALTIME] Error fetching referral details:', error);
        throw error;
      }

      if (!transactions || transactions.length === 0) {
        console.log('ℹ️ [REALTIME] No referral transactions found');
        return [];
      }

      // Get profile info for referred users
      const referredUserIds = transactions
        .map(t => t.referred_user_id)
        .filter(Boolean) as string[];

      let profiles: any[] = [];
      if (referredUserIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', referredUserIds);

        if (profilesError) {
          console.error('❌ [REALTIME] Error fetching referred user profiles:', profilesError);
        } else {
          profiles = profilesData || [];
        }
      }

      const result: ReferralDetail[] = transactions.map(transaction => {
        const profile = profiles.find(p => p.id === transaction.referred_user_id);
        return {
          ...transaction,
          referred_user_email: profile?.full_name || 'Guest User'
        };
      });

      console.log('✅ [REALTIME] Referral details fetched:', {
        count: result.length,
        timestamp: new Date().toISOString()
      });
      
      return result;
    },
    enabled: !!referrerUserId,
    // Reduce stale time for more frequent updates
    staleTime: 1000, // 1 second
    refetchInterval: 3000, // Refetch every 3 seconds
  });
};
