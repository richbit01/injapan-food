
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVariantOptions } from '@/hooks/useVariantOptions';
import { ProductVariant } from '@/types';
import { Badge } from '@/components/ui/badge';

interface ProductVariantSelectorProps {
  category: string;
  availableVariants: ProductVariant[];
  selectedVariants: Record<string, string>;
  onVariantChange: (variantName: string, value: string) => void;
  onValidityChange: (isValid: boolean) => void;
}

const ProductVariantSelector = ({
  category,
  availableVariants,
  selectedVariants,
  onVariantChange,
  onValidityChange
}: ProductVariantSelectorProps) => {
  const { data: variantOptions = [] } = useVariantOptions(category);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Check if selected variants match available product variants
  const getMatchingVariants = () => {
    if (!availableVariants || availableVariants.length === 0) {
      return [];
    }

    return availableVariants.filter(variant => {
      // Check if this variant matches all selected options
      const variantParts = variant.name.split(' - ');
      const selectedValues = Object.values(selectedVariants);
      
      return selectedValues.every(selectedValue => 
        variantParts.some(part => part.includes(selectedValue))
      );
    });
  };

  const validateSelection = () => {
    const errors: string[] = [];
    const requiredVariants = variantOptions.filter(vo => vo.is_required);
    
    // Check if all required variants are selected
    for (const variantOption of requiredVariants) {
      if (!selectedVariants[variantOption.variant_name]) {
        errors.push(`${variantOption.variant_name} wajib dipilih`);
      }
    }

    // Check if selected combination exists in available variants
    const matchingVariants = getMatchingVariants();
    if (Object.keys(selectedVariants).length > 0 && matchingVariants.length === 0) {
      errors.push('Kombinasi varian yang dipilih tidak tersedia');
    }

    setValidationErrors(errors);
    onValidityChange(errors.length === 0 && requiredVariants.length > 0);
  };

  useEffect(() => {
    validateSelection();
  }, [selectedVariants, variantOptions, availableVariants]);

  if (!category || variantOptions.length === 0) {
    return null;
  }

  const matchingVariants = getMatchingVariants();
  const selectedVariant = matchingVariants.length === 1 ? matchingVariants[0] : null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pilih Varian Produk</h3>
      
      {variantOptions.map((variantOption) => (
        <div key={variantOption.id}>
          <Label className="text-sm font-medium capitalize">
            {variantOption.variant_name}
            {variantOption.is_required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={selectedVariants[variantOption.variant_name] || ''}
            onValueChange={(value) => onVariantChange(variantOption.variant_name, value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={`Pilih ${variantOption.variant_name}`} />
            </SelectTrigger>
            <SelectContent>
              {variantOption.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      {/* Show validation errors */}
      {validationErrors.length > 0 && (
        <div className="space-y-1">
          {validationErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Show selected variant info */}
      {selectedVariant && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex justify-between items-start">
            <div>
              <Label className="text-sm font-medium text-green-800">Varian Dipilih:</Label>
              <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                {selectedVariant.name}
              </Badge>
            </div>
            <div className="text-right">
              {selectedVariant.price > 0 && (
                <div className="text-sm text-green-700">
                  Harga tambahan: +¥{selectedVariant.price.toLocaleString()}
                </div>
              )}
              <div className="text-sm text-green-700">
                Stok tersedia: {selectedVariant.stock}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show out of stock warning */}
      {selectedVariant && selectedVariant.stock === 0 && (
        <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-600 font-medium">
            Varian ini sedang tidak tersedia (stok habis)
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
