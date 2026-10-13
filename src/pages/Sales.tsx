import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Search, Eye, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Sales() {
  const { sales, loading } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedSale, setSelectedSale] = useState<string | null>(null);

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || s.status === statusFilter;
    const matchesPayment = !paymentFilter || s.payment_method === paymentFilter;
    const matchesDateFrom = !dateFrom || new Date(s.created_at) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(s.created_at) <= new Date(dateTo + 'T23:59:59');
    return matchesSearch && matchesStatus && matchesPayment && matchesDateFrom && matchesDateTo;
  });

  const totalRevenue = filteredSales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total, 0);
  const totalSales = filteredSales.filter(s => s.status === 'completed').length;
  const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  const saleDetail = sales.find(s => s.id === selectedSale);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sales..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Payments</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="transfer">Transfer</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Completed Sales</p>
          <p className="text-xl font-bold text-blue-600">{totalSales}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-xs text-gray-500">Average Sale</p>
          <p className="text-xl font-bold text-purple-600">${avgSale.toFixed(2)}</p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Sale ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Payment</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => (
                <tr key={sale.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs">{sale.id.slice(-8)}</td>
                  <td className="py-3 px-4 text-gray-600">{format(new Date(sale.created_at), 'MMM dd, yyyy HH:mm')}</td>
                  <td className="py-3 px-4">{sale.customer_name}</td>
                  <td className="py-3 px-4 text-center">{sale.items.length}</td>
                  <td className="py-3 px-4">
                    <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs">{sale.payment_method}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">${sale.total.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      sale.status === 'completed' ? 'bg-green-100 text-green-700' :
                      sale.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedSale(sale.id)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSales.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No sales found matching your filters</p>
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      {saleDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Sale Details</h3>
              <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Sale ID</p>
                  <p className="font-mono font-medium">{saleDetail.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">{format(new Date(saleDetail.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium">{saleDetail.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment</p>
                  <p className="font-medium capitalize">{saleDetail.payment_method}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Items</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-gray-500">Product</th>
                      <th className="text-right py-2 text-gray-500">Qty</th>
                      <th className="text-right py-2 text-gray-500">Price</th>
                      <th className="text-right py-2 text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleDetail.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-50">
                        <td className="py-2">{item.product_name}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">${item.unit_price.toFixed(2)}</td>
                        <td className="py-2 text-right font-medium">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${saleDetail.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${saleDetail.tax.toFixed(2)}</span>
                </div>
                {saleDetail.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${saleDetail.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">${saleDetail.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  saleDetail.status === 'completed' ? 'bg-green-100 text-green-700' :
                  saleDetail.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {saleDetail.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
