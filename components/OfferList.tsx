
import React, { useState, useEffect, useRef } from 'react';
import { Home, Search, Plus, Ship, MapPin, CheckCircle, Clock, PauseCircle, ChevronUp, ChevronDown, Anchor, DollarSign, Tag, Hash, Briefcase, RefreshCw, MoreVertical, Edit, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Offer, UserProfile } from '../types';
import { offerService } from '../services/offerService';
import { masterService } from '../services/masterService';

interface OfferListProps {
  onBack: () => void;
  onCreateNew: () => void;
  onRevise: (offer: Offer) => void;
  currentUser: UserProfile;
  onViewProfile?: (profile: Partial<UserProfile>) => void;
}

export const OfferList: React.FC<OfferListProps> = ({ onBack, onCreateNew, onRevise, currentUser, onViewProfile }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [displayedOffers, setDisplayedOffers] = useState<Offer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'EXPIRED' | 'SUSPENDED' | 'ACCEPTED' | 'REJECTED'>('LIVE');
  const [filterUser, setFilterUser] = useState<string>('ME');
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const tableRef = useRef<HTMLDivElement>(null);
  const subUsers = masterService.getSubUsers();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (offers.length > 0) applyFilters();
  }, [offers]);

  // Click outside listener for Action Menu and Expanded Rows
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Close Action Menu
      if (openActionId && !target.closest('.action-menu-container')) {
        setOpenActionId(null);
      }

      // Close Expanded Rows
      if (expandedRowIds.length > 0) {
        const closestRow = target.closest('tr');
        if (!closestRow && tableRef.current && !tableRef.current.contains(target)) {
          setExpandedRowIds([]);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openActionId, expandedRowIds]);

  const loadData = () => {
    setOffers(offerService.getOffers());
  };

  const applyFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
        const filtered = offers.filter(o => {
            const searchMatch = 
              o.offerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
              o.pol.toLowerCase().includes(searchTerm.toLowerCase()) ||
              o.pod.toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusMatch = statusFilter === 'ALL' || o.status === statusFilter;
            
            let userMatch = true;
            if (currentUser.isMainUser !== false) {
               if (filterUser === 'ME') userMatch = o.createdBy === 'main' || !o.createdBy;
               else if (filterUser !== 'ALL') userMatch = o.createdBy === filterUser;
            } else {
               userMatch = o.createdBy === currentUser.email;
            }
            return searchMatch && statusMatch && userMatch;
        });
        setDisplayedOffers(filtered);
        setIsLoading(false);
    }, 300);
  };

  const handleUpdateStatus = (id: string, status: 'SUSPENDED' | 'ACCEPTED' | 'REJECTED') => {
    offerService.updateStatus(id, status);
    setOpenActionId(null);
    loadData(); // Reload to reflect status change
  };

  const handleRevise = (offer: Offer) => {
    setOpenActionId(null);
    onRevise(offer);
  };

  const toggleRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedRowIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const toggleActionMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenActionId(prev => prev === id ? null : id);
  };

  // Helper to get Total Additional Charges String
  const getAdditionalChargesString = (offer: Offer) => {
      const totalUSD = offer.charges.filter(c => c.currency === 'USD').reduce((acc, c) => acc + c.amount, 0);
      const totalINR = offer.charges.filter(c => c.currency === 'INR').reduce((acc, c) => acc + c.amount, 0);
      const parts = [];
      if (totalUSD > 0) parts.push(`$${totalUSD}`);
      if (totalINR > 0) parts.push(`₹${totalINR}`);
      return parts.length > 0 ? parts.join(' + ') : 'None';
  };

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-emerald-600/20 rounded-lg text-emerald-400">
             <Tag className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">My Offers</span>
        </div>
        <button onClick={onBack} className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
         <div className="space-y-6">
            
            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                   <div className="relative flex-1 w-full max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-ocean-400" />
                      <input type="text" placeholder="Search Offers..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full bg-ocean-950/50 border border-ocean-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                   </div>
                   <div className="flex items-center space-x-2 bg-ocean-950/50 rounded-lg p-1 border border-ocean-700 overflow-x-auto">
                      {(['ALL', 'LIVE', 'EXPIRED', 'SUSPENDED', 'ACCEPTED', 'REJECTED'] as const).map(s => (
                        <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${statusFilter===s?'bg-emerald-600 text-white':'text-ocean-400 hover:text-white'}`}>{s}</button>
                      ))}
                   </div>
                   {currentUser.isMainUser !== false && (
                      <select className="bg-ocean-950/50 border border-ocean-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-auto" value={filterUser} onChange={e=>setFilterUser(e.target.value)}>
                        <option value="ME">My Data (Main)</option><option value="ALL">All Users</option>
                        {subUsers.map(u=><option key={u.id} value={u.id}>{u.fullName}</option>)}
                      </select>
                   )}
                   <button onClick={applyFilters} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg flex items-center shadow-emerald-900/20 disabled:opacity-50">
                     {isLoading?<RefreshCw className="w-4 h-4 animate-spin"/>:'GO'}
                   </button>
                </div>
                <button onClick={onCreateNew} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-medium flex items-center shadow-lg w-full xl:w-auto justify-center whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" /> Create Offer
                </button>
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl" ref={tableRef}>
               <div className="overflow-x-auto" style={{minHeight: '200px'}}>
                 <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs uppercase text-ocean-300">
                       <tr>
                          <th className="px-6 py-4 font-semibold w-[25%]">Route (POL - POD)</th>
                          <th className="px-6 py-4 font-semibold w-[15%]">Freight Rate (USD)</th>
                          <th className="px-6 py-4 font-semibold w-[20%]">Load & Status</th>
                          <th className="px-6 py-4 font-semibold w-[25%]">Target / Send To</th>
                          <th className="px-6 py-4 font-semibold text-right w-[15%]">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-ocean-100">
                       {displayedOffers.length > 0 ? displayedOffers.map(offer => {
                           const isExpanded = expandedRowIds.includes(offer.id);
                           const addCharges = getAdditionalChargesString(offer);
                           const isLive = offer.status === 'LIVE';
                           
                           return (
                             <React.Fragment key={offer.id}>
                               {/* Primary Row */}
                               <tr className={`hover:bg-white/5 transition-colors group cursor-pointer ${isExpanded?'bg-white/5':''}`} onClick={()=>toggleRow(offer.id)}>
                                  {/* Col 1: Route */}
                                  <td className="px-6 py-4 align-top">
                                     <div className="flex flex-col space-y-1">
                                        <span className="flex items-center text-white text-sm font-bold"><MapPin className="w-3.5 h-3.5 mr-2 text-emerald-400" /> {offer.pol.split('(')[0]}</span>
                                        <span className="flex items-center text-white text-sm font-bold"><MapPin className="w-3.5 h-3.5 mr-2 text-rose-400" /> {offer.pod.split('(')[0]}</span>
                                        <span className="text-[10px] text-ocean-400 pl-6">Via {offer.transitPort}</span>
                                     </div>
                                  </td>

                                  {/* Col 2: Freight Rate */}
                                  <td className="px-6 py-4 align-top">
                                     <span className="text-lg font-bold text-emerald-400">${offer.freightRate}</span>
                                  </td>

                                  {/* Col 3: Load & Status */}
                                  <td className="px-6 py-4 align-top">
                                     <div className="text-xs font-medium text-white mb-2">{offer.quantity} x {offer.loadType}</div>
                                     <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border
                                        ${offer.status==='LIVE'?'text-emerald-400 bg-emerald-900/20 border-emerald-900/50':
                                          offer.status==='ACCEPTED'?'text-blue-400 bg-blue-900/20 border-blue-900/50':
                                          offer.status==='SUSPENDED'?'text-amber-400 bg-amber-900/20 border-amber-900/50':
                                          'text-rose-400 bg-rose-900/20 border-rose-900/50'}
                                     `}>
                                       {offer.status}
                                     </span>
                                  </td>

                                  {/* Col 4: Send To */}
                                  <td className="px-6 py-4 align-top">
                                      {offer.offerType === 'SPECIFIC' ? (
                                        offer.targetUserName ? (
                                          <div className="flex flex-col">
                                            <span className="text-white font-medium text-xs">{offer.targetUserName}</span>
                                            <span className="text-cyan-400 font-medium text-[11px] mt-0.5">{offer.targetPartyName}</span>
                                          </div>
                                        ) : (
                                          <div className="text-cyan-400 font-medium text-[11px]">{offer.targetPartyDisplay}</div>
                                        )
                                      ) : (
                                        <span className="text-xs text-ocean-400 italic">
                                            {offer.offerGroup === 'GLOBAL' ? 'Broadcast to All Partners' : 'Broadcast to My Network'}
                                        </span>
                                      )}
                                  </td>

                                  {/* Col 5: Action */}
                                  <td className="px-6 py-4 text-right align-top relative">
                                     <div className="flex flex-col items-end gap-2 action-menu-container" onClick={e=>e.stopPropagation()}>
                                       
                                       {isLive ? (
                                          <div className="relative">
                                            <button 
                                                onClick={(e) => toggleActionMenu(offer.id, e)}
                                                className="px-2 py-1 bg-ocean-800 hover:bg-ocean-700 text-ocean-200 rounded border border-ocean-600 flex items-center text-xs font-medium transition-colors"
                                            >
                                                Action <MoreVertical className="w-3 h-3 ml-1" />
                                            </button>
                                            {openActionId === offer.id && (
                                                <div className="absolute right-0 top-full mt-1 w-32 bg-ocean-900 border border-ocean-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
                                                    <button onClick={(e) => { e.stopPropagation(); handleRevise(offer); }} className="w-full text-left px-3 py-2 text-xs text-cyan-400 hover:bg-white/10 flex items-center">
                                                        <Edit className="w-3 h-3 mr-2" /> Revise
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(offer.id, 'SUSPENDED'); }} className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-white/10 flex items-center">
                                                        <PauseCircle className="w-3 h-3 mr-2" /> Suspend
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(offer.id, 'ACCEPTED'); }} className="w-full text-left px-3 py-2 text-xs text-blue-400 hover:bg-white/10 flex items-center">
                                                        <ThumbsUp className="w-3 h-3 mr-2" /> Accepted
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(offer.id, 'REJECTED'); }} className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-white/10 flex items-center">
                                                        <ThumbsDown className="w-3 h-3 mr-2" /> Rejected
                                                    </button>
                                                </div>
                                            )}
                                          </div>
                                       ) : (
                                          <span className="text-[10px] text-ocean-500 italic">No Actions</span>
                                       )}

                                       <button onClick={(e)=>toggleRow(offer.id,e)} className="text-xs flex items-center text-indigo-400 hover:text-white mt-1">
                                          {isExpanded?'See Less':'See More'} {isExpanded?<ChevronUp className="w-3 h-3 ml-1"/>:<ChevronDown className="w-3 h-3 ml-1"/>}
                                       </button>
                                     </div>
                                  </td>
                               </tr>
                               
                               {/* Secondary Row (Collapsed) */}
                               {isExpanded && (
                                 <tr className="bg-ocean-900/30 border-b border-white/5 animate-fade-in-up" onClick={e=>e.stopPropagation()}>
                                   <td colSpan={5} className="px-6 py-4">
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                                         {/* Section 1: Vessel & Schedule */}
                                         <div className="col-span-1">
                                            <p className="text-ocean-500 font-bold uppercase mb-2">Vessel & Schedule</p>
                                            <div className="flex flex-col gap-1.5">
                                               <div className="flex items-center"><Anchor className="w-3.5 h-3.5 mr-2 text-emerald-400"/> <span className="text-white font-bold">{offer.vesselName}</span></div>
                                               <div className="pl-5 text-ocean-400">Voyage: {offer.voyage || '-'}</div>
                                               <div className="flex items-center mt-2"><Clock className="w-3.5 h-3.5 mr-2 text-emerald-400"/> <span className="text-white">Schedule: {offer.shipmentSchedule || '-'}</span></div>
                                            </div>
                                         </div>
                                         {/* Section 2: Reference & Cargo */}
                                         <div className="col-span-1">
                                            <p className="text-ocean-500 font-bold uppercase mb-2">Reference & Cargo</p>
                                            <div className="flex items-center mb-2"><Hash className="w-3.5 h-3.5 mr-2 text-indigo-400"/> <span className="text-white font-mono font-bold">{offer.offerNumber}</span></div>
                                            <div className="flex items-start"><Briefcase className="w-3.5 h-3.5 mr-2 text-indigo-400 mt-0.5"/> <p className="text-white">{offer.cargoDetail}</p></div>
                                         </div>
                                         {/* Section 3: Charges Breakdown & Total */}
                                         <div className="col-span-2">
                                            <p className="text-ocean-500 font-bold uppercase mb-2">Charges Breakdown</p>
                                            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                              {offer.charges.length > 0 ? offer.charges.map((c,i) => (
                                                <div key={i} className="flex justify-between text-ocean-200 border-b border-white/5 last:border-0 py-1">
                                                  <span>{c.name}</span>
                                                  <span className="font-mono text-emerald-400">{c.amount} {c.currency}</span>
                                                </div>
                                              )) : <div className="text-ocean-500 italic">No additional charges</div>}
                                              <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
                                                 <span className="text-ocean-400 font-bold">Total Additional Charges:</span>
                                                 <span className="text-emerald-400 font-bold text-sm">{addCharges}</span>
                                              </div>
                                            </div>
                                         </div>
                                      </div>
                                   </td>
                                 </tr>
                               )}
                             </React.Fragment>
                           );
                       }) : <tr><td colSpan={5} className="px-6 py-12 text-center text-ocean-400">No offers found matching criteria. Click GO to refresh.</td></tr>}
                    </tbody>
                 </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
