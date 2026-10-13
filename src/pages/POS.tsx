import React, { useState } from 'react';
import { useData, SaleItem } from '../store/DataContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, ArrowRightLeft, CheckCircle } from 'lucide-react';

export default function POS() {
  const { products, categories, addSale, loading } = useData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory && p.stock > 0;
  });

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.product_id === productId);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) return;
      setCart(cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
        total: product.price,
      }]);
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

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.08;
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal + tax - discountAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    await addSale({
      items: cart,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      payment_method: paymentMethod,
      customer_name: customerName || 'Walk-in Customer',
      status: 'completed',
    });

    setCart([]);
    setCustomerName('');
    setDiscount(0);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)]">
      {/* Products Section */}
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">All</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 content-start">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product.id)}
              className="bg-white border border-gray-100 rounded-xl p-3 text-left hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="w-full h-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-2 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
              <p className="text-xs text-gray-500">{product.sku}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold text-blue-600">${product.price.toFixed(2)}</span>
                <span className="text-xs text-gray-400">{product.stock} left</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="lg:w-96 bg-white rounded-xl border border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              Current Sale
            </h3>
            <span className="text-sm text-gray-500">{cart.length} items</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs">Click products to add them</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.product_name}</p>
                  <p className="text-xs text-gray-500">${item.unit_price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.product_id, -1)}
                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-100"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product_id, 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded text-gray-600 hover:bg-gray-100"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm font-semibold w-16 text-right">${item.total.toFixed(2)}</span>
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100 p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (8%)</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-right"
              />
              <span className="text-gray-500">%</span>
            </div>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount Amount</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span className="text-blue-600">${total.toFixed(2)}</span>
          </div>

          <input
            type="text"
            placeholder="Customer name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-colors ${
                paymentMethod === 'cash' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
              }`}
            >
              <Banknote className="w-4 h-4" />
              Cash
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-colors ${
                paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Card
            </button>
            <button
              onClick={() => setPaymentMethod('transfer')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-colors ${
                paymentMethod === 'transfer' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              Transfer
            </button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Complete Sale — ${total.toFixed(2)}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Sale completed successfully!</span>
        </div>
      )}
    </div>
  );
}
