
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, ShoppingCart, User, MapPin } from 'lucide-react';
import { usePendingOrders } from '@/hooks/usePendingOrders';
import { useConfirmOrder } from '@/hooks/useConfirmOrder';
import { useToast } from '@/hooks/use-toast';

const OrderConfirmation = () => {
  const { data: pendingOrders = [], isLoading } = usePendingOrders();
  const { confirmOrder, isConfirming } = useConfirmOrder();
  const { toast } = useToast();
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  const handleOrderAction = async (orderId: string, action: 'confirm' | 'cancel') => {
    try {
      setProcessingOrderId(orderId);
      
      await confirmOrder({ orderId, action });
      
      toast({
        title: action === 'confirm' ? 'Pesanan Dikonfirmasi' : 'Pesanan Dibatalkan',
        description: action === 'confirm' 
          ? 'Pesanan berhasil dikonfirmasi dan komisi referral telah diproses'
          : 'Pesanan dibatalkan dan komisi referral tidak diberikan',
      });
    } catch (error: any) {
      console.error(`❌ Failed to ${action} order:`, error);
      toast({
        title: 'Gagal Memproses Pesanan',
        description: error.message || `Terjadi kesalahan saat ${action === 'confirm' ? 'mengkonfirmasi' : 'membatalkan'} pesanan`,
        variant: 'destructive',
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Konfirmasi Pesanan</h2>
          <p className="text-gray-600">Kelola pesanan yang menunggu konfirmasi</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          <Clock className="w-4 h-4 mr-2" />
          {pendingOrders.length} Pending
        </Badge>
      </div>

      {pendingOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Pesanan Pending</h3>
            <p className="text-gray-500">Semua pesanan sudah dikonfirmasi atau dibatalkan</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5" />
                    <span>#{order.id.slice(0, 8)}</span>
                    {order.referralTransaction && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Referral: {order.referralTransaction.referral_code}
                      </Badge>
                    )}
                  </CardTitle>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{order.customer_info.fullName}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      📧 {order.customer_info.email || 'Tidak ada email'}
                    </div>
                    <div className="text-sm text-gray-600">
                      📱 {order.customer_info.phone}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Alamat Pengiriman</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.customer_info.address}, {order.customer_info.city}, {order.customer_info.zipCode}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-2">Items Pesanan:</h4>
                  <div className="space-y-1">
                    {order.items.slice(0, 3).map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{order.items.length - 3} item lainnya
                      </div>
                    )}
                  </div>
                </div>

                {/* Referral Info */}
                {order.referralTransaction && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">💰 Komisi Referral</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-600">Kode Referral:</span>
                        <div className="font-mono font-medium">{order.referralTransaction.referral_code}</div>
                      </div>
                      <div>
                        <span className="text-green-600">Komisi:</span>
                        <div className="font-medium">{formatPrice(order.referralTransaction.commission_amount)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-sm text-gray-500">
                    Dibuat: {formatDate(order.created_at)}
                  </div>
                  <div className="text-xl font-bold text-primary">
                    Total: {formatPrice(order.total_price)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => handleOrderAction(order.id, 'confirm')}
                    disabled={isConfirming || processingOrderId === order.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processingOrderId === order.id ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Mengkonfirmasi...</span>
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Konfirmasi Pesanan
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleOrderAction(order.id, 'cancel')}
                    disabled={isConfirming || processingOrderId === order.id}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Batalkan Pesanan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderConfirmation;
