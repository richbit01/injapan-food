
import { useState, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCartAnimation } from '@/hooks/useCartAnimation';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FlyingProductAnimation from '@/components/FlyingProductAnimation';
import { Product } from '@/types';

const Products = () => {
  const { data: products = [], isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const {
    animatingProduct,
    startPosition,
    targetPosition,
    isAnimating,
    shouldAnimateCart,
    triggerAnimation,
    resetAnimation
  } = useCartAnimation();

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product, position: { x: number; y: number }) => {
    // Get cart icon position (approximate)
    const cartPosition = {
      x: window.innerWidth - 100,
      y: 80
    };
    
    triggerAnimation(product, position, cartPosition);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header shouldAnimateCart={shouldAnimateCart} />
      
      {/* Flying Product Animation */}
      <FlyingProductAnimation
        product={animatingProduct}
        startPosition={startPosition}
        targetPosition={targetPosition}
        isAnimating={isAnimating}
        onComplete={resetAnimation}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Katalog Produk</h1>
          <p className="text-xl text-gray-600">Temukan makanan Indonesia favorit Anda</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h2>
            <p className="text-gray-600">Coba gunakan kata kunci yang berbeda atau pilih kategori lain</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
