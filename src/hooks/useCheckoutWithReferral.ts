
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
      console.log('🛒 Processing checkout with referral:', {
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
        try {
          // Calculate commission
          const commissionAmount = calculateCommission(checkoutData.totalPrice);
          
          console.log('💰 Processing referral transaction:', {
            referralCode: checkoutData.referralCode.trim(),
            orderId: order.id,
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            referredUserId: user?.id
          });

          // Create referral transaction
          await createReferralTransaction.mutateAsync({
            referralCode: checkoutData.referralCode.trim(),
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
