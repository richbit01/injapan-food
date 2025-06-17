
import { useReferralCommissionRate } from './useAppSettings';

export const useReferralCommission = () => {
  const { data: commissionRate = 3, isLoading } = useReferralCommissionRate();

  const calculateCommission = (totalAmount: number): number => {
    return totalAmount * (commissionRate / 100);
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
