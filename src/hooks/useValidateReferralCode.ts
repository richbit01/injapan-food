
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReferralCode } from '@/types/referral';

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
