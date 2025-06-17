
-- Create function to increment referral statistics
CREATE OR REPLACE FUNCTION increment_referral_stats(
  referral_code TEXT,
  commission_amount NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.referral_codes
  SET 
    total_uses = total_uses + 1,
    total_commission_earned = total_commission_earned + commission_amount
  WHERE code = referral_code AND is_active = true;
END;
$$;
