import React, { useState } from 'react';
import { useData, Purchase } from '../store/DataContext';
import { Plus, Search, Trash2, X, Package } from 'lucide-react';
import SearchableProductSelect from '../components/SearchableProductSelect';

export default function Purchases() {
  const { products, purchases, settings, addPurchase, deletePurchase } = useData();
  const sym = settings.currency_symbol;
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    supplier: '',
    invoice_number: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as { product_id: string; product_name: string; quantity: number; unit_cost: number; total: number }[],
    payment_status: 'unpaid' as 'paid' | 'partial' | 'unpaid',
    payment_method: 'cash',
    notes: '',
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  const filteredPurchases = purchases.filter(p =>
    p.supplier.toLowerCase().includes(search.toLowerCase()) ||
    p.invoice_number.toLowerCase().includes(search.toLowerCase())
  );

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const paidPurchases = purchases.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + p.total, 0);
  const unpaidPurchases = purchases.filter(p => p.payment_status !== 'paid').reduce((sum, p) => sum + p.total, 0);

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product || quantity <= 0 || unitCost <= 0) return;

    const newItem = {
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_cost: unitCost,
      total: quantity * unitCost,
    };

    setFormData({ ...formData, items: [...formData.items, newItem] });
    setSelectedProduct('');
    setQuantity(1);
    setUnitCost(0);
  };

  const removeItem = (index: number) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier || !formData.invoice_number || formData.items.length === 0) {
      alert('Please fill all required fields and add at least one item');
      return;
    }

    await addPurchase({ ...formData, subtotal, tax, total });
    setShowModal(false);
    setFormData({
      supplier: '',
      invoice_number: '',
      date: new Date().toISOString().split('T')[0],
      items: [],
      payment_status: 'unpaid',
      payment_method: 'cash',
      notes: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search purchases..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" />New Purchase
        </button>
      </div>

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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${purchase.payment_status === 'paid' ? 'bg-green-100 text-green-700' : purchase.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {purchase.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => { if (confirm('Delete this purchase?')) deletePurchase(purchase.id); }} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
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
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold text-lg">New Purchase</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <input type="text" required value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice # *</label>
                  <input type="text" required value={formData.invoice_number} onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Add Items</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <SearchableProductSelect
                      products={products}
                      value={selectedProduct}
                      onChange={setSelectedProduct}
                      currencySymbol={sym}
                      placeholder="Search product by name or SKU..."
                    />
                  </div>
                  <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 0)} placeholder="Qty" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                  <input type="number" min="0" step="0.01" value={unitCost} onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)} placeholder="Cost" className="px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <button type="button" onClick={addItem} disabled={!selectedProduct || quantity <= 0 || unitCost <= 0} className="mt-2 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
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
                        <th className="text-right py-2 px-3">Qty</th>
                        <th className="text-right py-2 px-3">Cost</th>
                        <th className="text-right py-2 px-3">Total</th>
                        <th className="text-center py-2 px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-50">
                          <td className="py-2 px-3">{item.product_name}</td>
                          <td className="py-2 px-3 text-right">{item.quantity}</td>
                          <td className="py-2 px-3 text-right">{sym}{item.unit_cost.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-medium">{sym}{item.total.toFixed(2)}</td>
                          <td className="py-2 px-3 text-center">
                            <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-medium">
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right">Subtotal:</td>
                        <td className="py-2 px-3 text-right">{sym}{subtotal.toFixed(2)}</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-right">Tax (5%):</td>
                        <td className="py-2 px-3 text-right">{sym}{tax.toFixed(2)}</td>
                        <td></td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td colSpan={3} className="py-2 px-3 text-right font-bold">Total:</td>
                        <td className="py-2 px-3 text-right font-bold text-blue-600">{sym}{total.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                  <select value={formData.payment_status} onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as any })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="mobile">Mobile Banking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save Purchase</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
