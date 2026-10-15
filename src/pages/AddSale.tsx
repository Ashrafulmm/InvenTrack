import React, { useState } from 'react';
import { useData, SaleItem } from '../store/DataContext';
import { Plus, Trash2, CheckCircle, Truck, Percent, Edit3, Package, AlertCircle } from 'lucide-react';
import SearchableProductSelect from '../components/SearchableProductSelect';

interface EditableSaleItem extends SaleItem {
  editPrice: number;
  editQuantity: number;
}

export default function AddSale() {
  const { products, addSale, settings } = useData();
  const [items, setItems] = useState<EditableSaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
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
    
    // Check if product already in cart
    const existing = items.find(i => i.product_id === selectedProduct);
    if (existing) {
      // If already exists, just select it for editing
      setSelectedProduct('');
      return;
    }

    // Add new item with editable fields
    const newItem: EditableSaleItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      unit_price: product.price,
      total: product.price,
      editPrice: product.price,
      editQuantity: 1,
    };
    
    setItems([...items, newItem]);
    setSelectedProduct('');
  };

  const updateItemPrice = (productId: string, newPrice: number) => {
    setItems(items.map(item => {
      if (item.product_id === productId) {
        const quantity = item.editQuantity;
        return {
          ...item,
          editPrice: newPrice,
          unit_price: newPrice,
          total: newPrice * quantity,
        };
      }
      return item;
    }));
  };

  const updateItemQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Validate stock
    if (newQuantity > product.stock) {
      alert(`Only ${product.stock} items available in stock!`);
      return;
    }
    
    if (newQuantity < 1) {
      return;
    }

    setItems(items.map(item => {
      if (item.product_id === productId) {
        return {
          ...item,
          editQuantity: newQuantity,
          quantity: newQuantity,
          total: item.editPrice * newQuantity,
        };
      }
      return item;
    }));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.product_id !== productId));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discount = discountType === 'percentage' ? subtotal * (discountValue / 100) : discountValue;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * (settings.tax_rate / 100);
  const total = taxableAmount + tax + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    await addSale({
      items: items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      })),
      subtotal,
      discount_type: discountType,
      discount_value: discountValue,
      discount,
      delivery_charge: deliveryCharge,
      tax,
      total,
      payment_method: paymentMethod,
      customer_name: customerName || 'Walk-in Customer',
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      courier_service: courierService,
      tracking_id: '',
      status: deliveryAddress ? 'pending' : 'completed',
      notes,
    });
    
    setItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDeliveryAddress('');
    setDiscountValue(0);
    setDeliveryCharge(settings.default_delivery_charge);
    setCourierService('');
    setNotes('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getProductStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.stock : 0;
  };

  const getRemainingStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const item = items.find(i => i.product_id === productId);
    if (!product || !item) return 0;
    return product.stock - item.editQuantity;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {showSuccess && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Sale recorded successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Search Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Add Products to Sale
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchableProductSelect
                products={products}
                value={selectedProduct}
                onChange={setSelectedProduct}
                currencySymbol={sym}
                onlyInStock={true}
                placeholder="Search product by name, SKU, or category..."
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              disabled={!selectedProduct}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add to Sale
            </button>
          </div>
          {selectedProduct && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected:</strong> {products.find(p => p.id === selectedProduct)?.name}
                {' '} • Stock: <strong>{getProductStock(selectedProduct)}</strong>
                {' '} • Price: <strong>{sym}{products.find(p => p.id === selectedProduct)?.price.toFixed(2)}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Items Table with Editable Fields */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-600" />
              Sale Items ({items.length})
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Click on price or quantity to edit)
              </span>
            </h3>
          </div>
          
          {items.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No items added yet</p>
              <p className="text-sm mt-1">Search and add products above to start building your sale</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 w-32">
                      <div className="flex items-center justify-end gap-1">
                        <Edit3 className="w-3 h-3" />
                        Price
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 w-32">
                      <div className="flex items-center justify-center gap-1">
                        <Edit3 className="w-3 h-3" />
                        Quantity
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 w-20">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const stock = getProductStock(item.product_id);
                    const remaining = getRemainingStock(item.product_id);
                    const isLowStock = remaining < stock * 0.2;
                    
                    return (
                      <tr key={item.product_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-800">{item.product_name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {products.find(p => p.id === item.product_id)?.sku}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div>
                            <p className={`font-semibold ${isLowStock ? 'text-orange-600' : 'text-gray-700'}`}>
                              {stock}
                            </p>
                            <p className="text-xs text-gray-500">
                              After: {remaining}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-gray-500 text-xs">{sym}</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.editPrice}
                              onChange={(e) => updateItemPrice(item.product_id, parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1.5 border border-gray-300 rounded text-right text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.product_id, item.editQuantity - 1)}
                              disabled={item.editQuantity <= 1}
                              className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={stock}
                              value={item.editQuantity}
                              onChange={(e) => updateItemQuantity(item.product_id, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1.5 border border-gray-300 rounded text-center text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.product_id, item.editQuantity + 1)}
                              disabled={item.editQuantity >= stock}
                              className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <p className="font-bold text-blue-600 text-base">{sym}{item.total.toFixed(2)}</p>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sale Details & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer & Delivery Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Customer & Delivery Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
              <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Leave empty for walk-in / pickup"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>
            
            {deliveryAddress && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  Courier Service
                </label>
                <select
                  value={courierService}
                  onChange={(e) => setCourierService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
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
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Payment & Pricing */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Percent className="w-5 h-5 text-blue-600" />
              Payment & Pricing
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="mobile_banking">Mobile Banking (bKash/Nagad)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed ({sym})</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                <input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Truck className="w-3 h-3" />
                Delivery Charge ({sym})
              </label>
              <input
                type="number"
                min="0"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Summary */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({items.length} items)</span>
                <span className="font-medium">{sym}{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount {discountType === 'percentage' ? `(${discountValue}%)` : ''}</span>
                  <span>-{sym}{discount.toFixed(2)}</span>
                </div>
              )}
              {settings.tax_rate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax ({settings.tax_rate}%)</span>
                  <span>{sym}{tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charge</span>
                <span>{sym}{deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">{sym}{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={items.length === 0}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Record Sale — {sym}{total.toFixed(2)}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
