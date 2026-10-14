import React, { useState } from 'react';
import { useData, StockAdjustment } from '../store/DataContext';
import { Plus, Search, Trash2, X, Settings } from 'lucide-react';
import SearchableProductSelect from '../components/SearchableProductSelect';

export default function StockAdjustments() {
  const { products, stockAdjustments, addStockAdjustment, deleteStockAdjustment } = useData();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    previous_stock: 0,
    new_stock: 0,
    adjustment_type: 'increase' as 'increase' | 'decrease',
    reason: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const filteredAdjustments = stockAdjustments.filter(a => {
    const matchesSearch = a.product_name.toLowerCase().includes(search.toLowerCase()) || a.reason.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || a.adjustment_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData({ ...formData, product_id: productId, product_name: product.name, previous_stock: product.stock, new_stock: product.stock });
    }
  };

  const handleTypeChange = (type: 'increase' | 'decrease') => {
    setFormData({ ...formData, adjustment_type: type, new_stock: formData.previous_stock });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || !formData.reason) {
      alert('Please select a product and provide a reason');
      return;
    }
    if (formData.adjustment_type === 'increase' && formData.new_stock <= formData.previous_stock) {
      alert('New stock must be greater than previous stock for increase');
      return;
    }
    if (formData.adjustment_type === 'decrease' && formData.new_stock >= formData.previous_stock) {
      alert('New stock must be less than previous stock for decrease');
      return;
    }
    await addStockAdjustment(formData);
    setShowModal(false);
    setFormData({ product_id: '', product_name: '', previous_stock: 0, new_stock: 0, adjustment_type: 'increase', reason: '', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search adjustments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Types</option>
            <option value="increase">Increase</option>
            <option value="decrease">Decrease</option>
          </select>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" />New Adjustment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Adjustments</p>
          <p className="text-2xl font-bold text-gray-800">{stockAdjustments.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Increases</p>
          <p className="text-2xl font-bold text-green-600">{stockAdjustments.filter(a => a.adjustment_type === 'increase').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Decreases</p>
          <p className="text-2xl font-bold text-red-600">{stockAdjustments.filter(a => a.adjustment_type === 'decrease').length}</p>
        </div>
      </div>

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
                    <p>No stock adjustments yet.</p>
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map(adj => (
                  <tr key={adj.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{new Date(adj.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium">{adj.product_name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${adj.adjustment_type === 'increase' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {adj.adjustment_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{adj.previous_stock}</td>
                    <td className="py-3 px-4 text-right font-semibold">{adj.new_stock}</td>
                    <td className="py-3 px-4 text-gray-600">{adj.reason}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => { if (confirm('Delete this adjustment?')) deleteStockAdjustment(adj.id); }} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
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
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">New Stock Adjustment</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <SearchableProductSelect
                  products={products}
                  value={formData.product_id}
                  onChange={handleProductSelect}
                  currencySymbol="৳"
                  placeholder="Search product by name or SKU..."
                />
              </div>
              {formData.product_id && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-800">Current Stock: <strong>{formData.previous_stock}</strong></p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                  <select value={formData.adjustment_type} onChange={(e) => handleTypeChange(e.target.value as any)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Stock *</label>
                  <input type="number" required min="0" value={formData.new_stock} onChange={(e) => setFormData({ ...formData, new_stock: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <select value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required>
                  <option value="">Select reason...</option>
                  <option value="Stock count correction">Stock count correction</option>
                  <option value="Damaged goods">Damaged goods</option>
                  <option value="Theft/Loss">Theft/Loss</option>
                  <option value="Returned items">Returned items</option>
                  <option value="Found items">Found items</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
