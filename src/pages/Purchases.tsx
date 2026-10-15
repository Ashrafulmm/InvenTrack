import React, { useState, useMemo } from 'react';
import { useData, Purchase } from '../store/DataContext';
import { Plus, Search, Trash2, X, Package, Edit3 } from 'lucide-react';
import SearchableProductSelect from '../components/SearchableProductSelect';

interface PurchaseItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total: number;
}

export default function Purchases() {
  const { products, purchases, settings, addPurchase, deletePurchase } = useData();
  const sym = settings.currency_symbol;
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    supplier: '',
    invoice_number: '',
    date: new Date().toISOString().split('T')[0],
    items: [] as PurchaseItem[],
    delivery_charge: 0,
    payment_status: 'unpaid' as 'paid' | 'partial' | 'unpaid',
    payment_method: 'cash',
    notes: '',
  });

  const filteredPurchases = purchases.filter(p =>
    p.supplier.toLowerCase().includes(search.toLowerCase()) ||
    p.invoice_number.toLowerCase().includes(search.toLowerCase())
  );

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const paidPurchases = purchases.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + p.total, 0);
  const unpaidPurchases = purchases.filter(p => p.payment_status !== 'paid').reduce((sum, p) => sum + p.total, 0);

  const addItem = (product: typeof products[0]) => {
    // Check if already in list - if so, increase quantity
    const existing = formData.items.find(i => i.product_id === product.id);
    if (existing) {
      setFormData({
        ...formData,
        items: formData.items.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_cost }
            : item
        ),
      });
      return;
    }

    const newItem: PurchaseItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_cost: product.cost,
      total: product.cost,
    };

    setFormData({ ...formData, items: [...formData.items, newItem] });
  };

  const removeItem = (productId: string) => {
    setFormData({ ...formData, items: formData.items.filter(i => i.product_id !== productId) });
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setFormData({
      ...formData,
      items: formData.items.map(item =>
        item.product_id === productId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.unit_cost }
          : item
      ),
    });
  };

  const updateItemCost = (productId: string, newCost: number) => {
    if (newCost < 0) return;
    setFormData({
      ...formData,
      items: formData.items.map(item =>
        item.product_id === productId
          ? { ...item, unit_cost: newCost, total: item.quantity * newCost }
          : item
      ),
    });
  };

  // Calculate totals - use useMemo to ensure recalculation on every render
  const itemsTotal = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  }, [formData.items]);
  
  const grandTotal = useMemo(() => {
    return itemsTotal + formData.delivery_charge;
  }, [itemsTotal, formData.delivery_charge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplier || !formData.invoice_number || formData.items.length === 0) {
      alert('Please fill all required fields and add at least one item');
      return;
    }

    await addPurchase({ ...formData, subtotal: itemsTotal, tax: 0, delivery_charge: formData.delivery_charge, total: grandTotal });
    setShowModal(false);
    setFormData({
      supplier: '',
      invoice_number: '',
      date: new Date().toISOString().split('T')[0],
      items: [],
      delivery_charge: 0,
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
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(purchase.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{purchase.invoice_number}</td>
                    <td className="py-3 px-4 font-medium">{purchase.supplier}</td>
                    <td className="py-3 px-4 text-center">{purchase.items.length}</td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {sym}{purchase.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          purchase.payment_status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : purchase.payment_status === 'partial'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {purchase.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm('Delete this purchase?')) deletePurchase(purchase.id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      >
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
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-lg">New Purchase</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Supplier & Invoice Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="e.g., ABC Supplier"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice # *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    placeholder="INV-001"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Add Product Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Add Products
                  </h4>
                  {formData.items.length > 0 && (
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                      <p className="text-xs opacity-80">Running Total</p>
                      <p className="text-lg font-bold">{sym}{itemsTotal.toFixed(2)}</p>
                    </div>
                  )}
                </div>
                <SearchableProductSelect
                  products={products}
                  value=""
                  onChange={() => {}}
                  onSelect={addItem}
                  instantAdd={true}
                  currencySymbol={sym}
                  placeholder="Click a product to add instantly..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Click any product from the list to add it. Click again to increase quantity.
                </p>
              </div>

              {/* Items Table with Editable Fields */}
              {formData.items.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    Purchase Items ({formData.items.length})
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      (Edit price and quantity directly)
                    </span>
                  </h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            Product
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 w-40">
                            <div className="flex items-center justify-center gap-1">
                              <Edit3 className="w-3 h-3" />
                              Quantity
                            </div>
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 w-40">
                            <div className="flex items-center justify-end gap-1">
                              <Edit3 className="w-3 h-3" />
                              Unit Cost
                            </div>
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-700 w-32">
                            Total
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 w-20">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item) => (
                          <tr
                            key={item.product_id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-800">{item.product_name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {products.find(p => p.id === item.product_id)?.sku}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateItemQuantity(item.product_id, item.quantity - 1)
                                  }
                                  disabled={item.quantity <= 1}
                                  className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItemQuantity(
                                      item.product_id,
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className="w-16 px-2 py-1.5 border border-gray-300 rounded text-center text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateItemQuantity(item.product_id, item.quantity + 1)
                                  }
                                  className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-gray-500 text-xs">{sym}</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unit_cost}
                                  onChange={(e) =>
                                    updateItemCost(
                                      item.product_id,
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-24 px-2 py-1.5 border border-gray-300 rounded text-right text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <p className="font-bold text-blue-600 text-base">
                                {sym}{item.total.toFixed(2)}
                              </p>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => removeItem(item.product_id)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-medium">
                        <tr>
                          <td colSpan={3} className="py-2 px-4 text-right text-gray-600">
                            Items Total:
                          </td>
                          <td className="py-2 px-4 text-right font-medium">
                            {sym}{itemsTotal.toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="py-2 px-4 text-right text-gray-600">
                            Delivery Charge:
                          </td>
                          <td className="py-2 px-4 text-right font-medium">
                            {sym}{formData.delivery_charge.toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                        <tr className="bg-blue-50 border-t-2 border-blue-200">
                          <td colSpan={3} className="py-3 px-4 text-right font-bold text-base">
                            Grand Total:
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-blue-600 text-lg">
                            {sym}{grandTotal.toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {formData.items.length === 0 && (
                <div className="border-t pt-4">
                  <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-lg">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No items added yet. Search and add products above.</p>
                  </div>
                </div>
              )}

              {/* Delivery Charge */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Charge ({sym})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.delivery_charge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      delivery_charge: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Add delivery/transport charges for this purchase
                </p>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="mobile">Mobile Banking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Save Purchase — {sym}{grandTotal.toFixed(2)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
