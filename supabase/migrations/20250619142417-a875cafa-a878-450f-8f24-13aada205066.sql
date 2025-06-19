
-- Enable realtime for referral tables
ALTER TABLE public.referral_codes REPLICA IDENTITY FULL;
ALTER TABLE public.referral_transactions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_transactions;
