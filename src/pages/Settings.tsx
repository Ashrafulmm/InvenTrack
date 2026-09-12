import React, { useState } from 'react';
import { useData } from '../store/DataContext';
import { Save, Database, Trash2, Download, Upload, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { products, sales, categories } = useData();
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

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.products) localStorage.setItem('inventory_products', JSON.stringify(data.products));
        if (data.sales) localStorage.setItem('inventory_sales', JSON.stringify(data.sales));
        if (data.categories) localStorage.setItem('inventory_categories', JSON.stringify(data.categories));
        if (data.settings) localStorage.setItem('settings', JSON.stringify(data.settings));
        alert('Data imported successfully! Please refresh the page.');
        window.location.reload();
      } catch {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
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
          Database Information
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
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Storage:</strong> Data is stored in your browser's localStorage. 
            For production use with Vercel, connect to a database like Supabase, PlanetScale, or MongoDB Atlas.
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
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Danger Zone</p>
                <p className="text-xs text-red-600 mt-1">
                  Resetting will clear all data from localStorage and restore defaults. This action cannot be undone.
                </p>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vercel Deployment Info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">🚀 Vercel Deployment Guide</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-800">For production deployment with a real database:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Convert to Next.js: <code className="bg-gray-200 px-1 rounded text-xs">npx create-next-app</code></li>
              <li>Set up Supabase or PlanetScale for database</li>
              <li>Use API routes for CRUD operations</li>
              <li>Deploy to Vercel: <code className="bg-gray-200 px-1 rounded text-xs">vercel deploy</code></li>
            </ol>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-800">Quick Setup with Supabase:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Create a Supabase project</li>
              <li>Create tables: products, sales, categories</li>
              <li>Replace localStorage calls with Supabase client</li>
              <li>Add environment variables in Vercel dashboard</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg text-gray-800">Reset All Data?</h3>
              <p className="text-sm text-gray-600 mt-2">
                This will permanently delete all products, sales, and categories. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
