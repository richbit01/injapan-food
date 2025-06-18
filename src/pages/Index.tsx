
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProducts } from '@/hooks/useProducts';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/productService';
import { useLanguage } from '@/hooks/useLanguage';

const Index = () => {
  const { data: products = [], isLoading: productsLoading, isError: productsError } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
  const { t } = useLanguage();

  const featuredProducts = products.slice(0, 6);

  // Show error state if there's an error
  if (productsError || categoriesError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('common.error')}</h2>
          <p className="text-gray-600 mb-4">{t('common.loadingError')}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            {t('common.refresh')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading only if both are still loading
  if (productsLoading && categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('products.loading')}</p>
        </div>
        <Footer />
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
              {t('hero.title')}<br />
              <span className="text-secondary">{t('hero.subtitle')}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
            <Link
              to="/products"
              className="inline-block bg-white text-primary font-bold py-4 px-8 rounded-lg text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
            >
              {t('hero.shopNow')}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('categories.title')}</h2>
          {categoriesLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          ) : categories.length > 0 ? (
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">{t('products.noProducts')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('products.featured')}</h2>
          {productsLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-600">{t('products.loading')}</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('products.noProducts')}</h3>
              <p className="text-gray-600">{t('products.comingSoon')}</p>
            </div>
          )}
          {featuredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="btn-primary inline-block"
              >
                {t('products.viewAll')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t('whyChoose.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-3">{t('whyChoose.fastDelivery')}</h3>
              <p className="text-gray-600">{t('whyChoose.fastDeliveryDesc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-3">{t('whyChoose.qualityGuaranteed')}</h3>
              <p className="text-gray-600">{t('whyChoose.qualityGuaranteedDesc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-3">{t('whyChoose.support247')}</h3>
              <p className="text-gray-600">{t('whyChoose.support247Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">{t('cta.title')}</h2>
          <p className="text-xl mb-8">{t('cta.description')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="btn-secondary inline-block"
            >
              {t('cta.startShopping')}
            </Link>
            <Link
              to="/how-to-buy"
              className="bg-white text-accent hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              {t('cta.howToBuy')}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
