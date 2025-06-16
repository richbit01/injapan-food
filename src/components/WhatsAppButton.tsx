
import { Phone } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';

const WhatsAppButton = () => {
  const { cart, total } = useCart();

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
      .map(item => `${item.name} - ${item.quantity}x - ¥${item.price}`)
      .join('\n');

    const message = `Halo! Saya ingin memesan:\n\n${orderText}\n\nTotal: ¥${total}\n\nTerima kasih!`;
    
    const whatsappUrl = `https://wa.me/81234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={handleWhatsAppOrder}
      className="fixed bottom-4 right-4 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg"
      size="lg"
    >
      <Phone className="w-6 h-6 mr-2" />
      Order via WhatsApp
    </Button>
  );
};

export default WhatsAppButton;
