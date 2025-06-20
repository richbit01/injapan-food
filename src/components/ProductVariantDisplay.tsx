
import { Badge } from '@/components/ui/badge';
import { ProductVariant } from '@/types';

interface ProductVariantDisplayProps {
  variants: ProductVariant[];
  selectedVariant?: ProductVariant;
  onVariantSelect?: (variant: ProductVariant) => void;
  showPrice?: boolean;
}

const ProductVariantDisplay = ({ 
  variants, 
  selectedVariant, 
  onVariantSelect, 
  showPrice = true 
}: ProductVariantDisplayProps) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900">Varian Tersedia:</h4>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isOutOfStock = variant.stock === 0;
          
          return (
            <Badge
              key={variant.id}
              variant={isSelected ? "default" : "secondary"}
              className={`
                cursor-pointer transition-colors text-sm px-3 py-2
                ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}
                ${isSelected ? 'bg-red-600 text-white' : 'hover:bg-gray-200'}
              `}
              onClick={() => {
                if (!isOutOfStock && onVariantSelect) {
                  onVariantSelect(variant);
                }
              }}
            >
              <div className="flex flex-col items-center">
                <span className="font-medium">{variant.name}</span>
                {showPrice && variant.price > 0 && (
                  <span className="text-xs">
                    +¥{variant.price.toLocaleString()}
                  </span>
                )}
                {isOutOfStock && (
                  <span className="text-xs text-red-500">Habis</span>
                )}
              </div>
            </Badge>
          );
        })}
      </div>
      
      {selectedVariant && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium text-gray-900">Varian Dipilih: </span>
              <span className="text-gray-700">{selectedVariant.name}</span>
            </div>
            <div className="text-right">
              {selectedVariant.price > 0 && (
                <div className="text-sm text-gray-600">
                  Harga tambahan: +¥{selectedVariant.price.toLocaleString()}
                </div>
              )}
              <div className="text-sm text-gray-600">
                Stok: {selectedVariant.stock} tersedia
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantDisplay;
