import { sampleProducts, categories } from '@/data/products';

export const getCategories = async (): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return categories;
};

export const getProductsByCategory = async (category: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return sampleProducts.filter(product => product.category === category);
};

export const searchProducts = async (searchTerm: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return sampleProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );
};