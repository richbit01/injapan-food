
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
    <div ref={cardRef} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] h-full flex flex-col">
      <Link to={`/products/${product.id}`} className="block flex-1">
        <div className="relative overflow-hidden rounded-t-xl mb-4">
          <img
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {product.category}
            </span>
          </div>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Habis
              </span>
            </div>
          )}
        </div>

        <div className="px-4 flex-1 flex flex-col">
          <h3 className="font-bold text-gray-900 text-sm md:text-base mb-2 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2 flex-1 leading-relaxed">
            {product.description}
          </p>
          
          <div className="space-y-3">
            <div className="text-lg md:text-xl font-bold text-red-600">
              {formatPrice(product.price)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                product.stock > 10 
                  ? 'bg-green-100 text-green-700' 
                  : product.stock > 0 
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              }`}>
                {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
              </span>
            </div>
          </div>
        </div>
      </Link>
      
      {/* Add to Cart Button */}
      <div className="p-4 pt-0" onClick={(e) => e.stopPropagation()}>
        <AddToCartButton
          product={product}
          className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
            product.stock === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white transform hover:scale-[1.02]'
          }`}
          onAddToCart={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Habis' : 'Tambah ke Keranjang'}
        </AddToCartButton>
      </div>
    </div>
  );
};

export default ProductCard;
