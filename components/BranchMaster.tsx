
import React, { useState, useEffect } from 'react';
import { Home, MapPin, Globe, Building, Plus, CheckCircle, XCircle, Power, Search } from 'lucide-react';
import { Branch, UserProfile } from '../types';
import { masterService } from '../services/masterService';

interface BranchMasterProps {
  onBack: () => void;
  currentUser: UserProfile;
}

export const BranchMaster: React.FC<BranchMasterProps> = ({ onBack, currentUser }) => {
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<Branch>({
    id: '',
    branchName: '',
    country: '',
    city: '',
    status: 'ACTIVE',
    isMainBranch: false
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = () => {
    setBranches(masterService.getBranches());
  };

  const filteredBranches = branches.filter(b => 
    b.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    masterService.toggleBranchStatus(id);
    loadBranches();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBranch: Branch = {
      ...formData,
      id: formData.id || Date.now().toString(),
      createdBy: currentUser.email || 'main'
    };
    masterService.saveBranch(newBranch);
    loadBranches();
    setView('LIST');
  };

  const startCreate = () => {
    setFormData({
      id: '',
      branchName: '',
      country: '',
      city: '',
      status: 'ACTIVE',
      isMainBranch: false
    });
    setView('CREATE');
  };

  // Determine if user can create branches (Main User or legacy/undefined assumed Main)
  const canCreate = currentUser.isMainUser !== false;

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
             <Globe className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">Branch Management</span>
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
                       placeholder="Search Branches..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full bg-ocean-900/50 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-ocean-500 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                   />
                </div>
                {canCreate && (
                  <button onClick={startCreate} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-medium flex items-center shadow-lg transition-all">
                    <Plus className="w-4 h-4 mr-2" /> Create Branch
                  </button>
                )}
            </div>

            <div className="bg-ocean-900/40 border border-white/10 rounded-xl overflow-hidden shadow-xl">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-xs uppercase text-ocean-300 font-semibold tracking-wider">
                     <tr>
                        <th className="px-6 py-4">Branch Name</th>
                        <th className="px-6 py-4">Country</th>
                        <th className="px-6 py-4">City / Location</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                     {filteredBranches.map(branch => (
                       <tr key={branch.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-medium text-white flex items-center">
                            {branch.isMainBranch && <span className="mr-2 px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded">MAIN</span>}
                            {branch.branchName}
                          </td>
                          <td className="px-6 py-4 text-ocean-300">{branch.country}</td>
                          <td className="px-6 py-4 text-ocean-300">{branch.city}</td>
                          <td className="px-6 py-4">
                            {branch.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center text-emerald-400 text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1"/> Active</span>
                            ) : (
                              <span className="inline-flex items-center text-rose-400 text-xs font-bold"><XCircle className="w-3 h-3 mr-1"/> Suspended</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                             {!branch.isMainBranch && canCreate && (
                               <button 
                                 onClick={() => handleToggleStatus(branch.id)}
                                 className={`p-2 rounded-lg border transition-colors ${branch.status === 'ACTIVE' ? 'border-rose-900/50 text-rose-400 hover:bg-rose-900/20' : 'border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/20'}`}
                                 title={branch.status === 'ACTIVE' ? 'Suspend Branch' : 'Activate Branch'}
                               >
                                 <Power className="w-4 h-4" />
                               </button>
                             )}
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl bg-ocean-900/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
               <h3 className="text-xl font-bold text-white mb-6">Create New Branch</h3>
               <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Branch Name</label>
                    <div className="relative">
                       <Building className="absolute left-3 top-3 w-5 h-5 text-ocean-500" />
                       <input 
                         required
                         type="text" 
                         className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
                         placeholder="e.g. London Office"
                         value={formData.branchName}
                         onChange={e => setFormData({...formData, branchName: e.target.value})}
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Country</label>
                        <div className="relative">
                           <Globe className="absolute left-3 top-3 w-5 h-5 text-ocean-500" />
                           <input 
                             required
                             type="text" 
                             className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
                             placeholder="e.g. UK"
                             value={formData.country}
                             onChange={e => setFormData({...formData, country: e.target.value})}
                           />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">City / Location</label>
                        <div className="relative">
                           <MapPin className="absolute left-3 top-3 w-5 h-5 text-ocean-500" />
                           <input 
                             required
                             type="text" 
                             className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
                             placeholder="e.g. London"
                             value={formData.city}
                             onChange={e => setFormData({...formData, city: e.target.value})}
                           />
                        </div>
                    </div>
                 </div>
                 <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => setView('LIST')} className="px-6 py-2 text-ocean-300 hover:text-white">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg">Save Branch</button>
                 </div>
               </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
