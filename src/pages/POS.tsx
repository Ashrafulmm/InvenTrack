import React, { useState } from 'react';
import { useData, SaleItem } from '../store/DataContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, ArrowRightLeft, CheckCircle, Smartphone, Truck, Percent } from 'lucide-react';

export default function POS() {
  const { products, categories, addSale, settings, loading } = useData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'mobile_banking'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const sym = settings.currency_symbol;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory && p.stock > 0;
  });

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existingItem = cart.find(item => item.product_id === productId);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) return;
      setCart(cart.map(item => item.product_id === productId ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price } : item));
    } else {
      setCart([...cart, { product_id: product.id, product_name: product.name, quantity: 1, unit_price: product.price, total: product.price }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        if (product && newQty > product.stock) return item;
        return { ...item, quantity: newQty, total: newQty * item.unit_price };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => setCart(cart.filter(item => item.product_id !== productId));

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discount = discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * (settings.tax_rate / 100);
  const total = taxableAmount + tax + deliveryCharge;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    await addSale({
      items: cart, subtotal, discount_type: discountType, discount_value: discountValue, discount,
      delivery_charge: deliveryCharge, tax, total, payment_method: paymentMethod,
      customer_name: customerName || 'Walk-in Customer', customer_phone: customerPhone,
      delivery_address: '', courier_service: '', tracking_id: '', status: 'completed', notes: '',
    });
    setCart([]); setCustomerName(''); setCustomerPhone(''); setDiscountValue(0); setDeliveryCharge(0);
    setShowCheckout(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)]">
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search products by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
            {search && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                {filteredProducts.length} found
              </div>
            )}
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 content-start">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No products found matching "{search}"</p>
            </div>
          ) : filteredProducts.map(product => (
            <button key={product.id} onClick={() => addToCart(product.id)} className="bg-white border border-gray-100 rounded-xl p-3 text-left hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="w-full h-14 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-2 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
              <p className="text-xs text-gray-500">{product.sku}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold text-blue-600">{sym}{product.price.toFixed(2)}</span>
                <span className="text-xs text-gray-400">{product.stock}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:w-96 bg-white rounded-xl border border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-blue-600" />Current Sale</h3>
            <span className="text-sm text-gray-500">{cart.length} items</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.product_id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                <p className="text-xs text-gray-500">{sym}{item.unit_price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQuantity(item.product_id, -1)} className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                <span className="w-7 text-center text-sm font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product_id, 1)} className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
              </div>
              <span className="text-sm font-semibold w-16 text-right">{sym}{item.total.toFixed(2)}</span>
              <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 p-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">{sym}{subtotal.toFixed(2)}</span></div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <div className="flex items-center gap-1">
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="px-1 py-1 border border-gray-200 rounded text-xs">
                <option value="percentage">%</option>
                <option value="fixed">{sym}</option>
              </select>
              <input type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))} className="w-14 px-2 py-1 border border-gray-200 rounded text-sm text-right" />
            </div>
          </div>
          {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-{sym}{discount.toFixed(2)}</span></div>}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Delivery</span>
            <input type="number" min="0" value={deliveryCharge} onChange={(e) => setDeliveryCharge(Math.max(0, parseFloat(e.target.value) || 0))} className="w-20 px-2 py-1 border border-gray-200 rounded text-sm text-right" />
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total</span><span className="text-blue-600">{sym}{total.toFixed(2)}</span></div>

          <button onClick={() => setShowCheckout(true)} disabled={cart.length === 0} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Checkout — {sym}{total.toFixed(2)}
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Complete Sale</h3>
            <div className="space-y-3">
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone (optional)" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {[{ v: 'cash', l: 'Cash', i: Banknote }, { v: 'card', l: 'Card', i: CreditCard }, { v: 'mobile_banking', l: 'Mobile', i: Smartphone }, { v: 'transfer', l: 'Transfer', i: ArrowRightLeft }].map(p => (
                    <button key={p.v} type="button" onClick={() => setPaymentMethod(p.v as any)} className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition ${paymentMethod === p.v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                      <p.i className="w-4 h-4" />{p.l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total</span><span className="text-blue-600">{sym}{total.toFixed(2)}</span></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCheckout(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCheckout} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Confirm Sale</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-5 h-5" /><span className="font-medium">Sale completed!</span>
        </div>
      )}
    </div>
  );
}
