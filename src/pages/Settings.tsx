import React, { useState, useEffect } from 'react';
import { useData } from '../store/DataContext';
import { useAuth } from '../store/AuthContext';
import { Save, Database, Download, RefreshCw, CheckCircle, Truck, Store, Key } from 'lucide-react';

export default function Settings() {
  const { products, sales, categories, settings, updateSettings, refreshData } = useData();
  const { user } = useAuth();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => { setLocalSettings(settings); }, [settings]);

  const handleSave = async () => {
    await updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
    const data = { products, sales, categories, settings, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'courier', label: 'Courier API', icon: Truck },
    { id: 'database', label: 'Database', icon: Database },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /><span>Settings saved successfully!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-lg border border-gray-100 p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === tab.id ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <h3 className="font-semibold text-gray-800 text-lg">Store Settings</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input type="text" value={localSettings.store_name} onChange={(e) => setLocalSettings({ ...localSettings, store_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select value={localSettings.currency} onChange={(e) => {
                const symbols: Record<string, string> = { BDT: '৳', USD: '$', EUR: '€', GBP: '£', INR: '₹' };
                setLocalSettings({ ...localSettings, currency: e.target.value, currency_symbol: symbols[e.target.value] || e.target.value });
              }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="BDT">BDT - Bangladeshi Taka</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
              <input type="text" value={localSettings.currency_symbol} onChange={(e) => setLocalSettings({ ...localSettings, currency_symbol: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input type="number" min="0" max="100" value={localSettings.tax_rate} onChange={(e) => setLocalSettings({ ...localSettings, tax_rate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Delivery Charge ({localSettings.currency_symbol})</label>
            <input type="number" min="0" value={localSettings.default_delivery_charge} onChange={(e) => setLocalSettings({ ...localSettings, default_delivery_charge: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
            <Save className="w-4 h-4" />Save Settings
          </button>
        </div>
      )}

      {/* Courier Tab */}
      {activeTab === 'courier' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2"><Truck className="w-5 h-5 text-blue-600" />Steadfast Courier API</h3>
            <p className="text-sm text-gray-500 mt-1">Connect your Steadfast account to create orders and track shipments automatically.</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium">How to get API credentials:</p>
            <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://portal.steadfast.com.bd" target="_blank" rel="noopener" className="underline font-medium">portal.steadfast.com.bd</a></li>
              <li>Login → Settings → API Integration</li>
              <li>Copy your API Key and API Secret</li>
              <li>Paste them below</li>
            </ol>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Key className="w-3 h-3" />API Key</label>
            <input type="text" value={localSettings.steadfast_api_key} onChange={(e) => setLocalSettings({ ...localSettings, steadfast_api_key: e.target.value })} placeholder="Enter your Steadfast API Key" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Key className="w-3 h-3" />API Secret</label>
            <input type="password" value={localSettings.steadfast_api_secret} onChange={(e) => setLocalSettings({ ...localSettings, steadfast_api_secret: e.target.value })} placeholder="Enter your Steadfast API Secret" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
            <input type="text" value={localSettings.steadfast_endpoint} onChange={(e) => setLocalSettings({ ...localSettings, steadfast_endpoint: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
              <Save className="w-4 h-4" />Save API Settings
            </button>
            {localSettings.steadfast_api_key && (
              <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" />Configured</span>
            )}
          </div>
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-800 mb-2">Other Courier Services</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="border border-gray-200 rounded-lg p-3 text-center">
                <p className="font-medium text-gray-800">Pathao</p>
                <p className="text-xs text-gray-500 mt-1">Coming Soon</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 text-center">
                <p className="font-medium text-gray-800">RedX</p>
                <p className="text-xs text-gray-500 mt-1">Coming Soon</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 text-center">
                <p className="font-medium text-gray-800">eCourier</p>
                <p className="text-xs text-gray-500 mt-1">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2"><Database className="w-5 h-5 text-purple-600" />Supabase Database</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-4"><p className="text-sm text-gray-500">Products</p><p className="text-2xl font-bold text-gray-800">{products.length}</p></div>
              <div className="bg-gray-50 rounded-lg p-4"><p className="text-sm text-gray-500">Sales</p><p className="text-2xl font-bold text-gray-800">{sales.length}</p></div>
              <div className="bg-gray-50 rounded-lg p-4"><p className="text-sm text-gray-500">Categories</p><p className="text-2xl font-bold text-gray-800">{categories.length}</p></div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-green-700"><strong>Connected to Supabase</strong></p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Data Management</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"><Download className="w-4 h-4" />Export Data</button>
              <button onClick={refreshData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><RefreshCw className="w-4 h-4" />Refresh</button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-3">User</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">{user?.name?.charAt(0).toUpperCase()}</div>
              <div><p className="font-medium text-gray-800">{user?.name}</p><p className="text-sm text-gray-500">{user?.email}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
