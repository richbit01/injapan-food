
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  const { calculateCommission } = useReferralCommission();

  return useMutation({
    mutationFn: async (checkoutData: CheckoutData) => {
      console.log('🛒 [CHECKOUT] Starting checkout process:', {
        totalPrice: checkoutData.totalPrice,
        referralCode: checkoutData.referralCode,
        userId: user?.id,
        itemsCount: checkoutData.items.length,
        timestamp: new Date().toISOString()
      });

      // Step 1: Create order with pending status
      const orderData = {
        user_id: user?.id || null,
        items: checkoutData.items,
        customer_info: checkoutData.customerInfo,
        total_price: checkoutData.totalPrice,
        status: 'pending' // Always pending until admin confirms
      };

      console.log('📝 [CHECKOUT] Creating order in database...');
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('❌ [CHECKOUT] Order creation failed:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      console.log('✅ [CHECKOUT] Order saved to database:', {
        orderId: order.id,
        status: order.status,
        timestamp: new Date().toISOString()
      });

      // Step 2: Create pending referral transaction if code provided
      if (checkoutData.referralCode && checkoutData.referralCode.trim()) {
        const cleanCode = checkoutData.referralCode.trim().toUpperCase();
        
        try {
          console.log('💰 [CHECKOUT] Processing referral code for pending approval:', cleanCode);
          
          // Validate referral code first
          const { data: referralCodeData, error: validationError } = await supabase
            .from('referral_codes')
            .select('*')
            .eq('code', cleanCode)
            .eq('is_active', true)
            .single();

          if (validationError || !referralCodeData) {
            console.warn('⚠️ [CHECKOUT] Invalid referral code, skipping:', {
              code: cleanCode,
              error: validationError
            });
            return order;
          }

          // Prevent self-referral
          if (user?.id && referralCodeData.user_id === user.id) {
            console.warn('⚠️ [CHECKOUT] Self-referral detected, skipping');
            return order;
          }

          // Calculate commission but DON'T update stats yet
          const commissionAmount = calculateCommission(checkoutData.totalPrice);
          
          console.log('💰 [CHECKOUT] Commission calculated for pending approval:', {
            orderTotal: checkoutData.totalPrice,
            commissionAmount,
            referrerUserId: referralCodeData.user_id,
            referredUserId: user?.id || 'guest'
          });

          // Create PENDING referral transaction (no stats update)
          const transactionData = {
            referrer_id: referralCodeData.user_id,
            referred_user_id: user?.id || null,
            referral_code: cleanCode,
            order_id: order.id,
            commission_amount: commissionAmount,
            order_total: checkoutData.totalPrice,
            status: 'pending' // Wait for admin confirmation
          };

          console.log('📝 [CHECKOUT] Creating pending referral transaction...');
          const { data: transaction, error: transactionError } = await supabase
            .from('referral_transactions')
            .insert(transactionData)
            .select()
            .single();

          if (transactionError) {
            console.error('❌ [CHECKOUT] Referral transaction creation failed:', {
              error: transactionError,
              data: transactionData
            });
            // Don't fail the order if referral processing fails
            console.warn('⚠️ [CHECKOUT] Order successful but referral processing failed');
          } else {
            console.log('✅ [CHECKOUT] Pending referral transaction created:', {
              transactionId: transaction.id,
              status: transaction.status,
              awaitingConfirmation: true,
              timestamp: new Date().toISOString()
            });
          }

        } catch (referralError: any) {
          console.error('❌ [CHECKOUT] Referral processing failed:', {
            error: referralError,
            message: referralError.message,
            orderId: order.id
          });
          // Don't fail the order if referral processing fails
          console.warn('⚠️ [CHECKOUT] Order successful but referral processing failed');
        }
      } else {
        console.log('ℹ️ [CHECKOUT] No referral code provided');
      }

      console.log('✅ [CHECKOUT] Checkout completed successfully:', {
        orderId: order.id,
        hasReferral: !!checkoutData.referralCode,
        awaitingAdminConfirmation: true,
        timestamp: new Date().toISOString()
      });
      
      return order;
    },
    onSuccess: (order) => {
      console.log('🎉 [CHECKOUT] Checkout mutation successful:', {
        orderId: order.id,
        status: order.status,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate queries for immediate UI updates
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['referral-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referrer-summary'] });
      queryClient.invalidateQueries({ queryKey: ['admin-referral-details'] });
      
      console.log('🔄 [CHECKOUT] All data refreshed for pending confirmation');
    },
    onError: (error) => {
      console.error('💥 [CHECKOUT] Checkout failed completely:', {
        error,
        timestamp: new Date().toISOString()
      });
    }
  });
};
