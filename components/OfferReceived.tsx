
import React, { useState, useEffect, useRef } from 'react';
import { Home, Search, Ship, MapPin, CheckCircle, Clock, ChevronUp, ChevronDown, Anchor, DollarSign, Tag, Hash, Briefcase, RefreshCw, User, XCircle, ThumbsUp, AlertTriangle, Box } from 'lucide-react';
import { Offer, UserProfile } from '../types';
import { offerService } from '../services/offerService';
import { masterService } from '../services/masterService';

// --- MOCK EXTERNAL USERS FOR VIEW ---
const MOCK_USER_DB: Record<string, any> = {
    'exp_01': { name: 'Rajesh Kumar', designation: 'Export Manager', company: 'Royal Exports Ltd', email: 'rajesh@royal.com', mobile: '9876543210', city: 'Mumbai', role: 'Shipper' },
    'exp_02': { name: 'Li Wei', designation: 'Logistics Head', company: 'Shanghai Trading Co', email: 'li@shanghai.cn', mobile: '13988887777', city: 'Shanghai', role: 'Agent' },
    'main': { name: 'Demo User', designation: 'Manager', company: 'My Company', email: 'demo@myco.com', mobile: '555-1234', city: 'London', role: 'Admin' }
};

interface OfferReceivedProps {
  onBack: () => void;
  currentUser: UserProfile;
  onViewProfile?: (profile: Partial<UserProfile>) => void;
}

