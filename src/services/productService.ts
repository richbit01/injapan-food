
import { supabase } from '@/integrations/supabase/client';

export const getCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .distinct();

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data?.map(item => item.category) || [];
};

export const getProductsByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }

  return data || [];
};

export const searchProducts = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching products:', error);
    throw error;
  }

  return data || [];
};
