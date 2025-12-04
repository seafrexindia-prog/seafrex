
import React, { useState, useEffect } from 'react';
import { Home, Plus, Trash2, Edit, Save, List, Globe, Box, DollarSign, Settings, Search } from 'lucide-react';
import { adminMasterService } from '../services/adminMasterService';
import { PortMaster, LoadTypeMaster, CurrencyMaster, MatrixMaster } from '../types';

interface AdminMastersProps {
  onBack: () => void;
}

type MasterType = 'PORT' | 'LOAD' | 'CURRENCY' | 'MATRIX';

export const AdminMasters: React.FC<AdminMastersProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<MasterType>('PORT');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data States
  const [ports, setPorts] = useState<PortMaster[]>([]);
  const [loadTypes, setLoadTypes] = useState<LoadTypeMaster[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyMaster[]>([]);
  const [matrices, setMatrices] = useState<MatrixMaster[]>([]);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Dynamic Form Fields
  const [f1, setF1] = useState(''); // Name / Type / Currency
  const [f2, setF2] = useState(''); // ShortName / Detail / Country
  const [f3, setF3] = useState(''); // FullName
  const [f4, setF4] = useState(''); // Country (Port)

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = () => {
    setPorts(adminMasterService.getPorts());
    setLoadTypes(adminMasterService.getLoadTypes());
    setCurrencies(adminMasterService.getCurrencies());
    setMatrices(adminMasterService.getMatrices());
  };

  const handleEdit = (item: any, type: MasterType) => {
    setIsEditing(true);
    setEditId(item.id);
    if (type === 'PORT') {
      setF1(item.name); setF2(item.shortName); setF3(item.fullName); setF4(item.country);
    } else if (type === 'LOAD') {
      setF1(item.loadType); setF2(item.detail);
    } else if (type === 'CURRENCY') {
      setF1(item.currency); setF2(item.country);
    } else if (type === 'MATRIX') {
      setF1(item.name);
    }
  };

  const handleDelete = (id: string, type: MasterType) => {
    if (window.confirm('Delete this record?')) {
      if (type === 'PORT') adminMasterService.deletePort(id);
      if (type === 'LOAD') adminMasterService.deleteLoadType(id);
      if (type === 'CURRENCY') adminMasterService.deleteCurrency(id);
      if (type === 'MATRIX') adminMasterService.deleteMatrix(id);
      loadAll();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editId || Date.now().toString();
    
    if (activeTab === 'PORT') {
      adminMasterService.savePort({ id, name: f1, shortName: f2, fullName: f3, country: f4 });
    } else if (activeTab === 'LOAD') {
      adminMasterService.saveLoadType({ id, loadType: f1, detail: f2 });
    } else if (activeTab === 'CURRENCY') {
      adminMasterService.saveCurrency({ id, currency: f1, country: f2 });
    } else if (activeTab === 'MATRIX') {
      adminMasterService.saveMatrix({ id, name: f1 });
    }
    
    loadAll();
    resetForm();
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setF1(''); setF2(''); setF3(''); setF4('');
  };

  // Filter Logic
  const getFilteredData = () => {
    const term = searchTerm.toLowerCase();
    if (activeTab === 'PORT') return ports.filter(p => p.name.toLowerCase().includes(term) || p.shortName.toLowerCase().includes(term));
    if (activeTab === 'LOAD') return loadTypes.filter(l => l.loadType.toLowerCase().includes(term));
    if (activeTab === 'CURRENCY') return currencies.filter(c => c.currency.toLowerCase().includes(term));
    if (activeTab === 'MATRIX') return matrices.filter(m => m.name.toLowerCase().includes(term));
    return [];
  };

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-slate-700/50 rounded-lg text-slate-300">
             <Settings className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">Admin Masters</span>
        </div>
        <button onClick={onBack} className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
         <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
               {[
                 { id: 'PORT', label: 'Port Master', icon: Globe },
                 { id: 'LOAD', label: 'Load Type', icon: Box },
                 { id: 'CURRENCY', label: 'Currency', icon: DollarSign },
                 { id: 'MATRIX', label: 'Matrix', icon: List }
               ].map(tab => {
                 const Icon = tab.icon;
                 return (
                   <button 
                     key={tab.id}
                     onClick={() => { setActiveTab(tab.id as any); resetForm(); }}
                     className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-all ${activeTab === tab.id ? 'bg-cyan-600 text-white shadow-lg' : 'bg-ocean-900/50 text-ocean-400 hover:text-white'}`}
                   >
                     <Icon className="w-4 h-4 mr-2" /> {tab.label}
                   </button>
                 );
               })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* List Panel */}
                <div className="lg:col-span-2 bg-ocean-900/40 border border-white/10 rounded-xl overflow-hidden flex flex-col h-[600px]">
                   <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-ocean-400" />
                        <input 
                          type="text" 
                          placeholder={`Search ${activeTab}...`} 
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full bg-ocean-950 border border-ocean-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                        />
                      </div>
                      <div className="text-xs text-ocean-400 font-mono">
                        Count: {getFilteredData().length}
                      </div>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                      <table className="w-full text-left">
                         <thead className="bg-white/5 text-xs uppercase text-ocean-300 sticky top-0 backdrop-blur-md">
                            <tr>
                               {activeTab === 'PORT' && <><th className="px-4 py-3">Name (Code)</th><th className="px-4 py-3">Full Name</th><th className="px-4 py-3">Country</th></>}
                               {activeTab === 'LOAD' && <><th className="px-4 py-3">Load Type</th><th className="px-4 py-3">Details</th></>}
                               {activeTab === 'CURRENCY' && <><th className="px-4 py-3">Currency</th><th className="px-4 py-3">Country</th></>}
                               {activeTab === 'MATRIX' && <th className="px-4 py-3">Matrix Name</th>}
                               <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-white/5 text-sm">
                            {getFilteredData().map((item: any) => (
                              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                 {activeTab === 'PORT' && <>
                                    <td className="px-4 py-2 text-white font-medium">{item.name} <span className="text-ocean-400 font-mono text-xs">({item.shortName})</span></td>
                                    <td className="px-4 py-2 text-ocean-300 text-xs">{item.fullName}</td>
                                    <td className="px-4 py-2 text-ocean-300 text-xs">{item.country}</td>
                                 </>}
                                 {activeTab === 'LOAD' && <>
                                    <td className="px-4 py-2 text-white font-medium">{item.loadType}</td>
                                    <td className="px-4 py-2 text-ocean-400 text-xs">{item.detail || '-'}</td>
                                 </>}
                                 {activeTab === 'CURRENCY' && <>
                                    <td className="px-4 py-2 text-white font-bold">{item.currency}</td>
                                    <td className="px-4 py-2 text-ocean-300">{item.country}</td>
                                 </>}
                                 {activeTab === 'MATRIX' && <td className="px-4 py-2 text-white font-medium">{item.name}</td>}
                                 
                                 <td className="px-4 py-2 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => handleEdit(item, activeTab)} className="p-1.5 text-cyan-400 hover:bg-cyan-900/30 rounded"><Edit className="w-3.5 h-3.5"/></button>
                                      <button onClick={() => handleDelete(item.id, activeTab)} className="p-1.5 text-rose-400 hover:bg-rose-900/30 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
                                    </div>
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

                {/* Edit/Create Panel */}
                <div className="lg:col-span-1 bg-ocean-900/40 border border-white/10 rounded-xl p-6 h-fit shadow-lg">
                   <h3 className="text-white font-bold mb-6 flex items-center">
                      {isEditing ? <Edit className="w-4 h-4 mr-2 text-yellow-400" /> : <Plus className="w-4 h-4 mr-2 text-emerald-400" />}
                      {isEditing ? 'Edit Record' : 'Add New Record'}
                   </h3>
                   <form onSubmit={handleSave} className="space-y-4">
                      
                      {activeTab === 'PORT' && (
                        <>
                          <div><label className="text-[10px] text-ocean-400 uppercase font-bold">Port Name</label><input required className="w-full bg-ocean-950 border border-ocean-700 rounded p-2 text-white text-sm" value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. Mundra"/></div>
                          <div><label className="text-[10px] text-ocean-400 uppercase font-bold">Short Name (Code)</label><input required className="w-full bg-ocean-950 border border-ocean-700 rounded p-2 text-white text-sm" value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. INMUN"/></div>
                          <div><label className="text-[10px] text-ocean-400 uppercase font-bold">Full Name</label><input required className="w-full bg-ocean-950 border border-ocean-700 rounded p-2 text-white text-sm" value={f3} onChange={e=>setF3(e.target.value)} placeholder="e.g. Adani Port"/></div>
                          <div><label className="text-[10px] text-ocean-400 uppercase font-bold">Country</label><input required className="w-full bg-ocean-950 border border-ocean-700 rounded p-2 text-white text-sm" value={f4} onChange={e=>setF4(e.target.value)} placeholder="e.g. India"/></div>
                        </>
                      )}

                      {activeTab === 'LOAD' && (
                        <>
                          <div><label className="text-[10px] text-ocean-400 uppercase font-bold">Load Type</label><input required className="w-full bg-ocean-950 border border-ocean-700 rounded p-2 text-white text-sm" value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. 20 Feet Box"/></div>
                          <div><label className="text-[10px] text-ocean-400 uppercase font-bold">Detail (Optional)</label><input className="w-full bg-ocean-950 border border-ocean-700 rounded p-2 text-white text-sm" value={f2} onChange={e=>setF2(e.target.value)} placeholder="Optional detail"/></div>
                        </>
                      )}

                      {activeTab === 'CURRENCY' && (
                        <>
                          <div><label className="text-[10px] text-ocean-400 uppercase font-bold">Currency Code</label><input required className="w-full bg-ocean-950 border border-ocean-700 rounded p-2 text-white text-sm" value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. USD"/></div>
                          <div><label className="text-[10px] text-ocean-400 uppercase font-bold">Country</label><input required className="w-full bg-ocean-950 border border-ocean-700 rounded p-2 text-white text-sm" value={f2} onChange={e=>setF2(e.target.value)} placeholder="e.g. USA"/></div>
                        </>
                      )}

                      {activeTab === 'MATRIX' && (
                        <>
                          <div><label className="text-[10px] text-ocean-400 uppercase font-bold">Matrix Unit</label><input required className="w-full bg-ocean-950 border border-ocean-700 rounded p-2 text-white text-sm" value={f1} onChange={e=>setF1(e.target.value)} placeholder="e.g. Container"/></div>
                        </>
                      )}

                      <div className="flex gap-2 pt-4">
                         {isEditing && <button type="button" onClick={resetForm} className="flex-1 py-2 bg-ocean-800 text-ocean-300 rounded hover:bg-ocean-700 font-medium">Cancel</button>}
                         <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded font-bold shadow-lg hover:from-emerald-500 hover:to-teal-500">
                            {isEditing ? 'Update' : 'Add Record'}
                         </button>
                      </div>
                   </form>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};
