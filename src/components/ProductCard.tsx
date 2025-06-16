
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
    
    if (product.stock === 0) {
      toast({
        title: "Stok Habis",
        description: `${product.name} sedang tidak tersedia`,
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    
    addToCart(product);
    toast({
      title: "Berhasil ditambahkan!",
      description: `${product.name} telah ditambahkan ke keranjang`,
      duration: 2000,
    });
  };

  return (
    <Link to={`/products/${product.id}`}>
      <div className="card-product p-4 h-full">
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute top-2 right-2">
            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium">
              {product.category}
            </span>
          </div>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Stok Habis
              </span>
            </div>
          )}
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
              disabled={product.stock === 0}
              className={`px-3 py-2 text-sm flex items-center space-x-1 rounded-lg transition-colors ${
                product.stock === 0 
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{product.stock === 0 ? 'Habis' : 'Keranjang'}</span>
            </button>
          </div>
          
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              product.stock > 10 
                ? 'bg-green-100 text-green-800' 
                : product.stock > 0 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `Stok: ${product.stock}` : 'Stok Habis'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
