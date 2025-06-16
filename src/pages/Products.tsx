
import { useState, useRef } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCartAnimation } from '@/hooks/useCartAnimation';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FlyingProductAnimation from '@/components/FlyingProductAnimation';
import { Product } from '@/types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <SelectItem value="all" className="hover:bg-gray-100 cursor-pointer">
                  Semua Kategori
                </SelectItem>
                {categories.map(category => (
                  <SelectItem 
                    key={category} 
                    value={category}
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Overview */}
        {selectedCategory !== 'all' && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md border-l-4 border-primary">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Berdasarkan Kategori: {selectedCategory}</h2>
            <p className="text-gray-600">
              Menampilkan {filteredProducts.length} produk dalam kategori "{selectedCategory}"
            </p>
          </div>
        )}

        {/* Products Grid - Updated responsive layout */}
        {filteredProducts.length > 0 ? (
          <div>
            {selectedCategory !== 'all' && (
              <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Produk Berdasarkan Kategori
              </h3>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6 px-4">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h2>
            <p className="text-gray-600">
              {selectedCategory !== 'all' 
                ? `Tidak ada produk dalam kategori "${selectedCategory}" yang sesuai dengan pencarian Anda`
                : 'Coba gunakan kata kunci yang berbeda atau pilih kategori lain'
              }
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-4 btn-primary"
              >
                Lihat Semua Kategori
              </button>
            )}
          </div>
        )}

        {/* Categories Overview */}
        {selectedCategory === 'all' && searchTerm === '' && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Jelajahi Berdasarkan Kategori</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(category => {
                const categoryProducts = products.filter(p => p.category === category);
                const categoryImage = categoryProducts[0]?.image_url || '/placeholder.svg';
                
                return (
                  <div
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
                  >
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={categoryImage}
                        alt={category}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {category}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {categoryProducts.length} produk tersedia
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
