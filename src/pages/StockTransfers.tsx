import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Plus, Search, Edit2, Trash2, X, ArrowRightLeft, Package } from 'lucide-react';

export interface StockTransfer {
  id: string;
  from_location: string;
  to_location: string;
  date: string;
  items: { product_id: string; product_name: string; quantity: number }[];
  status: 'pending' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
}

export default function StockTransfers() {
  const { settings } = useData();
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = t.from_location.toLowerCase().includes(search.toLowerCase()) ||
      t.to_location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalTransfers = transfers.length;
  const pendingTransfers = transfers.filter(t => t.status === 'pending').length;
  const completedTransfers = transfers.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transfers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Transfer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Transfers</p>
          <p className="text-2xl font-bold text-gray-800">{totalTransfers}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingTransfers}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedTransfers}</p>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">From</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600"></th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">To</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Items</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <ArrowRightLeft className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No stock transfers yet. Click "New Transfer" to move stock between locations.</p>
                  </td>
                </tr>
              ) : (
                filteredTransfers.map(transfer => (
                  <tr key={transfer.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{new Date(transfer.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium">{transfer.from_location}</td>
                    <td className="py-3 px-4 text-center">
                      <ArrowRightLeft className="w-4 h-4 text-gray-400 mx-auto" />
                    </td>
                    <td className="py-3 px-4 font-medium">{transfer.to_location}</td>
                    <td className="py-3 px-4 text-center">{transfer.items.length}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transfer.status === 'completed' ? 'bg-green-100 text-green-700' :
                        transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {transfer.status}
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
              <h3 className="font-semibold text-lg">New Stock Transfer</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-center py-8">Stock transfer form coming soon...</p>
              <p className="text-sm text-gray-500 text-center">This feature will allow you to transfer stock between different locations or warehouses.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
