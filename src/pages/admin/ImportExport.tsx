import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { exportProductsToCSV, parseCSVProducts } from '@/utils/exportUtils';
import { useLogAdminAction } from '@/hooks/useAdminLogs';
import AdminLayout from '@/components/admin/AdminLayout';

const ImportExport = () => {
  const { data: products = [], refetch } = useProducts();
  const logAction = useLogAdminAction();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [importPreview, setImportPreview] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExportProducts = () => {
    exportProductsToCSV(products);
    logAction.mutate({
      action: 'export_products',
      target_type: 'products',
      details: { count: products.length }
    });
    toast({
      title: "Export Berhasil!",
      description: `${products.length} produk berhasil diekspor ke CSV`,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Error",
        description: "Silakan upload file CSV yang valid",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      try {
        const parsedData = parseCSVProducts(csvText);
        setImportData(parsedData);
        setImportPreview(true);
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal memproses file CSV. Pastikan format file benar.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleImportProducts = async () => {
    if (importData.length === 0) return;

    setImporting(true);
    try {
      const validProducts = importData.filter(product => 
        product.name && product.price && product.category
      );

      if (validProducts.length === 0) {
        throw new Error('Tidak ada produk valid untuk diimport');
      }

      const { error } = await supabase
        .from('products')
        .insert(validProducts.map(product => ({
          ...product,
          status: product.status || 'active',
          stock: product.stock || 0
        })));

      if (error) throw error;

      logAction.mutate({
        action: 'import_products',
        target_type: 'products',
        details: { count: validProducts.length }
      });

      toast({
        title: "Import Berhasil!",
        description: `${validProducts.length} produk berhasil ditambahkan`,
      });

      setImportData([]);
      setImportPreview(false);
      refetch();

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error importing products:', error);
      toast({
        title: "Error",
        description: "Gagal mengimport produk",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  const csvTemplate = `"Nama Produk","Harga (¥)","Stok","Status","Kategori","Deskripsi"
"Contoh Mie Instan","500","10","Aktif","Makanan Ringan","Mie instan rasa ayam bawang"
"Contoh Sambal","750","5","Aktif","Bumbu Dapur","Sambal terasi pedas manis"
"Contoh Kerupuk","300","20","Tidak Aktif","Makanan Ringan","Kerupuk udang renyah"`;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Import & Export Data</h1>
          <p className="text-gray-600">Kelola data produk secara massal</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export Data Produk</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Export semua data produk ke file CSV untuk backup atau analisis.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Data yang akan diekspor:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ID Produk</li>
                  <li>• Nama produk</li>
                  <li>• Harga (dalam format ¥)</li>
                  <li>• Stok tersedia</li>
                  <li>• Status (Aktif/Tidak Aktif/Stok Habis)</li>
                  <li>• Kategori</li>
                  <li>• Deskripsi lengkap</li>
                  <li>• Tanggal input (format Indonesia)</li>
                  <li>• Varian produk (jika ada)</li>
                </ul>
              </div>
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  File CSV akan diformat dengan encoding UTF-8 dan BOM untuk kompatibilitas dengan Excel.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={handleExportProducts}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export {products.length} Produk ke CSV
              </Button>
            </CardContent>
          </Card>

          {/* Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Import Data Produk</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Upload file CSV untuk menambahkan banyak produk sekaligus.
              </p>
              
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  File CSV harus menggunakan format yang benar dengan header dalam bahasa Indonesia. 
                  Status produk: "Aktif", "Tidak Aktif", atau "Stok Habis".
                </AlertDescription>
              </Alert>

              <div>
                <label className="block text-sm font-medium mb-2">Upload File CSV:</label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="mb-4"
                />
              </div>

              <div>
                <h4 className="font-medium mb-2">Template CSV (Contoh Format):</h4>
                <Textarea
                  value={csvTemplate}
                  readOnly
                  rows={5}
                  className="text-xs font-mono bg-gray-50"
                />
                <div className="mt-2 text-xs text-gray-600">
                  <p><strong>Catatan format:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Harga dalam angka (tanpa simbol ¥)</li>
                    <li>Status: "Aktif", "Tidak Aktif", atau "Stok Habis"</li>
                    <li>Gunakan tanda kutip untuk text yang mengandung koma</li>
                    <li>Encoding file harus UTF-8</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    const BOM = '\uFEFF';
                    const blob = new Blob([BOM + csvTemplate], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'template-produk-injapan.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Preview */}
        {importPreview && importData.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Preview Import Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Preview {importData.length} produk yang akan diimport. Periksa data sebelum melanjutkan.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="max-h-80 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-medium">Nama</th>
                      <th className="p-3 text-left font-medium">Harga</th>
                      <th className="p-3 text-left font-medium">Stok</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-left font-medium">Kategori</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.slice(0, 10).map((product, index) => (
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium">{product.name}</td>
                        <td className="p-3">¥{product.price.toLocaleString()}</td>
                        <td className="p-3">{product.stock}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' :
                            product.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status === 'active' ? 'Aktif' : 
                             product.status === 'inactive' ? 'Tidak Aktif' : 'Stok Habis'}
                          </span>
                        </td>
                        <td className="p-3">{product.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importData.length > 10 && (
                  <div className="p-3 text-center text-gray-500 text-sm bg-gray-50">
                    ... dan {importData.length - 10} produk lainnya
                  </div>
                )}
              </div>

              <div className="flex space-x-4 mt-4">
                <Button
                  onClick={handleImportProducts}
                  disabled={importing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {importing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Import {importData.length} Produk
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportData([]);
                    setImportPreview(false);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default ImportExport;
