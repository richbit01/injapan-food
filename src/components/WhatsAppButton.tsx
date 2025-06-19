
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useCheckoutWithReferral } from '@/hooks/useCheckoutWithReferral';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
  };
  quantity: number;
}

interface CustomerInfo {
  name: string;
  prefecture: string;
  postal_code: string;
  address: string;
  phone: string;
  notes?: string;
}

interface WhatsAppButtonProps {
  cart: CartItem[];
  total: number;
  customerInfo: CustomerInfo;
  referralCode?: string;
  onSuccess?: () => void;
}

const WhatsAppButton = ({ cart, total, customerInfo, referralCode, onSuccess }: WhatsAppButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const checkoutWithReferral = useCheckoutWithReferral();
  const { toast } = useToast();

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      console.log('🛒 Starting checkout process with referral:', {
        total,
        referralCode,
        itemsCount: cart.length
      });

      // Prepare checkout data
      const checkoutData = {
        items: cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        customerInfo: {
          fullName: customerInfo.name,
          email: '', // Will be filled if user is logged in
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.prefecture,
          prefecture: customerInfo.prefecture,
          zipCode: customerInfo.postal_code,
        },
        referralCode: referralCode || undefined,
        totalPrice: total,
      };

      // Process the order with referral
      const order = await checkoutWithReferral.mutateAsync(checkoutData);
      
      console.log('✅ Order created successfully:', order.id);

      // Create WhatsApp message
      const formatPrice = (price: number) => `¥${price.toLocaleString()}`;
      
      let message = `*PESANAN BARU*\n\n`;
      message += `*Nama:* ${customerInfo.name}\n`;
      message += `*HP:* ${customerInfo.phone}\n`;
      message += `*Alamat:* ${customerInfo.address}, ${customerInfo.prefecture} ${customerInfo.postal_code}\n\n`;
      
      message += `*PRODUK:*\n`;
      cart.forEach((item, index) => {
        message += `${index + 1}. ${item.product.name}\n`;
        message += `   Jumlah: ${item.quantity}\n`;
        message += `   Harga: ${formatPrice(item.product.price)} x ${item.quantity} = ${formatPrice(item.product.price * item.quantity)}\n\n`;
      });
      
      message += `*TOTAL: ${formatPrice(total)}*\n\n`;
      
      if (referralCode) {
        message += `*Kode Referral:* ${referralCode}\n\n`;
      }
      
      if (customerInfo.notes) {
        message += `*Catatan:* ${customerInfo.notes}\n\n`;
      }
      
      message += `*Order ID:* ${order.id}\n`;
      message += `Terima kasih telah berbelanja di Injapan Food! 🙏`;

      // Open WhatsApp
      const whatsappNumber = "8119927773";
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: 'Pesanan Berhasil!',
        description: referralCode 
          ? `Pesanan dengan kode referral ${referralCode} berhasil dibuat. Komisi akan diproses.`
          : 'Pesanan berhasil dibuat. Anda akan diarahkan ke WhatsApp.',
      });

      // Call success callback
      onSuccess?.();

    } catch (error: any) {
      console.error('❌ Checkout failed:', error);
      toast({
        title: 'Gagal Memproses Pesanan',
        description: error.message || 'Terjadi kesalahan saat memproses pesanan',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isProcessing}
      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isProcessing ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Memproses...</span>
        </div>
      ) : (
        <>
          <MessageSquare className="w-5 h-5" />
          <span>Pesan via WhatsApp</span>
        </>
      )}
    </button>
  );
};

export default WhatsAppButton;
