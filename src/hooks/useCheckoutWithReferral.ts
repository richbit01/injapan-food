
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
      console.log('Processing checkout with referral:', {
        ...checkoutData,
        items: checkoutData.items.length + ' items',
        hasReferralCode: !!checkoutData.referralCode
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
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      console.log('Order created successfully:', order.id);

      // If there's a referral code, create the referral transaction
      if (checkoutData.referralCode && order) {
        try {
          const commissionAmount = calculateCommission(checkoutData.totalPrice);
          
          console.log('Processing referral transaction:', {
            referralCode: checkoutData.referralCode,
            orderId: order.id,
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            referredUserId: user?.id
          });

          const referralResult = await createReferralTransaction.mutateAsync({
            referralCode: checkoutData.referralCode,
            orderId: order.id,
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            referredUserId: user?.id
          });

          console.log('Referral transaction processed successfully:', referralResult);
        } catch (referralError) {
          console.error('Error processing referral transaction:', referralError);
          // Log the error but don't fail the order - this is important for user experience
          console.error('Referral processing failed but order was successful. Manual intervention may be needed.');
        }
      } else {
        console.log('No referral code provided, skipping referral processing');
      }

      return order;
    },
    onSuccess: (order) => {
      console.log('Checkout completed successfully for order:', order.id);
      // Invalidate all relevant queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });
    },
    onError: (error) => {
      console.error('Checkout failed:', error);
    }
  });
};
