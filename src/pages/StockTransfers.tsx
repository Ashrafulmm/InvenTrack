import React, { useState } from 'react';
import { useData, StockTransfer } from '../store/DataContext';
import { Plus, Search, Trash2, X, ArrowRightLeft } from 'lucide-react';

export default function StockTransfers() {
  const { products, stockTransfers, addStockTransfer, deleteStockTransfer } = useData();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    from_location: '',
    to_location: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as { product_id: string; product_name: string; quantity: number }[],
    status: 'pending' as 'pending' | 'completed' | 'cancelled',
    notes: '',
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const filteredTransfers = stockTransfers.filter(t => {
    const matchesSearch = t.from_location.toLowerCase().includes(search.toLowerCase()) || t.to_location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product || quantity <= 0) return;
    setFormData({ ...formData, items: [...formData.items, { product_id: product.id, product_name: product.name, quantity }] });
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.from_location || !formData.to_location || formData.items.length === 0) {
      alert('Please fill locations and add items');
      return;
    }
    await addStockTransfer(formData);
    setShowModal(false);
    setFormData({ from_location: '', to_location: '', date: new Date().toISOString().split('T')[0], items: [], status: 'pending', notes: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search transfers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" />New Transfer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Transfers</p>
          <p className="text-2xl font-bold text-gray-800">{stockTransfers.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stockTransfers.filter(t => t.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stockTransfers.filter(t => t.status === 'completed').length}</p>
        </div>
      </div>

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
                    <p>No stock transfers yet.</p>
                  </td>
                </tr>
              ) : (
                filteredTransfers.map(transfer => (
                  <tr key={transfer.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{new Date(transfer.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium">{transfer.from_location}</td>
                    <td className="py-3 px-4 text-center"><ArrowRightLeft className="w-4 h-4 text-gray-400 mx-auto" /></td>
                    <td className="py-3 px-4 font-medium">{transfer.to_location}</td>
                    <td className="py-3 px-4 text-center">{transfer.items.length}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${transfer.status === 'completed' ? 'bg-green-100 text-green-700' : transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {transfer.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => { if (confirm('Delete this transfer?')) deleteStockTransfer(transfer.id); }} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-lg">New Stock Transfer</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Location *</label>
                  <input type="text" required value={formData.from_location} onChange={(e) => setFormData({ ...formData, from_location: e.target.value })} placeholder="e.g., Main Warehouse" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Location *</label>
                  <input type="text" required value={formData.to_location} onChange={(e) => setFormData({ ...formData, to_location: e.target.value })} placeholder="e.g., Store A" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Add Items</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="sm:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="">Select product...</option>
                    {products.filter(p => p.stock > 0).map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
                  </select>
                  <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} placeholder="Qty" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <button type="button" onClick={addItem} disabled={!selectedProduct || quantity <= 0} className="mt-2 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  <Plus className="w-4 h-4" />Add Item
                </button>
              </div>

              {formData.items.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-3">Items ({formData.items.length})</h4>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3">Product</th>
                        <th className="text-right py-2 px-3">Quantity</th>
                        <th className="text-center py-2 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-50">
                          <td className="py-2 px-3">{item.product_name}</td>
                          <td className="py-2 px-3 text-right">{item.quantity}</td>
                          <td className="py-2 px-3 text-center">
                            <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
