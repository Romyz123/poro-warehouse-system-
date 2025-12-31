
import React, { useState, useEffect } from 'react';
import { InventoryItem, AuditLog } from '../types';
import { analyzeStockLevels } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  inventory: InventoryItem[];
  logs: AuditLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, logs }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const stats = {
    totalItems: inventory.length,
    totalStock: inventory.reduce((acc, i) => acc + i.quantity, 0),
    lowStock: inventory.filter(i => i.quantity <= i.minStock).length,
    outOfStock: inventory.filter(i => i.quantity === 0).length,
    recentMovements: logs.slice(0, 5),
    totalValue: inventory.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0)
  };

  const chartData = inventory.slice(0, 10).map(i => ({
    name: i.sku,
    qty: i.quantity,
    min: i.minStock
  }));

  const categoryData = Object.entries(
    inventory.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeStockLevels(inventory, logs);
    setAiAnalysis(result || "Analysis failed.");
    setIsAnalyzing(false);
  };

  useEffect(() => {
    runAnalysis();
  }, [inventory]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Warehouse Overview</h2>
          <p className="text-slate-500">Real-time status of building 07</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium text-slate-400">Inventory Valuation</p>
          <p className="text-2xl font-black text-indigo-600">${stats.totalValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total SKUs" value={stats.totalItems} icon="fa-barcode" color="bg-blue-500" />
        <StatCard title="Total Units" value={stats.totalStock} icon="fa-boxes" color="bg-emerald-500" />
        <StatCard title="Low Stock Alerts" value={stats.lowStock} icon="fa-triangle-exclamation" color="bg-amber-500" />
        <StatCard title="Out of Stock" value={stats.outOfStock} icon="fa-circle-xmark" color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
            <i className="fas fa-chart-bar text-slate-400"></i>
            <span>Stock Levels (Top 10 SKUs)</span>
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="qty" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.qty <= entry.min ? '#f43f5e' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-900 p-6 rounded-2xl shadow-xl text-white overflow-hidden relative">
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <i className="fas fa-microchip"></i>
              <span>Gemini Stock Analysis</span>
            </h3>
            {isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="text-indigo-200 text-sm animate-pulse">Scanning inventory patterns...</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                <p className="text-sm leading-relaxed text-indigo-100 whitespace-pre-line">
                  {aiAnalysis}
                </p>
                <button 
                  onClick={runAnalysis}
                  className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg text-xs font-bold transition-all"
                >
                  Refresh Intelligence
                </button>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4">Stock by Category</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={categoryData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#3b82f6'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-4">Recent Audit Activity</h3>
          <div className="space-y-4">
            {stats.recentMovements.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    <i className={`fas ${log.type === 'IN' ? 'fa-arrow-down' : 'fa-arrow-up'}`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{log.itemName}</p>
                    <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {log.type === 'IN' ? '+' : '-'}{Math.abs(log.quantityDelta)}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">{log.sku}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: number | string, icon: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
      <i className={`fas ${icon} text-lg`}></i>
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;
