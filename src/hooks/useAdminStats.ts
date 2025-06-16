
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, Product, ProductVariant } from '@/types';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Get products data
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products for stats:', productsError);
        throw productsError;
      }

      // Get orders count
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders_tracking')
        .select('*', { count: 'exact', head: true });

      if (ordersError) {
        console.error('Error fetching orders count:', ordersError);
      }

      const productsList = (products || []).map(p => ({
        ...p,
        status: p.status as 'active' | 'inactive' | 'out_of_stock',
        variants: Array.isArray(p.variants) 
          ? (p.variants as unknown as ProductVariant[])
          : []
      })) as Product[];
      
      const totalProducts = productsList.length;
      const activeProducts = productsList.filter(p => p.status === 'active').length;
      const outOfStockProducts = productsList.filter(p => p.stock === 0 || p.status === 'out_of_stock').length;
      const lowStockProducts = productsList
        .filter(p => p.stock > 0 && p.stock <= 10 && p.status === 'active')
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);
      const criticalStockProducts = productsList
        .filter(p => p.stock > 0 && p.stock < 5 && p.status === 'active')
        .sort((a, b) => a.stock - b.stock);

      return {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        lowStockProducts,
        totalOrders: ordersCount || 0,
        criticalStockProducts
      };
    },
  });
};
