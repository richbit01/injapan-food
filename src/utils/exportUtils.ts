
import { Product, OrderTracking } from '@/types';

export const exportProductsToCSV = (products: Product[]) => {
  const headers = [
    'Nama Produk',
    'Harga (¥)',
    'Stok',
    'Status',
    'Kategori',
    'Tanggal Input',
    'Deskripsi',
    'Varian'
  ];

  const csvContent = [
    headers.join(','),
    ...products.map(product => [
      `"${product.name}"`,
      product.price,
      product.stock,
      product.status,
      `"${product.category}"`,
      product.created_at ? new Date(product.created_at).toLocaleDateString('id-ID') : '',
      `"${product.description || ''}"`,
      product.variants ? `"${product.variants.map(v => `${v.name}: ¥${v.price}`).join(', ')}"` : ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `injapan-food-products-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportOrdersToCSV = (orders: OrderTracking[]) => {
  const headers = [
    'ID Pesanan',
    'Nama Pelanggan',
    'Email',
    'Telepon',
    'Total Amount (¥)',
    'Status',
    'Tanggal Pesanan',
    'Items',
    'Catatan'
  ];

  const csvContent = [
    headers.join(','),
    ...orders.map(order => [
      order.id,
      `"${order.customer_name}"`,
      `"${order.customer_email || ''}"`,
      `"${order.customer_phone || ''}"`,
      order.total_amount,
      order.status,
      new Date(order.created_at).toLocaleDateString('id-ID'),
      `"${order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}"`,
      `"${order.notes || ''}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `injapan-food-orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const parseCSVProducts = (csvText: string): Partial<Product>[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  return lines.slice(1).filter(line => line.trim()).map(line => {
    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
    
    return {
      name: values[0] || '',
      price: parseInt(values[1]) || 0,
      stock: parseInt(values[2]) || 0,
      status: (values[3] as any) || 'active',
      category: values[4] || '',
      description: values[5] || ''
    };
  });
};
