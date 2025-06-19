
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCreateReferralTransaction } from '@/hooks/useReferralCodes';
import { useReferralCommission } from '@/hooks/useReferralCommission';

interface CheckoutData {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    variant?: string;
  }>;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    prefecture: string;
    zipCode: string;
  };
  referralCode?: string;
  totalPrice: number;
}

export const useCheckoutWithReferral = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const createReferralTransaction = useCreateReferralTransaction();
  const { calculateCommission } = useReferralCommission();

  return useMutation({
    mutationFn: async (checkoutData: CheckoutData) => {
      console.log('🛒 Starting checkout process:', {
        totalPrice: checkoutData.totalPrice,
        referralCode: checkoutData.referralCode,
        userId: user?.id,
        itemsCount: checkoutData.items.length
      });

      // Create the order first
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          items: checkoutData.items,
          customer_info: checkoutData.customerInfo,
          total_price: checkoutData.totalPrice,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Error creating order:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('✅ Order created successfully:', order.id);

      // Process referral if code provided
      if (checkoutData.referralCode && checkoutData.referralCode.trim()) {
        const cleanCode = checkoutData.referralCode.trim().toUpperCase();
        
        try {
          console.log('🔍 Processing referral code:', cleanCode);
          
          // First validate the referral code exists and is active
          const { data: referralCodeData, error: validationError } = await supabase
            .from('referral_codes')
            .select('*')
            .eq('code', cleanCode)
            .eq('is_active', true)
            .single();

          if (validationError || !referralCodeData) {
            console.warn('⚠️ Invalid referral code:', cleanCode, validationError);
            // Don't throw error, just log warning - order should still proceed
            return order;
          }

          console.log('✅ Valid referral code found:', {
            code: referralCodeData.code,
            ownerId: referralCodeData.user_id
          });

          // Prevent self-referral
          if (user?.id && referralCodeData.user_id === user.id) {
            console.warn('⚠️ Self-referral attempt detected, skipping');
            return order;
          }

          // Calculate commission
          const commissionAmount = calculateCommission(checkoutData.totalPrice);
          
          console.log('💰 Creating referral transaction:', {
            referralCode: cleanCode,
            orderId: order.id,
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            referrerUserId: referralCodeData.user_id,
            referredUserId: user?.id
          });

          // Create referral transaction
          await createReferralTransaction.mutateAsync({
            referralCode: cleanCode,
            orderId: order.id,
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            referredUserId: user?.id
          });

          console.log('✅ Referral transaction processed successfully');

        } catch (referralError: any) {
          console.error('❌ Error processing referral transaction:', referralError);
          // Don't fail the order, just log the referral error
          console.warn('⚠️ Order successful but referral processing failed:', referralError.message);
        }
      } else {
        console.log('ℹ️ No referral code provided, skipping referral processing');
      }

      return order;
    },
    onSuccess: (order) => {
      console.log('🎉 Checkout completed successfully for order:', order.id);
      // Invalidate all relevant queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });
    },
    onError: (error) => {
      console.error('💥 Checkout failed:', error);
    }
  });
};
