
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/UserMenu';
import CartIcon from '@/components/CartIcon';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  shouldAnimateCart?: boolean;
}

const Header = ({ shouldAnimateCart = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Beranda' },
    { path: '/products', label: 'Produk' },
    { path: '/how-to-buy', label: 'Cara Membeli' },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">IJ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Injapan Food</h1>
              <p className="text-xs text-gray-600">Makanan Indonesia di Jepang</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side - Cart, Auth, Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-primary transition-colors duration-200"
              aria-label="Shopping Cart"
            >
              <CartIcon onAnimationTrigger={shouldAnimateCart} />
            </Link>

            {/* Auth */}
            {user ? (
              <UserMenu />
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Masuk</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors duration-200"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`bg-current block transition-all duration-300 h-0.5 w-6 transform ${
                  isMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-0.5'
                }`} />
                <span className={`bg-current block transition-all duration-300 h-0.5 w-6 my-0.5 ${
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                }`} />
                <span className={`bg-current block transition-all duration-300 h-0.5 w-6 transform ${
                  isMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-0.5'
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'text-primary'
                      : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {!user && (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-primary font-medium"
                >
                  Masuk / Daftar
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
