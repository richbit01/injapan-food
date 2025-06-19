
// Re-export all referral hooks from their individual files
export { useUserReferralCode } from './useUserReferralCode';
export { useCreateReferralCode } from './useCreateReferralCode';
export { useReferralTransactions } from './useReferralTransactions';
export { useValidateReferralCode } from './useValidateReferralCode';
export { useCreateReferralTransaction } from './useCreateReferralTransaction';

// Re-export types for backward compatibility
export type { ReferralCode, ReferralTransaction } from '@/types/referral';
