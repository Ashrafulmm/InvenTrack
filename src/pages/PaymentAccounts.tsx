import React, { useState } from 'react';
import { useData, PaymentAccount } from '../store/DataContext';
import { Plus, Edit2, Trash2, X, CreditCard, Building2, Smartphone, Banknote } from 'lucide-react';

export default function PaymentAccounts() {
  const { paymentAccounts, settings, addPaymentAccount, deletePaymentAccount } = useData();
  const sym = settings.currency_symbol;
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as 'bank' | 'mobile_banking' | 'cash' | 'card',
    account_number: '',
    bank_name: '',
    balance: 0,
    is_active: true,
  });

  const totalBalance = paymentAccounts.filter(a => a.is_active).reduce((sum, a) => sum + a.balance, 0);
  const activeAccounts = paymentAccounts.filter(a => a.is_active).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank': return Building2;
      case 'mobile_banking': return Smartphone;
      case 'cash': return Banknote;
      default: return CreditCard;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'bank': return 'bg-blue-100 text-blue-600';
      case 'mobile_banking': return 'bg-purple-100 text-purple-600';
      case 'cash': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please enter account name');
      return;
    }
    await addPaymentAccount(formData);
    setShowModal(false);
    setFormData({ name: '', type: 'bank', account_number: '', bank_name: '', balance: 0, is_active: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Manage your payment accounts and methods</p>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" />Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Balance</p>
          <p className="text-2xl font-bold text-gray-800">{sym}{totalBalance.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Active Accounts</p>
          <p className="text-2xl font-bold text-green-600">{activeAccounts}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Accounts</p>
          <p className="text-2xl font-bold text-blue-600">{paymentAccounts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentAccounts.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-100 p-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-gray-500">No payment accounts yet. Click "Add Account" to get started.</p>
          </div>
        ) : (
          paymentAccounts.map(account => {
            const Icon = getIcon(account.type);
            const colorClass = getColor(account.type);
            return (
              <div key={account.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{account.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{account.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${account.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {account.account_number && <p className="text-sm text-gray-600 mb-1"><span className="text-gray-500">Account:</span> {account.account_number}</p>}
                {account.bank_name && <p className="text-sm text-gray-600 mb-2"><span className="text-gray-500">Bank:</span> {account.bank_name}</p>}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-xl font-bold text-gray-800">{sym}{account.balance.toFixed(2)}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { if (confirm('Delete this account?')) deletePaymentAccount(account.id); }} className="flex-1 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Add Payment Account</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., DBBL Savings" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="bank">Bank Account</option>
                  <option value="mobile_banking">Mobile Banking (bKash/Nagad)</option>
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input type="text" value={formData.account_number} onChange={(e) => setFormData({ ...formData, account_number: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input type="text" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance ({sym})</label>
                  <input type="number" step="0.01" value={formData.balance || ''} onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
