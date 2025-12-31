
import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { editInventoryImage } from '../services/geminiService';

interface InventoryListProps {
  inventory: InventoryItem[];
  onRestock: (id: string, amount: number, reason: string) => void;
  onBulkImport: (items: InventoryItem[]) => void;
  onUpdateItem: (item: InventoryItem) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ inventory, onRestock, onBulkImport, onUpdateItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [imageLabItem, setImageLabItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState(0);
  
  // Image Lab state
  const [imagePrompt, setImagePrompt] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const categories = ['All', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filtered = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleImageGeneration = async () => {
    if (!imageLabItem) return;
    setIsProcessingImage(true);
    try {
      const prompt = imagePrompt || `A high quality professional industrial photo of ${imageLabItem.name}`;
      const newImageUrl = await editInventoryImage(prompt, imageLabItem.imageUrl);
      if (newImageUrl) {
        onUpdateItem({ ...imageLabItem, imageUrl: newImageUrl });
        setImageLabItem({ ...imageLabItem, imageUrl: newImageUrl });
      }
    } catch (err) {
      alert("Failed to process image. Ensure API key is valid.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const newItems: InventoryItem[] = lines.slice(1).map(line => {
        const [sku, name, qty, aisle, shelf, bin] = line.split(',');
        return {
          id: '', 
          sku: sku.trim(),
          name: name.trim(),
          category: 'Imported',
          quantity: parseInt(qty) || 0,
          minStock: 10,
          location: { aisle: aisle.trim(), shelf: shelf.trim(), bin: bin.trim() },
          description: 'Imported via CSV',
          unitPrice: 0,
          lastUpdated: new Date().toISOString()
        };
      });
      onBulkImport(newItems);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex-1 max-w-lg relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Search by SKU, item name..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          <select 
            className="bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex space-x-2">
            <label className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors font-bold flex items-center space-x-2">
              <i className="fas fa-file-import"></i>
              <span>Import</span>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Item</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Stock Level</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center space-x-4">
                    <div 
                      onClick={() => setImageLabItem(item)}
                      className="w-12 h-12 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden border border-slate-200 cursor-pointer group relative"
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <i className="fas fa-image"></i>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-indigo-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <i className="fas fa-magic text-white text-xs"></i>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold">{item.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{item.sku}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">{item.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <div className="flex space-x-1">
                      <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono">{item.location.aisle}</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{item.location.shelf}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-black text-slate-700">{item.quantity}</span>
                      <div className={`w-2 h-2 rounded-full ${item.quantity <= item.minStock ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => setImageLabItem(item)}
                      className="text-slate-600 hover:text-slate-900 text-sm font-bold p-2 bg-slate-100 rounded-lg transition-all"
                      title="Update item image"
                    >
                      <i className="fas fa-camera"></i>
                    </button>
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-bold p-2 bg-indigo-50 rounded-lg"
                    >
                      Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Lab Modal */}
      {imageLabItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[80vh]">
            <div className="flex-1 bg-slate-950 flex items-center justify-center relative">
              {imageLabItem.imageUrl ? (
                <img src={imageLabItem.imageUrl} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center text-slate-600">
                  <i className="fas fa-image text-6xl mb-4"></i>
                  <p>No item image yet</p>
                </div>
              )}
              {isProcessingImage && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-white px-6 py-4 rounded-2xl flex items-center space-x-4 shadow-xl animate-bounce">
                    <i className="fas fa-wand-magic-sparkles text-indigo-600 text-xl"></i>
                    <span className="font-bold text-slate-800">Gemini is rendering...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-96 p-8 flex flex-col justify-between border-l border-slate-100">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">AI Image Lab</h3>
                    <p className="text-slate-500">{imageLabItem.name}</p>
                  </div>
                  <button onClick={() => setImageLabItem(null)} className="text-slate-400 hover:text-slate-600">
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h4 className="text-xs font-black text-indigo-600 uppercase mb-2">Editor Prompt</h4>
                    <textarea 
                      className="w-full bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
                      rows={4}
                      placeholder="e.g. Enhance the lighting and put it in a clean warehouse background..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <button 
                      onClick={handleImageGeneration}
                      disabled={isProcessingImage}
                      className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black flex items-center justify-center space-x-2 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                    >
                      <i className="fas fa-bolt"></i>
                      <span>{imageLabItem.imageUrl ? 'Edit with AI' : 'Generate with AI'}</span>
                    </button>
                    
                    <label className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 cursor-pointer hover:bg-slate-200 transition-all">
                      <i className="fas fa-upload"></i>
                      <span>Upload Photo</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              onUpdateItem({ ...imageLabItem, imageUrl: ev.target?.result as string });
                              setImageLabItem({ ...imageLabItem, imageUrl: ev.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-widest text-center">
                Powered by Gemini 2.5 Flash Image
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Restock Modal (Existing) */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-black text-slate-900">Restock</h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400"><i className="fas fa-times"></i></button>
            </div>
            <input 
              type="number" 
              className="w-full bg-slate-50 border-none rounded-xl p-4 mb-4 text-center text-2xl font-black"
              value={restockAmount}
              onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
            />
            <button 
              onClick={() => { onRestock(selectedItem.id, restockAmount, 'Manual'); setSelectedItem(null); }}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black"
            >Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
