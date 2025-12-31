
import React from 'react';
import { InventoryItem } from '../types';

interface LocationMapProps {
  inventory: InventoryItem[];
}

const LocationMap: React.FC<LocationMapProps> = ({ inventory }) => {
  const aisles = ['A', 'B', 'C', 'D'];
  const shelves = ['S1', 'S2', 'S3', 'S4'];

  const getAisleItems = (aisle: string) => inventory.filter(i => i.location.aisle.startsWith(aisle));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Warehouse Floor Plan</h2>
        <p className="text-slate-500">Heatmap of current item distribution across aisles</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            {aisles.map(a => (
              <div key={a} className="space-y-2">
                <div className="flex justify-between items-end">
                  <h3 className="text-xl font-black text-slate-800">Aisle {a}</h3>
                  <span className="text-xs font-bold text-slate-400">{getAisleItems(a).length} SKUs</span>
                </div>
                <div className="h-64 bg-slate-200 rounded-3xl overflow-hidden relative border-4 border-slate-100 shadow-inner">
                  <div className="absolute inset-0 grid grid-rows-4 gap-1 p-2">
                    {shelves.map(s => {
                      const shelfItems = getAisleItems(a).filter(i => i.location.shelf === s);
                      const density = Math.min(shelfItems.length * 20, 100);
                      return (
                        <div key={s} className="relative group bg-white/40 rounded-lg flex items-center justify-center overflow-hidden">
                          <div 
                            className="absolute inset-0 bg-indigo-500 transition-all duration-1000"
                            style={{ width: `${density}%`, opacity: density / 100 }}
                          ></div>
                          <span className="relative z-10 text-[10px] font-black text-slate-500 group-hover:text-indigo-900 transition-colors">{s}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-6 p-4 bg-white rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase">Capacity:</span>
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[65%]"></div>
            </div>
            <span className="text-sm font-black text-slate-900">65% Full</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6">Location Search</h3>
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl">
              <p className="text-sm text-slate-500 mb-4">Quickly find which shelf an item belongs to:</p>
              <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="SKU or Item Name..."
                  className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Aisle-Wise Distribution</h4>
              {aisles.map(a => (
                <div key={a} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black">
                      {a}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Main Storage Zone {a}</p>
                      <p className="text-xs text-slate-400">{getAisleItems(a).length} distinct items</p>
                    </div>
                  </div>
                  <button className="text-indigo-600 font-bold text-sm">View Shelf Map</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
