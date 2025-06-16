
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLog } from '@/types';

export const useAdminLogs = () => {
  return useQuery({
    queryKey: ['admin-logs'],
    queryFn: async (): Promise<AdminLog[]> => {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching admin logs:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useLogAdminAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logData: {
      action: string;
      target_type: string;
      target_id?: string;
      details?: any;
    }) => {
      const { error } = await supabase
        .from('admin_logs')
        .insert([{
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          ...logData
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
  });
};
