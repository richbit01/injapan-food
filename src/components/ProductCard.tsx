
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/utils/cart';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Berhasil ditambahkan!",
      description: `${product.name} telah ditambahkan ke keranjang`,
      duration: 2000,
    });
  };

  return (
    <Link to={`/product/${product.id}`}>
      <div className="card-product p-4 h-full">
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute top-2 right-2">
            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium">
              {product.category}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>
            
            <button
              onClick={handleAddToCart}
              className="btn-primary px-3 py-2 text-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Keranjang</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
