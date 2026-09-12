import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Save, Database, Trash2, Download, Upload, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { products, sales, categories, refreshData } = useData();
  const [taxRate, setTaxRate] = useState(8);
  const [storeName, setStoreName] = useState('InvenTrack Store');
  const [currency, setCurrency] = useState('USD');
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    localStorage.setItem('settings', JSON.stringify({ taxRate, storeName, currency }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
    const data = {
      products,
      sales,
      categories,
      settings: { taxRate, storeName, currency },
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = async () => {
    await refreshData();
    alert('Data refreshed from Supabase!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Store Settings */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Save className="w-5 h-5 text-blue-600" />
          Store Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CNY">CNY (¥)</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Database Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          Supabase Database
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Products</p>
            <p className="text-2xl font-bold text-gray-800">{products.length}</p>
            <p className="text-xs text-gray-400">records</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Sales</p>
            <p className="text-2xl font-bold text-gray-800">{sales.length}</p>
            <p className="text-xs text-gray-400">transactions</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
            <p className="text-xs text-gray-400">categories</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-sm text-green-700">
            <strong>Connected to Supabase</strong> — Your data is stored in a cloud database.
          </p>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-green-600" />
          Data Management
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Export All Data (JSON)
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh from Database
            </button>
          </div>
        </div>
      </div>

      {/* Vercel Deployment Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">🚀 Vercel Deployment</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-800">Your app is connected to Supabase!</p>
            <p className="mt-1 text-blue-700">
              To deploy on Vercel, add these environment variables in your Vercel project settings:
            </p>
            <div className="mt-2 bg-white rounded p-2 font-mono text-xs">
              <p>VITE_SUPABASE_URL = https://nfprstkdespvxompdmjb.supabase.co</p>
              <p>VITE_SUPABASE_ANON_KEY = eyJhbGci... (your full key)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
