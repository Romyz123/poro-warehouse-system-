
import React from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  onOpenScanner: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onOpenScanner }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'inventory', label: 'Inventory', icon: 'fa-boxes-stacked' },
    { id: 'withdrawals', label: 'Quick Withdrawal', icon: 'fa-truck-ramp-box' },
    { id: 'locations', label: 'Locations', icon: 'fa-warehouse' },
    { id: 'logs', label: 'Audit Logs', icon: 'fa-clipboard-list' },
    { id: 'rma', label: 'Returns (RMA)', icon: 'fa-rotate-left' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex h-full shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <i className="fas fa-cubes text-white text-xl"></i>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">WHMaster AI</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 bg-slate-800/50 m-4 rounded-xl space-y-3">
        <button 
          onClick={onOpenScanner}
          className="w-full bg-white text-slate-900 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:bg-slate-100 transition-colors"
        >
          <i className="fas fa-qrcode"></i>
          <span>Scan Barcode</span>
        </button>
        <p className="text-xs text-slate-500 text-center italic">Mobile-ready scanning</p>
      </div>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center space-x-3">
          <img src="https://picsum.photos/32/32" className="rounded-full ring-2 ring-slate-700" alt="Avatar" />
          <div className="text-sm">
            <p className="text-white font-medium">Alex Chen</p>
            <p className="text-slate-500 text-xs">Head of Logistics</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
