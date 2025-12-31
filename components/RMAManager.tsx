
import React, { useState } from 'react';
import { RMAEntry, InventoryItem } from '../types';

interface RMAManagerProps {
  rmas: RMAEntry[];
  setRMAs: (rmas: RMAEntry[]) => void;
  inventory: InventoryItem[];
  onRestock: (id: string, amount: number, reason: string) => void;
}

const RMAManager: React.FC<RMAManagerProps> = ({ rmas, setRMAs, inventory, onRestock }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<RMAEntry>>({
    status: 'PENDING',
    reason: 'DEFECTIVE'
  });

  const handleUpdateStatus = (id: string, status: RMAEntry['status']) => {
    const updated = rmas.map(r => {
      if (r.id === id) {
        if (status === 'RESTOCKED' && r.status !== 'RESTOCKED') {
          onRestock(r.itemId, r.quantity, `RMA Restock: ${r.id}`);
        }
        return { ...r, status };
      }
      return r;
    });
    setRMAs(updated);
  };

  const handleCreateRMA = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventory.find(i => i.sku === newItem.sku);
    if (!item) return alert("Invalid SKU");

    const entry: RMAEntry = {
      ...newItem as RMAEntry,
      id: `RMA-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      itemId: item.id,
      itemName: item.name,
      timestamp: new Date().toISOString(),
    };

    setRMAs([entry, ...rmas]);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Returns Management</h2>
          <p className="text-slate-500 text-lg">Process RMA requests and damaged stock</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center space-x-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
        >
          <i className="fas fa-plus"></i>
          <span>New RMA Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rmas.map(rma => (
          <div key={rma.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block mb-1">{rma.id}</p>
                <h3 className="text-lg font-bold text-slate-900">{rma.itemName}</h3>
                <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">{rma.sku}</p>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                rma.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                rma.status === 'RESTOCKED' ? 'bg-emerald-100 text-emerald-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                {rma.status}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Reason:</span>
                <span className="font-bold text-slate-700 uppercase tracking-tighter">{rma.reason}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Qty:</span>
                <span className="font-bold text-slate-700">{rma.quantity}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Opened:</span>
                <span className="font-bold text-slate-700">{new Date(rma.timestamp).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Update Status</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleUpdateStatus(rma.id, 'RESTOCKED')}
                  className="bg-emerald-50 text-emerald-600 py-2 rounded-xl text-xs font-black hover:bg-emerald-100 transition-colors"
                >Restock</button>
                <button 
                  onClick={() => handleUpdateStatus(rma.id, 'SCRAPPED')}
                  className="bg-rose-50 text-rose-600 py-2 rounded-xl text-xs font-black hover:bg-rose-100 transition-colors"
                >Scrap</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <form onSubmit={handleCreateRMA} className="p-8 space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900">Log Return (RMA)</h3>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Item SKU</label>
                  <input 
                    required
                    type="text" 
                    placeholder="EL-001-PRO"
                    className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Reason</label>
                    <select 
                      className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => setNewItem({ ...newItem, reason: e.target.value as any })}
                    >
                      <option value="DEFECTIVE">Defective</option>
                      <option value="DAMAGED">Damaged in Transit</option>
                      <option value="WRONG_ITEM">Wrong Item Sent</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Internal Notes</label>
                  <textarea 
                    rows={3}
                    className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe the issue..."
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all"
              >
                Issue RMA Authorization
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RMAManager;
