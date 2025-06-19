
import React from 'react';
import { Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, User, MapPin, Gift, CheckCircle, XCircle } from 'lucide-react';
import { useConfirmOrder } from '@/hooks/useConfirmOrder';
import { toast } from '@/hooks/use-toast';

interface OrderConfirmationProps {
  order: Order;
}

const OrderConfirmation = ({ order }: OrderConfirmationProps) => {
  const { confirmOrder, cancelOrder, isLoading } = useConfirmOrder();

  const handleConfirm = async () => {
    try {
      await confirmOrder.mutateAsync({
        orderId: order.id,
        referralTransactionId: order.referralTransaction?.id
      });
      
      toast({
        title: "Berhasil!",
        description: "Pesanan telah dikonfirmasi dan komisi referral telah diberikan",
      });
    } catch (error) {
      console.error('Error confirming order:', error);
      toast({
        title: "Error",
        description: "Gagal mengkonfirmasi pesanan",
        variant: "destructive"
      });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync({
        orderId: order.id,
        referralTransactionId: order.referralTransaction?.id
      });
      
      toast({
        title: "Berhasil!",
        description: "Pesanan telah dibatalkan",
      });
    } catch (error) {
      console.error('Error canceling order:', error);
      toast({
        title: "Error",
        description: "Gagal membatalkan pesanan",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Order #{order.id.slice(0, 8)}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
              {order.status === 'pending' ? 'Pending' : order.status}
            </Badge>
            {order.referralTransaction && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <Gift className="w-3 h-3 mr-1" />
                Referral
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Informasi Pelanggan
            </h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Nama:</span> {order.customer_info.name}</p>
              <p><span className="font-medium">Email:</span> {order.customer_info.email}</p>
              <p><span className="font-medium">Telepon:</span> {order.customer_info.phone}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Alamat Pengiriman
            </h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Prefektur:</span> {order.customer_info.prefecture}</p>
              <p><span className="font-medium">Kode Pos:</span> {order.customer_info.postal_code}</p>
              <p><span className="font-medium">Alamat:</span> {order.customer_info.address}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Item Pesanan</h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">¥{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>¥{order.total_price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Referral Info */}
        {order.referralTransaction && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-3 flex items-center">
              <Gift className="w-4 h-4 mr-2" />
              Informasi Referral
            </h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Kode Referral:</span> {order.referralTransaction.referral_code}</p>
              <p><span className="font-medium">Komisi:</span> ¥{Number(order.referralTransaction.commission_amount).toLocaleString()}</p>
              <p><span className="font-medium">Status:</span> 
                <Badge variant="secondary" className="ml-2">
                  {order.referralTransaction.status === 'pending' ? 'Pending' : order.referralTransaction.status}
                </Badge>
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {order.status === 'pending' && (
          <div className="flex space-x-4 pt-4 border-t">
            <Button 
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Konfirmasi Pesanan
            </Button>
            <Button 
              onClick={handleCancel}
              disabled={isLoading}
              variant="destructive"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Batalkan Pesanan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderConfirmation;
