import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });

  const categories = [
    'Makanan Ringan',
    'Bumbu Dapur', 
    'Makanan Siap Saji',
    'Bahan Masak Beku',
    'Sayur Segar/Beku',
    'Sayur Beku'
  ];

  useEffect(() => {
    if (product) {
      console.log('Setting form data from product:', product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category: product.category,
        stock: product.stock?.toString() || '0'
      });
      setImagePreview(product.image_url);
    }
  }, [product]);

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating ${field} to:`, value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('New form data:', newData);
      return newData;
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Price input changed to:', value);
    
    // Allow empty string or valid numbers
    if (value === '' || /^\d+$/.test(value)) {
      handleInputChange('price', value);
    }
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Stock input changed to:', value);
    
    // Allow empty string or valid numbers
    if (value === '' || /^\d+$/.test(value)) {
      handleInputChange('stock', value);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    // Delete old image if it exists and is from our storage
    if (product?.image_url && product.image_url.includes('product-images')) {
      const oldImagePath = product.image_url.split('/').pop();
      if (oldImagePath) {
        await supabase.storage
          .from('product-images')
          .remove([oldImagePath]);
      }
    }

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting form with data:', formData);
    
    if (!formData.name || !formData.price || !formData.category || !formData.stock) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive"
      });
      return;
    }

    // Validate price and stock are valid numbers
    const priceNum = parseInt(formData.price);
    const stockNum = parseInt(formData.stock);
    
    if (isNaN(priceNum) || priceNum < 0) {
      toast({
        title: "Error",
        description: "Harga harus berupa angka yang valid",
        variant: "destructive"
      });
      return;
    }
    
    if (isNaN(stockNum) || stockNum < 0) {
      toast({
        title: "Error",
        description: "Stok harus berupa angka yang valid",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Upload new image if provided
      const imageUrl = await uploadImage();

      console.log('Updating product with:', {
        name: formData.name,
        description: formData.description,
        price: priceNum,
        category: formData.category,
        stock: stockNum,
        ...(imageUrl && { image_url: imageUrl })
      });

      // Update product
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: priceNum,
          category: formData.category,
          stock: stockNum,
          ...(imageUrl && { image_url: imageUrl })
        })
        .eq('id', id!);

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Produk berhasil diupdate",
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      
      let errorMessage = "Gagal mengupdate produk";
      if (error instanceof Error) {
        if (error.message.includes('storage') || error.message.includes('violates row-level security')) {
          errorMessage = "Gagal mengupload gambar. Silakan coba lagi";
        } else if (error.message.includes('authentication')) {
          errorMessage = "Masalah autentikasi. Silakan login ulang";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produk tidak ditemukan</h1>
          <Link to="/admin/products">
            <Button>Kembali ke Daftar Produk</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Produk</h1>
            <p className="text-gray-600">Update informasi produk</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Edit Informasi Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Nama Produk *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Masukkan nama produk"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Masukkan deskripsi produk"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Harga (¥) *</Label>
                    <Input
                      id="price"
                      type="text"
                      inputMode="numeric"
                      value={formData.price}
                      onChange={handlePriceChange}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stok *</Label>
                    <Input
                      id="stock"
                      type="text"
                      inputMode="numeric"
                      value={formData.stock}
                      onChange={handleStockChange}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="image">Foto Produk</Label>
                  <div className="mt-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mb-4"
                    />
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Simpan Perubahan
                  </Button>
                  <Link to="/admin/products">
                    <Button type="button" variant="outline">
                      Batal
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditProduct;
