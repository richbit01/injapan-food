
import { useState, useRef } from 'react';
import { Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
  onAddToCart?: (position: { x: number; y: number }) => void;
  disabled?: boolean;
}

const AddToCartButton = ({ 
  product, 
  quantity = 1, 
  className = "btn-primary",
  onAddToCart,
  disabled = false
}: AddToCartButtonProps) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleAddToCart = () => {
    if (product.stock === 0 || disabled) {
      toast({
        title: "Stok Habis",
        description: `${product.name} sedang tidak tersedia`,
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    // Get button position for animation
    if (buttonRef.current && onAddToCart) {
      const rect = buttonRef.current.getBoundingClientRect();
      onAddToCart({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }

    addToCart(product, quantity);
    
    // Show success state
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    // Show toast with cart link
    toast({
      title: "Berhasil ditambahkan!",
      description: `${quantity}x ${product.name} telah ditambahkan ke keranjang`,
      duration: 3000,
      action: (
        <button 
          className="text-primary hover:text-primary/80 font-medium"
          onClick={() => window.location.href = '/cart'}
        >
          Lihat Keranjang
        </button>
      )
    });
  };

  const isOutOfStock = product.stock === 0;

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleAddToCart}
      disabled={isOutOfStock || disabled}
      className={`${className} ${isOutOfStock ? 'bg-gray-400 text-white cursor-not-allowed' : ''} 
        transition-all duration-200 ease-in-out relative overflow-hidden`}
      whileHover={!isOutOfStock ? { scale: 1.02 } : {}}
      whileTap={!isOutOfStock ? { scale: 0.98 } : {}}
      animate={isAdded ? {
        backgroundColor: "#16a34a",
        transition: { duration: 0.3 }
      } : {}}
    >
      <motion.div
        className="flex items-center space-x-2"
        animate={isAdded ? { x: 0 } : { x: 0 }}
      >
        <motion.div
          animate={isAdded ? { rotate: 360, scale: [1, 1.2, 1] } : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </motion.div>
        <span>
          {isOutOfStock ? 'Habis' : isAdded ? '✓ Ditambahkan' : 'Keranjang'}
        </span>
      </motion.div>
    </motion.button>
  );
};

export default AddToCartButton;
