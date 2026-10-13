import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Plus, Search, Edit2, Trash2, X, Settings, Package } from 'lucide-react';

export interface StockAdjustment {
  id: string;
  product_id: string;
  product_name: string;
  previous_stock: number;
  new_stock: number;
  adjustment_type: 'increase' | 'decrease';
  reason: string;
  date: string;
  notes: string;
  created_at: string;
}

export default function StockAdjustments() {
  const { settings } = useData();
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredAdjustments = adjustments.filter(a => {
    const matchesSearch = a.product_name.toLowerCase().includes(search.toLowerCase()) ||
      a.reason.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || a.adjustment_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalAdjustments = adjustments.length;
  const increases = adjustments.filter(a => a.adjustment_type === 'increase').length;
  const decreases = adjustments.filter(a => a.adjustment_type === 'decrease').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search adjustments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Types</option>
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
          </select>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Adjustment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Adjustments</p>
          <p className="text-2xl font-bold text-gray-800">{totalAdjustments}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Increases</p>
          <p className="text-2xl font-bold text-green-600">{increases}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Decreases</p>
          <p className="text-2xl font-bold text-red-600">{decreases}</p>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Previous</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">New</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Reason</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No stock adjustments yet. Click "New Adjustment" to manually adjust stock levels.</p>
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map(adjustment => (
                  <tr key={adjustment.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{new Date(adjustment.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium">{adjustment.product_name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        adjustment.adjustment_type === 'increase' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {adjustment.adjustment_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{adjustment.previous_stock}</td>
                    <td className="py-3 px-4 text-right font-semibold">{adjustment.new_stock}</td>
                    <td className="py-3 px-4 text-gray-600">{adjustment.reason}</td>
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
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">New Stock Adjustment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-center py-8">Stock adjustment form coming soon...</p>
              <p className="text-sm text-gray-500 text-center">This feature will allow you to manually adjust stock levels for inventory corrections.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
