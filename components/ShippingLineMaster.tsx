
import React, { useState, useEffect } from 'react';
import { Home, Ship, Globe, Box, Plus, CheckCircle, XCircle, Power, Search } from 'lucide-react';
import { ShippingLine, UserProfile } from '../types';
import { masterService } from '../services/masterService';

interface ShippingLineMasterProps {
  onBack: () => void;
  currentUser: UserProfile;
}

export const ShippingLineMaster: React.FC<ShippingLineMasterProps> = ({ onBack, currentUser }) => {
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  const [lines, setLines] = useState<ShippingLine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<ShippingLine>({
    id: '',
    lineName: '',
    unitName: '',
    country: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    loadLines();
  }, []);

  const loadLines = () => {
    setLines(masterService.getShippingLines());
  };

  const filteredLines = lines.filter(l => 
    l.lineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    masterService.toggleShippingLineStatus(id);
    loadLines();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLine: ShippingLine = {
      ...formData,
      id: formData.id || Date.now().toString(),
      createdBy: currentUser.email || 'main'
    };
    masterService.saveShippingLine(newLine);
    loadLines();
    setView('LIST');
  };

  const startCreate = () => {
    setFormData({
      id: '',
      lineName: '',
      unitName: '',
      country: '',
      status: 'ACTIVE'
    });
    setView('CREATE');
  };

  // Determine if user can create (Main User or legacy/undefined assumed Main)
  const canCreate = currentUser.isMainUser !== false;

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
             <Ship className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">Shipping Lines</span>
        </div>
        <button onClick={onBack} className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {view === 'LIST' ? (
          <div className="space-y-6">
            
            {/* Toolbar: Search + Create */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-ocean-400" />
                   <input
                       type="text"
                       placeholder="Search Shipping Lines..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full bg-ocean-900/50 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-ocean-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                   />
                </div>
                {canCreate && (
                  <button onClick={startCreate} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-medium flex items-center shadow-lg transition-all">
                    <Plus className="w-4 h-4 mr-2" /> Create Shipping Line
                  </button>
                )}
            </div>

            <div className="bg-ocean-900/40 border border-white/10 rounded-xl overflow-hidden shadow-xl">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-xs uppercase text-ocean-300 font-semibold tracking-wider">
                     <tr>
                        <th className="px-6 py-4">Line Name</th>
                        <th className="px-6 py-4">Unit Name (Code)</th>
                        <th className="px-6 py-4">Country</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                     {filteredLines.length > 0 ? (
                       filteredLines.map(line => (
                         <tr key={line.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 font-medium text-white flex items-center">
                              <Ship className="w-4 h-4 mr-2 text-ocean-500" />
                              {line.lineName}
                            </td>
                            <td className="px-6 py-4 text-ocean-300 font-mono">{line.unitName}</td>
                            <td className="px-6 py-4 text-ocean-300">{line.country}</td>
                            <td className="px-6 py-4">
                              {line.status === 'ACTIVE' ? (
                                <span className="inline-flex items-center text-emerald-400 text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1"/> Active</span>
                              ) : (
                                <span className="inline-flex items-center text-rose-400 text-xs font-bold"><XCircle className="w-3 h-3 mr-1"/> Suspended</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                               {canCreate && (
                                 <button 
                                   onClick={() => handleToggleStatus(line.id)}
                                   className={`p-2 rounded-lg border transition-colors ${line.status === 'ACTIVE' ? 'border-rose-900/50 text-rose-400 hover:bg-rose-900/20' : 'border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/20'}`}
                                   title={line.status === 'ACTIVE' ? 'Suspend Line' : 'Activate Line'}
                                 >
                                   <Power className="w-4 h-4" />
                                 </button>
                               )}
                            </td>
                         </tr>
                       ))
                     ) : (
                        <tr><td colSpan={5} className="px-6 py-12 text-center text-ocean-400">No shipping lines found.</td></tr>
                     )}
                  </tbody>
               </table>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl bg-ocean-900/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
               <h3 className="text-xl font-bold text-white mb-6">Create Shipping Line</h3>
               <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Shipping Line Name</label>
                    <div className="relative">
                       <Ship className="absolute left-3 top-3 w-5 h-5 text-ocean-500" />
                       <input 
                         required
                         type="text" 
                         className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                         placeholder="e.g. Maersk Line"
                         value={formData.lineName}
                         onChange={e => setFormData({...formData, lineName: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Unit Name / Code</label>
                        <div className="relative">
                           <Box className="absolute left-3 top-3 w-5 h-5 text-ocean-500" />
                           <input 
                             required
                             type="text" 
                             className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                             placeholder="e.g. MAEU"
                             value={formData.unitName}
                             onChange={e => setFormData({...formData, unitName: e.target.value})}
                           />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Country</label>
                        <div className="relative">
                           <Globe className="absolute left-3 top-3 w-5 h-5 text-ocean-500" />
                           <input 
                             required
                             type="text" 
                             className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                             placeholder="e.g. Denmark"
                             value={formData.country}
                             onChange={e => setFormData({...formData, country: e.target.value})}
                           />
                        </div>
                    </div>
                 </div>
                 <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => setView('LIST')} className="px-6 py-2 text-ocean-300 hover:text-white">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg">Save Line</button>
                 </div>
               </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
