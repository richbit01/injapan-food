
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

      // Generate truly unique referral code using multiple random elements
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const randomStr1 = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 chars
      const randomStr2 = Math.random().toString(36).substring(2, 4).toUpperCase(); // 2 chars
      const userIdPart = user.id.replace(/-/g, '').substring(0, 4).toUpperCase(); // First 4 chars of user ID
      
      // Create a more complex and unique code
      const baseCode = `REF${userIdPart}${randomStr1}${timestamp}${randomStr2}`;
      
      console.log('Generated base referral code:', baseCode);

      // Check if code already exists and regenerate if needed
      let finalCode = baseCode;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const { data: existingCode } = await supabase
          .from('referral_codes')
          .select('code')
          .eq('code', finalCode)
          .single();

        if (!existingCode) {
          // Code is unique, break the loop
          break;
        }

        // Generate completely new code if collision detected
        const newTimestamp = Date.now().toString().slice(-6);
        const newRandomStr1 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const newRandomStr2 = Math.random().toString(36).substring(2, 4).toUpperCase();
        const newUserIdPart = user.id.replace(/-/g, '').substring(Math.floor(Math.random() * 10), 4).toUpperCase();
        
        finalCode = `REF${newUserIdPart}${newRandomStr1}${newTimestamp}${newRandomStr2}`;
        attempts++;
        console.log(`Code collision detected, trying new code: ${finalCode} (attempt ${attempts})`);
      }

      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique referral code after multiple attempts');
      }

      console.log('Final unique referral code:', finalCode);

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
