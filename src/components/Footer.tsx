
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src="/lovable-uploads/022a8dd4-6c9e-4b02-82a8-703a2cbfb51a.png" 
                  alt="Injapan Food Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold">Injapan Food</h3>
                <p className="text-xs md:text-sm text-gray-400">Makanan Indonesia di Jepang</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 text-sm md:text-base leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="text-sm text-gray-400 space-y-1">
              <p className="flex items-center">
                <span className="mr-2">📱</span>
                WhatsApp: +62 851-5545-2259
              </p>
              <p className="flex items-center">
                <span className="mr-2">📧</span>
                Email: info@injapanfood.com
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm md:text-base">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm md:text-base">
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/how-to-buy" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm md:text-base">
                  {t('nav.howToBuy')}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm md:text-base">
                  {t('nav.cart')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{t('footer.categories')}</h4>
            <ul className="space-y-2 text-gray-400 text-sm md:text-base">
              <li>Makanan Ringan</li>
              <li>Bumbu Dapur</li>
              <li>Makanan Siap Saji</li>
              <li>Bahan Masak Beku</li>
              <li>Sayur Segar/Beku</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400">
          <p className="text-sm md:text-base">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
