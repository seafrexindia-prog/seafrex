
import React, { useState, useEffect } from 'react';
import { Home, DollarSign, Plus, Trash2, Save, FileText, ChevronRight, X, Layers, List, Edit, Search, RefreshCw } from 'lucide-react';
import { ChargeHead, ChargeItem, ChargeMatrix, Currency, UserProfile } from '../types';
import { masterService } from '../services/masterService';

interface ChargesMasterProps {
  onBack: () => void;
  currentUser: UserProfile;
}

export const ChargesMaster: React.FC<ChargesMasterProps> = ({ onBack, currentUser }) => {
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  const [chargeHeads, setChargeHeads] = useState<ChargeHead[]>([]);
  const [displayedHeads, setDisplayedHeads] = useState<ChargeHead[]>([]);
  const [selectedHead, setSelectedHead] = useState<ChargeHead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter State (Similar to other modules)
  const [filterUser, setFilterUser] = useState<string>('ME');
  const [isLoading, setIsLoading] = useState(false);
  const subUsers = masterService.getSubUsers();

  // Form State
  const [headName, setHeadName] = useState('');
  const [items, setItems] = useState<ChargeItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setChargeHeads(masterService.getChargeHeads());
  };

  // Initial Apply
  useEffect(() => {
    if (chargeHeads.length > 0) applyFilters();
  }, [chargeHeads]);

  const applyFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
        const filtered = chargeHeads.filter(head => {
            // Search Filter
            const matchesSearch = head.headName.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;
        
            // Ownership filtering logic
            if (currentUser.isMainUser !== false) {
               // Main User view
               if (filterUser === 'ME') {
                 // Mock 'main' ownership for demonstration
                 return head.createdBy === 'main' || !head.createdBy; 
               } else if (filterUser === 'ALL') {
                 return true;
               } else {
                 return head.createdBy === filterUser;
               }
            } else {
               // Sub-User view (only see own)
               return head.createdBy === currentUser.email;
            }
          });
          setDisplayedHeads(filtered);
          setIsLoading(false);
    }, 300);
  };

  const initCreate = () => {
    setEditingId(null);
    setHeadName('');
    setItems([
      { id: Date.now().toString(), name: '', amount: 0, matrix: 'Per Container', currency: 'INR' }
    ]);
    setView('CREATE');
  };

  const handleEdit = (head: ChargeHead) => {
    setEditingId(head.id);
    setHeadName(head.headName);
    setItems(head.items.map(i => ({...i}))); // Deep copy to prevent direct mutation
    setView('CREATE');
  };

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now().toString(), name: '', amount: 0, matrix: 'Per Container', currency: 'INR' }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof ChargeItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headName.trim() || items.length === 0) return;

    // Determine owner
    const creator = currentUser.isMainUser !== false ? 'main' : (currentUser.email || 'main');

    const newHead: ChargeHead = {
      id: editingId || Date.now().toString(),
      headName,
      items,
      status: 'ACTIVE',
      createdBy: editingId ? (chargeHeads.find(h => h.id === editingId)?.createdBy || creator) : creator
    };

    masterService.saveChargeHead(newHead);
    loadData();
    setView('LIST');
  };

  const handleDeleteHead = (id: string) => {
    if (window.confirm('Are you sure you want to delete this Charge Head?')) {
      masterService.deleteChargeHead(id);
      loadData();
      setSelectedHead(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up relative">
      
      {/* Header Bar */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-yellow-600/20 rounded-lg text-yellow-400">
             <DollarSign className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">Charges Master</span>
        </div>
        <button onClick={onBack} className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {view === 'LIST' ? (
          <div className="space-y-6">
             {/* Toolbar / Filter */}
             <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-ocean-900/40 p-4 rounded-xl border border-white/5 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                   <div className="flex items-center text-ocean-300 text-sm whitespace-nowrap">
                      <Layers className="w-4 h-4 mr-2" />
                      Standard Charges
                   </div>

                   {/* Search Input */}
                   <div className="relative flex-1 w-full max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-ocean-400" />
                      <input
                          type="text"
                          placeholder="Search Charges..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-ocean-950/50 border border-ocean-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm placeholder-ocean-500 focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                      />
                   </div>

                   {/* User Selection for Main User */}
                   {currentUser.isMainUser !== false && (
                      <select 
                        className="bg-ocean-900/50 border border-ocean-700 rounded-lg px-3 py-1.5 text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none w-full sm:w-auto"
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                      >
                        <option value="ME">My Data (Main)</option>
                        <option value="ALL">All Users</option>
                        {subUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.fullName}</option>
                        ))}
                      </select>
                   )}

                   {/* GO Button */}
                   <button 
                        onClick={applyFilters}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 disabled:opacity-50 flex items-center"
                   >
                        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin"/> : 'GO'}
                   </button>
                </div>

                <button 
                  onClick={initCreate}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-xl font-medium flex items-center shadow-lg transition-all w-full sm:w-auto justify-center whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Charge Head
                </button>
             </div>

             <div className="bg-ocean-900/40 border border-white/10 rounded-xl overflow-hidden shadow-xl">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-xs uppercase text-ocean-300 font-semibold tracking-wider">
                     <tr>
                        <th className="px-6 py-4">Charge Head Name</th>
                        <th className="px-6 py-4">Items</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                     {displayedHeads.length > 0 ? (
                       displayedHeads.map(head => (
                         <tr key={head.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4 font-medium text-white">{head.headName}</td>
                            <td className="px-6 py-4 text-ocean-300">
                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ocean-800 text-ocean-200 text-xs">
                                 {head.items.length} Items
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end space-x-2">
                                  <button 
                                    onClick={() => setSelectedHead(head)}
                                    className="px-3 py-1.5 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-900/30 rounded-lg text-xs font-medium flex items-center transition-colors"
                                  >
                                    <List className="w-3.5 h-3.5 mr-1.5" /> View
                                  </button>
                                  
                                  {/* Edit Button */}
                                  <button 
                                    onClick={() => handleEdit(head)}
                                    className="p-1.5 text-yellow-400 hover:bg-yellow-900/20 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>

                                  <button 
                                    onClick={() => handleDeleteHead(head.id)}
                                    className="p-1.5 text-rose-400 hover:bg-rose-900/20 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan={3} className="px-6 py-12 text-center text-ocean-400">
                           No charge heads found matching criteria. Click GO to refresh.
                         </td>
                       </tr>
                     )}
                  </tbody>
               </table>
             </div>
          </div>
        ) : (
          <div className="flex justify-center">
             <div className="w-full max-w-4xl bg-ocean-900/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                  {editingId ? 'Edit Charge Structure' : 'Create New Charge Structure'}
                </h3>
                
                <form onSubmit={handleSave} className="space-y-8">
                   {/* Head Name */}
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Charges Head Name</label>
                      <input 
                        required 
                        type="text" 
                        value={headName}
                        onChange={e => setHeadName(e.target.value)}
                        className="w-full bg-black/20 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 outline-none placeholder-ocean-500"
                        placeholder="e.g. 20 Feet Box Contain - Mudra Port"
                      />
                   </div>

                   {/* Dynamic Items */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Charge Details List</label>
                         <button 
                           type="button" 
                           onClick={handleAddItem}
                           className="text-xs text-yellow-400 hover:text-white flex items-center font-bold uppercase tracking-wider"
                         >
                           <Plus className="w-4 h-4 mr-1" /> Add More Charges
                         </button>
                      </div>

                      <div className="space-y-3">
                         {items.map((item, index) => (
                           <div key={item.id} className="grid grid-cols-12 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 items-end relative group">
                              <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-ocean-800 rounded-full flex items-center justify-center text-[10px] text-ocean-400 border border-ocean-600">
                                {index + 1}
                              </span>
                              
                              <div className="col-span-4 space-y-1">
                                 <label className="text-[10px] font-semibold text-ocean-400 uppercase">Charge Name</label>
                                 <input 
                                   required
                                   type="text" 
                                   value={item.name}
                                   onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                                   className="w-full bg-black/20 border border-ocean-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                                   placeholder="e.g. THC"
                                 />
                              </div>

                              <div className="col-span-3 space-y-1">
                                 <label className="text-[10px] font-semibold text-ocean-400 uppercase">Amount</label>
                                 <input 
                                   required
                                   type="number" 
                                   value={item.amount || ''}
                                   onChange={e => handleItemChange(item.id, 'amount', parseFloat(e.target.value))}
                                   className="w-full bg-black/20 border border-ocean-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                                   placeholder="0.00"
                                 />
                              </div>

                              <div className="col-span-2 space-y-1">
                                 <label className="text-[10px] font-semibold text-ocean-400 uppercase">Currency</label>
                                 <select 
                                   value={item.currency}
                                   onChange={e => handleItemChange(item.id, 'currency', e.target.value)}
                                   className="w-full bg-black/20 border border-ocean-700 rounded-lg px-2 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                                 >
                                   <option value="INR">INR</option>
                                   <option value="USD">USD</option>
                                 </select>
                              </div>

                              <div className="col-span-2 space-y-1">
                                 <label className="text-[10px] font-semibold text-ocean-400 uppercase">Matrix</label>
                                 <select 
                                   value={item.matrix}
                                   onChange={e => handleItemChange(item.id, 'matrix', e.target.value)}
                                   className="w-full bg-black/20 border border-ocean-700 rounded-lg px-2 py-2 text-sm text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                                 >
                                   <option value="Per Container">Per Container</option>
                                   <option value="Per Tone">Per Tone</option>
                                   <option value="Per KG">Per KG</option>
                                   <option value="Per BOX">Per BOX</option>
                                 </select>
                              </div>

                              <div className="col-span-1 flex justify-center pb-1">
                                 {items.length > 1 && (
                                   <button 
                                     type="button" 
                                     onClick={() => handleRemoveItem(item.id)}
                                     className="text-rose-400 hover:text-white hover:bg-rose-900/50 p-1.5 rounded transition-colors"
                                   >
                                     <Trash2 className="w-4 h-4" />
                                   </button>
                                 )}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                      <button 
                        type="button" 
                        onClick={() => setView('LIST')} 
                        className="px-6 py-3 text-ocean-300 hover:text-white font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-bold shadow-lg flex items-center"
                      >
                        <Save className="w-5 h-5 mr-2" /> Save Charges
                      </button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedHead && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-ocean-900 border border-white/20 rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in-up">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                 <div>
                    <h3 className="text-white font-bold text-lg">{selectedHead.headName}</h3>
                    <p className="text-xs text-ocean-400 uppercase mt-1">Charge Breakdown</p>
                 </div>
                 <button onClick={() => setSelectedHead(null)} className="text-ocean-400 hover:text-white bg-white/5 p-2 rounded-lg transition-colors">
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs uppercase text-ocean-300 font-semibold">
                       <tr>
                          <th className="px-4 py-3 rounded-l-lg">Charge Name</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Currency</th>
                          <th className="px-4 py-3 rounded-r-lg">Matrix</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-ocean-100">
                       {selectedHead.items.map(item => (
                         <tr key={item.id} className="hover:bg-white/5">
                            <td className="px-4 py-3 font-medium">{item.name}</td>
                            <td className="px-4 py-3 font-mono text-white">{item.amount.toFixed(2)}</td>
                            <td className="px-4 py-3 text-xs font-bold text-ocean-400">{item.currency}</td>
                            <td className="px-4 py-3">
                               <span className="px-2 py-1 rounded bg-ocean-950 border border-ocean-700 text-xs">
                                 {item.matrix}
                               </span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="p-4 border-t border-white/10 bg-black/20 rounded-b-2xl flex justify-end">
                 <button onClick={() => setSelectedHead(null)} className="text-sm text-ocean-300 hover:text-white">Close</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
