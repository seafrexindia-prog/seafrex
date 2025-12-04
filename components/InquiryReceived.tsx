
import React, { useState, useEffect, useRef } from 'react';
import { Home, Search, Calendar, Ship, ChevronDown, ChevronUp, Box, Hash, Briefcase, AlertTriangle, CheckCircle, Send, User, XCircle, RefreshCw, Tag, MapPin } from 'lucide-react';
import { Inquiry, UserProfile } from '../types';
import { inquiryService } from '../services/inquiryService';
import { masterService } from '../services/masterService';

// --- MOCK EXTERNAL USERS FOR VIEW ---
const MOCK_USER_DB: Record<string, any> = {
    'exp_01': { name: 'Rajesh Kumar', designation: 'Export Manager', company: 'Royal Exports Ltd', email: 'rajesh@royal.com', mobile: '9876543210', city: 'Mumbai', role: 'Shipper' },
    'exp_02': { name: 'Li Wei', designation: 'Logistics Head', company: 'Shanghai Trading Co', email: 'li@shanghai.cn', mobile: '13988887777', city: 'Shanghai', role: 'Agent' },
    'main': { name: 'Demo User', designation: 'Manager', company: 'My Company', email: 'demo@myco.com', mobile: '555-1234', city: 'London', role: 'Admin' }
};

interface InquiryReceivedProps {
  onBack: () => void;
  currentUser: UserProfile;
  onReplyWithOffer: (inquiry: Inquiry, senderInfo?: { name: string, company: string }) => void;
  onViewProfile?: (profile: Partial<UserProfile>) => void;
}

