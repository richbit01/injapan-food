
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProducts } from '@/hooks/useProducts';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/productService';

const Index = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const featuredProducts = products.slice(0, 6);

  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Rasa Indonesia 🇮🇩<br />
              <span className="text-secondary">di Tanah Sakura 🌸</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Temukan cita rasa rumah dengan koleksi makanan khas Indonesia terlengkap untuk Anda yang berada di Jepang
            </p>
            <Link
              to="/products"
              className="inline-block bg-white text-primary font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              🛒 Belanja Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Kategori Produk</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="bg-gray-50 hover:bg-primary hover:text-white p-6 rounded-lg text-center transition-all duration-200 transform hover:scale-105"
              >
                <div className="text-2xl mb-2">
                  {['🍿', '🌶️', '🍜', '🧊', '🥬', '🍃'][index % 6]}
                </div>
                <h3 className="font-medium text-sm">{category}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Produk Populer</h2>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Belum ada produk tersedia</p>
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="btn-primary inline-block"
            >
              Lihat Semua Produk
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Mengapa Pilih Injapan Food?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-3">Pengiriman Cepat</h3>
              <p className="text-gray-600">Pengiriman ke seluruh Jepang dengan packaging aman dan terjamin</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-3">Kualitas Terjamin</h3>
              <p className="text-gray-600">Semua produk adalah authentic Indonesia dengan kualitas terbaik</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-3">Pelayanan 24/7</h3>
              <p className="text-gray-600">Customer service siap membantu Anda kapan saja via WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Siap Merasakan Kelezatan Indonesia?</h2>
          <p className="text-xl mb-8">Jangan biarkan rindu kampung halaman mengganggu. Pesan sekarang!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="btn-secondary inline-block"
            >
              🛍️ Mulai Belanja
            </Link>
            <Link
              to="/how-to-buy"
              className="bg-white text-accent hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              📖 Cara Membeli
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
