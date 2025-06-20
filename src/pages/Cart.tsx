
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutForm from '@/components/CheckoutForm';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();

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

  const handleOrderComplete = () => {
    clearCart();
  };

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Keranjang Saya Kosong</h2>
              <p className="text-gray-600 mb-6">Belum ada produk yang ditambahkan ke keranjang Anda</p>
              <Link to="/products">
                <Button className="bg-primary hover:bg-primary/90">
                  Mulai Belanja
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
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Keranjang Saya</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Produk yang Dipilih ({cart.length} item)</h2>
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
                        <p className="text-primary font-bold">¥{item.price.toLocaleString()}</p>
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
                      <div className="text-right">
                        <p className="font-semibold">¥{(item.price * item.quantity).toLocaleString()}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} item)</span>
                    <span className="font-semibold">¥{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold text-primary">
                    <span>Total Belanja</span>
                    <span>¥{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-1">
              <CheckoutForm 
                cart={cart} 
                total={total} 
                onOrderComplete={handleOrderComplete}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
