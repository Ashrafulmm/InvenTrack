import React, { useState } from 'react';
import { useData, SaleItem } from '../store/DataContext';
import { Plus, Trash2, CheckCircle, Truck, Percent } from 'lucide-react';

export default function AddSale() {
  const { products, addSale, settings } = useData();
  const [items, setItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'mobile_banking'>('cash');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(settings.default_delivery_charge);
  const [courierService, setCourierService] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const sym = settings.currency_symbol;

  const addItem = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    if (quantity <= 0 || quantity > product.stock) return;
    const existing = items.find(i => i.product_id === selectedProduct);
    if (existing) {
      setItems(items.map(i => i.product_id === selectedProduct ? { ...i, quantity: i.quantity + quantity, total: (i.quantity + quantity) * i.unit_price } : i));
    } else {
      setItems([...items, { product_id: product.id, product_name: product.name, quantity, unit_price: product.price, total: product.price * quantity }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItem = (productId: string) => setItems(items.filter(i => i.product_id !== productId));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * (settings.tax_rate / 100);
  const total = taxableAmount + tax + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    await addSale({
      items, subtotal, discount_type: discountType, discount_value: discountValue, discount, delivery_charge: deliveryCharge,
      tax, total, payment_method: paymentMethod, customer_name: customerName || 'Walk-in Customer',
      customer_phone: customerPhone, delivery_address: deliveryAddress, courier_service: courierService,
      tracking_id: '', status: deliveryAddress ? 'pending' : 'completed', notes,
    });
    setItems([]); setCustomerName(''); setCustomerPhone(''); setDeliveryAddress('');
    setDiscountValue(0); setDeliveryCharge(settings.default_delivery_charge); setCourierService(''); setNotes('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {showSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /><span className="font-medium">Sale recorded successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Add Items</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option value="">Select a product...</option>
              {products.filter(p => p.stock > 0).map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku}) - {sym}{p.price.toFixed(2)} - Stock: {p.stock}</option>
              ))}
            </select>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-24 px-3 py-2.5 border border-gray-200 rounded-lg text-sm" placeholder="Qty" />
            <button type="button" onClick={addItem} disabled={!selectedProduct} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              <Plus className="w-4 h-4" />Add
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100"><h3 className="font-semibold text-gray-800">Sale Items ({items.length})</h3></div>
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-400"><p>No items added yet.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-5 font-medium text-gray-600">Product</th>
                    <th className="text-right py-3 px-5 font-medium text-gray-600">Unit Price</th>
                    <th className="text-center py-3 px-5 font-medium text-gray-600">Qty</th>
                    <th className="text-right py-3 px-5 font-medium text-gray-600">Total</th>
                    <th className="text-center py-3 px-5 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.product_id} className="border-t border-gray-50">
                      <td className="py-3 px-5 font-medium">{item.product_name}</td>
                      <td className="py-3 px-5 text-right">{sym}{item.unit_price.toFixed(2)}</td>
                      <td className="py-3 px-5 text-center">{item.quantity}</td>
                      <td className="py-3 px-5 text-right font-medium">{sym}{item.total.toFixed(2)}</td>
                      <td className="py-3 px-5 text-center">
                        <button type="button" onClick={() => removeItem(item.product_id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Customer & Delivery</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in Customer" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
              <textarea value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Leave empty for walk-in / pickup" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
            </div>
            {deliveryAddress && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Truck className="w-4 h-4" />Courier Service</label>
                <select value={courierService} onChange={(e) => setCourierService(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="">Select courier (optional)</option>
                  <option value="steadfast">Steadfast Courier</option>
                  <option value="pathao">Pathao</option>
                  <option value="redx">RedX</option>
                  <option value="self">Self Delivery</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Payment & Pricing</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="mobile_banking">Mobile Banking (bKash/Nagad)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Percent className="w-3 h-3" />Discount Type</label>
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed ({sym})</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Truck className="w-3 h-3" />Delivery Charge ({sym})</label>
              <input type="number" min="0" value={deliveryCharge} onChange={(e) => setDeliveryCharge(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">{sym}{subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount {discountType === 'percentage' ? `(${discountValue}%)` : ''}</span><span>-{sym}{discount.toFixed(2)}</span></div>}
              {settings.tax_rate > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">Tax ({settings.tax_rate}%)</span><span>{sym}{tax.toFixed(2)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-gray-600">Delivery Charge</span><span>{sym}{deliveryCharge.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total</span><span className="text-blue-600">{sym}{total.toFixed(2)}</span></div>
            </div>

            <button type="submit" disabled={items.length === 0} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Record Sale — {sym}{total.toFixed(2)}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
