import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { Download, FileText, TrendingUp, DollarSign, Package, Users } from 'lucide-react';

export default function Reports() {
  const { products, sales, categories } = useData();
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  const today = startOfDay(new Date());
  const startDate = subDays(today, parseInt(period));
  
  const periodSales = sales.filter(s => {
    const saleDate = startOfDay(new Date(s.date));
    return saleDate >= startDate && saleDate <= today && s.status === 'completed';
  });

  // Daily sales data
  const days = eachDayOfInterval({ start: startDate, end: today });
  const dailyData = days.map(day => {
    const daySales = periodSales.filter(s => startOfDay(new Date(s.date)).getTime() === day.getTime());
    return {
      date: format(day, 'MMM dd'),
      revenue: daySales.reduce((sum, s) => sum + s.total, 0),
      sales: daySales.length,
      items: daySales.reduce((sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0), 0),
    };
  });

  // Profit analysis
  const profitData = periodSales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const profit = (item.unitPrice - product.cost) * item.quantity;
        acc.revenue += item.total;
        acc.cost += product.cost * item.quantity;
        acc.profit += profit;
      }
    });
    return acc;
  }, { revenue: 0, cost: 0, profit: 0 });

  // Category performance
  const categoryPerformance = categories.map(cat => {
    const catSales = periodSales.filter(s => 
      s.items.some(i => products.find(p => p.id === i.productId)?.category === cat.name)
    );
    const revenue = catSales.reduce((sum, s) => {
      return sum + s.items
        .filter(i => products.find(p => p.id === i.productId)?.category === cat.name)
        .reduce((iSum, i) => iSum + i.total, 0);
    }, 0);
    return { name: cat.name, revenue, color: cat.color };
  }).filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue);

  // Payment breakdown
  const paymentBreakdown = [
    { name: 'Cash', value: periodSales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0), color: '#10B981' },
    { name: 'Card', value: periodSales.filter(s => s.paymentMethod === 'card').reduce((sum, s) => sum + s.total, 0), color: '#3B82F6' },
    { name: 'Transfer', value: periodSales.filter(s => s.paymentMethod === 'transfer').reduce((sum, s) => sum + s.total, 0), color: '#8B5CF6' },
  ].filter(p => p.value > 0);

  // Top selling products
  const productMap: Record<string, { name: string; qty: number; revenue: number; profit: number }> = {};
  periodSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!productMap[item.productId]) {
        productMap[item.productId] = { name: item.productName, qty: 0, revenue: 0, profit: 0 };
      }
      productMap[item.productId].qty += item.quantity;
      productMap[item.productId].revenue += item.total;
      if (product) {
        productMap[item.productId].profit += (item.unitPrice - product.cost) * item.quantity;
      }
    });
  });
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Inventory value
  const inventoryValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
  const retailValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  const handleExportCSV = () => {
    const headers = ['Date', 'Sale ID', 'Customer', 'Items', 'Subtotal', 'Tax', 'Discount', 'Total', 'Payment', 'Status'];
    const rows = periodSales.map(s => [
      format(new Date(s.date), 'yyyy-MM-dd HH:mm'),
      s.id,
      s.customerName,
      s.items.length,
      s.subtotal.toFixed(2),
      s.tax.toFixed(2),
      s.discount.toFixed(2),
      s.total.toFixed(2),
      s.paymentMethod,
      s.status,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${format(today, 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Period Selector & Export */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex gap-2">
          {(['7', '30', '90'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p} Days
            </button>
          ))}
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">Total Revenue</span>
          </div>
          <p className="text-xl font-bold text-gray-800">${periodSales.reduce((s, sale) => s + sale.total, 0).toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Net Profit</span>
          </div>
          <p className="text-xl font-bold text-gray-800">${profitData.profit.toFixed(2)}</p>
          <p className="text-xs text-green-600">Margin: {profitData.revenue > 0 ? ((profitData.profit / profitData.revenue) * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">Items Sold</span>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {periodSales.reduce((s, sale) => s + sale.items.reduce((is, i) => is + i.quantity, 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500">Transactions</span>
          </div>
          <p className="text-xl font-bold text-gray-800">{periodSales.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Volume */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Sales Volume</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#8B5CF6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="items" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Category Performance</h3>
          <div className="space-y-3">
            {categoryPerformance.map((cat, idx) => {
              const maxRevenue = Math.max(...categoryPerformance.map(c => c.revenue));
              const width = maxRevenue > 0 ? (cat.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                    <span className="text-gray-600">${cat.revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${width}%`, backgroundColor: cat.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Methods</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {paymentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {paymentBreakdown.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{p.name}</p>
                    <p className="text-xs text-gray-500">${p.value.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Top Selling Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">#</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Qty Sold</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Revenue</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Profit</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Margin</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, idx) => (
                <tr key={idx} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium">{product.name}</td>
                  <td className="py-3 px-4 text-right">{product.qty}</td>
                  <td className="py-3 px-4 text-right font-medium">${product.revenue.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-green-600">${product.profit.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-green-600 font-medium">
                      {product.revenue > 0 ? ((product.profit / product.revenue) * 100).toFixed(1) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Report */}
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Inventory Valuation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600">Cost Value</p>
            <p className="text-2xl font-bold text-blue-800">${inventoryValue.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600">Retail Value</p>
            <p className="text-2xl font-bold text-green-800">${retailValue.toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600">Potential Profit</p>
            <p className="text-2xl font-bold text-purple-800">${(retailValue - inventoryValue).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
