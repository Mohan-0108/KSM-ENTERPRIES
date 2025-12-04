import React, { useState } from 'react';
import { AppData, Contact, Product, CartItem, Transaction, TransactionType } from '../types';
import { Plus, Trash2, ShoppingCart, User, Truck } from 'lucide-react';

interface OutwardStockProps {
  data: AppData;
  onComplete: (transaction: Transaction) => void;
}

export const OutwardStock: React.FC<OutwardStockProps> = ({ data, onComplete }) => {
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [priceOverride, setPriceOverride] = useState<string>('');

  const buyers = data.contacts.filter(c => c.type === 'BUYER');

  const addToCart = () => {
    if (!selectedProductId || quantity <= 0) return;
    const product = data.products.find(p => p.id === selectedProductId);
    if (!product) return;

    if (product.currentStock < quantity) {
      alert(`Insufficient stock! Only ${product.currentStock} available.`);
      return;
    }

    const price = priceOverride ? parseFloat(priceOverride) : product.defaultSellPrice;

    const existingItemIndex = cart.findIndex(item => item.productId === selectedProductId);
    
    if (existingItemIndex > -1) {
      const newCart = [...cart];
      const newQty = newCart[existingItemIndex].quantity + quantity;
      if (product.currentStock < newQty) {
          alert(`Insufficient stock for total quantity!`);
          return;
      }
      newCart[existingItemIndex].quantity = newQty;
      newCart[existingItemIndex].priceAtTransaction = price;
      setCart(newCart);
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity,
        priceAtTransaction: price
      }]);
    }
    
    setSelectedProductId('');
    setQuantity(1);
    setPriceOverride('');
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {
    if (!selectedBuyerId || cart.length === 0) return;
    const buyer = data.contacts.find(c => c.id === selectedBuyerId);
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.priceAtTransaction), 0);

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      date: Date.now(),
      type: TransactionType.OUTWARD,
      contactId: selectedBuyerId,
      contactName: buyer?.name || 'Unknown',
      items: cart,
      totalAmount
    };

    onComplete(transaction);
    setCart([]);
    setSelectedBuyerId('');
  };

  const currentProduct = data.products.find(p => p.id === selectedProductId);

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Selection Panel */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <Truck className="mr-2 text-indigo-600" /> Outward Stock (Sales)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Customer</label>
              <div className="relative">
                <select
                  value={selectedBuyerId}
                  onChange={(e) => setSelectedBuyerId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none"
                >
                  <option value="">-- Choose Customer --</option>
                  {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="border-t border-slate-100 my-4 pt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Add Items</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">-- Select Product --</option>
                    {data.products.map(p => (
                      <option key={p.id} value={p.id} disabled={p.currentStock === 0}>
                        {p.name} (Available: {p.currentStock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={currentProduct?.currentStock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Selling Price (Unit)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder={currentProduct ? `${currentProduct.defaultSellPrice}` : "0.00"}
                    value={priceOverride}
                    onChange={(e) => setPriceOverride(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              
              <button
                onClick={addToCart}
                disabled={!selectedProductId || !quantity}
                className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" /> Add to Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-indigo-600" /> Sales Cart
            </h3>
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full font-medium">
              {cart.length} Items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[300px] space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <ShoppingCart className="w-8 h-8 mb-2 opacity-20" />
                No items in cart
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start bg-slate-50 p-3 rounded-lg group">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{item.productName}</p>
                    <p className="text-xs text-slate-500">
                      {item.quantity} x ${item.priceAtTransaction.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-700 text-sm">
                      ${(item.quantity * item.priceAtTransaction).toFixed(2)}
                    </span>
                    <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4">
            <div className="flex justify-between items-center mb-4 text-lg font-bold text-slate-800">
              <span>Total Revenue</span>
              <span>${cart.reduce((sum, i) => sum + (i.quantity * i.priceAtTransaction), 0).toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || !selectedBuyerId}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              Confirm Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};