import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Plus, Edit2, Trash2, X, CreditCard, Building2, Smartphone } from 'lucide-react';

export interface PaymentAccount {
  id: string;
  name: string;
  type: 'bank' | 'mobile_banking' | 'cash' | 'card';
  account_number?: string;
  bank_name?: string;
  balance: number;
  is_active: boolean;
  created_at: string;
}

export default function PaymentAccounts() {
  const { settings } = useData();
  const sym = settings.currency_symbol;
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [showModal, setShowModal] = useState(false);

  const totalBalance = accounts.filter(a => a.is_active).reduce((sum, a) => sum + a.balance, 0);
  const activeAccounts = accounts.filter(a => a.is_active).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank': return Building2;
      case 'mobile_banking': return Smartphone;
      case 'card': return CreditCard;
      default: return CreditCard;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Manage your payment accounts and methods</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {/* Stats */}
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
          <p className="text-2xl font-bold text-blue-600">{accounts.length}</p>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-100 p-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-gray-500">No payment accounts yet. Click "Add Account" to get started.</p>
          </div>
        ) : (
          accounts.map(account => {
            const Icon = getIcon(account.type);
            return (
              <div key={account.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      account.type === 'bank' ? 'bg-blue-100' :
                      account.type === 'mobile_banking' ? 'bg-purple-100' :
                      'bg-green-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        account.type === 'bank' ? 'text-blue-600' :
                        account.type === 'mobile_banking' ? 'text-purple-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{account.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{account.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    account.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {account.account_number && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="text-gray-500">Account:</span> {account.account_number}
                  </p>
                )}
                {account.bank_name && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="text-gray-500">Bank:</span> {account.bank_name}
                  </p>
                )}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="text-xl font-bold text-gray-800">{sym}{account.balance.toFixed(2)}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    <Edit2 className="w-4 h-4 mx-auto" />
                  </button>
                  <button className="flex-1 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Add Payment Account</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-center py-8">Payment account form coming soon...</p>
              <p className="text-sm text-gray-500 text-center">This feature will allow you to manage bank accounts, mobile banking, and other payment methods.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
