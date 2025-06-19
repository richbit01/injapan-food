
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/cart';
import { prefectures } from '@/data/prefectures';
import WhatsAppButton from '@/components/WhatsAppButton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReferralCodeInput from '@/components/ReferralCodeInput';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [isReferralValid, setIsReferralValid] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    prefecture: '',
    postal_code: '',
    address: '',
    phone: '',
    notes: ''
  });

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleReferralValidation = (isValid: boolean, code?: string) => {
    setIsReferralValid(isValid);
    if (isValid && code) {
      setReferralCode(code);
      console.log('✅ Referral code set for checkout:', code);
    } else {
      setReferralCode('');
      console.log('❌ Referral code cleared');
    }
  };

  const handleCheckoutSuccess = () => {
    clearCart();
    setShowCheckout(false);
    setReferralCode('');
    setIsReferralValid(false);
    setCustomerInfo({
      name: '',
      prefecture: '',
      postal_code: '',
      address: '',
      phone: '',
      notes: ''
    });
  };

  const isFormValid = () => {
    return customerInfo.name && 
           customerInfo.prefecture && 
           customerInfo.postal_code && 
           customerInfo.address && 
           customerInfo.phone;
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h1 className="text-3xl font-bold mb-4">Keranjang Kosong</h1>
          <p className="text-gray-600 mb-8">Belum ada produk yang ditambahkan ke keranjang</p>
          <Link to="/products" className="btn-primary">
            Mulai Belanja
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full sm:w-24 h-24 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{item.product.description}</p>
                    <div className="text-lg font-bold text-primary">
                      {formatPrice(item.product.price)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-gray-600 hover:text-primary"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 border-x border-gray-300">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:text-primary"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-xl font-bold">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
              <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
              
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {!showCheckout ? (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full btn-primary"
                >
                  Lanjut ke Checkout
                </button>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold">Informasi Pengiriman</h3>
                  
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  
                  <select
                    value={customerInfo.prefecture}
                    onChange={(e) => setCustomerInfo({...customerInfo, prefecture: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Pilih Prefektur</option>
                    {prefectures.map((pref) => (
                      <option key={pref.name} value={pref.name}>
                        {pref.name} ({pref.name_en})
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Kode Pos"
                    value={customerInfo.postal_code}
                    onChange={(e) => setCustomerInfo({...customerInfo, postal_code: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  
                  <textarea
                    placeholder="Alamat Lengkap"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  
                  <input
                    type="tel"
                    placeholder="Nomor HP Jepang"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />

                  {/* Referral Code Input */}
                  <ReferralCodeInput
                    value={referralCode}
                    onChange={setReferralCode}
                    onValidation={handleReferralValidation}
                  />
                  
                  <textarea
                    placeholder="Catatan Tambahan (Opsional)"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                  
                  {isFormValid() ? (
                    <WhatsAppButton
                      cart={cart}
                      total={total}
                      customerInfo={customerInfo}
                      referralCode={isReferralValid ? referralCode : undefined}
                      onSuccess={handleCheckoutSuccess}
                    />
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg cursor-not-allowed"
                    >
                      Lengkapi Data Pengiriman
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="w-full text-gray-600 hover:text-primary"
                  >
                    Kembali ke Keranjang
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
