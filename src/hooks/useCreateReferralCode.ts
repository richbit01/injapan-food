
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

      // Simple but effective code generation
      const generateSimpleCode = () => {
        // Use first 8 chars of user ID (without dashes) + timestamp
        const userHash = user.id.replace(/-/g, '').substring(0, 8).toUpperCase();
        const timestamp = Date.now().toString().slice(-6); // Last 6 digits
        const randomNum = Math.floor(Math.random() * 999).toString().padStart(3, '0');
        
        return `REF${userHash}${timestamp}${randomNum}`;
      };

      // Alternative generation method if first fails
      const generateAlternativeCode = () => {
        // Use middle part of user ID + different timestamp format
        const userIdClean = user.id.replace(/-/g, '');
        const userHash = userIdClean.substring(8, 16).toUpperCase();
        const timestamp = Date.now().toString(36).toUpperCase(); // Base36 encoding
        const randomHex = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
        
        return `REF${userHash}${timestamp}${randomHex}`.substring(0, 20); // Limit length
      };

      // Try simple generation first
      let finalCode = generateSimpleCode();
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        console.log(`Attempting to create code: ${finalCode} (attempt ${attempts + 1})`);

        // Check if code already exists
        const { data: existingCode, error: checkError } = await supabase
          .from('referral_codes')
          .select('code')
          .eq('code', finalCode)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking code uniqueness:', checkError);
          throw new Error('Failed to verify code uniqueness');
        }

        if (!existingCode) {
          // Code is unique, break the loop
          console.log(`Unique code found: ${finalCode}`);
          break;
        }

        console.log(`Code collision detected for: ${finalCode}, generating new one...`);
        attempts++;
        
        // Use alternative generation method for subsequent attempts
        if (attempts <= 2) {
          finalCode = generateSimpleCode();
        } else {
          finalCode = generateAlternativeCode();
        }
        
        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (attempts >= maxAttempts) {
        // Final fallback: use user ID hash + current timestamp
        const userHash = user.id.replace(/-/g, '').substring(0, 12).toUpperCase();
        const uniqueTimestamp = Date.now().toString();
        finalCode = `REF${userHash}${uniqueTimestamp}`.substring(0, 25);
        
        console.log('Using fallback code generation:', finalCode);
      }

      console.log('Creating referral code with final code:', finalCode);

      const { data, error } = await supabase
        .from('referral_codes')
        .insert({
          user_id: user.id,
          code: finalCode,
          is_active: true,
          total_uses: 0,
          total_commission_earned: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating referral code:', error);
        
        // Handle duplicate key error specifically
        if (error.code === '23505') {
          throw new Error('Terjadi konflik kode referral. Silakan coba lagi.');
        }
        
        throw new Error('Gagal membuat kode referral: ' + error.message);
      }

      console.log('Referral code created successfully:', data);
      return data as ReferralCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
    },
    onError: (error) => {
      console.error('Referral code creation failed:', error);
    }
  });
};
