
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VariantOption {
  id: string;
  category: string;
  variant_name: string;
  options: string[];
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export const useVariantOptions = (category?: string) => {
  return useQuery({
    queryKey: ['variant-options', category],
    queryFn: async (): Promise<VariantOption[]> => {
      console.log('Fetching variant options for category:', category);
      
      let query = supabase
        .from('variant_options')
        .select('*')
        .order('variant_name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching variant options:', error);
        throw error;
      }

      console.log('Raw variant options data:', data);
      
      // Parse the JSON options properly
      const parsedData = (data || []).map(item => ({
        ...item,
        options: Array.isArray(item.options) 
          ? item.options as string[]
          : JSON.parse(item.options as string)
      }));

      console.log('Parsed variant options:', parsedData);
      return parsedData;
    },
    enabled: !!category, // Only fetch when category is provided
  });
};
