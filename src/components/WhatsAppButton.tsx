
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/types';
import { formatPrice } from '@/utils/cart';

interface WhatsAppButtonProps {
  cart: CartItem[];
  total: number;
  customerInfo: {
    name: string;
    prefecture: string;
    postal_code: string;
    address: string;
    phone: string;
    notes: string;
  };
  onSuccess: () => void;
}

const WhatsAppButton = ({ cart, total, customerInfo, onSuccess }: WhatsAppButtonProps) => {
  const handleWhatsAppOrder = () => {
    if (cart.length === 0) {
      alert('Keranjang kosong! Silakan tambahkan produk terlebih dahulu.');
      return;
    }

    // Format order details for WhatsApp
    const orderItems = cart.map(item => ({
      product_id: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    }));

    const orderText = orderItems
      .map(item => `${item.name} - ${item.quantity}x - ${formatPrice(item.price)}`)
      .join('\n');

    const customerDetails = `
Nama: ${customerInfo.name}
Prefektur: ${customerInfo.prefecture}
Kode Pos: ${customerInfo.postal_code}
Alamat: ${customerInfo.address}
No HP: ${customerInfo.phone}
${customerInfo.notes ? `Catatan: ${customerInfo.notes}` : ''}`;

    const message = `Halo! Saya ingin memesan:

${orderText}

Total: ${formatPrice(total)}

Informasi Pengiriman:${customerDetails}

Terima kasih!`;
    
    const whatsappUrl = `https://wa.me/+6285155452259?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Call onSuccess callback to clear cart and reset form
    onSuccess();
  };

  return (
    <Button
      onClick={handleWhatsAppOrder}
      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg"
      size="lg"
    >
      <Phone className="w-5 h-5 mr-2" />
      Pesan via WhatsApp
    </Button>
  );
};

export default WhatsAppButton;
