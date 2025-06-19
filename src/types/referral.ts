
export interface ReferralCode {
  id: string;
  code: string;
  user_id: string;
  discount_percentage: number;
  max_uses: number;
  total_uses: number;
  total_commission_earned: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReferralTransaction {
  id: string;
  referral_code: string;
  referrer_id: string;
  order_id: string;
  commission_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  confirmed_by?: string;
}
