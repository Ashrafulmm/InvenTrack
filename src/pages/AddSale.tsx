import React, { useState } from 'react';
import { useData, SaleItem } from '../store/DataContext';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

export default function AddSale() {
  const { products, addSale } = useData();
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [discount, setDiscount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    if (quantity <= 0 || quantity > product.stock) return;

    const existing = items.find(i => i.productId === selectedProduct);
    if (existing) {
      setItems(items.map(i =>
        i.productId === selectedProduct
          ? { ...i, quantity: i.quantity + quantity, total: (i.quantity + quantity) * i.unitPrice }
          : i
      ));
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        total: product.price * quantity,
      }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.08;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal + tax - discountAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    addSale({
      items,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      paymentMethod,
      customerName: customerName || 'Walk-in Customer',
      status: 'completed',
    });

    setItems([]);
    setCustomerName('');
    setDiscount(0);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {showSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Sale recorded successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Add Items Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Add Items</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a product...</option>
              {products.filter(p => p.stock > 0).map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - ${p.price.toFixed(2)} - Stock: {p.stock}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-24 px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
              placeholder="Qty"
            />
            <button
              type="button"
              onClick={addItem}
              disabled={!selectedProduct}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Sale Items ({items.length})</h3>
          </div>
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No items added yet. Select a product above to add items.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-5 font-medium text-gray-600">Product</th>
                  <th className="text-right py-3 px-5 font-medium text-gray-600">Unit Price</th>
                  <th className="text-center py-3 px-5 font-medium text-gray-600">Quantity</th>
                  <th className="text-right py-3 px-5 font-medium text-gray-600">Total</th>
                  <th className="text-center py-3 px-5 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.productId} className="border-t border-gray-50">
                    <td className="py-3 px-5 font-medium">{item.productName}</td>
                    <td className="py-3 px-5 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-5 text-center">{item.quantity}</td>
                    <td className="py-3 px-5 text-right font-medium">${item.total.toFixed(2)}</td>
                    <td className="py-3 px-5 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sale Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Sale Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'transfer')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({discount}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={items.length === 0}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Record Sale
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
