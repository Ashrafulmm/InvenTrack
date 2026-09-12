import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id?: string;
  sale_id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'transfer';
  customer_name: string;
  status: 'completed' | 'pending' | 'cancelled';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  created_at?: string;
}

interface DataContextType {
  products: Product[];
  sales: Sale[];
  categories: Category[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'created_at'>) => Promise<void>;
  updateSale: (id: string, sale: Partial<Sale>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data from Supabase
  const refreshData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch sales with items
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*, sale_items(*)')
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      // Transform sales data to include items array
      const transformedSales: Sale[] = (salesData || []).map(sale => ({
        id: sale.id,
        items: sale.sale_items || [],
        subtotal: sale.subtotal,
        tax: sale.tax,
        discount: sale.discount,
        total: sale.total,
        payment_method: sale.payment_method,
        customer_name: sale.customer_name,
        status: sale.status,
        created_at: sale.created_at,
      }));

      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setSales(transformedSales);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;
    
    setProducts(prev => [data, ...prev]);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    ));
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'created_at'>) => {
    // Insert sale first
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{
        subtotal: sale.subtotal,
        tax: sale.tax,
        discount: sale.discount,
        total: sale.total,
        payment_method: sale.payment_method,
        customer_name: sale.customer_name,
        status: sale.status,
      }])
      .select()
      .single();

    if (saleError) throw saleError;

    // Insert sale items
    if (sale.items.length > 0) {
      const saleItems = sale.items.map(item => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;
    }

    // Update stock for each product
    for (const item of sale.items) {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        await updateProduct(item.product_id, { stock: product.stock - item.quantity });
      }
    }

    // Add to local state
    const newSale: Sale = {
      ...saleData,
      items: sale.items,
    };
    setSales(prev => [newSale, ...prev]);
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    const { error } = await supabase
      .from('sales')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    setSales(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;

    setCategories(prev => [...prev, data]);
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <DataContext.Provider value={{
      products, sales, categories, loading,
      addProduct, updateProduct, deleteProduct,
      addSale, updateSale,
      addCategory, deleteCategory,
      refreshData,
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
