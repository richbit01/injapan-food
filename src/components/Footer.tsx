
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src="/lovable-uploads/022a8dd4-6c9e-4b02-82a8-703a2cbfb51a.png" 
                  alt="Injapan Food Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Injapan Food</h3>
                <p className="text-sm text-gray-400">Makanan Indonesia di Jepang</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Menyediakan produk makanan Indonesia berkualitas tinggi untuk komunitas Indonesia di Jepang. 
              Nikmati cita rasa kampung halaman dengan pengiriman ke seluruh Jepang.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 hover:text-white transition-colors">
                <span className="mr-3 text-lg">📱</span>
                <span>WhatsApp: +62 851-5545-2259</span>
              </div>
              <div className="flex items-center text-gray-300 hover:text-white transition-colors">
                <span className="mr-3 text-lg">📧</span>
                <span>Email: info@injapanfood.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Menu Utama</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">🏠</span>
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">🛍️</span>
                  Produk
                </Link>
              </li>
              <li>
                <Link to="/how-to-buy" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">📋</span>
                  Cara Beli
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">🛒</span>
                  Keranjang
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-bold mb-6">Kategori Populer</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="hover:text-white transition-colors cursor-pointer">
                <span className="mr-2">🍿</span>
                Makanan Ringan
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span className="mr-2">🌶️</span>
                Bumbu Dapur
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span className="mr-2">🍜</span>
                Makanan Siap Saji
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span className="mr-2">🥬</span>
                Sayur & Bahan Segar
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Injapan Food. Semua hak dilindungi undang-undang.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Syarat & Ketentuan
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Bantuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
