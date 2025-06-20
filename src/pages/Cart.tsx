
import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useConfirmOrder } from '@/hooks/useConfirmOrder';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { mutate: confirmOrder, isPending } = useConfirmOrder();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const handleQuantityChange = (id: string, change: number) => {
    const item = cart.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(0, item.quantity + change);
      if (newQuantity === 0) {
        removeFromCart(id);
      } else {
        updateQuantity(id, newQuantity);
      }
    }
  };

  const handleSubmitOrder = () => {
    if (!user) {
      toast({
        title: t('cart.loginRequired'),
        description: t('cart.loginRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: t('cart.fillRequired'),
        description: t('cart.fillRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      user_id: user.uid,
      user_email: user.email || '',
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      notes: customerInfo.notes,
      items: cart,
      total_amount: total,
      status: 'pending' as const
    };

    confirmOrder(orderData, {
      onSuccess: () => {
        clearCart();
        setCustomerInfo({
          name: '',
          email: '',
          phone: '',
          address: '',
          notes: ''
        });
      }
    });
  };

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('cart.empty')}</h2>
              <p className="text-gray-600 mb-6">{t('cart.emptyDesc')}</p>
              <Link to="/products">
                <Button className="bg-primary hover:bg-primary/90">
                  {t('cart.continueShopping')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('cart.title')}</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">{t('cart.items')}</h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                      <img
                        src={item.image_url || '/placeholder.svg'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-primary font-bold">¥{item.price}</p>
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <div className="text-sm text-gray-600">
                            {Object.entries(item.selectedVariants).map(([type, value], index) => (
                              <span key={`${type}-${index}`}>
                                {type}: {value}
                                {index < Object.keys(item.selectedVariants || {}).length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary & Customer Info */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">{t('cart.customerInfo')}</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t('cart.name')} *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder={t('cart.namePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('cart.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      placeholder={t('cart.emailPlaceholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('cart.phone')} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder={t('cart.phonePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">{t('cart.address')} *</Label>
                    <Textarea
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      placeholder={t('cart.addressPlaceholder')}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">{t('cart.notes')}</Label>
                    <Textarea
                      id="notes"
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                      placeholder={t('cart.notesPlaceholder')}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">{t('cart.summary')}</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t('cart.subtotal')}</span>
                    <span>¥{total}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>{t('cart.total')}</span>
                    <span>¥{total}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSubmitOrder}
                  disabled={isPending}
                  className="w-full mt-6 bg-primary hover:bg-primary/90"
                >
                  {isPending ? t('cart.processing') : t('cart.placeOrder')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
