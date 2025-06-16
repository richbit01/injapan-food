
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  ShoppingCart, 
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/admin',
      exact: true
    },
    {
      icon: Package,
      label: 'Semua Produk',
      path: '/admin/products'
    },
    {
      icon: Plus,
      label: 'Tambah Produk',
      path: '/admin/products/new'
    },
    {
      icon: ShoppingCart,
      label: 'Pesanan',
      path: '/admin/orders'
    },
    {
      icon: Settings,
      label: 'Pengaturan',
      path: '/admin/settings'
    }
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-red-600 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-red-500">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-red-200 text-sm">Injapan Food</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'bg-red-700 text-white'
                      : 'text-red-100 hover:bg-red-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-red-500">
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start text-red-100 hover:bg-red-700 hover:text-white"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
