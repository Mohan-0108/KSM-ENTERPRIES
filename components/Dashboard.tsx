import React, { useState } from 'react';
import { AppData, Product, Contact, TransactionType } from '../types';
import { Analytics } from './Analytics';
import { 
  Package, Users, Clock, AlertTriangle, PlusCircle, 
  Search, Archive, TrendingUp, DollarSign, LayoutDashboard 
} from 'lucide-react';

interface DashboardProps {
  data: AppData;
  onAddProduct: (p: Product) => void;
  onAddContact: (c: Contact) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onAddProduct, onAddContact }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'contacts' | 'history'>('overview');
  
  // Create Product Form State
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: '', defaultBuyPrice: 0, defaultSellPrice: 0 });
  const [newContact, setNewContact] = useState({ name: '', type: 'BUYER', email: '' });

  // History filtering
  const threeMonthsAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
  const recentTransactions = data.transactions
    .filter(t => t.date >= threeMonthsAgo)
    .sort((a, b) => b.date - a.date);

  // Quick Stats
  const lowStockItems = data.products.filter(p => p.currentStock < 10);
  const totalStockValue = data.products.reduce((acc, p) => acc + (p.currentStock * p.defaultBuyPrice), 0);

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      id: crypto.randomUUID(),
      ...newProduct,
      description: '',
      currentStock: 0
    });
    setNewProduct({ name: '', sku: '', category: '', defaultBuyPrice: 0, defaultSellPrice: 0 });
    alert('Product created!');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddContact({
      id: crypto.randomUUID(),
      name: newContact.name,
      type: newContact.type as 'BUYER' | 'SELLER',
      email: newContact.email
    });
    setNewContact({ name: '', type: 'BUYER', email: '' });
    alert('Contact created!');
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="flex overflow-x-auto space-x-2 pb-2 border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview & Analysis', icon: LayoutDashboard },
          { id: 'products', label: 'Products & Pricing', icon: Archive },
          { id: 'contacts', label: 'Buyers & Sellers', icon: Users },
          { id: 'history', label: 'Order History', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Total Inventory Value</p>
                  <p className="text-xl font-bold text-slate-800">${totalStockValue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Low Stock Alerts</p>
                  <p className="text-xl font-bold text-red-600">{lowStockItems.length} Items</p>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-full">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Total Products</p>
                  <p className="text-xl font-bold text-slate-800">{data.products.length}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full">
                  <Package className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">90-Day Orders</p>
                  <p className="text-xl font-bold text-slate-800">{recentTransactions.length}</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Analytics Component */}
            <Analytics data={data} />
            
            {/* Low Stock Table */}
            {lowStockItems.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-red-50">
                  <h3 className="font-semibold text-red-800 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" /> Stock Alerts
                  </h3>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Product Name</th>
                      <th className="px-6 py-3">SKU</th>
                      <th className="px-6 py-3">Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lowStockItems.map(p => (
                      <tr key={p.id}>
                        <td className="px-6 py-3 font-medium text-slate-800">{p.name}</td>
                        <td className="px-6 py-3 text-slate-500">{p.sku}</td>
                        <td className="px-6 py-3 text-red-600 font-bold">{p.currentStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
              <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center">
                <PlusCircle className="w-5 h-5 mr-2" /> Add New Product
              </h3>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Product Name</label>
                  <input required className="w-full mt-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-slate-800 outline-none" 
                    value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">SKU / Code</label>
                  <input required className="w-full mt-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-slate-800 outline-none" 
                    value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Category</label>
                  <input required className="w-full mt-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-slate-800 outline-none" 
                    value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Cost Price ($)</label>
                    <input type="number" step="0.01" required className="w-full mt-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-slate-800 outline-none" 
                      value={newProduct.defaultBuyPrice} onChange={e => setNewProduct({...newProduct, defaultBuyPrice: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700">Sell Price ($)</label>
                    <input type="number" step="0.01" required className="w-full mt-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-slate-800 outline-none" 
                      value={newProduct.defaultSellPrice} onChange={e => setNewProduct({...newProduct, defaultSellPrice: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-900 transition text-sm font-medium">Create Product</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-800">Inventory List</h3>
                <span className="text-xs text-slate-500">{data.products.length} Products</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Stock</th>
                      <th className="px-6 py-3">Buy / Sell Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-800">{p.name} <br/><span className="text-xs text-slate-400 font-normal">{p.sku}</span></td>
                        <td className="px-6 py-3 text-slate-600">{p.category}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.currentStock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {p.currentStock}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-600">${p.defaultBuyPrice} / ${p.defaultSellPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTACTS TAB */}
        {activeTab === 'contacts' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
              <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center">
                <Users className="w-5 h-5 mr-2" /> Add Contact
              </h3>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Full Name / Company</label>
                  <input required className="w-full mt-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-slate-800 outline-none" 
                    value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
                </div>
                 <div>
                  <label className="block text-xs font-medium text-slate-700">Type</label>
                  <select className="w-full mt-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-slate-800 outline-none"
                    value={newContact.type} onChange={e => setNewContact({...newContact, type: e.target.value})}
                  >
                    <option value="BUYER">Buyer</option>
                    <option value="SELLER">Seller (Supplier)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Email</label>
                  <input type="email" required className="w-full mt-1 border rounded-md p-2 text-sm focus:ring-2 focus:ring-slate-800 outline-none" 
                    value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-900 transition text-sm font-medium">Create Contact</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-slate-800">Directory</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.contacts.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-medium text-slate-800">{c.name}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.type === 'BUYER' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-600">{c.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-slate-500" /> Transaction History (Last 3 Months)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Person/Company</th>
                    <th className="px-6 py-3">Items</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        No transactions found in the last 3 months.
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-slate-600 whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString()} <br/>
                          <span className="text-xs text-slate-400">{new Date(t.date).toLocaleTimeString()}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center ${t.type === TransactionType.INWARD ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {t.type === TransactionType.INWARD ? 'INWARD' : 'OUTWARD'}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-medium text-slate-800">{t.contactName}</td>
                        <td className="px-6 py-3 text-slate-600">
                          <ul className="list-disc list-inside text-xs">
                            {t.items.map((item, idx) => (
                              <li key={idx}>{item.productName} (x{item.quantity})</li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-3 text-right font-bold text-slate-800">
                          ${t.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};