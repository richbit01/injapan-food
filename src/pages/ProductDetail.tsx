import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { formatPrice } from '@/utils/cart';
import { useCartAnimation } from '@/hooks/useCartAnimation';
import { ShoppingCart, Truck, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AddToCartButton from '@/components/AddToCartButton';
import FlyingProductAnimation from '@/components/FlyingProductAnimation';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const quantityRef = useRef<HTMLDivElement>(null);
  
  const { data: product, isLoading } = useProduct(id!);
  const { data: allProducts = [] } = useProducts();
  
  const {
    animatingProduct,
    startPosition,
    targetPosition,
    isAnimating,
    shouldAnimateCart,
    triggerAnimation,
    resetAnimation
  } = useCartAnimation();

  // Scroll to top when component mounts or product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = (position: { x: number; y: number }) => {
    if (product) {
      // Get cart icon position (approximate)
      const cartPosition = {
        x: window.innerWidth - 100, // Approximate cart position
        y: 80 // Header height
      };
      
      triggerAnimation(product, position, cartPosition);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header shouldAnimateCart={shouldAnimateCart} />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-bold mb-4">Produk Tidak Ditemukan</h1>
          <Link to="/products" className="btn-primary">
            Kembali ke Katalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

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
        {/* Breadcrumb */}
        <nav className="flex space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-primary">Beranda</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Produk</Link>
          <span>/</span>
          <span className="text-primary">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium mb-3">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="text-4xl font-bold text-primary mb-6">
                {formatPrice(product.price)}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Deskripsi Produk</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock Status */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Ketersediaan</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                product.stock > 10 
                  ? 'bg-green-100 text-green-800' 
                  : product.stock > 0 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {product.stock > 0 ? `Tersedia (${product.stock})` : 'Stok Habis'}
              </div>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div ref={quantityRef}>
                <h3 className="text-lg font-semibold mb-3">Jumlah</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-lg font-semibold">
                    Total: {formatPrice(product.price * quantity)}
                  </div>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            {product.stock > 0 ? (
              <button
                onClick={() => {
                  const rect = quantityRef.current?.getBoundingClientRect();
                  if (rect) {
                    handleAddToCart({
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2
                    });
                  }
                }}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-lg py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-3 group"
              >
                <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
                <span>Tambahkan ke Keranjang</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-400 text-white text-lg py-4 rounded-xl cursor-not-allowed flex items-center justify-center space-x-3"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Stok Habis</span>
              </button>
            )}

            {/* Product Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-gray-800 mb-1">Pengiriman Express</div>
                <div className="text-xs text-gray-600">Dikirim dengan layanan terpercaya</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-sm font-semibold text-gray-800 mb-1">Kualitas Premium</div>
                <div className="text-xs text-gray-600">Produk berkualitas tinggi terjamin</div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Produk Sejenis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="card-product p-4">
                  <Link to={`/products/${relatedProduct.id}`}>
                    <img
                      src={relatedProduct.image_url || '/placeholder.svg'}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                    <div className="text-xl font-bold text-primary">
                      {formatPrice(relatedProduct.price)}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
