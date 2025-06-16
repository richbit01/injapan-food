
import { Product, OrderTracking } from '@/types';

export const exportProductsToCSV = (products: Product[]) => {
  const headers = [
    'ID',
    'Nama Produk',
    'Harga',
    'Stok',
    'Status', 
    'Kategori',
    'Deskripsi',
    'Tanggal Input',
    'Varian'
  ];

  const csvData = products.map(product => [
    product.id,
    product.name,
    product.price,
    product.stock,
    product.status,
    product.category,
    product.description || '',
    product.created_at || '',
    product.variants ? JSON.stringify(product.variants) : ''
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `produk-injapan-food-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSVProducts = (csvText: string) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) throw new Error('CSV file harus memiliki header dan minimal 1 baris data');

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
  const requiredHeaders = ['nama produk', 'harga', 'kategori'];
  
  const missingHeaders = requiredHeaders.filter(header => 
    !headers.some(h => h.includes(header.replace(' ', '')))
  );
  
  if (missingHeaders.length > 0) {
    throw new Error(`Header yang diperlukan tidak ditemukan: ${missingHeaders.join(', ')}`);
  }

  const products = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    
    if (values.length < headers.length) continue;
    
    const product: any = {
      name: '',
      price: 0,
      category: '',
      description: '',
      stock: 0,
      status: 'active'
    };

    headers.forEach((header, index) => {
      const value = values[index] || '';
      
      if (header.includes('nama')) {
        product.name = value;
      } else if (header.includes('harga')) {
        product.price = parseInt(value.replace(/[^\d]/g, '')) || 0;
      } else if (header.includes('stok')) {
        product.stock = parseInt(value) || 0;
      } else if (header.includes('status')) {
        product.status = value || 'active';
      } else if (header.includes('kategori')) {
        product.category = value;
      } else if (header.includes('deskripsi')) {
        product.description = value;
      }
    });

    if (product.name && product.price && product.category) {
      products.push(product);
    }
  }

  return products;
};

export const exportOrdersToCSV = (orders: OrderTracking[]) => {
  const headers = [
    'ID Pesanan',
    'Nama Pelanggan',
    'Email',
    'Telepon', 
    'Total Amount',
    'Status',
    'Items',
    'Tanggal Pesanan'
  ];

  const csvData = orders.map(order => [
    order.id,
    order.customer_name,
    order.customer_email || '',
    order.customer_phone || '',
    order.total_amount,
    order.status,
    order.items.map(item => `${item.quantity}x ${item.name}`).join('; '),
    order.created_at
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `pesanan-injapan-food-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
