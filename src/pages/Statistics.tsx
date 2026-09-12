import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { format, subDays, startOfDay, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';

export default function Statistics() {
  const { products, sales, categories, loading } = useData();
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const completedSales = sales.filter(s => s.status === 'completed');

  const getTimeData = () => {
    const today = startOfDay(new Date());
    
    if (view === 'daily') {
      const days = Array.from({ length: 30 }, (_, i) => subDays(today, 29 - i));
      return days.map(day => {
        const daySales = completedSales.filter(s => startOfDay(new Date(s.created_at)).getTime() === day.getTime());
        return {
          label: format(day, 'MMM dd'),
          revenue: daySales.reduce((sum, s) => sum + s.total, 0),
          sales: daySales.length,
          profit: daySales.reduce((sum, s) => {
            return sum + s.items.reduce((iSum, item) => {
              const product = products.find(p => p.id === item.product_id);
              return iSum + (product ? (item.unit_price - product.cost) * item.quantity : 0);
            }, 0);
          }, 0),
        };
      });
    } else if (view === 'weekly') {
      const weeks = eachWeekOfInterval({ start: subDays(today, 90), end: today });
      return weeks.map(week => {
        const weekEnd = subDays(week, -6);
        const weekSales = completedSales.filter(s => {
          const d = startOfDay(new Date(s.created_at));
          return d >= week && d <= weekEnd;
        });
        return {
          label: format(week, 'MMM dd'),
          revenue: weekSales.reduce((sum, s) => sum + s.total, 0),
          sales: weekSales.length,
          profit: weekSales.reduce((sum, s) => {
            return sum + s.items.reduce((iSum, item) => {
              const product = products.find(p => p.id === item.product_id);
              return iSum + (product ? (item.unit_price - product.cost) * item.quantity : 0);
            }, 0);
          }, 0),
        };
      });
    } else {
      const months = eachMonthOfInterval({ start: subDays(today, 365), end: today });
      return months.map(month => {
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const monthSales = completedSales.filter(s => {
          const d = new Date(s.created_at);
          return d >= month && d <= monthEnd;
        });
        return {
          label: format(month, 'MMM yyyy'),
          revenue: monthSales.reduce((sum, s) => sum + s.total, 0),
          sales: monthSales.length,
          profit: monthSales.reduce((sum, s) => {
            return sum + s.items.reduce((iSum, item) => {
              const product = products.find(p => p.id === item.product_id);
              return iSum + (product ? (item.unit_price - product.cost) * item.quantity : 0);
            }, 0);
          }, 0),
        };
      });
    }
  };

  const timeData = getTimeData();

  // Hourly distribution
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourSales = completedSales.filter(s => new Date(s.created_at).getHours() === hour);
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      sales: hourSales.length,
      revenue: hourSales.reduce((sum, s) => sum + s.total, 0),
    };
  });

  // Category radar data
  const radarData = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat.name);
    const catSales = completedSales.filter(s => 
      s.items.some(i => products.find(p => p.id === i.product_id)?.category === cat.name)
    );
    return {
      category: cat.name.slice(0, 8),
      products: catProducts.length,
      sales: catSales.length,
      revenue: catSales.reduce((sum, s) => {
        return sum + s.items
          .filter(i => products.find(p => p.id === i.product_id)?.category === cat.name)
          .reduce((iSum, i) => iSum + i.total, 0);
      }, 0),
    };
  });

  // Price vs Quantity scatter
  const scatterData = products.map(p => {
    const productSales = completedSales.filter(s => s.items.some(i => i.product_id === p.id));
    const totalQty = productSales.reduce((sum, s) => {
      return sum + s.items.filter(i => i.product_id === p.id).reduce((iSum, i) => iSum + i.quantity, 0);
    }, 0);
    return {
      name: p.name,
      price: p.price,
      quantity: totalQty,
      stock: p.stock,
    };
  }).filter(d => d.quantity > 0);

  // Stock health
  const stockHealth = {
    healthy: products.filter(p => p.stock > p.min_stock * 2).length,
    adequate: products.filter(p => p.stock > p.min_stock && p.stock <= p.min_stock * 2).length,
    low: products.filter(p => p.stock <= p.min_stock && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  };

  // Profit margins by category
  const marginData = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat.name);
    const avgMargin = catProducts.length > 0
      ? catProducts.reduce((sum, p) => sum + ((p.price - p.cost) / p.price * 100), 0) / catProducts.length
      : 0;
    return {
      name: cat.name,
      margin: parseFloat(avgMargin.toFixed(1)),
      color: cat.color,
    };
  }).filter(d => d.margin > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2">
        {(['daily', 'weekly', 'monthly'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              view === v ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {v} View
          </button>
        ))}
      </div>

      {/* Revenue & Profit Chart */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Revenue vs Profit Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeData}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, '']} />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#colorRev)" name="Revenue" />
            <Area type="monotone" dataKey="profit" stroke="#10B981" fill="url(#colorProf)" name="Profit" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Sales Distribution */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Sales by Hour</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="sales" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Radar */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Category Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fontSize: 9 }} />
              <Radar name="Products" dataKey="products" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Radar name="Sales" dataKey="sales" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Price vs Quantity */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Price vs Sales Volume</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="price" name="Price" tick={{ fontSize: 11 }} label={{ value: 'Price ($)', position: 'bottom', fontSize: 11 }} />
              <YAxis dataKey="quantity" name="Quantity" tick={{ fontSize: 11 }} label={{ value: 'Qty Sold', angle: -90, position: 'left', fontSize: 11 }} />
              <ZAxis dataKey="stock" range={[50, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterData} fill="#F59E0B" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Health */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Stock Health</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stockHealth.healthy}</p>
              <p className="text-sm text-green-700">Healthy</p>
              <p className="text-xs text-green-600">&gt; 2x min stock</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{stockHealth.adequate}</p>
              <p className="text-sm text-blue-700">Adequate</p>
              <p className="text-xs text-blue-600">Above min stock</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">{stockHealth.low}</p>
              <p className="text-sm text-orange-700">Low Stock</p>
              <p className="text-xs text-orange-600">Below min stock</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{stockHealth.outOfStock}</p>
              <p className="text-sm text-red-700">Out of Stock</p>
              <p className="text-xs text-red-600">Zero quantity</p>
            </div>
          </div>
          {products.length > 0 && (
            <div className="mt-4">
              <div className="flex h-3 rounded-full overflow-hidden">
                <div className="bg-green-500" style={{ width: `${(stockHealth.healthy / products.length) * 100}%` }}></div>
                <div className="bg-blue-500" style={{ width: `${(stockHealth.adequate / products.length) * 100}%` }}></div>
                <div className="bg-orange-500" style={{ width: `${(stockHealth.low / products.length) * 100}%` }}></div>
                <div className="bg-red-500" style={{ width: `${(stockHealth.outOfStock / products.length) * 100}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profit Margins */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Average Profit Margins by Category</h3>
        <div className="space-y-3">
          {marginData.sort((a, b) => b.margin - a.margin).map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-28 text-sm font-medium text-gray-700 truncate">{item.name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                <div
                  className="h-4 rounded-full transition-all"
                  style={{ width: `${item.margin}%`, backgroundColor: item.color }}
                ></div>
              </div>
              <span className="w-12 text-sm font-bold text-right" style={{ color: item.color }}>{item.margin}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
