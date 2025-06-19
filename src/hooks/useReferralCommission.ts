
import { useReferralCommissionRate } from './useAppSettings';

export const useReferralCommission = () => {
  const { data: commissionRate = 3, isLoading } = useReferralCommissionRate();

  const calculateCommission = (totalAmount: number): number => {
    const commission = Math.round(totalAmount * (commissionRate / 100));
    console.log('💰 Commission calculation:', {
      totalAmount,
      commissionRate: `${commissionRate}%`,
      commission
    });
    return commission;
  };

  const formatCommission = (totalAmount: number): string => {
    const commission = calculateCommission(totalAmount);
    return `¥${commission.toLocaleString()}`;
  };

  return {
    commissionRate,
    isLoading,
    calculateCommission,
    formatCommission
  };
};
