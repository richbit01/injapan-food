
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useVariantOptions } from '@/hooks/useVariantOptions';
import { ProductVariant } from '@/types';

interface ProductVariantsProps {
  category: string;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

const ProductVariants = ({ category, variants, onChange }: ProductVariantsProps) => {
  const { data: variantOptions = [] } = useVariantOptions(category);
  const [selectedVariants, setSelectedVariants] = useState<ProductVariant[]>(variants);

  useEffect(() => {
    setSelectedVariants(variants);
  }, [variants]);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      stock: 0
    };
    const updatedVariants = [...selectedVariants, newVariant];
    setSelectedVariants(updatedVariants);
    onChange(updatedVariants);
  };

  const removeVariant = (index: number) => {
    const updatedVariants = selectedVariants.filter((_, i) => i !== index);
    setSelectedVariants(updatedVariants);
    onChange(updatedVariants);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = selectedVariants.map((variant, i) => {
      if (i === index) {
        return { ...variant, [field]: value };
      }
      return variant;
    });
    setSelectedVariants(updatedVariants);
    onChange(updatedVariants);
  };

  const buildVariantName = (index: number, variantName: string, option: string) => {
    const currentVariant = selectedVariants[index];
    const existingParts = currentVariant.name ? currentVariant.name.split(' - ') : [];
    
    // Remove existing part for this variant type
    const filteredParts = existingParts.filter(part => {
      const variantOption = variantOptions.find(vo => 
        vo.variant_name === variantName && vo.options.some(opt => part.includes(opt))
      );
      return !variantOption;
    });
    
    // Add new part
    filteredParts.push(option);
    
    return filteredParts.join(' - ');
  };

  if (!category) {
    return (
      <div className="text-gray-500 text-sm">
        Pilih kategori produk terlebih dahulu untuk menampilkan varian
      </div>
    );
  }

  if (variantOptions.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        Tidak ada varian yang tersedia untuk kategori "{category}"
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Varian Produk</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addVariant}
          className="flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Varian</span>
        </Button>
      </div>

      {selectedVariants.length === 0 && (
        <div className="text-gray-500 text-sm">
          Belum ada varian ditambahkan. Klik "Tambah Varian" untuk menambah varian baru.
        </div>
      )}

      {selectedVariants.map((variant, index) => (
        <div key={variant.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Varian {index + 1}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeVariant(index)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variantOptions.map((variantOption) => (
              <div key={variantOption.id}>
                <Label className="text-sm capitalize">
                  {variantOption.variant_name}
                  {variantOption.is_required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const newName = buildVariantName(index, variantOption.variant_name, value);
                    updateVariant(index, 'name', newName);
                  }}
                >
                  <SelectTrigger>
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
          </div>

          {variant.name && (
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Nama Varian:</Label>
              <Badge variant="secondary">{variant.name}</Badge>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Harga Tambahan (¥)</Label>
              <input
                type="number"
                value={variant.price}
                onChange={(e) => updateVariant(index, 'price', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <Label className="text-sm">Stok Varian</Label>
              <input
                type="number"
                value={variant.stock}
                onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="0"
                min="0"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductVariants;
