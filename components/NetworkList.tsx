
import React, { useState, useEffect } from 'react';
import { Home, User, Trash2, Mail, Phone, MapPin, Briefcase, ExternalLink, Search, UserPlus, RefreshCw } from 'lucide-react';
import { NetworkParty, UserProfile } from '../types';
import { masterService } from '../services/masterService';

interface NetworkPartyWithMeta extends NetworkParty {}

const MOCK_NETWORK: NetworkPartyWithMeta[] = [
  { id: '1', name: 'Rahul Verma', company: 'Global Logistics Pvt Ltd', designation: 'Senior Manager', mobile: '+91 98765 43210', email: 'rahul.v@globallogistics.com', city: 'Mumbai', photoUrl: null, createdBy: 'main' },
  { id: '2', name: 'Sarah Jenkins', company: 'Oceanic Freight', designation: 'Director', mobile: '+1 202 555 0123', email: 's.jenkins@oceanic.com', city: 'London', photoUrl: null, createdBy: 'sub1@ocean.com' },
  { id: '3', name: 'David Chen', company: 'Pacific Shipping Co.', designation: 'Operations Head', mobile: '+86 139 1234 5678', email: 'david.c@pacificship.cn', city: 'Shanghai', photoUrl: null, createdBy: 'main' },
  { id: '4', name: 'Mohammed Al-Fayed', company: 'Gulf Transport', designation: 'CEO', mobile: '+971 50 123 4567', email: 'm.fayed@gulftrans.ae', city: 'Dubai', photoUrl: null, createdBy: 'sub1@ocean.com' },
  { id: '5', name: 'Elena Petrova', company: 'Baltic Forwarders', designation: 'Logistics Coordinator', mobile: '+7 916 123 45 67', email: 'elena.p@balticfwd.ru', city: 'St. Petersburg', photoUrl: null, createdBy: 'main' },
];

interface NetworkListProps {
  onBack: () => void;
  onSendRequest: () => void;
  currentUser?: UserProfile;
  onViewProfile?: (profile: Partial<UserProfile>) => void;
}

export const NetworkList: React.FC<NetworkListProps> = ({ onBack, onSendRequest, currentUser, onViewProfile }) => {
  const [parties, setParties] = useState<NetworkPartyWithMeta[]>(MOCK_NETWORK);
  const [displayedParties, setDisplayedParties] = useState<NetworkPartyWithMeta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter state for main user - Default to 'ME' (My Data)
  const [filterUser, setFilterUser] = useState<string>('ME');
  const [isLoading, setIsLoading] = useState(false);
  const subUsers = masterService.getSubUsers();

  useEffect(() => {
    // Initial load
    applyFilters();
  }, []);

  const applyFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
        const filtered = parties.filter(party => {
            const matchesSearch = party.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Logic for Main User: Can filter by ALL, ME (main), or specific Sub User
            if (currentUser?.isMainUser !== false) { 
               if (filterUser === 'ALL') {
                  return matchesSearch;
               }
               if (filterUser === 'ME') {
                  // In mock data 'main' represents the main user
                  return matchesSearch && party.createdBy === 'main';
               }
               // Specific Sub User
               return matchesSearch && party.createdBy === filterUser;
            } 
            
            // Logic for Sub User: Only see their own data
            // In mock data, sub user createdBy matches their email
            return matchesSearch && party.createdBy === currentUser?.email; 
          });
          setDisplayedParties(filtered);
          setIsLoading(false);
    }, 300);
  };

  const handleDeNetwork = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this party from your network?')) {
      setParties(prev => prev.filter(p => p.id !== id));
      // Update displayed list directly to reflect removal immediately
      setDisplayedParties(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleRowClick = (party: NetworkPartyWithMeta) => {
      if (onViewProfile) {
          onViewProfile({
              fullName: party.name,
              companyName: party.company,
              designation: party.designation,
              email: party.email,
              mobile: party.mobile,
              address: party.city,
              // Use explicit photoUrl as photoBase64 compatible prop
              photoBase64: party.photoUrl,
              role: 'Network Partner' as any
          });
      }
  };

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
             <ExternalLink className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">My Network</span>
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
                  placeholder="Search by User Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-ocean-900/50 border border-ocean-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-ocean-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            
            {/* Filter Dropdown for Main User */}
            {(!currentUser || currentUser.isMainUser) && (
              <select 
                className="bg-ocean-900/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
          onClick={onSendRequest}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center shadow-lg shadow-blue-900/20 transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Network Request
        </button>
      </div>

      {/* Content Area - Table */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="bg-ocean-900/40 border border-white/10 rounded-xl overflow-hidden shadow-xl">
           <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-xs uppercase text-ocean-300 font-semibold tracking-wider">
                 <tr>
                    <th className="px-6 py-4">User Name</th>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4 text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                 {displayedParties.length > 0 ? (
                     displayedParties.map(party => (
                         <tr 
                            key={party.id} 
                            className="hover:bg-white/5 transition-colors group cursor-pointer"
                            onClick={() => handleRowClick(party)}
                         >
                            <td className="px-6 py-4">
                               <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-ocean-800 border border-ocean-600 flex items-center justify-center shrink-0 text-sm font-bold text-white overflow-hidden">
                                    {party.photoUrl ? (
                                      <img src={party.photoUrl} alt={party.name} className="w-full h-full object-cover" />
                                    ) : (
                                      party.name.charAt(0)
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-white group-hover:text-cyan-400 transition-colors underline decoration-dotted decoration-ocean-600 underline-offset-4">{party.name}</span>
                                    <span className="text-[11px] text-ocean-400 flex items-center mt-0.5">
                                       <Briefcase className="w-3 h-3 mr-1 opacity-70" /> {party.designation}
                                    </span>
                                  </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="text-white font-medium">{party.company}</span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col space-y-1">
                                  <div className="flex items-center text-ocean-200">
                                     <Mail className="w-3.5 h-3.5 mr-2 text-ocean-500" />
                                     <span className="truncate max-w-[150px]" title={party.email}>{party.email}</span>
                                  </div>
                                  <div className="flex items-center text-ocean-200">
                                     <Phone className="w-3.5 h-3.5 mr-2 text-ocean-500" />
                                     <span>{party.mobile}</span>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center text-ocean-300">
                                  <MapPin className="w-4 h-4 mr-2 text-ocean-600" />
                                  {party.city}
                               </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button 
                                 onClick={(e) => handleDeNetwork(party.id, e)}
                                 className="inline-flex items-center px-3 py-1.5 bg-rose-900/20 hover:bg-rose-900/40 text-rose-300 border border-rose-900/30 rounded-lg transition-colors text-xs font-medium"
                               >
                                 <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                 De-Network
                               </button>
                            </td>
                         </tr>
                     ))
                 ) : (
                     <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-ocean-400">
                           <div className="flex flex-col items-center justify-center">
                              <Search className="w-8 h-8 mb-2 opacity-50" />
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
