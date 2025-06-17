
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AppSetting {
  id: string;
  value: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface SettingsHistory {
  id: string;
  setting_id: string;
  old_value: any;
  new_value: any;
  changed_by: string;
  changed_at: string;
  notes?: string;
}

interface ReferralCommissionValue {
  rate: number;
}

export const useAppSettings = () => {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async (): Promise<AppSetting[]> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('id');

      if (error) {
        console.error('Error fetching app settings:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useReferralCommissionRate = () => {
  return useQuery({
    queryKey: ['referral-commission-rate'],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('id', 'referral_commission_rate')
        .single();

      if (error) {
        console.error('Error fetching referral commission rate:', error);
        throw error;
      }

      // Type guard to safely access the rate property
      const value = data?.value as ReferralCommissionValue;
      return value?.rate || 3;
    },
  });
};

export const useUpdateAppSetting = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      settingId,
      newValue,
      notes
    }: {
      settingId: string;
      newValue: any;
      notes?: string;
    }) => {
      // First get the old value for history
      const { data: oldSetting } = await supabase
        .from('app_settings')
        .select('value')
        .eq('id', settingId)
        .single();

      // Update the setting
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({ value: newValue })
        .eq('id', settingId);

      if (updateError) {
        console.error('Error updating setting:', updateError);
        throw updateError;
      }

      // Add to history
      const { error: historyError } = await supabase
        .from('settings_history')
        .insert({
          setting_id: settingId,
          old_value: oldSetting?.value || null,
          new_value: newValue,
          changed_by: user?.id,
          notes: notes
        });

      if (historyError) {
        console.error('Error adding to history:', historyError);
        // Don't throw here as the main update succeeded
      }

      return { settingId, newValue };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      queryClient.invalidateQueries({ queryKey: ['referral-commission-rate'] });
      queryClient.invalidateQueries({ queryKey: ['settings-history'] });
    },
  });
};

export const useSettingsHistory = (settingId?: string) => {
  return useQuery({
    queryKey: ['settings-history', settingId],
    queryFn: async (): Promise<SettingsHistory[]> => {
      let query = supabase
        .from('settings_history')
        .select('*')
        .order('changed_at', { ascending: false });

      if (settingId) {
        query = query.eq('setting_id', settingId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching settings history:', error);
        throw error;
      }

      return data || [];
    },
  });
};
