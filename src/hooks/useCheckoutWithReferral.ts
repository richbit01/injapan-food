
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
      console.log('Processing checkout with referral:', checkoutData);

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

      console.log('Order created:', order);

      // If there's a referral code, create the referral transaction
      if (checkoutData.referralCode && order) {
        try {
          const commissionAmount = calculateCommission(checkoutData.totalPrice);
          
          console.log('Creating referral transaction:', {
            referralCode: checkoutData.referralCode,
            orderId: order.id,
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            referredUserId: user?.id
          });

          await createReferralTransaction.mutateAsync({
            referralCode: checkoutData.referralCode,
            orderId: order.id,
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            referredUserId: user?.id
          });

          console.log('Referral transaction created successfully');
        } catch (referralError) {
          console.error('Error creating referral transaction:', referralError);
          // Don't fail the order if referral fails, just log it
        }
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
    },
  });
};
