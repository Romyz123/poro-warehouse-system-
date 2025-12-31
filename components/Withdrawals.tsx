
import React, { useState } from 'react';
import { InventoryItem } from '../types';

interface WithdrawalsProps {
  inventory: InventoryItem[];
  onWithdraw: (id: string, amount: number, reason: string) => void;
}

const Withdrawals: React.FC<WithdrawalsProps> = ({ inventory, onWithdraw }) => {
  const [cart, setCart] = useState<{ item: InventoryItem; qty: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [reason, setReason] = useState('Production Use');

  const filtered = inventory.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.sku.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const addToCart = (item: InventoryItem) => {
    setCart(prev => {
      const existing = prev.find(p => p.item.id === item.id);
      if (existing) return prev.map(p => p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { item, qty: 1 }];
    });
    setSearchTerm('');
  };

  const handleCheckout = () => {
    cart.forEach(c => onWithdraw(c.item.id, c.qty, reason));
    setCart([]);
    alert("Checkout completed!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Internal Stock Issuance</h2>
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search SKU or Name to add to withdrawal..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {searchTerm && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {filtered.length > 0 ? (
                  filtered.map(i => (
                    <button 
                      key={i.id}
                      onClick={() => addToCart(i)}
                      className="w-full flex items-center justify-between p-4 hover:bg-indigo-50 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                          {i.imageUrl && <img src={i.imageUrl} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{i.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{i.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Qty: {i.quantity}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">No matching items found</div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Withdrawal List</h3>
            {cart.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-400">
                <i className="fas fa-shopping-cart text-4xl mb-4 block"></i>
                <p>Your withdrawal cart is empty.</p>
              </div>
            ) : (
              cart.map(c => (
                <div key={c.item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm font-black text-indigo-600 overflow-hidden">
                      {c.item.imageUrl ? <img src={c.item.imageUrl} className="w-full h-full object-cover" /> : c.qty}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{c.item.name} {c.qty > 1 && <span className="text-indigo-600 ml-2">x{c.qty}</span>}</p>
                      <p className="text-xs text-slate-500">{c.item.sku}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setCart(cart.filter(p => p.item.id !== c.item.id))}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4">Finalize Checkout</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Purpose</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
              >
                <option>Production Use</option>
                <option>Sample Request</option>
                <option>Maintenance (MRO)</option>
                <option>Scrap/Dispose</option>
              </select>
            </div>
            
            <div className="pt-4 border-t border-slate-100 mt-4">
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl ${
                  cart.length > 0 
                  ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Complete Withdrawal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
