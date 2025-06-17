
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Trash2,
  FileText,
  BarChart3,
  Upload,
  Download,
  Percent
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
      exact: true
    },
    {
      title: 'Kelola Produk',
      icon: Package,
      path: '/admin/products'
    },
    {
      title: 'Riwayat Pesanan',
      icon: ShoppingCart,
      path: '/admin/orders'
    },
    {
      title: 'Panel Referral',
      icon: Users,
      path: '/admin/referral-panel'
    },
    {
      title: 'Pengaturan Referral',
      icon: Percent,
      path: '/admin/referral-settings'
    },
    {
      title: 'Import/Export',
      icon: Upload,
      path: '/admin/import-export'
    },
    {
      title: 'Recycle Bin',
      icon: Trash2,
      path: '/admin/recycle-bin'
    },
    {
      title: 'Log Aktivitas',
      icon: FileText,
      path: '/admin/logs'
    },
    {
      title: 'Statistik',
      icon: BarChart3,
      path: '/admin/analytics'
    }
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${
      collapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img 
              src="/lovable-uploads/022a8dd4-6c9e-4b02-82a8-703a2cbfb51a.png" 
              alt="Injapan Food Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-gray-900">Injapan Food</h2>
              <p className="text-xs text-gray-600">Admin Panel</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-4 w-full flex justify-center p-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  active 
                    ? 'bg-red-100 text-red-700 border-r-2 border-red-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {!collapsed && <span className="font-medium">{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