export const OfferReceived: React.FC<OfferReceivedProps> = ({ onBack, currentUser, onViewProfile }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [displayedOffers, setDisplayedOffers] = useState<Offer[]>([]);
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'ACCEPTED' | 'REJECTED'>('LIVE');
  const [filterUser, setFilterUser] = useState<string>('ME');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);
  const subUsers = masterService.getSubUsers();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (offers.length > 0) applyFilters();
  }, [offers]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedRowIds.length === 0) return;
      const target = event.target as HTMLElement;
      if (tableRef.current && !tableRef.current.contains(target)) {
        setExpandedRowIds([]);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [expandedRowIds]);

  const loadData = () => {
    const all = offerService.getOffers();
    // Filter logic: Offer Type = SPECIFIC AND Target matches Me
    const myReceived = all.filter(o => {
        if (o.offerType !== 'SPECIFIC') return false;
        
        const targetCompany = o.targetPartyName || '';
        const targetUser = o.targetUserName || '';
        const myCompany = currentUser.companyName || 'My Company';

        // Check against current user or sub-users if main
        const isTargetingMe = targetCompany.toLowerCase().includes(myCompany.toLowerCase()) || 
                              targetUser.toLowerCase().includes(currentUser.fullName.toLowerCase());
        
        // If main user, also include offers targeting sub-users for visibility (optional, but good for admin)
        // For simplicity, strict matching to "Me" or "My Company"
        return isTargetingMe;
    });
    setOffers(myReceived);
  };

  const applyFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
        const filtered = offers.filter(o => {
            // 1. Status Filter
            const statusMatch = statusFilter === 'ALL' || o.status === statusFilter;

            // 2. User Filter (Recipient) - Assuming Main user wants to see what sub-users received
            let userMatch = true;
            if (currentUser.isMainUser !== false) {
                 if (filterUser === 'ME') {
                    // Already filtered by company in loadData, but refine by name if needed
                    userMatch = true; 
                 } else if (filterUser === 'ALL') {
                     userMatch = true;
                 } else {
                     const sub = subUsers.find(u => u.id === filterUser);
                     if (sub) {
                         userMatch = o.targetUserName?.includes(sub.fullName) || false;
                     }
                 }
            }

            // 3. Search
            const searchMatch = 
                o.offerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.pol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.pod.toLowerCase().includes(searchTerm.toLowerCase());

            return statusMatch && userMatch && searchMatch;
        });
        setDisplayedOffers(filtered);
        setIsLoading(false);
    }, 300);
  };

  const handleStatusChange = (id: string, newStatus: 'ACCEPTED' | 'REJECTED', e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to ${newStatus} this offer?`)) {
        offerService.updateStatus(id, newStatus);
        // Refresh data
        loadData();
    }
  };

  const getSenderDetails = (createdBy: string) => {
    if (MOCK_USER_DB[createdBy]) return MOCK_USER_DB[createdBy];
    const sub = subUsers.find(u => u.id === createdBy || u.email === createdBy);
    if (sub) return { 
        name: sub.fullName, designation: sub.designation, company: currentUser.companyName || 'Company',
        email: sub.email, mobile: sub.mobile, photoBase64: sub.photoBase64, role: sub.role 
    };
    if (createdBy === currentUser.email || (createdBy === 'main' && currentUser.isMainUser)) return { 
        name: currentUser.fullName, designation: currentUser.designation, company: currentUser.companyName,
        email: currentUser.email, mobile: currentUser.mobile, photoBase64: currentUser.photoBase64, role: currentUser.role 
    };
    return { name: 'Unknown Sender', designation: '-', company: 'External Partner' };
  };

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRowIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleProfileClick = (e: React.MouseEvent, createdBy: string) => {
      e.stopPropagation();
      if (onViewProfile) {
          const details = getSenderDetails(createdBy);
          onViewProfile({
              fullName: details.name,
              companyName: details.company,
              designation: details.designation,
              email: details.email,
              mobile: details.mobile,
              role: details.role,
              photoBase64: details.photoBase64,
              address: details.city
          });
      }
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
           <span className="font-semibold text-lg text-white">Received Offers</span>
        </div>
        <button onClick={onBack} className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="space-y-6">
          
          {/* Toolbar - NO CREATE BUTTON */}
          <div className="flex flex-col xl:flex-row justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                   
                   {/* Search */}
                   <div className="relative flex-1 w-full max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-ocean-400" />
                      <input
                          type="text"
                          placeholder="Search Received Offers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-ocean-950/50 border border-ocean-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      />
                   </div>

                   {/* Status Filter */}
                   <div className="flex items-center space-x-2 bg-ocean-950/50 rounded-lg p-1 border border-ocean-700 overflow-x-auto">
                      {(['ALL', 'LIVE', 'ACCEPTED', 'REJECTED'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === s ? 'bg-emerald-600 text-white' : 'text-ocean-400 hover:text-white'}`}
                        >
                          {s}
                        </button>
                      ))}
                   </div>

                   {/* User Selection (Main User) */}
                   {currentUser.isMainUser !== false && (
                      <select 
                        className="bg-ocean-950/50 border border-ocean-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-auto"
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                      >
                        <option value="ME">Received by Me</option>
                        <option value="ALL">All Recipients</option>
                        {subUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.fullName}</option>
                        ))}
                      </select>
                   )}

                   {/* GO Button */}
                   <button 
                     onClick={applyFilters}
                     disabled={isLoading}
                     className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg transition-all flex items-center shadow-emerald-900/20 disabled:opacity-50"
                   >
                     {isLoading ? <RefreshCw className="w-4 h-4 animate-spin"/> : 'GO'}
                   </button>
                </div>
            </div>

          {/* Results Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl" ref={tableRef}>
             <div className="overflow-x-auto" style={{minHeight: '200px'}}>
               <table className="w-full text-left">
                  <thead className="bg-white/5 text-xs uppercase text-ocean-300">
                     <tr>
                        <th className="px-6 py-4 font-semibold w-[25%]">Route (POL - POD)</th>
                        <th className="px-6 py-4 font-semibold w-[15%]">Rate (USD)</th>
                        <th className="px-6 py-4 font-semibold w-[20%]">Load Details</th>
                        <th className="px-6 py-4 font-semibold w-[25%]">Sender / Posted By</th>
                        <th className="px-6 py-4 font-semibold text-right w-[15%]">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-ocean-100">
                     {displayedOffers.length > 0 ? (
                       displayedOffers.map(offer => {
                         const isExpanded = expandedRowIds.includes(offer.id);
                         const sender = getSenderDetails(offer.createdBy);
                         const addCharges = getAdditionalChargesString(offer);
                         
                         return (
                           <React.Fragment key={offer.id}>
                              {/* Primary Row */}
                              <tr className={`hover:bg-white/5 transition-colors cursor-pointer ${isExpanded ? 'bg-white/5' : ''}`} onClick={(e) => toggleRow(offer.id, e)}>
                                 {/* Route */}
                                 <td className="px-6 py-4 align-top">
                                    <div className="flex flex-col space-y-1">
                                      <div className="flex items-center text-white font-bold text-sm">
                                        <MapPin className="w-3.5 h-3.5 mr-2 text-emerald-400" /> {offer.pol.split('(')[0]}
                                      </div>
                                      <div className="border-l border-dashed border-ocean-600 h-3 ml-1.5"></div>
                                      <div className="flex items-center text-white font-bold text-sm">
                                        <MapPin className="w-3.5 h-3.5 mr-2 text-rose-400" /> {offer.pod.split('(')[0]}
                                      </div>
                                    </div>
                                 </td>

                                 {/* Rate */}
                                 <td className="px-6 py-4 align-top">
                                    <span className="text-lg font-bold text-emerald-400">${offer.freightRate}</span>
                                 </td>

                                 {/* Load Details */}
                                 <td className="px-6 py-4 align-top">
                                    <div className="flex flex-col">
                                       <span className="text-white font-bold">{offer.quantity} <span className="text-xs text-ocean-300">{offer.matrix}</span></span>
                                       <div className="flex items-center mt-1 text-white font-medium text-xs">
                                            <Box className="w-3.5 h-3.5 mr-2 text-indigo-400" /> {offer.loadType}
                                       </div>
                                       {offer.status !== 'LIVE' && (
                                           <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border mt-2 w-fit
                                              ${offer.status==='ACCEPTED'?'text-blue-400 bg-blue-900/20 border-blue-900/50':
                                                'text-rose-400 bg-rose-900/20 border-rose-900/50'}
                                           `}>
                                             {offer.status}
                                           </span>
                                       )}
                                    </div>
                                 </td>

                                 {/* Sender Details - CLICKABLE */}
                                 <td className="px-6 py-4 align-top" onClick={(e) => handleProfileClick(e, offer.createdBy)}>
                                    <div className="flex flex-col group/user">
                                       <div className="flex items-center">
                                          <User className="w-3.5 h-3.5 mr-2 text-ocean-400 shrink-0 group-hover/user:text-white" />
                                          <span className="text-white font-bold text-sm group-hover/user:underline decoration-dotted decoration-ocean-500 underline-offset-4">{sender.name}</span>
                                       </div>
                                       <div className="flex items-center mt-1">
                                          <Briefcase className="w-3.5 h-3.5 mr-2 text-ocean-400 shrink-0" />
                                          <span className="text-cyan-400 text-xs font-semibold">{sender.company}</span>
                                       </div>
                                    </div>
                                 </td>

                                 {/* Action */}
                                 <td className="px-6 py-4 text-right align-top">
                                    {offer.status === 'LIVE' ? (
                                        <div className="flex flex-col space-y-2 items-end">
                                            <button 
                                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 inline-flex items-center"
                                              onClick={(e) => handleStatusChange(offer.id, 'ACCEPTED', e)}
                                            >
                                              <ThumbsUp className="w-3 h-3 mr-1.5" /> Accept
                                            </button>
                                            <button 
                                              className="text-rose-400 hover:text-white border border-rose-900/40 hover:bg-rose-900/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center"
                                              onClick={(e) => handleStatusChange(offer.id, 'REJECTED', e)}
                                            >
                                              <XCircle className="w-3 h-3 mr-1.5" /> Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-ocean-500 italic text-right mt-2">No Actions</div>
                                    )}
                                    <div className="mt-2 flex justify-end">
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-ocean-500"/> : <ChevronDown className="w-4 h-4 text-ocean-500"/>}
                                    </div>
                                 </td>
                              </tr>

                              {/* Secondary Row (Collapsed Details) */}
                              {isExpanded && (
                                <tr className="bg-ocean-900/30 border-b border-white/5 animate-fade-in-up cursor-default" onClick={(e) => e.stopPropagation()}>
                                   <td colSpan={5} className="px-6 py-4">
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                                         <div className="col-span-1">
                                            <p className="text-ocean-500 font-bold uppercase mb-2">Vessel & Schedule</p>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center"><Anchor className="w-3.5 h-3.5 mr-2 text-emerald-400"/> <span className="text-white font-bold">{offer.vesselName}</span></div>
                                                <div className="pl-5 text-ocean-400">Voyage: {offer.voyage || '-'}</div>
                                                <div className="flex items-center mt-2"><Clock className="w-3.5 h-3.5 mr-2 text-emerald-400"/> <span className="text-white">Schedule: {offer.shipmentSchedule || '-'}</span></div>
                                            </div>
                                         </div>
                                         
                                         <div className="col-span-1">
                                             <p className="text-ocean-500 font-bold uppercase mb-2">Reference</p>
                                             <div className="flex items-center text-white font-mono font-bold">
                                                <Hash className="w-3.5 h-3.5 mr-2 text-cyan-400" /> {offer.offerNumber}
                                             </div>
                                             <div className="mt-2 text-ocean-400">
                                                Valid Upto: <span className="text-white">{new Date(offer.validUntil).toLocaleDateString()}</span>
                                             </div>
                                         </div>

                                         <div className="col-span-1">
                                            <p className="text-ocean-500 font-bold uppercase mb-2">Cargo Details</p>
                                            <div className="flex items-start">
                                               <p className="text-white text-sm">{offer.cargoDetail}</p>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-ocean-500 font-bold uppercase mb-1">Hazardous Info</p>
                                                {offer.isHazardous ? (
                                                    <span className="text-rose-400 flex items-center font-bold"><AlertTriangle className="w-3 h-3 mr-1"/> {offer.hazardousDetail}</span>
                                                ) : <span className="text-emerald-500 flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Safe</span>}
                                            </div>
                                         </div>

                                         <div className="col-span-1">
                                            <p className="text-ocean-500 font-bold uppercase mb-2">Charges Breakdown</p>
                                            <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                              {offer.charges.length > 0 ? offer.charges.map((c,i) => (
                                                <div key={i} className="flex justify-between text-ocean-200 border-b border-white/5 last:border-0 py-1">
                                                  <span>{c.name}</span>
                                                  <span className="font-mono text-emerald-400">{c.amount} {c.currency}</span>
                                                </div>
                                              )) : <div className="text-ocean-500 italic">No additional charges</div>}
                                              <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center">
                                                 <span className="text-ocean-400 font-bold">Total Additional:</span>
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
                       })
                     ) : (
                       <tr>
                         <td colSpan={5} className="px-6 py-12 text-center text-ocean-400">
                           <div className="flex flex-col items-center justify-center">
                              <Tag className="w-8 h-8 mb-2 opacity-50" />
                              <p>No received offers found matching criteria.</p>
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
