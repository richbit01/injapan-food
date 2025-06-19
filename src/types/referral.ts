
export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
  is_active: boolean;
  total_uses: number;
  total_commission_earned: number;
}

export interface ReferralTransaction {
  id: string;
  referrer_id: string;
  referred_user_id?: string;
  referral_code: string;
  order_id: string;
  commission_amount: number;
  order_total: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
}
