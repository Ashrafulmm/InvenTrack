import React from 'react';
import { useData } from '../store/DataContext';
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

export default function Dashboard() {
  const { products, sales, categories } = useData();

  const today = startOfDay(new Date());
  const last7Days = subDays(today, 7);
  const last30Days = subDays(today, 30);

  const todaySales = sales.filter(s => new Date(s.date) >= today && s.status === 'completed');
  const weekSales = sales.filter(s => new Date(s.date) >= last7Days && s.status === 'completed');
  const monthSales = sales.filter(s => new Date(s.date) >= last30Days && s.status === 'completed');

  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const weekRevenue = weekSales.reduce((sum, s) => sum + s.total, 0);
  const monthRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  // Revenue chart data (last 30 days)
  const revenueData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i);
    const daySales = sales.filter(s => {
      const saleDate = startOfDay(new Date(s.date));
      return saleDate.getTime() === date.getTime() && s.status === 'completed';
    });
    return {
      date: format(date, 'MMM dd'),
      revenue: daySales.reduce((sum, s) => sum + s.total, 0),
      sales: daySales.length,
    };
  });

  // Category distribution
  const categoryData = categories.map(cat => ({
    name: cat.name,
    value: products.filter(p => p.category === cat.name).length,
    color: cat.color,
  })).filter(c => c.value > 0);

  // Top products by sales
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  monthSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
      }
      productSalesMap[item.productId].quantity += item.quantity;
      productSalesMap[item.productId].revenue += item.total;
    });
  });
  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Payment method distribution
  const paymentData = [
    { name: 'Cash', value: monthSales.filter(s => s.paymentMethod === 'cash').length, color: '#10B981' },
    { name: 'Card', value: monthSales.filter(s => s.paymentMethod === 'card').length, color: '#3B82F6' },
    { name: 'Transfer', value: monthSales.filter(s => s.paymentMethod === 'transfer').length, color: '#8B5CF6' },
  ].filter(p => p.value > 0);

  const statCards = [
    {
      title: 'Today\'s Revenue',
      value: `$${todayRevenue.toFixed(2)}`,
      change: '+12.5%',
      positive: true,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Total Products',
      value: products.length.toString(),
      change: `${totalStock} units`,
      positive: true,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Monthly Sales',
      value: monthSales.length.toString(),
      change: `$${monthRevenue.toFixed(2)}`,
      positive: true,
      icon: ShoppingCart,
      color: 'bg-purple-500',
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockProducts.length.toString(),
      change: 'Needs attention',
      positive: false,
      icon: AlertTriangle,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                {card.positive ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-orange-500" />
                )}
                <span className={`text-sm font-medium ${card.positive ? 'text-green-600' : 'text-orange-600'}`}>
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Revenue Overview</h3>
            <span className="text-sm text-gray-500">Last 30 days</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Product Categories</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-2">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  <span className="text-gray-600">{cat.name}</span>
                </div>
                <span className="font-medium text-gray-800">{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Top Products (This Month)</h3>
          <div className="space-y-3">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.quantity} units sold</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-800">${product.revenue.toFixed(2)}</span>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No sales data available</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Low Stock Alerts</h3>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">{product.stock} left</p>
                  <p className="text-xs text-gray-500">Min: {product.minStock}</p>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <p className="text-sm text-green-600 text-center py-4">✓ All products are well stocked</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Sale ID</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Customer</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Items</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Payment</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Total</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-mono text-xs">{sale.id.slice(-8)}</td>
                  <td className="py-2.5 px-3">{sale.customerName}</td>
                  <td className="py-2.5 px-3">{sale.items.length} items</td>
                  <td className="py-2.5 px-3">
                    <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs">{sale.paymentMethod}</span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold">${sale.total.toFixed(2)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      sale.status === 'completed' ? 'bg-green-100 text-green-700' :
                      sale.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
