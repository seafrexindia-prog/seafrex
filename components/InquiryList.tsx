
import React, { useState, useEffect, useRef } from 'react';
import { Home, Search, Plus, Filter, AlertTriangle, Clock, CheckCircle, PauseCircle, Ship, MapPin, ChevronDown, ChevronUp, Box, Calendar, Hash, Tag, Briefcase, RefreshCw } from 'lucide-react';
import { Inquiry, UserProfile } from '../types';
import { inquiryService } from '../services/inquiryService';
import { masterService } from '../services/masterService';

interface InquiryListProps {
  onBack: () => void;
  onCreateNew: () => void;
  currentUser: UserProfile;
}

export const InquiryList: React.FC<InquiryListProps> = ({ onBack, onCreateNew, currentUser }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [displayedInquiries, setDisplayedInquiries] = useState<Inquiry[]>([]); // Data actually shown in table
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'EXPIRED' | 'SUSPENDED'>('LIVE');
  const [filterUser, setFilterUser] = useState<string>('ME');
  
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  
  const subUsers = masterService.getSubUsers();

  useEffect(() => {
    loadData();
    // Set up an interval to check for expiry every minute in real-time
    const interval = setInterval(() => {
        // We only reload underlying data, not force a refresh of view unless user clicks Go, 
        // but for expiry checks we might want to silently update. 
        // For this specific requirement "reduce load", we'll keep manual refresh dominant.
        const freshData = inquiryService.getInquiries();
        setInquiries(freshData);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Initial Load: Apply defaults
  useEffect(() => {
    if (inquiries.length > 0) {
        applyFilters();
    }
  }, [inquiries]); // Only run when initial data is fetched

  // Handle click outside to close expanded rows
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedRowIds.length === 0) return;
      const target = event.target as HTMLElement;
      const closestRow = target.closest('tr');
      if (!closestRow && tableRef.current && !tableRef.current.contains(target)) {
        setExpandedRowIds([]);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [expandedRowIds]);

  const loadData = () => {
    setInquiries(inquiryService.getInquiries());
  };

  const applyFilters = () => {
    setIsLoading(true);
    
    // Simulate a small delay for "loading" feel if fetching from backend
    setTimeout(() => {
        const filtered = inquiries.filter(inq => {
            // 1. Search (Always live or included in Go? Usually search is live, but let's include it in Go for consistency with request)
            const searchMatch = 
              inq.inquiryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
              inq.cargoDetail.toLowerCase().includes(searchTerm.toLowerCase()) ||
              inq.pol.toLowerCase().includes(searchTerm.toLowerCase()) ||
              inq.pod.toLowerCase().includes(searchTerm.toLowerCase());
            
            // 2. Status
            const statusMatch = statusFilter === 'ALL' || inq.status === statusFilter;
        
            // 3. User Filter
            let userMatch = true;
            if (currentUser.isMainUser !== false) {
               if (filterUser === 'ME') {
                 userMatch = inq.createdBy === 'main' || !inq.createdBy;
               } else if (filterUser !== 'ALL') {
                 userMatch = inq.createdBy === filterUser;
               }
            } else {
               userMatch = inq.createdBy === currentUser.email;
            }
        
            return searchMatch && statusMatch && userMatch;
          });
          
          setDisplayedInquiries(filtered);
          setIsLoading(false);
    }, 300);
  };

  const handleSuspend = (id: string) => {
    if (window.confirm('Are you sure you want to suspend this inquiry manually?')) {
      inquiryService.suspendInquiry(id);
      // Refresh underlying data then re-apply filters
      const freshData = inquiryService.getInquiries();
      setInquiries(freshData);
      // We manually re-trigger filter logic with new data
      setDisplayedInquiries(prev => prev.map(inq => inq.id === id ? {...inq, status: 'SUSPENDED'} : inq));
    }
  };

  const toggleRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedRowIds(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
       {/* Header */}
       <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400">
             <Ship className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">My Inquiries</span>
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
                   
                   {/* Search */}
                   <div className="relative flex-1 w-full max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-ocean-400" />
                      <input
                          type="text"
                          placeholder="Search Inquiries..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-ocean-950/50 border border-ocean-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                   </div>

                   {/* Status Filter */}
                   <div className="flex items-center space-x-2 bg-ocean-950/50 rounded-lg p-1 border border-ocean-700">
                      {(['ALL', 'LIVE', 'EXPIRED', 'SUSPENDED'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${statusFilter === s ? 'bg-indigo-600 text-white' : 'text-ocean-400 hover:text-white'}`}
                        >
                          {s}
                        </button>
                      ))}
                   </div>

                   {/* User Selection (Main User) */}
                   {currentUser.isMainUser !== false && (
                      <select 
                        className="bg-ocean-950/50 border border-ocean-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-auto"
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
                     className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg transition-all flex items-center shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-wait"
                   >
                     {isLoading ? <RefreshCw className="w-4 h-4 animate-spin"/> : 'GO'}
                   </button>
                </div>

                <button 
                  onClick={onCreateNew}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium flex items-center shadow-lg transition-all w-full xl:w-auto justify-center whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create Inquiry
                </button>
            </div>

            {/* Data Table with Expandable Rows */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl" ref={tableRef}>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs uppercase text-ocean-300">
                       <tr>
                          <th className="px-6 py-4 font-semibold w-[25%]">Route (POL - POD)</th>
                          <th className="px-6 py-4 font-semibold w-[20%]">Load & Status</th>
                          <th className="px-6 py-4 font-semibold w-[15%]">Cargo (Qty/Unit)</th>
                          <th className="px-6 py-4 font-semibold w-[25%]">Target / Send To</th>
                          <th className="px-6 py-4 font-semibold text-right w-[15%]">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-ocean-100">
                       {displayedInquiries.length > 0 ? (
                         displayedInquiries.map(inq => {
                           const isExpanded = expandedRowIds.includes(inq.id);
                           return (
                             <React.Fragment key={inq.id}>
                               {/* PRIMARY ROW */}
                               <tr 
                                  className={`hover:bg-white/5 transition-colors group ${isExpanded ? 'bg-white/5' : ''}`}
                                  onClick={() => toggleRow(inq.id)}
                               >
                                  {/* Col 1: Route */}
                                  <td className="px-6 py-4 align-top">
                                     <div className="flex flex-col space-y-1.5">
                                        <span className="flex items-center text-white text-sm font-bold truncate" title={inq.pol}>
                                            <MapPin className="w-3.5 h-3.5 mr-2 text-emerald-400 shrink-0" /> {inq.pol.split('(')[0]}
                                        </span>
                                        <span className="flex items-center text-white text-sm font-bold truncate" title={inq.pod}>
                                            <MapPin className="w-3.5 h-3.5 mr-2 text-rose-400 shrink-0" /> {inq.pod.split('(')[0]}
                                        </span>
                                     </div>
                                  </td>

                                  {/* Col 2: Load & Status */}
                                  <td className="px-6 py-4 align-top">
                                     <div className="mb-2 text-xs font-medium text-white">{inq.loadType}</div>
                                     <div>
                                        {inq.status === 'LIVE' && (
                                           <span className="inline-flex items-center text-emerald-400 text-[10px] font-bold px-2 py-0.5 bg-emerald-900/20 border border-emerald-900/50 rounded-full">
                                             <CheckCircle className="w-3 h-3 mr-1"/> LIVE
                                           </span>
                                         )}
                                         {inq.status === 'EXPIRED' && (
                                           <span className="inline-flex items-center text-ocean-400 text-[10px] font-bold px-2 py-0.5 bg-ocean-800/20 border border-ocean-800/50 rounded-full">
                                             <Clock className="w-3 h-3 mr-1"/> EXPIRED
                                           </span>
                                         )}
                                         {inq.status === 'SUSPENDED' && (
                                           <span className="inline-flex items-center text-rose-400 text-[10px] font-bold px-2 py-0.5 bg-rose-900/20 border border-rose-900/50 rounded-full">
                                             <PauseCircle className="w-3 h-3 mr-1"/> SUSPENDED
                                           </span>
                                         )}
                                     </div>
                                  </td>

                                  {/* Col 3: Cargo (Qty & Unit) */}
                                  <td className="px-6 py-4 align-top">
                                     <div className="flex flex-col">
                                        <span className="text-xl font-bold text-white">{inq.quantity}</span>
                                        <span className="text-xs text-ocean-400 uppercase tracking-wider">{inq.matrix}</span>
                                     </div>
                                  </td>

                                  {/* Col 4: Target / Send To */}
                                  <td className="px-6 py-4 align-top">
                                      {inq.inquiryType === 'SPECIFIC' ? (
                                        inq.targetUserName ? (
                                          <div className="flex flex-col">
                                            <span className="text-white font-medium text-xs">{inq.targetUserName}</span>
                                            <span className="text-cyan-400 font-medium text-[11px] mt-0.5">{inq.targetPartyName}</span>
                                          </div>
                                        ) : (
                                          <div className="text-cyan-400 font-medium text-[11px]">{inq.targetPartyDisplay}</div>
                                        )
                                      ) : (
                                        <span className="text-xs text-ocean-400 italic">
                                            {inq.inquiryGroup === 'GLOBAL' ? 'Broadcast to All Partners' : 'Broadcast to My Network'}
                                        </span>
                                      )}
                                  </td>

                                  {/* Col 5: Actions */}
                                  <td className="px-6 py-4 text-right align-top">
                                     <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
                                       {inq.status === 'LIVE' && (
                                         <button 
                                           onClick={(e) => { e.stopPropagation(); handleSuspend(inq.id); }}
                                           className="text-[10px] text-rose-400 hover:text-white border border-rose-900/50 hover:bg-rose-900/50 px-2 py-1 rounded transition-all"
                                         >
                                           Suspend
                                         </button>
                                       )}
                                       <button 
                                          onClick={(e) => toggleRow(inq.id, e)}
                                          className="text-xs flex items-center text-indigo-400 hover:text-white font-medium transition-colors mt-1"
                                       >
                                          {isExpanded ? 'See Less' : 'See More'}
                                          {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                                       </button>
                                     </div>
                                  </td>
                               </tr>
                               
                               {/* SECONDARY ROW (EXPANDED) */}
                               {isExpanded && (
                                 <tr className="bg-ocean-900/30 border-b border-white/5 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                                   <td colSpan={5} className="px-6 py-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                                         
                                         {/* Section 0: Inquiry Reference */}
                                         <div className="col-span-1">
                                            <p className="text-ocean-500 font-bold uppercase mb-2">Inquiry Reference</p>
                                            <div className="flex items-center mb-2">
                                              <Hash className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                                              <span className="text-white font-mono font-bold text-sm">{inq.inquiryNumber}</span>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                               <div className="flex items-center">
                                                 <Tag className="w-3.5 h-3.5 mr-2 text-ocean-500" />
                                                 <span className="px-1.5 py-0.5 bg-ocean-800 rounded text-[10px] text-ocean-300 border border-ocean-700">
                                                   {inq.inquiryType}
                                                 </span>
                                               </div>
                                               <div className="flex items-center">
                                                  <div className="w-3.5 h-3.5 mr-2"></div>
                                                  <span className="px-1.5 py-0.5 bg-indigo-900/50 rounded text-[10px] text-indigo-300 border border-indigo-800/50">
                                                    {inq.inquiryGroup}
                                                  </span>
                                               </div>
                                            </div>
                                         </div>

                                         {/* Section 1: Cargo Details (Removed Qty/Unit from here) */}
                                         <div className="col-span-1">
                                            <p className="text-ocean-500 font-bold uppercase mb-2">Cargo Description</p>
                                            <div className="flex items-start">
                                              <Briefcase className="w-3.5 h-3.5 mr-2 text-indigo-400 shrink-0 mt-0.5" />
                                              <p className="text-white text-sm font-medium leading-relaxed">{inq.cargoDetail}</p>
                                            </div>
                                         </div>

                                         {/* Section 2: Schedule & Validity */}
                                         <div className="col-span-1">
                                            <p className="text-ocean-500 font-bold uppercase mb-2">Schedule & Validity</p>
                                            <div className="space-y-2">
                                              <div className="flex items-start">
                                                  <Clock className="w-3.5 h-3.5 mr-2 text-indigo-400 shrink-0 mt-0.5" />
                                                  <div>
                                                      <span className="block text-ocean-300 text-[10px]">Shipment Schedule</span>
                                                      <span className="text-white font-bold">{inq.shipmentSchedule}</span>
                                                  </div>
                                              </div>
                                              <div className="flex items-start">
                                                  <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-400 shrink-0 mt-0.5" />
                                                  <div>
                                                      <span className="block text-ocean-300 text-[10px]">Valid Upto</span>
                                                      <span className="text-white">{inq.validUntil}</span>
                                                  </div>
                                              </div>
                                            </div>
                                         </div>

                                         {/* Section 3: Hazardous Info */}
                                         <div className="col-span-1">
                                            <p className="text-ocean-500 font-bold uppercase mb-2">Hazardous Info</p>
                                            {inq.isHazardous ? (
                                                <div className="bg-rose-900/20 border border-rose-900/40 p-2 rounded-lg">
                                                    <span className="flex items-center text-rose-400 font-bold mb-1">
                                                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> YES - HAZARDOUS
                                                    </span>
                                                    <p className="text-ocean-200 italic">{inq.hazardousDetail || 'No details provided'}</p>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-emerald-400 font-medium py-2">
                                                    <CheckCircle className="w-3.5 h-3.5 mr-2" /> Non-Hazardous Cargo
                                                </div>
                                            )}
                                         </div>

                                      </div>
                                   </td>
                                 </tr>
                               )}
                             </React.Fragment>
                           );
                         })
                       ) : (
                         <tr>
                           <td colSpan={5} className="px-6 py-12 text-center text-ocean-400">
                             <div className="flex flex-col items-center justify-center">
                                <Ship className="w-8 h-8 mb-2 opacity-50" />
                                <p>No inquiries found matching criteria. Click GO to refresh.</p>
                             </div>
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
