
-- Create table for referral codes
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_uses INTEGER NOT NULL DEFAULT 0,
  total_commission_earned NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Create table for referral transactions
CREATE TABLE public.referral_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  order_id TEXT NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  order_total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for referral_codes
CREATE POLICY "Users can view their own referral codes" 
  ON public.referral_codes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes" 
  ON public.referral_codes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes" 
  ON public.referral_codes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active referral codes for validation" 
  ON public.referral_codes 
  FOR SELECT 
  USING (is_active = true);

-- Create policies for referral_transactions
CREATE POLICY "Users can view their own referral transactions" 
  ON public.referral_transactions 
  FOR SELECT 
  USING (auth.uid() = referrer_id);

CREATE POLICY "System can create referral transactions" 
  ON public.referral_transactions 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referral_codes_active ON public.referral_codes(is_active);
CREATE INDEX idx_referral_transactions_referrer ON public.referral_transactions(referrer_id);
CREATE INDEX idx_referral_transactions_order ON public.referral_transactions(order_id);
