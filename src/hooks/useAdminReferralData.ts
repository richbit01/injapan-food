
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  return useQuery({
    queryKey: ['admin-referrer-summary'],
    queryFn: async (): Promise<ReferrerSummary[]> => {
      console.log('Fetching referrer summary for admin');

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
        console.error('Error fetching referral codes:', codesError);
        throw codesError;
      }

      if (!referralCodes || referralCodes.length === 0) {
        return [];
      }

      // Get user details for each referrer
      const userIds = referralCodes.map(code => code.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError);
        throw profilesError;
      }

      // Get user emails from auth.users (we'll need to use a different approach since we can't query auth.users directly)
      // For now, we'll use the profile data and referral code as identifier
      const result: ReferrerSummary[] = referralCodes.map(code => {
        const profile = profiles?.find(p => p.id === code.user_id);
        return {
          user_id: code.user_id,
          referral_code: code.code,
          total_uses: code.total_uses,
          total_commission_earned: code.total_commission_earned,
          user_name: profile?.full_name || 'Unknown User',
          user_email: code.code // Using referral code as identifier for now
        };
      });

      console.log('Referrer summary data:', result);
      return result;
    },
  });
};

export const useAdminReferralDetails = (referrerUserId: string | null) => {
  return useQuery({
    queryKey: ['admin-referral-details', referrerUserId],
    queryFn: async (): Promise<ReferralDetail[]> => {
      if (!referrerUserId) return [];

      console.log('Fetching referral details for user:', referrerUserId);

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
        console.error('Error fetching referral details:', error);
        throw error;
      }

      if (!transactions || transactions.length === 0) {
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
          console.error('Error fetching referred user profiles:', profilesError);
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

      console.log('Referral details data:', result);
      return result;
    },
    enabled: !!referrerUserId,
  });
};
