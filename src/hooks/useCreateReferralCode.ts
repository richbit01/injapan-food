
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

      // Generate truly unique referral code with better randomization
      const generateUniqueCode = () => {
        // Use multiple sources of randomness
        const timestamp = Date.now();
        const randomBytes1 = crypto.getRandomValues(new Uint8Array(4));
        const randomBytes2 = crypto.getRandomValues(new Uint8Array(4));
        const performanceNow = Math.floor(performance.now() * 1000);
        
        // Create unique hash from user ID with different positions
        const userIdClean = user.id.replace(/-/g, '');
        const userHash1 = userIdClean.substring(0, 4).toUpperCase();
        const userHash2 = userIdClean.substring(8, 12).toUpperCase();
        const userHash3 = userIdClean.substring(16, 20).toUpperCase();
        
        // Convert random bytes to hex
        const randomHex1 = Array.from(randomBytes1, byte => 
          byte.toString(16).padStart(2, '0')
        ).join('').toUpperCase();
        
        const randomHex2 = Array.from(randomBytes2, byte => 
          byte.toString(16).padStart(2, '0')
        ).join('').toUpperCase();
        
        // Create multiple variants and pick one randomly
        const variants = [
          `REF${userHash1}${timestamp.toString().slice(-4)}${randomHex1}`,
          `REF${userHash2}${performanceNow.toString().slice(-4)}${randomHex2}`,
          `REF${userHash3}${randomHex1.substring(0, 4)}${timestamp.toString().slice(-4)}`,
          `REF${randomHex1.substring(0, 4)}${userHash1}${randomHex2.substring(0, 4)}`,
          `REF${userHash2}${randomHex2}${timestamp.toString().slice(-6, -2)}`
        ];
        
        // Pick random variant
        const randomIndex = Math.floor(Math.random() * variants.length);
        return variants[randomIndex];
      };

      // Check for uniqueness with retry mechanism
      let finalCode: string;
      let attempts = 0;
      const maxAttempts = 15; // Increased attempts

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
        
        // Add small delay between attempts to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
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