export const InquiryReceived: React.FC<InquiryReceivedProps> = ({ onBack, currentUser, onReplyWithOffer, onViewProfile }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [displayedInquiries, setDisplayedInquiries] = useState<Inquiry[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LIVE' | 'EXPIRED' | 'REJECTED'>('LIVE');
  const [filterUser, setFilterUser] = useState<string>('ME');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);
  const subUsers = masterService.getSubUsers();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (inquiries.length > 0) applyFilters();
  }, [inquiries]); 

  const loadData = () => {
    // Logic: Received inquiries are those where Type=SPECIFIC and target matches ME
    const all = inquiryService.getInquiries();
    const myReceived = all.filter(inq => {
        if (inq.inquiryType !== 'SPECIFIC') return false;
        // Fuzzy match current user
        const targetCompany = inq.targetPartyName || '';
        const targetUser = inq.targetUserName || '';
        const myCompany = currentUser.companyName || 'My Company';
        
        return targetCompany.toLowerCase().includes(myCompany.toLowerCase()) || 
               targetUser.toLowerCase().includes(currentUser.fullName.toLowerCase());
    });
    setInquiries(myReceived);
  };

  const applyFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
        const filtered = inquiries.filter(inq => {
            // 1. Status Filter
            const statusMatch = statusFilter === 'ALL' || inq.status === statusFilter;

            // 2. User Filter (Sender / Assigned To)
            let userMatch = true;
            if (currentUser.isMainUser !== false) {
                 if (filterUser === 'ME') {
                     userMatch = inq.targetUserName?.includes(currentUser.fullName) || false;
                 } else if (filterUser === 'ALL') {
                     userMatch = true;
                 } else {
                     const sub = subUsers.find(u => u.id === filterUser);
                     if (sub) {
                         userMatch = inq.targetUserName?.includes(sub.fullName) || false;
                     }
                 }
            } else {
                 userMatch = true; 
            }

            // 3. Search
            const searchMatch = 
                inq.inquiryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inq.pol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inq.pod.toLowerCase().includes(searchTerm.toLowerCase());

            return statusMatch && userMatch && searchMatch;
        });
        setDisplayedInquiries(filtered);
        setIsLoading(false);
    }, 300);
  };

  const handleDecline = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to decline this inquiry?")) {
        inquiryService.updateStatus(id, 'REJECTED');
        loadData(); // Reload and re-filter
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
    return { name: 'Unknown User', designation: 'Agent', company: 'Logistics Partner' };
  };

  const handleSendOffer = (inq: Inquiry, e: React.MouseEvent) => {
    e.stopPropagation();
    const sender = getSenderDetails(inq.createdBy);
    onReplyWithOffer(inq, { name: sender.name, company: sender.company });
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

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expandedRows.length === 0) return;
      const target = event.target as HTMLElement;
      if (tableRef.current && !tableRef.current.contains(target)) {
        setExpandedRows([]);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [expandedRows]);

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      
      {/* Header */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400">
             <Ship className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">Received Inquiries</span>
        </div>
        <button onClick={onBack} className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="space-y-6">
          
          {/* Toolbar */}
          <div className="flex flex-col xl:flex-row justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                   
                   {/* Search */}
                   <div className="relative flex-1 w-full max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-ocean-400" />
                      <input
                          type="text"
                          placeholder="Search Received Inquiries..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-ocean-950/50 border border-ocean-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                   </div>

                   {/* Status Filter */}
                   <div className="flex items-center space-x-2 bg-ocean-950/50 rounded-lg p-1 border border-ocean-700 overflow-x-auto">
                      {(['ALL', 'LIVE', 'EXPIRED', 'REJECTED'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === s ? 'bg-indigo-600 text-white' : 'text-ocean-400 hover:text-white'}`}
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

          {/* Results Table - Matched with Explore Style */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl" ref={tableRef}>
             <div className="overflow-x-auto" style={{minHeight: '200px'}}>
               <table className="w-full text-left">
                  <thead className="bg-white/5 text-xs uppercase text-ocean-300">
                     <tr>
                        <th className="px-6 py-4 font-semibold w-[25%]">Route Info</th>
                        <th className="px-6 py-4 font-semibold w-[15%]">Load Details</th>
                        <th className="px-6 py-4 font-semibold w-[20%]">Schedule</th>
                        <th className="px-6 py-4 font-semibold w-[20%]">Sender</th>
                        <th className="px-6 py-4 font-semibold text-right w-[20%]">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-ocean-100">
                     {displayedInquiries.length > 0 ? (
                       displayedInquiries.map(inq => {
                         const isExpanded = expandedRows.includes(inq.id);
                         const sender = getSenderDetails(inq.createdBy);
                         
                         return (
                           <React.Fragment key={inq.id}>
                              {/* Primary Row */}
                              <tr className={`hover:bg-white/5 transition-colors cursor-pointer ${isExpanded ? 'bg-white/5' : ''}`} onClick={(e) => toggleRow(inq.id, e)}>
                                 {/* Route */}
                                 <td className="px-6 py-4 align-top">
                                    <div className="flex flex-col space-y-1">
                                      <div className="flex items-center text-white font-bold text-sm">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shrink-0"></div> {inq.pol.split('(')[0]}
                                      </div>
                                      <div className="border-l border-dashed border-ocean-600 h-3 ml-1"></div>
                                      <div className="flex items-center text-white font-bold text-sm">
                                        <div className="w-2 h-2 rounded-full bg-rose-500 mr-2 shrink-0"></div> {inq.pod.split('(')[0]}
                                      </div>
                                    </div>
                                 </td>

                                 {/* Load Details */}
                                 <td className="px-6 py-4 align-top">
                                    <div className="flex flex-col">
                                       <span className="text-white font-bold text-lg">{inq.quantity} <span className="text-sm font-medium text-ocean-300">{inq.matrix}</span></span>
                                       <div className="flex items-center mt-1 text-white font-medium text-sm">
                                            <Box className="w-3.5 h-3.5 mr-2 text-indigo-400" /> {inq.loadType}
                                       </div>
                                       {inq.status === 'REJECTED' && <span className="text-[10px] text-rose-400 font-bold mt-1 uppercase border border-rose-900 px-1 rounded bg-rose-900/20 w-fit">Declined</span>}
                                    </div>
                                 </td>

                                 {/* Schedule */}
                                 <td className="px-6 py-4 align-top">
                                    <div className="flex items-center text-ocean-200">
                                       <Calendar className="w-4 h-4 mr-2 text-ocean-500 shrink-0" />
                                       <span className="font-bold">{inq.shipmentSchedule}</span>
                                    </div>
                                 </td>

                                 {/* Sender Details - CLICKABLE */}
                                 <td className="px-6 py-4 align-top" onClick={(e) => handleProfileClick(e, inq.createdBy)}>
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
                                    {inq.status === 'LIVE' ? (
                                        <div className="flex flex-col space-y-2 items-end">
                                            <button 
                                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 inline-flex items-center"
                                              onClick={(e) => handleSendOffer(inq, e)}
                                            >
                                              <Send className="w-3 h-3 mr-1.5" /> Send Offer
                                            </button>
                                            <button 
                                              className="text-rose-400 hover:text-white border border-rose-900/40 hover:bg-rose-900/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center"
                                              onClick={(e) => handleDecline(inq.id, e)}
                                            >
                                              <XCircle className="w-3 h-3 mr-1.5" /> Decline
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
                                            <p className="text-ocean-500 font-bold uppercase mb-2">Reference</p>
                                            <div className="flex items-center text-white font-mono font-bold">
                                               <Hash className="w-3.5 h-3.5 mr-2 text-cyan-400" /> {inq.inquiryNumber}
                                            </div>
                                            <div className="mt-2 text-ocean-400">
                                               Valid Upto: <span className="text-white">{inq.validUntil}</span>
                                            </div>
                                         </div>
                                         
                                         <div className="col-span-1">
                                             <p className="text-ocean-500 font-bold uppercase mb-2">Scope</p>
                                             <span className="inline-flex items-center px-2 py-0.5 bg-indigo-900/30 text-indigo-400 text-[10px] rounded border border-indigo-900/50 w-fit">
                                                Specific
                                             </span>
                                         </div>

                                         <div className="col-span-1">
                                            <p className="text-ocean-500 font-bold uppercase mb-2">Cargo Details</p>
                                            <div className="flex items-start">
                                               <p className="text-white text-sm">{inq.cargoDetail}</p>
                                            </div>
                                         </div>

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
                              <p>No received inquiries found matching criteria.</p>
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
