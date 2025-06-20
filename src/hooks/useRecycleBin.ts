
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
      // First, move to recycle bin
      const { error: recycleBinError } = await supabase
        .from('recycle_bin')
        .insert([{
          original_table: data.table,
          original_id: data.itemId,
          data: data.itemData,
          deleted_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (recycleBinError) {
        console.error('Error moving to recycle bin:', recycleBinError);
        throw recycleBinError;
      }

      // Then, delete from original table
      if (data.table === 'products') {
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', data.itemId);

        if (deleteError) {
          console.error('Error deleting from products table:', deleteError);
          throw deleteError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recycle-bin'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useRestoreFromRecycleBin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: RecycleBinItem) => {
      if (item.original_table === 'products') {
        // Check if product with same ID already exists
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('id', item.original_id)
          .single();

        if (existingProduct) {
          // If product already exists, generate a new ID
          const productData = { ...item.data };
          delete productData.id; // Remove the ID so Supabase generates a new one
          
          const { error: restoreError } = await supabase
            .from('products')
            .insert([productData]);

          if (restoreError) throw restoreError;
        } else {
          // If product doesn't exist, restore with original ID
          const { error: restoreError } = await supabase
            .from('products')
            .insert([item.data]);

          if (restoreError) throw restoreError;
        }
      }

      // Remove from recycle bin
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
