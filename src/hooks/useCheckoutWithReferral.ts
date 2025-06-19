
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
      console.log('🛒 [REALTIME] Starting checkout process:', {
        totalPrice: checkoutData.totalPrice,
        referralCode: checkoutData.referralCode,
        userId: user?.id,
        itemsCount: checkoutData.items.length,
        timestamp: new Date().toISOString()
      });

      // Step 1: Create order immediately in database
      const orderData = {
        user_id: user?.id || null,
        items: checkoutData.items,
        customer_info: checkoutData.customerInfo,
        total_price: checkoutData.totalPrice,
        status: 'pending'
      };

      console.log('📝 [REALTIME] Creating order in database...');
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('❌ [REALTIME] Order creation failed:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('✅ [REALTIME] Order saved to database:', {
        orderId: order.id,
        timestamp: new Date().toISOString()
      });

      // Step 2: Process referral immediately if code provided
      if (checkoutData.referralCode && checkoutData.referralCode.trim()) {
        const cleanCode = checkoutData.referralCode.trim().toUpperCase();
        
        try {
          console.log('💰 [REALTIME] Processing referral commission for code:', cleanCode);
          
          // Validate referral code first
          const { data: referralCodeData, error: validationError } = await supabase
            .from('referral_codes')
            .select('*')
            .eq('code', cleanCode)
            .eq('is_active', true)
            .single();

          if (validationError || !referralCodeData) {
            console.warn('⚠️ [REALTIME] Invalid referral code, skipping commission:', {
              code: cleanCode,
              error: validationError
            });
            return order;
          }

          // Prevent self-referral
          if (user?.id && referralCodeData.user_id === user.id) {
            console.warn('⚠️ [REALTIME] Self-referral detected, skipping commission');
            return order;
          }

          // Calculate commission based on current settings
          const commissionAmount = calculateCommission(checkoutData.totalPrice);
          
          console.log('💰 [REALTIME] Commission calculated:', {
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            referrerUserId: referralCodeData.user_id,
            referredUserId: user?.id || 'guest'
          });

          // Create referral transaction immediately
          console.log('📝 [REALTIME] Saving referral transaction to database...');
          const transactionResult = await createReferralTransaction.mutateAsync({
            referralCode: cleanCode,
            orderId: order.id,
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            referredUserId: user?.id
          });

          console.log('✅ [REALTIME] Referral transaction saved:', {
            transactionId: transactionResult.id,
            timestamp: new Date().toISOString()
          });

          // Force immediate UI refresh
          queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
          queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
          queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
          queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });

          console.log('🔄 [REALTIME] All queries invalidated for immediate UI update');

        } catch (referralError: any) {
          console.error('❌ [REALTIME] Referral processing failed:', {
            error: referralError,
            message: referralError.message,
            orderId: order.id
          });
          // Don't fail the order if referral processing fails
          console.warn('⚠️ [REALTIME] Order successful but referral processing failed');
        }
      } else {
        console.log('ℹ️ [REALTIME] No referral code provided, skipping commission processing');
      }

      console.log('✅ [REALTIME] Checkout completed successfully:', {
        orderId: order.id,
        timestamp: new Date().toISOString()
      });
      
      return order;
    },
    onSuccess: (order) => {
      console.log('🎉 [REALTIME] Checkout mutation successful:', {
        orderId: order.id,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate all relevant queries for immediate UI updates
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });
      
      console.log('🔄 [REALTIME] All data refreshed for realtime updates');
    },
    onError: (error) => {
      console.error('💥 [REALTIME] Checkout failed completely:', {
        error,
        timestamp: new Date().toISOString()
      });
    }
  });
};
