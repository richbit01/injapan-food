
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types';

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: products = [], isLoading, refetch } = useProducts();
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: ''
  });

  const categories = [
    'Makanan Ringan',
    'Bumbu Dapur', 
    'Makanan Siap Saji',
    'Bahan Masak Beku',
    'Sayur Segar/Beku',
    'Sayur Beku'
  ];

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(data?.role === 'admin');
      }
    };

    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  // Redirect if not admin
  if (!authLoading && (!user || !isAdmin)) {
    return <Navigate to="/" replace />;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: ''
    });
    setEditingProduct(null);
  };

  const handleAddProduct = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.price),
          category: formData.category,
          image_url: formData.image_url || '/placeholder.svg'
        }]);

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Produk berhasil ditambahkan",
      });

      resetForm();
      setShowAddDialog(false);
      refetch();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan produk",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || ''
    });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.price),
          category: formData.category,
          image_url: formData.image_url || '/placeholder.svg'
        })
        .eq('id', editingProduct.id);

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Produk berhasil diupdate",
      });

      resetForm();
      refetch();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Gagal mengupdate produk",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Produk berhasil dihapus",
      });

      refetch();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus produk",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Kelola produk dan pesanan</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Produk
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah Produk Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Produk</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Masukkan nama produk"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Deskripsi</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Masukkan deskripsi produk"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Harga (¥)</label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Kategori</label>
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">URL Gambar</label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg (opsional)"
                  />
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleAddProduct} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Produk
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Batal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Management */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kelola Produk ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img 
                      src={product.image_url || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    
                    {editingProduct?.id === product.id ? (
                      <div className="flex-1 space-y-2">
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="font-medium"
                        />
                        <Textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={2}
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <Input
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                          />
                          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={formData.image_url}
                            onChange={(e) => handleInputChange('image_url', e.target.value)}
                            placeholder="URL Gambar"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{product.name}</h3>
                        <p className="text-gray-600 text-sm">{product.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="font-bold text-primary">¥{product.price}</span>
                          <Badge variant="secondary">{product.category}</Badge>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      {editingProduct?.id === product.id ? (
                        <>
                          <Button size="sm" onClick={handleUpdateProduct}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={resetForm}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
