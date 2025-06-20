import { Link } from 'react-router-dom';
import { Instagram, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Footer = () => {
  const { t } = useLanguage();

  const socialMediaLinks = [
    {
      name: 'WhatsApp',
      url: 'https://wa.me/6285155452259',
      icon: MessageCircle,
      color: 'hover:text-green-400'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/injapanfood',
      icon: Instagram,
      color: 'hover:text-pink-400'
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@injapanfood',
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.16 20.5a6.34 6.34 0 0 0 10.86-4.43V7.83a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.26z"/>
        </svg>
      ),
      color: 'hover:text-red-400'
    }
  ];

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
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Menyediakan produk makanan Indonesia berkualitas tinggi untuk komunitas Indonesia di Jepang. 
              Nikmati cita rasa kampung halaman dengan pengiriman ke seluruh Jepang.
            </p>
            
            {/* Social Media Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">Ikuti Kami</h4>
              <div className="flex space-x-4">
                {socialMediaLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 bg-gray-800 rounded-full text-gray-300 transition-all duration-200 transform hover:scale-110 ${social.color}`}
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <IconComponent />
                    </a>
                  );
                })}
              </div>
            </div>

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
