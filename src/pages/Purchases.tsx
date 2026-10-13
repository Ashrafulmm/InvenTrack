import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Plus, Search, Edit2, Trash2, X, Package, DollarSign, Calendar } from 'lucide-react';

export interface Purchase {
  id: string;
  supplier: string;
  invoice_number: string;
  date: string;
  items: { product_id: string; product_name: string; quantity: number; unit_cost: number; total: number }[];
  subtotal: number;
  tax: number;
  total: number;
  payment_status: 'paid' | 'partial' | 'unpaid';
  payment_method: string;
  notes: string;
  created_at: string;
}

export default function Purchases() {
  const { settings } = useData();
  const sym = settings.currency_symbol;
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const filteredPurchases = purchases.filter(p =>
    p.supplier.toLowerCase().includes(search.toLowerCase()) ||
    p.invoice_number.toLowerCase().includes(search.toLowerCase())
  );

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const paidPurchases = purchases.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + p.total, 0);
  const unpaidPurchases = purchases.filter(p => p.payment_status !== 'paid').reduce((sum, p) => sum + p.total, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search purchases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Purchase
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Purchases</p>
          <p className="text-2xl font-bold text-gray-800">{sym}{totalPurchases.toFixed(2)}</p>
          <p className="text-xs text-gray-400">{purchases.length} orders</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-2xl font-bold text-green-600">{sym}{paidPurchases.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Unpaid</p>
          <p className="text-2xl font-bold text-red-600">{sym}{unpaidPurchases.toFixed(2)}</p>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Invoice #</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Items</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No purchases yet. Click "New Purchase" to add one.</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(purchase => (
                  <tr key={purchase.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{new Date(purchase.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-mono text-xs">{purchase.invoice_number}</td>
                    <td className="py-3 px-4 font-medium">{purchase.supplier}</td>
                    <td className="py-3 px-4 text-center">{purchase.items.length}</td>
                    <td className="py-3 px-4 text-right font-semibold">{sym}{purchase.total.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        purchase.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                        purchase.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {purchase.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">New Purchase</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-center py-8">Purchase form coming soon...</p>
              <p className="text-sm text-gray-500 text-center">This feature will allow you to record purchases from suppliers and automatically update stock levels.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
