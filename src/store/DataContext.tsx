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
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount: number;
  delivery_charge: number;
  tax: number;
  total: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'mobile_banking';
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  courier_service: string;
  tracking_id: string;
  status: 'completed' | 'pending' | 'cancelled' | 'delivered' | 'shipped';
  notes: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  created_at?: string;
}

export interface Settings {
  store_name: string;
  currency: string;
  currency_symbol: string;
  tax_rate: number;
  default_delivery_charge: number;
  steadfast_api_key: string;
  steadfast_api_secret: string;
  steadfast_endpoint: string;
}

interface DataContextType {
  products: Product[];
  sales: Sale[];
  categories: Category[];
  settings: Settings;
  loading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'created_at'>) => Promise<void>;
  updateSale: (id: string, sale: Partial<Sale>) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'created_at'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const defaultSettings: Settings = {
  store_name: 'InvenTrack Store',
  currency: 'BDT',
  currency_symbol: '৳',
  tax_rate: 0,
  default_delivery_charge: 60,
  steadfast_api_key: '',
  steadfast_api_secret: '',
  steadfast_endpoint: 'https://portal.steadfast.com.bd/api/v1',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Fetch products
      let productsData: Product[] = [];
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.warn('Products table not found or error:', error.message);
        } else {
          productsData = data || [];
        }
      } catch (err) {
        console.warn('Failed to fetch products:', err);
      }

      // Fetch categories
      let categoriesData: Category[] = [];
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: true });
        
        if (error) {
          console.warn('Categories table not found or error:', error.message);
        } else {
          categoriesData = data || [];
        }
      } catch (err) {
        console.warn('Failed to fetch categories:', err);
      }

      // Fetch sales with items
      let salesData: any[] = [];
      try {
        const { data, error } = await supabase
          .from('sales')
          .select('*, sale_items(*)')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.warn('Sales table not found or error:', error.message);
        } else {
          salesData = data || [];
        }
      } catch (err) {
        console.warn('Failed to fetch sales:', err);
      }

      const transformedSales: Sale[] = salesData.map(sale => ({
        id: sale.id,
        items: sale.sale_items || [],
        subtotal: sale.subtotal,
        discount_type: sale.discount_type || 'percentage',
        discount_value: sale.discount_value || 0,
        discount: sale.discount,
        delivery_charge: sale.delivery_charge || 0,
        tax: sale.tax,
        total: sale.total,
        payment_method: sale.payment_method,
        customer_name: sale.customer_name,
        customer_phone: sale.customer_phone || '',
        delivery_address: sale.delivery_address || '',
        courier_service: sale.courier_service || '',
        tracking_id: sale.tracking_id || '',
        status: sale.status,
        notes: sale.notes || '',
        created_at: sale.created_at,
      }));

      setProducts(productsData);
      setCategories(categoriesData);
      setSales(transformedSales);

      // Load settings from localStorage
      try {
        const savedSettings = localStorage.getItem('app_settings');
        if (savedSettings) {
          setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
        }
      } catch (err) {
        console.warn('Failed to load settings:', err);
      }
    } catch (error) {
      console.error('Critical error in refreshData:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) {
        console.error('Failed to add product:', error);
        alert('Failed to add product: ' + error.message);
        return;
      }
      setProducts(prev => [data, ...prev]);
    } catch (err) {
      console.error('Exception adding product:', err);
      alert('Failed to add product. Please check your database connection.');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Failed to update product:', error);
        alert('Failed to update product: ' + error.message);
        return;
      }
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      ));
    } catch (err) {
      console.error('Exception updating product:', err);
      alert('Failed to update product.');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product: ' + error.message);
        return;
      }
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Exception deleting product:', err);
      alert('Failed to delete product.');
    }
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'created_at'>) => {
    try {
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{
          subtotal: sale.subtotal,
          discount_type: sale.discount_type,
          discount_value: sale.discount_value,
          discount: sale.discount,
          delivery_charge: sale.delivery_charge,
          tax: sale.tax,
          total: sale.total,
          payment_method: sale.payment_method,
          customer_name: sale.customer_name,
          customer_phone: sale.customer_phone,
          delivery_address: sale.delivery_address,
          courier_service: sale.courier_service,
          tracking_id: sale.tracking_id,
          status: sale.status,
          notes: sale.notes,
        }])
        .select()
        .single();

      if (saleError) {
        console.error('Failed to add sale:', saleError);
        alert('Failed to record sale: ' + saleError.message);
        return;
      }

      if (sale.items.length > 0) {
        const saleItems = sale.items.map(item => ({
          sale_id: saleData.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        }));

        const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
        if (itemsError) {
          console.error('Failed to add sale items:', itemsError);
        }
      }

      // Update stock
      for (const item of sale.items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          await updateProduct(item.product_id, { stock: product.stock - item.quantity });
        }
      }

      const newSale: Sale = { ...saleData, items: sale.items };
      setSales(prev => [newSale, ...prev]);
    } catch (err) {
      console.error('Exception adding sale:', err);
      alert('Failed to record sale. Please check your database connection.');
    }
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    try {
      const { error } = await supabase.from('sales').update(updates).eq('id', id);
      if (error) {
        console.error('Failed to update sale:', error);
        alert('Failed to update sale: ' + error.message);
        return;
      }
      setSales(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (err) {
      console.error('Exception updating sale:', err);
      alert('Failed to update sale.');
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase.from('categories').insert([category]).select().single();
      if (error) {
        console.error('Failed to add category:', error);
        alert('Failed to add category: ' + error.message);
        return;
      }
      setCategories(prev => [...prev, data]);
    } catch (err) {
      console.error('Exception adding category:', err);
      alert('Failed to add category.');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category: ' + error.message);
        return;
      }
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Exception deleting category:', err);
      alert('Failed to delete category.');
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('app_settings', JSON.stringify(updated));
  };

  return (
    <DataContext.Provider value={{
      products, sales, categories, settings, loading,
      addProduct, updateProduct, deleteProduct,
      addSale, updateSale,
      addCategory, deleteCategory,
      updateSettings, refreshData,
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
