
import React from 'react';
import { AuditLog } from '../types';

interface AuditLogsProps {
  logs: AuditLog[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Immutable Audit Logs</h2>
          <p className="text-slate-500">Chronological history of all stock interactions</p>
        </div>
        <button className="p-2 bg-slate-50 rounded-lg text-slate-500 hover:bg-slate-100">
          <i className="fas fa-download mr-2"></i>
          Export History
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
              <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">SKU / Item</th>
              <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Change</th>
              <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User / Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-4">
                  <p className="text-sm font-bold text-slate-900">{new Date(log.timestamp).toLocaleDateString()}</p>
                  <p className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                </td>
                <td className="px-8 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    log.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 
                    log.type === 'OUT' ? 'bg-amber-100 text-amber-600' : 
                    'bg-indigo-100 text-indigo-600'
                  }`}>
                    {log.type}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <p className="text-sm font-bold text-slate-800">{log.itemName}</p>
                  <p className="text-xs text-slate-400 font-mono">{log.sku}</p>
                </td>
                <td className="px-8 py-4 text-right">
                  <p className={`font-black ${log.quantityDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {log.quantityDelta > 0 ? '+' : ''}{log.quantityDelta}
                  </p>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center space-x-2">
                    <img src={`https://picsum.photos/seed/${log.user}/24/24`} className="w-6 h-6 rounded-full" alt="User" />
                    <div>
                      <p className="text-xs font-bold text-slate-700">{log.user}</p>
                      <p className="text-[10px] text-slate-500 italic">"{log.reason}"</p>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
