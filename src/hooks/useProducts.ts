
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return (data || []).map(product => ({
        ...product,
        status: product.status as 'active' | 'inactive' | 'out_of_stock',
        variants: Array.isArray(product.variants) ? product.variants : []
      }));
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<Product | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        if (error.code === 'PGRST116') {
          return null; // Product not found
        }
        throw error;
      }

      return {
        ...data,
        status: data.status as 'active' | 'inactive' | 'out_of_stock',
        variants: Array.isArray(data.variants) ? data.variants : []
      };
    },
    enabled: !!id,
  });
};
