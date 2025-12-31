
import React, { useState, useEffect } from 'react';
import { InventoryItem, AuditLog, RMAEntry } from './types';
import { INITIAL_INVENTORY, INITIAL_LOGS, INITIAL_RMAS } from './mockData';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import Withdrawals from './components/Withdrawals';
import AuditLogs from './components/AuditLogs';
import RMAManager from './components/RMAManager';
import Scanner from './components/Scanner';
import LocationMap from './components/LocationMap';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'withdrawals' | 'logs' | 'rma' | 'locations'>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [rmas, setRMAs] = useState<RMAEntry[]>(INITIAL_RMAS);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('warehouse_data');
    if (saved) {
      try {
        const { inventory: inv, logs: l, rmas: r } = JSON.parse(saved);
        setInventory(inv);
        setLogs(l);
        setRMAs(r);
      } catch (e) {
        console.error("Failed to load saved data");
      }
    }
  }, []);

  const saveData = (newInv: InventoryItem[], newLogs: AuditLog[], newRmas: RMAEntry[]) => {
    localStorage.setItem('warehouse_data', JSON.stringify({ inventory: newInv, logs: newLogs, rmas: newRmas }));
  };

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    setInventory(prev => {
      const next = prev.map(item => item.id === updatedItem.id ? updatedItem : item);
      saveData(next, logs, rmas);
      return next;
    });
  };

  const addLog = (itemId: string, delta: number, type: AuditLog['type'], reason: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      itemId,
      itemName: item.name,
      sku: item.sku,
      type,
      quantityDelta: delta,
      reason,
      timestamp: new Date().toISOString(),
      user: 'warehouse_operator_01'
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    return updatedLogs;
  };

  const handleWithdraw = (itemId: string, amount: number, reason: string) => {
    setInventory(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          const newQty = item.quantity - amount;
          return { ...item, quantity: newQty >= 0 ? newQty : 0, lastUpdated: new Date().toISOString() };
        }
        return item;
      });
      const newLogs = addLog(itemId, -amount, 'OUT', reason);
      saveData(updated, newLogs || logs, rmas);
      return updated;
    });
  };

  const handleRestock = (itemId: string, amount: number, reason: string) => {
    setInventory(prev => {
      const updated = prev.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: item.quantity + amount, lastUpdated: new Date().toISOString() };
        }
        return item;
      });
      const newLogs = addLog(itemId, amount, 'IN', reason);
      saveData(updated, newLogs || logs, rmas);
      return updated;
    });
  };

  const handleBulkImport = (newItems: InventoryItem[]) => {
    setInventory(prev => {
      const merged = [...prev];
      newItems.forEach(item => {
        const existingIdx = merged.findIndex(i => i.sku === item.sku);
        if (existingIdx > -1) {
          merged[existingIdx] = { ...merged[existingIdx], ...item, quantity: merged[existingIdx].quantity + item.quantity };
        } else {
          merged.push({ ...item, id: Math.random().toString(36).substr(2, 9) });
        }
      });
      saveData(merged, logs, rmas);
      return merged;
    });
  };

  return (
    <div className="flex h-full bg-slate-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onOpenScanner={() => setIsScannerOpen(true)} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'dashboard' && <Dashboard inventory={inventory} logs={logs} />}
          {activeTab === 'inventory' && (
            <InventoryList 
              inventory={inventory} 
              onRestock={handleRestock} 
              onBulkImport={handleBulkImport}
              onUpdateItem={handleUpdateItem}
            />
          )}
          {activeTab === 'withdrawals' && <Withdrawals inventory={inventory} onWithdraw={handleWithdraw} />}
          {activeTab === 'logs' && <AuditLogs logs={logs} />}
          {activeTab === 'rma' && <RMAManager rmas={rmas} setRMAs={(r) => { setRMAs(r); saveData(inventory, logs, r); }} inventory={inventory} onRestock={handleRestock} />}
          {activeTab === 'locations' && <LocationMap inventory={inventory} />}
        </div>
      </main>

      {isScannerOpen && (
        <Scanner 
          onClose={() => setIsScannerOpen(false)} 
          onScan={(sku) => {
            const item = inventory.find(i => i.sku === sku);
            if (item) {
              setActiveTab('withdrawals');
              setIsScannerOpen(false);
            } else {
              alert("SKU not found in inventory.");
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
