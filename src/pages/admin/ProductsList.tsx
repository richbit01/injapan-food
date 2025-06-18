
import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash, Search, Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';

const ProductsList = () => {
  const { data: products = [], refetch, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deletingProducts, setDeletingProducts] = useState<Set<string>>(new Set());

  console.log('Products data:', products); // Debug log

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = async (productId: string, imageUrl?: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    console.log('Starting deletion of product:', productId);
    
    // Add product to deleting set to show loading state
    setDeletingProducts(prev => new Set(prev).add(productId));

    try {
      // Delete image from storage if exists
      if (imageUrl && imageUrl.includes('product-images')) {
        console.log('Deleting image from storage:', imageUrl);
        const imagePath = imageUrl.split('/').pop();
        if (imagePath) {
          const { error: storageError } = await supabase.storage
            .from('product-images')
            .remove([imagePath]);
          
          if (storageError) {
            console.warn('Error deleting image from storage:', storageError);
            // Continue with product deletion even if image deletion fails
          } else {
            console.log('Image deleted successfully from storage');
          }
        }
      }

      // Delete product from database
      console.log('Deleting product from database:', productId);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Database deletion error:', error);
        throw error;
      }

      console.log('Product deleted successfully from database');

      toast({
        title: "Berhasil!",
        description: "Produk berhasil dihapus",
      });

      // Force refetch the products list
      console.log('Refetching products list...');
      await refetch();
      
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus produk",
        variant: "destructive"
      });
    } finally {
      // Remove product from deleting set
      setDeletingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
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

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Produk</h1>
            <p className="text-gray-600">Lihat dan kelola semua produk</p>
          </div>
          <Link to="/admin/products/add">
            <Button className="bg-green-600 hover:bg-green-700">
              Tambah Produk Baru
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filter & Pencarian</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Produk ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className={`flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-all ${
                  deletingProducts.has(product.id) ? 'opacity-50 pointer-events-none' : ''
                }`}>
                  <img 
                    src={product.image_url || '/placeholder.svg'} 
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="font-bold text-red-600 text-lg">¥{product.price}</span>
                      <Badge variant="secondary">{product.category}</Badge>
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        Stok: {product.stock}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link to={`/products/${product.id}`}>
                      <Button size="sm" variant="outline" title="Lihat Produk">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link to={`/admin/products/edit/${product.id}`}>
                      <Button size="sm" variant="outline" title="Edit Produk">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeleteProduct(product.id, product.image_url)}
                      disabled={deletingProducts.has(product.id)}
                      title="Hapus Produk"
                    >
                      {deletingProducts.has(product.id) ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {products.length === 0 ? 'Belum ada produk yang ditambahkan' : 'Tidak ada produk yang ditemukan'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ProductsList;
