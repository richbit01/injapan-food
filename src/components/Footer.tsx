
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">IJ</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Injapan Food</h3>
                <p className="text-sm text-gray-400">Makanan Indonesia di Jepang</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Toko online terpercaya untuk makanan khas Indonesia berkualitas tinggi, 
              khusus melayani komunitas Indonesia di Jepang.
            </p>
            <div className="text-sm text-gray-400">
              <p>📱 WhatsApp: +62 851-5545-2259</p>
              <p>📧 Email: info@injapanfood.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Menu Utama</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Produk
                </Link>
              </li>
              <li>
                <Link to="/how-to-buy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Cara Membeli
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Keranjang
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Kategori</h4>
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
          <p>&copy; 2024 Injapan Food. All rights reserved.</p>
          <p className="text-sm mt-2">
            Dibuat dengan ❤️ untuk komunitas Indonesia di Jepang
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
