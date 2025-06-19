
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReferralCode } from '@/types/referral';

export const useValidateReferralCode = () => {
  return useMutation({
    mutationFn: async (code: string): Promise<ReferralCode | null> => {
      console.log('🔍 Validating referral code:', code);

      if (!code || code.trim().length === 0) {
        console.log('ℹ️ Empty referral code provided');
        return null;
      }

      const cleanCode = code.trim().toUpperCase();

      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('❌ Error validating referral code:', error);
        throw new Error(`Validation failed: ${error.message}`);
      }

      if (data) {
        console.log('✅ Valid referral code found:', {
          code: data.code,
          ownerId: data.user_id,
          totalUses: data.total_uses
        });
      } else {
        console.log('❌ Invalid or inactive referral code:', cleanCode);
      }

      return data as ReferralCode || null;
    },
  });
};
