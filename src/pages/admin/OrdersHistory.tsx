
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye } from 'lucide-react';
import { OrderTracking } from '@/types';
import { exportOrdersToCSV } from '@/utils/exportUtils';
import AdminLayout from '@/components/admin/AdminLayout';

const OrdersHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['orders-tracking'],
    queryFn: async (): Promise<OrderTracking[]> => {
      const { data, error } = await supabase
        .from('orders_tracking')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data || [];
    },
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    exportOrdersToCSV(filteredOrders);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan</h1>
            <p className="text-gray-600">Kelola dan pantau semua pesanan pelanggan</p>
          </div>
          <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Filter & Pencarian</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Cari berdasarkan nama, email, atau ID pesanan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pesanan ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{order.customer_name}</h3>
                      <p className="text-sm text-gray-600">ID: {order.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-600 mb-2">
                        ¥{order.total_amount.toLocaleString()}
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Items:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      {order.items.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded">
                          {item.name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.customer_email && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Email: {order.customer_email}</p>
                    </div>
                  )}

                  {order.customer_phone && (
                    <div className="mt-1">
                      <p className="text-sm text-gray-600">Telepon: {order.customer_phone}</p>
                    </div>
                  )}

                  {order.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Catatan: {order.notes}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tidak ada pesanan yang ditemukan dengan filter tersebut'
                    : 'Belum ada pesanan masuk'
                  }
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default OrdersHistory;
