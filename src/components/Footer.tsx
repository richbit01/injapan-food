
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img 
                  src="/lovable-uploads/022a8dd4-6c9e-4b02-82a8-703a2cbfb51a.png" 
                  alt="Injapan Food Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">Injapan Food</h3>
                <p className="text-sm text-gray-400">Makanan Indonesia di Jepang</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              {t('footer.description')}
            </p>
            <div className="text-sm text-gray-400">
              <p>📱 WhatsApp: +62 851-5545-2259</p>
              <p>📧 Email: info@injapanfood.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors duration-200">
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/how-to-buy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  {t('nav.howToBuy')}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white transition-colors duration-200">
                  {t('nav.cart')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.categories')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Makanan Ringan</li>
              <li>Bumbu Dapur</li>
              <li>Makanan Siap Saji</li>
              <li>Bahan Masak Beku</li>
              <li>Sayur Segar/Beku</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
