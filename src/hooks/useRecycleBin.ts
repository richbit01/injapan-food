
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RecycleBinItem } from '@/types';

export const useRecycleBin = () => {
  return useQuery({
    queryKey: ['recycle-bin'],
    queryFn: async (): Promise<RecycleBinItem[]> => {
      const { data, error } = await supabase
        .from('recycle_bin')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (error) {
        console.error('Error fetching recycle bin:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useMoveToRecycleBin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      table: string;
      itemId: string;
      itemData: any;
    }) => {
      const { error } = await supabase
        .from('recycle_bin')
        .insert([{
          original_table: data.table,
          original_id: data.itemId,
          data: data.itemData,
          deleted_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recycle-bin'] });
    },
  });
};

export const useRestoreFromRecycleBin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: RecycleBinItem) => {
      if (item.original_table === 'products') {
        const { error: restoreError } = await supabase
          .from('products')
          .insert([item.data]);

        if (restoreError) throw restoreError;
      }

      const { error: deleteError } = await supabase
        .from('recycle_bin')
        .delete()
        .eq('id', item.id);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recycle-bin'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
