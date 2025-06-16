
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/utils/cart';
import AddToCartButton from '@/components/AddToCartButton';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, position: { x: number; y: number }) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (position: { x: number; y: number }) => {
    if (onAddToCart) {
      onAddToCart(product, position);
    }
  };

  return (
    <Link to={`/products/${product.id}`}>
      <div ref={cardRef} className="card-product p-4 h-full transition-all duration-200 hover:scale-105 hover:shadow-lg">
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full aspect-[3/4] object-cover transition-transform duration-300 hover:scale-110"
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
          
          <div className="flex items-center justify-between mb-2">
            <div className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>
            
            <div onClick={(e) => e.preventDefault()}>
              <AddToCartButton
                product={product}
                className={`px-2 py-1 text-xs flex items-center space-x-1 rounded-lg transition-colors ${
                  product.stock === 0 
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'btn-primary'
                }`}
                onAddToCart={handleAddToCart}
                disabled={product.stock === 0}
              />
            </div>
          </div>
          
          <div>
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
