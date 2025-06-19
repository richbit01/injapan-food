
-- Add columns to referral_transactions for admin confirmation tracking
ALTER TABLE public.referral_transactions 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.profiles(id);

-- Update existing pending transactions to have proper status
UPDATE public.referral_transactions 
SET status = 'pending' 
WHERE status = 'pending';

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_referral_transactions_status ON public.referral_transactions(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Add a function to confirm referral transaction and update stats
CREATE OR REPLACE FUNCTION public.confirm_referral_transaction(
  transaction_id UUID,
  admin_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_record RECORD;
BEGIN
  -- Get the transaction details
  SELECT * INTO transaction_record
  FROM public.referral_transactions
  WHERE id = transaction_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;
  
  -- Update the transaction status
  UPDATE public.referral_transactions
  SET 
    status = 'confirmed',
    confirmed_at = NOW(),
    confirmed_by = admin_id
  WHERE id = transaction_id;
  
  -- Update referral code statistics
  UPDATE public.referral_codes
  SET 
    total_uses = total_uses + 1,
    total_commission_earned = total_commission_earned + transaction_record.commission_amount
  WHERE code = transaction_record.referral_code AND is_active = true;
END;
$$;

-- Add a function to cancel referral transaction
CREATE OR REPLACE FUNCTION public.cancel_referral_transaction(
  transaction_id UUID,
  admin_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the transaction status to cancelled
  UPDATE public.referral_transactions
  SET 
    status = 'cancelled',
    confirmed_at = NOW(),
    confirmed_by = admin_id
  WHERE id = transaction_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found or already processed';
  END IF;
END;
$$;
