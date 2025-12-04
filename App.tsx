import React, { useState, useEffect } from 'react';
import { getAppData, addTransaction, saveAppData } from './services/storage';
import { AppData, Transaction, Product, Contact } from './types';
import { Dashboard } from './components/Dashboard';
import { InwardStock } from './components/InwardStock';
import { OutwardStock } from './components/OutwardStock';
import { LayoutDashboard, Download, Upload, Box } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'inward' | 'outward'>('dashboard');

  useEffect(() => {
    // Load data on mount
    const loadedData = getAppData();
    setData(loadedData);
  }, []);

  const handleTransactionComplete = (transaction: Transaction) => {
    if (!data) return;
    const updatedData = addTransaction(transaction, data);
    setData(updatedData);
    alert('Transaction successful!');
    setCurrentView('dashboard');
  };

  const handleAddProduct = (product: Product) => {
    if (!data) return;
    const newData = { ...data, products: [...data.products, product] };
    saveAppData(newData);
    setData(newData);
  };

  const handleAddContact = (contact: Contact) => {
    if (!data) return;
    const newData = { ...data, contacts: [...data.contacts, contact] };
    saveAppData(newData);
    setData(newData);
  };

  if (!data) return <div className="flex h-screen items-center justify-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">StockFlow</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              currentView === 'dashboard' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('inward')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              currentView === 'inward' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Inward Stock</span>
          </button>

          <button
            onClick={() => setCurrentView('outward')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              currentView === 'outward' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Outward Stock</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800 text-xs text-slate-500 text-center">
          <p>© 2024 StockFlow Manager</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto h-screen">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800 capitalize">
            {currentView === 'dashboard' ? 'Business Overview' : 
             currentView === 'inward' ? 'Purchase Stock' : 'Sell Stock'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500">
              Welcome back, <strong>Admin</strong>
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300"></div>
          </div>
        </header>

        <div className="p-8">
          {currentView === 'dashboard' && (
            <Dashboard 
              data={data} 
              onAddProduct={handleAddProduct}
              onAddContact={handleAddContact}
            />
          )}
          {currentView === 'inward' && (
            <InwardStock data={data} onComplete={handleTransactionComplete} />
          )}
          {currentView === 'outward' && (
            <OutwardStock data={data} onComplete={handleTransactionComplete} />
          )}
        </div>
      </main>

    </div>
  );
};

export default App;