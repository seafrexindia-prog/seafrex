
import React, { useState, useEffect } from 'react';
import { Home, Search, Edit, Trash2, User, Building2, Phone, MapPin, Briefcase, Plus, Mail, RefreshCw } from 'lucide-react';
import { InternalParty, UserProfile } from '../types';
import { partyService } from '../services/partyService';
import { masterService } from '../services/masterService';

interface InternalPartyListProps {
  onBack: () => void;
  onEdit: (party: InternalParty) => void;
  onCreateNew: () => void;
  currentUser?: UserProfile;
}

export const InternalPartyList: React.FC<InternalPartyListProps> = ({ onBack, onEdit, onCreateNew, currentUser }) => {
  const [parties, setParties] = useState<InternalParty[]>([]);
  const [displayedParties, setDisplayedParties] = useState<InternalParty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter state for main user - Default 'ME'
  const [filterUser, setFilterUser] = useState<string>('ME');
  const [isLoading, setIsLoading] = useState(false);
  const subUsers = masterService.getSubUsers();

  useEffect(() => {
    // Inject mock 'createdBy' into existing service data for demo purposes since service returns static list initially
    const rawParties = partyService.getParties();
    const partiesWithOwner = rawParties.map((p, idx) => ({
      ...p,
      createdBy: p.createdBy || (idx % 2 === 0 ? 'main' : 'sub1@ocean.com') // Ensure mock distribution if not present
    }));
    setParties(partiesWithOwner);
  }, []);

  // Initial Load Trigger (once data is set)
  useEffect(() => {
    if (parties.length > 0) {
        applyFilters();
    }
  }, [parties]);

  const applyFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
        const filtered = parties.filter(party => {
            const matchesSearch = party.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  party.companyName.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Main User Filter Logic
            if (currentUser?.isMainUser !== false) {
               if (filterUser === 'ALL') {
                 return matchesSearch;
               }
               if (filterUser === 'ME') {
                 return matchesSearch && party.createdBy === 'main';
               }
               return matchesSearch && party.createdBy === filterUser;
            }
            
            // Sub user sees own data
            return matchesSearch && party.createdBy === currentUser?.email; 
          });
          setDisplayedParties(filtered);
          setIsLoading(false);
    }, 300);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this party?')) {
      partyService.deleteParty(id);
      setParties(prev => prev.filter(p => p.id !== id));
      setDisplayedParties(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-emerald-600/20 rounded-lg text-emerald-400">
             <Building2 className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">Internal Party List</span>
        </div>
        <button 
          onClick={onBack}
          className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          title="Back to Dashboard"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar */}
      <div className="shrink-0 px-6 pt-6 pb-2 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 gap-4 max-w-2xl">
            <div className="relative flex-1">
               <Search className="absolute left-3 top-3 h-4 w-4 text-ocean-400" />
               <input
                   type="text"
                   placeholder="Search parties..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full bg-ocean-900/50 border border-ocean-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-ocean-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
               />
            </div>
            {/* Filter Dropdown for Main User */}
            {(!currentUser || currentUser.isMainUser) && (
              <select 
                className="bg-ocean-900/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
          onClick={onCreateNew}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-emerald-900/20 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Party
        </button>
      </div>

      {/* Content Area - Table */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="bg-ocean-900/40 border border-white/10 rounded-xl overflow-hidden shadow-xl">
           <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-xs uppercase text-ocean-300 font-semibold tracking-wider">
                 <tr>
                    <th className="px-6 py-4">Contact Person</th>
                    <th className="px-6 py-4">Company Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Mobile</th>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4 text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                 {displayedParties.length > 0 ? (
                     displayedParties.map(party => (
                         <tr key={party.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4">
                               <div className="flex items-center space-x-3">
                                  <div className="w-9 h-9 rounded-full bg-ocean-800 flex items-center justify-center shrink-0 text-sm font-bold text-white border border-white/10">
                                      {party.contactPerson.charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-white">{party.contactPerson}</span>
                                    {party.designation && (
                                      <span className="text-[11px] text-ocean-400 flex items-center mt-0.5">
                                        <Briefcase className="w-3 h-3 mr-1 opacity-70" />
                                        {party.designation}
                                      </span>
                                    )}
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="text-ocean-100 font-medium">{party.companyName}</span>
                            </td>
                            <td className="px-6 py-4 text-ocean-300">
                                <div className="flex items-center">
                                  <Mail className="w-3.5 h-3.5 mr-2 text-ocean-500" />
                                  <span className="truncate max-w-[150px]">{party.email || '-'}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-ocean-300 font-mono text-xs">
                                <div className="flex items-center">
                                  <Phone className="w-3.5 h-3.5 mr-2 text-ocean-500" />
                                  {party.mobile}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-ocean-300">
                                <span className="inline-flex items-center px-2 py-1 rounded bg-ocean-950 border border-ocean-800 text-xs">
                                  <MapPin className="w-3 h-3 mr-1 text-ocean-500" />
                                  {party.city}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end space-x-2">
                                 <button 
                                   onClick={() => onEdit(party)}
                                   className="p-1.5 text-cyan-400 hover:bg-cyan-400/10 rounded transition-colors"
                                   title="Edit"
                                 >
                                   <Edit className="w-4 h-4" />
                                 </button>
                                 <button 
                                   onClick={() => handleDelete(party.id)}
                                   className="p-1.5 text-rose-400 hover:bg-rose-400/10 rounded transition-colors"
                                   title="Remove"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                               </div>
                            </td>
                         </tr>
                     ))
                 ) : (
                     <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-ocean-400">
                           <div className="flex flex-col items-center justify-center">
                              <Building2 className="w-8 h-8 mb-2 opacity-50" />
                              <p>No parties found. Click GO to refresh.</p>
                           </div>
                        </td>
                     </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};
