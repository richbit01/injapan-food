
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
                <h2 className="text-xl font-semibold mb-6">Produk yang Dipilih ({cart.length} item)</h2>
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 pb-6 border-b last:border-b-0 last:pb-0">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-16 h-16">
                        <img
                          src={item.image_url || '/placeholder.svg'}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">{item.name}</h3>
                        <div className="text-sm font-bold text-primary">¥{item.price.toLocaleString()}</div>
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block mt-1">
                            {Object.entries(item.selectedVariants).map(([type, value], index) => (
                              <span key={`${type}-${index}`}>
                                {type}: {value}
                                {index < Object.keys(item.selectedVariants || {}).length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price and Remove */}
                      <div className="text-right flex flex-col items-end gap-2 min-w-[80px]">
                        <div className="text-sm font-bold text-gray-800">
                          ¥{(item.price * item.quantity).toLocaleString()}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Hapus dari keranjang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-gray-600">
                      <span className="text-base">Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} item)</span>
                      <span className="text-lg font-semibold">¥{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-2xl font-bold text-primary border-t pt-3">
                      <span>Total Belanja</span>
                      <span>¥{total.toLocaleString()}</span>
                    </div>
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
