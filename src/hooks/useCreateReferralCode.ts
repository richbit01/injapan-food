
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ReferralCode } from '@/types/referral';

export const useCreateReferralCode = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Creating referral code for user:', user.id);

      // Generate truly unique referral code using crypto random values
      const generateUniqueCode = () => {
        const timestamp = Date.now().toString();
        const randomBytes = crypto.getRandomValues(new Uint8Array(8));
        const randomHex = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
        const userHash = user.id.replace(/-/g, '').substring(0, 8).toUpperCase();
        
        // Create a more complex unique code
        return `REF${userHash}${timestamp.slice(-6)}${randomHex.substring(0, 6).toUpperCase()}`;
      };

      // Check for uniqueness with retry mechanism
      let finalCode: string;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        finalCode = generateUniqueCode();
        console.log(`Attempting to create code: ${finalCode} (attempt ${attempts + 1})`);

        // Check if code already exists
        const { data: existingCode, error: checkError } = await supabase
          .from('referral_codes')
          .select('code')
          .eq('code', finalCode)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking code uniqueness:', checkError);
          throw checkError;
        }

        if (!existingCode) {
          // Code is unique, break the loop
          console.log(`Unique code found: ${finalCode}`);
          break;
        }

        console.log(`Code collision detected for: ${finalCode}, generating new one...`);
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique referral code after multiple attempts');
      }

      console.log('Creating referral code with final code:', finalCode!);

      const { data, error } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          code: finalCode!,
          is_active: true,
          total_uses: 0,
          total_commission_earned: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating referral code:', error);
        throw error;
      }

      console.log('Referral code created successfully:', data);
      return data as ReferralCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
    },
  });
};
