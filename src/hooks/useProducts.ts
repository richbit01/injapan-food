
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductVariant } from '@/types';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      console.log('Fetching products...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Raw products data:', data);

      const products = (data || []).map(product => ({
        ...product,
        status: product.status as 'active' | 'inactive' | 'out_of_stock',
        variants: Array.isArray(product.variants) 
          ? (product.variants as unknown as ProductVariant[])
          : []
      }));

      console.log('Processed products:', products);
      return products;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<Product | null> => {
      if (!id) {
        console.log('No ID provided for useProduct');
        return null;
      }
      
      console.log('Fetching product with ID:', id);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        if (error.code === 'PGRST116') {
          console.log('Product not found for ID:', id);
          return null; // Product not found
        }
        throw error;
      }

      console.log('Found product:', data);

      return {
        ...data,
        status: data.status as 'active' | 'inactive' | 'out_of_stock',
        variants: Array.isArray(data.variants) 
          ? (data.variants as unknown as ProductVariant[])
          : []
      };
    },
    enabled: !!id,
  });
};
