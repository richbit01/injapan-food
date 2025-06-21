import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { sampleProducts } from '@/data/products';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setProducts(sampleProducts);
      setIsLoading(false);
    }, 500);
  }, []);

  return {
    data: products,
    isLoading,
    isError,
    error: null,
    refetch: () => {
      setIsLoading(true);
      setTimeout(() => {
        setProducts(sampleProducts);
        setIsLoading(false);
      }, 500);
    }
  };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    // Simulate loading
    setTimeout(() => {
      const foundProduct = sampleProducts.find(p => p.id === id);
      setProduct(foundProduct || null);
      setIsLoading(false);
    }, 300);
  }, [id]);

  return {
    data: product,
    isLoading,
    isError: false,
    error: null
  };
};