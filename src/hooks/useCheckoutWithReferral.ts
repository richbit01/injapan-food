
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCreateReferralTransaction } from '@/hooks/useCreateReferralTransaction';
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
      console.log('🛒 Starting checkout process with detailed logging:', {
        totalPrice: checkoutData.totalPrice,
        referralCode: checkoutData.referralCode,
        userId: user?.id,
        itemsCount: checkoutData.items.length,
        customerInfo: checkoutData.customerInfo
      });

      // Create the order first
      const orderData = {
        user_id: user?.id || null,
        items: checkoutData.items,
        customer_info: checkoutData.customerInfo,
        total_price: checkoutData.totalPrice,
        status: 'pending'
      };

      console.log('📝 Creating order with data:', orderData);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('❌ Error creating order:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('✅ Order created successfully:', {
        orderId: order.id,
        orderData: order
      });

      // Process referral if code provided
      if (checkoutData.referralCode && checkoutData.referralCode.trim()) {
        const cleanCode = checkoutData.referralCode.trim().toUpperCase();
        
        try {
          console.log('🔍 Processing referral code with detailed steps:', cleanCode);
          
          // First validate the referral code exists and is active
          console.log('🔍 Step 1: Validating referral code in database...');
          const { data: referralCodeData, error: validationError } = await supabase
            .from('referral_codes')
            .select('*')
            .eq('code', cleanCode)
            .eq('is_active', true)
            .single();

          if (validationError || !referralCodeData) {
            console.warn('⚠️ Invalid referral code:', {
              code: cleanCode,
              error: validationError,
              data: referralCodeData
            });
            // Don't throw error, just log warning - order should still proceed
            return order;
          }

          console.log('✅ Step 2: Valid referral code found:', {
            code: referralCodeData.code,
            ownerId: referralCodeData.user_id,
            currentUses: referralCodeData.total_uses,
            currentCommission: referralCodeData.total_commission_earned
          });

          // Prevent self-referral
          if (user?.id && referralCodeData.user_id === user.id) {
            console.warn('⚠️ Step 3: Self-referral attempt detected, skipping referral processing');
            return order;
          }

          console.log('✅ Step 3: Self-referral check passed');

          // Calculate commission
          const commissionAmount = calculateCommission(checkoutData.totalPrice);
          
          console.log('💰 Step 4: Commission calculation:', {
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            commissionRate: '3%'
          });

          console.log('📝 Step 5: Creating referral transaction with data:', {
            referralCode: cleanCode,
            orderId: order.id,
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            referrerUserId: referralCodeData.user_id,
            referredUserId: user?.id || 'guest'
          });

          // Create referral transaction using the mutation
          const transactionResult = await createReferralTransaction.mutateAsync({
            referralCode: cleanCode,
            orderId: order.id,
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            referredUserId: user?.id
          });

          console.log('✅ Step 6: Referral transaction created successfully:', {
            transactionId: transactionResult.id,
            transactionData: transactionResult
          });

          // Force refresh of referral data
          console.log('🔄 Step 7: Invalidating queries to refresh UI...');
          queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
          queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
          queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
          queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });

          console.log('🎉 Referral processing completed successfully!');

        } catch (referralError: any) {
          console.error('❌ Error processing referral transaction:', {
            error: referralError,
            message: referralError.message,
            stack: referralError.stack
          });
          // Don't fail the order, just log the referral error
          console.warn('⚠️ Order successful but referral processing failed');
        }
      } else {
        console.log('ℹ️ No referral code provided, skipping referral processing');
      }

      console.log('✅ Final step: Order checkout completed successfully for order:', order.id);
      return order;
    },
    onSuccess: (order) => {
      console.log('🎉 Checkout mutation completed successfully for order:', order.id);
      // Invalidate all relevant queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });
    },
    onError: (error) => {
      console.error('💥 Checkout mutation failed:', error);
    }
  });
};
