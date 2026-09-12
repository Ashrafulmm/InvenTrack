import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  customerName: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

interface DataContextType {
  products: Product[];
  sales: Sale[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultCategories: Category[] = [
  { id: '1', name: 'Electronics', color: '#3B82F6' },
  { id: '2', name: 'Clothing', color: '#10B981' },
  { id: '3', name: 'Food & Beverages', color: '#F59E0B' },
  { id: '4', name: 'Office Supplies', color: '#8B5CF6' },
  { id: '5', name: 'Home & Garden', color: '#EF4444' },
  { id: '6', name: 'Health & Beauty', color: '#EC4899' },
];

const defaultProducts: Product[] = [
  { id: '1', name: 'Wireless Mouse', sku: 'ELC-001', category: 'Electronics', price: 29.99, cost: 15.00, stock: 150, minStock: 20, description: 'Ergonomic wireless mouse', createdAt: '2024-01-15', updatedAt: '2024-01-15' },
  { id: '2', name: 'USB-C Cable', sku: 'ELC-002', category: 'Electronics', price: 12.99, cost: 4.50, stock: 300, minStock: 50, description: '6ft USB-C charging cable', createdAt: '2024-01-16', updatedAt: '2024-01-16' },
  { id: '3', name: 'Cotton T-Shirt', sku: 'CLT-001', category: 'Clothing', price: 24.99, cost: 8.00, stock: 200, minStock: 30, description: 'Premium cotton t-shirt', createdAt: '2024-01-17', updatedAt: '2024-01-17' },
  { id: '4', name: 'Notebook A5', sku: 'OFS-001', category: 'Office Supplies', price: 5.99, cost: 2.00, stock: 500, minStock: 100, description: 'A5 lined notebook', createdAt: '2024-01-18', updatedAt: '2024-01-18' },
  { id: '5', name: 'Bluetooth Speaker', sku: 'ELC-003', category: 'Electronics', price: 49.99, cost: 22.00, stock: 75, minStock: 15, description: 'Portable bluetooth speaker', createdAt: '2024-01-19', updatedAt: '2024-01-19' },
  { id: '6', name: 'Coffee Beans 1kg', sku: 'FNB-001', category: 'Food & Beverages', price: 18.99, cost: 9.00, stock: 120, minStock: 25, description: 'Premium arabica coffee beans', createdAt: '2024-01-20', updatedAt: '2024-01-20' },
  { id: '7', name: 'Desk Lamp', sku: 'HMG-001', category: 'Home & Garden', price: 34.99, cost: 14.00, stock: 60, minStock: 10, description: 'LED desk lamp with dimmer', createdAt: '2024-01-21', updatedAt: '2024-01-21' },
  { id: '8', name: 'Hand Cream', sku: 'HLB-001', category: 'Health & Beauty', price: 14.99, cost: 5.00, stock: 180, minStock: 30, description: 'Moisturizing hand cream 100ml', createdAt: '2024-01-22', updatedAt: '2024-01-22' },
  { id: '9', name: 'Mechanical Keyboard', sku: 'ELC-004', category: 'Electronics', price: 89.99, cost: 40.00, stock: 45, minStock: 10, description: 'RGB mechanical keyboard', createdAt: '2024-01-23', updatedAt: '2024-01-23' },
  { id: '10', name: 'Yoga Mat', sku: 'HMG-002', category: 'Home & Garden', price: 29.99, cost: 12.00, stock: 80, minStock: 15, description: 'Non-slip yoga mat', createdAt: '2024-01-24', updatedAt: '2024-01-24' },
];

const generateSales = (): Sale[] => {
  const sales: Sale[] = [];
  const paymentMethods: ('cash' | 'card' | 'transfer')[] = ['cash', 'card', 'transfer'];
  const statuses: ('completed' | 'pending' | 'cancelled')[] = ['completed', 'completed', 'completed', 'completed', 'pending', 'cancelled'];
  
  for (let i = 0; i < 50; i++) {
    const numItems = Math.floor(Math.random() * 4) + 1;
    const items: SaleItem[] = [];
    let subtotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const product = defaultProducts[Math.floor(Math.random() * defaultProducts.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const total = product.price * quantity;
      subtotal += total;
      items.push({
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        total,
      });
    }
    
    const tax = subtotal * 0.08;
    const discount = Math.random() > 0.7 ? subtotal * 0.1 : 0;
    const total = subtotal + tax - discount;
    
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    sales.push({
      id: `sale-${i + 1}`,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      customerName: `Customer ${i + 1}`,
      date: date.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  
  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('inventory_products');
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('inventory_sales');
    return saved ? JSON.parse(saved) : generateSales();
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('inventory_categories');
    return saved ? JSON.parse(saved) : defaultCategories;
  });

  useEffect(() => {
    localStorage.setItem('inventory_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('inventory_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('inventory_categories', JSON.stringify(categories));
  }, [categories]);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : p
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addSale = (sale: Omit<Sale, 'id' | 'date'>) => {
    const newSale: Sale = {
      ...sale,
      id: `sale-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setSales(prev => [newSale, ...prev]);
    
    // Update stock
    sale.items.forEach(item => {
      setProducts(prev => prev.map(p => 
        p.id === item.productId ? { ...p, stock: p.stock - item.quantity, updatedAt: new Date().toISOString().split('T')[0] } : p
      ));
    });
  };

  const updateSale = (id: string, updates: Partial<Sale>) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: Date.now().toString() }]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <DataContext.Provider value={{
      products, sales, categories,
      addProduct, updateProduct, deleteProduct,
      addSale, updateSale,
      addCategory, deleteCategory,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
