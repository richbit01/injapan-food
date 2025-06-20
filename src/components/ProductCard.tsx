
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { formatPrice } from '@/utils/cart';
import { useLanguage } from '@/hooks/useLanguage';
import AddToCartButton from '@/components/AddToCartButton';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, position: { x: number; y: number }) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const handleAddToCart = (position: { x: number; y: number }) => {
    if (onAddToCart) {
      onAddToCart(product, position);
    }
  };

  return (
    <div ref={cardRef} className="card-product p-2 sm:p-3 md:p-4 h-full flex flex-col">
      <Link to={`/products/${product.id}`} className="block flex-1 group">
        <div className="relative overflow-hidden rounded-lg mb-2 sm:mb-3 md:mb-4">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
            <span className="bg-secondary text-secondary-foreground px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium">
              {product.category}
            </span>
          </div>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium">
                {t('products.outOfStock')}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 line-clamp-2 leading-tight">{product.name}</h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 flex-1">{product.description}</p>
          
          <div className="text-base sm:text-lg md:text-xl font-bold text-primary mb-1 sm:mb-2">
            {formatPrice(product.price)}
          </div>
          
          <div className="mb-2 sm:mb-3">
            <span className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${
              product.stock > 10 
                ? 'bg-green-100 text-green-800' 
                : product.stock > 0 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `${t('products.stock')}: ${product.stock}` : t('products.outOfStock')}
            </span>
          </div>
        </div>
      </Link>
      
      {/* Add to Cart Button Outside Link */}
      <div className="mt-auto pt-1 sm:pt-2" onClick={(e) => e.stopPropagation()}>
        <AddToCartButton
          product={product}
          className={`w-full py-1.5 sm:py-2 text-xs sm:text-sm flex items-center justify-center space-x-1 sm:space-x-2 rounded-lg transition-colors ${
            product.stock === 0 
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'btn-primary'
          }`}
          onAddToCart={handleAddToCart}
          disabled={product.stock === 0}
        />
      </div>
    </div>
  );
};

export default ProductCard;
