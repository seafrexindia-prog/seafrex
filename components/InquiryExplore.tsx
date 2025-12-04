
import React, { useState, useEffect, useRef } from 'react';
import { Home, Search, MapPin, Calendar, Ship, Globe, Users, ChevronDown, ChevronUp, Tag, Box, Hash, Briefcase, Clock, AlertTriangle, CheckCircle, Send, User } from 'lucide-react';
import { Inquiry, LoadType, UserProfile } from '../types';
import { inquiryService } from '../services/inquiryService';
import { masterService } from '../services/masterService';

const MOCK_PORTS = ['Mundra (INMUN)', 'Jebel Ali (AEJEA)', 'Singapore (SGSIN)', 'Rotterdam (NLRTM)', 'Shanghai (CNSHA)', 'New York (USNYC)'];

// --- MOCK EXTERNAL USERS FOR EXPLORE VIEW ---
const MOCK_USER_DB: Record<string, any> = {
    'exp_01': { name: 'Rajesh Kumar', designation: 'Export Manager', company: 'Royal Exports Ltd', email: 'rajesh@royalexports.com', mobile: '+91 98700 12345', city: 'Mumbai', role: 'Shipper / Exporter' },
    'exp_02': { name: 'Li Wei', designation: 'Logistics Head', company: 'Shanghai Trading Co', email: 'li.wei@shanghaitrade.cn', mobile: '+86 138 0000 0000', city: 'Shanghai', role: 'Forwarder / Agent' },
    'main': { name: 'Demo User', designation: 'Manager', company: 'My Company', email: 'demo@mycompany.com', mobile: '9999999999', city: 'London', role: 'Admin' }
};

// --- HELPER: Generate Next 12 Weeks Schedule ---
const generateScheduleOptions = (): string[] => {
  const options: string[] = [];
  let currentDate = new Date();
  while (options.length < 12) {
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = currentDate.getFullYear().toString().slice(-2);
    let prefix = '';
    if (day <= 7) prefix = '1ST';
    else if (day <= 14) prefix = '2ND';
    else if (day <= 21) prefix = '3RD';
    else prefix = 'LAST';
    const scheduleStr = `${prefix}-WEEK-${month}-${year}`;
    if (options.length === 0 || options[options.length - 1] !== scheduleStr) {
        options.push(scheduleStr);
    }
    currentDate.setDate(currentDate.getDate() + 7);
  }
  return options;
};

// Internal helper for port search
const ExplorePortInput = ({ placeholder, value, onChange, iconColor }: { placeholder: string, value: string, onChange: (v: string) => void, iconColor: string }) => {
  const [show, setShow] = useState(false);
  const filtered = MOCK_PORTS.filter(p => p.toLowerCase().includes(value.toLowerCase()));
  
  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-3 pointer-events-none">
        <MapPin className={`w-4 h-4 ${iconColor}`} />
      </div>
      <input 
        type="text" 
        value={value}
        onChange={(e) => { onChange(e.target.value); setShow(true); }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder={placeholder}
        className="w-full bg-ocean-950 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-ocean-500 focus:ring-2 focus:ring-cyan-500 outline-none font-medium"
      />
      {show && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-ocean-900 border border-ocean-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
          {filtered.map((p, i) => (
            <div key={i} onClick={() => onChange(p)} className="px-4 py-2 hover:bg-ocean-800 text-ocean-100 cursor-pointer text-sm">
              {p}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface InquiryExploreProps {
  onBack: () => void;
  currentUser: UserProfile;
  onReplyWithOffer: (inquiry: Inquiry, senderInfo?: { name: string, company: string }) => void;
  onViewProfile?: (profile: Partial<UserProfile>) => void;
}

export const InquiryExplore: React.FC<InquiryExploreProps> = ({ onBack, currentUser, onReplyWithOffer, onViewProfile }) => {
  // Search State
  const [scope, setScope] = useState<'GLOBAL' | 'NETWORK'>('GLOBAL');
  const [pol, setPol] = useState('');
  const [pod, setPod] = useState('');
  const [loadType, setLoadType] = useState<LoadType | ''>('');
  const [schedule, setSchedule] = useState('');

  // Results State
  const [results, setResults] = useState<Inquiry[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);

  const scheduleOptions = generateScheduleOptions();
  const subUsers = masterService.getSubUsers();

  // Click outside listener to close rows
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

  const handleSearch = () => {
    setHasSearched(true);
    const allInquiries = inquiryService.getInquiries();
    
    // Filter Logic
    const filtered = allInquiries.filter(inq => {
      // 1. Scope Check
      const scopeMatch = scope === 'GLOBAL' ? inq.inquiryGroup === 'GLOBAL' : (inq.inquiryGroup === 'NETWORK' || inq.inquiryGroup === 'NETWORK_PARTY');
      
      // 2. Route Check
      const polMatch = !pol || inq.pol.toLowerCase().includes(pol.toLowerCase());
      const podMatch = !pod || inq.pod.toLowerCase().includes(pod.toLowerCase());

      // 3. Load Type Check
      const loadMatch = !loadType || inq.loadType === loadType;

      // 4. Schedule Check (Exact Match)
      const scheduleMatch = !schedule || inq.shipmentSchedule === schedule;

      // 5. Status Check (Only Live)
      const statusMatch = inq.status === 'LIVE';

      return scopeMatch && polMatch && podMatch && loadMatch && scheduleMatch && statusMatch;
    });

    setResults(filtered);
  };

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  // Helper to resolve creator details
  const getCreatorDetails = (createdBy: string) => {
    // 1. Check Mock External DB (Simulating finding other companies)
    if (MOCK_USER_DB[createdBy]) {
        return MOCK_USER_DB[createdBy];
    }

    // 2. Check Sub-Users
    const sub = subUsers.find(u => u.id === createdBy || u.email === createdBy);
    if (sub) {
      return {
        name: sub.fullName,
        designation: sub.designation,
        company: currentUser.companyName || 'Company',
        email: sub.email,
        mobile: sub.mobile,
        role: sub.role,
        photoBase64: sub.photoBase64
      };
    }

    // 3. Fallback (If creator matches current user, show current user, else unknown)
    if (createdBy === currentUser.email || (createdBy === 'main' && currentUser.isMainUser)) {
        return {
            name: currentUser.fullName,
            designation: currentUser.designation,
            company: currentUser.companyName,
            email: currentUser.email,
            mobile: currentUser.mobile,
            role: currentUser.role,
            photoBase64: currentUser.photoBase64
        };
    }

    // Default Fallback
    return {
      name: 'Unknown User',
      designation: 'Agent',
      company: 'Logistics Partner',
      role: 'Partner'
    };
  };

  const handleSendOffer = (e: React.MouseEvent, inq: Inquiry) => {
      e.stopPropagation();
      const creator = getCreatorDetails(inq.createdBy);
      onReplyWithOffer(inq, { name: creator.name, company: creator.company });
  };

  const handleProfileClick = (e: React.MouseEvent, createdBy: string) => {
      e.stopPropagation();
      if (onViewProfile) {
          const details = getCreatorDetails(createdBy);
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

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      
      {/* Header */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-cyan-600/20 rounded-lg text-cyan-400">
             <Globe className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">Explore Inquiries</span>
        </div>
        <button onClick={onBack} className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* SEARCH PANEL */}
          <div className="bg-gradient-to-r from-ocean-900 to-ocean-800 rounded-2xl p-6 border border-white/10 shadow-2xl relative">
             
             {/* Center Heading */}
             <div className="absolute top-4 left-0 right-0 text-center">
                <h2 className="text-white/20 text-4xl font-black uppercase tracking-widest select-none pointer-events-none">Explore Inquiry</h2>
             </div>
             
             {/* Scope Tabs - Increased top margin */}
             <div className="flex justify-center mb-6 relative z-10 mt-12">
                <div className="bg-ocean-950 p-1 rounded-xl inline-flex border border-ocean-700">
                  <button 
                    onClick={() => setScope('GLOBAL')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center transition-all ${scope === 'GLOBAL' ? 'bg-cyan-600 text-white shadow-lg' : 'text-ocean-400 hover:text-white'}`}
                  >
                    <Globe className="w-4 h-4 mr-2" /> Global Market
                  </button>
                  <button 
                    onClick={() => setScope('NETWORK')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center transition-all ${scope === 'NETWORK' ? 'bg-cyan-600 text-white shadow-lg' : 'text-ocean-400 hover:text-white'}`}
                  >
                    <Users className="w-4 h-4 mr-2" /> My Network
                  </button>
                </div>
             </div>

             {/* Inputs Row */}
             <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative z-10">
                
                {/* Route */}
                <div className="md:col-span-5 grid grid-cols-2 gap-2">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider pl-1">Origin (POL)</label>
                      <ExplorePortInput placeholder="From" value={pol} onChange={setPol} iconColor="text-emerald-400" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider pl-1">Destination (POD)</label>
                      <ExplorePortInput placeholder="To" value={pod} onChange={setPod} iconColor="text-rose-400" />
                   </div>
                </div>

                {/* Load Type */}
                <div className="md:col-span-3 space-y-1">
                   <label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider pl-1">Load Type</label>
                   <div className="relative">
                      <Ship className="absolute left-3 top-3 w-4 h-4 text-cyan-400 pointer-events-none" />
                      <select 
                        value={loadType} 
                        onChange={(e) => setLoadType(e.target.value as LoadType)}
                        className="w-full bg-ocean-950 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none appearance-none font-medium cursor-pointer"
                      >
                        <option value="">Any Load Type</option>
                        <option value="20 Feet Box">20 Feet Box</option>
                        <option value="40 Feet Box">40 Feet Box</option>
                        <option value="20 ft OC">20 ft OC</option>
                        <option value="20 ft Tanker">20 ft Tanker</option>
                        <option value="Bulk Vessel">Bulk Vessel</option>
                        <option value="LCL">LCL</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-ocean-500 pointer-events-none" />
                   </div>
                </div>

                {/* Schedule Dropdown */}
                <div className="md:col-span-2 space-y-1">
                   <label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider pl-1">Shipment Schedule</label>
                   <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-cyan-400 pointer-events-none" />
                      <select
                        value={schedule}
                        onChange={(e) => setSchedule(e.target.value)}
                        className="w-full bg-ocean-950 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-medium text-sm appearance-none"
                      >
                        <option value="">Any Schedule</option>
                        {scheduleOptions.map((opt, idx) => (
                           <option key={idx} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-ocean-500 pointer-events-none" />
                   </div>
                </div>

                {/* Search Button */}
                <div className="md:col-span-2">
                   <button 
                     onClick={handleSearch}
                     className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] flex items-center justify-center"
                   >
                     <Search className="w-5 h-5 mr-2" /> Search
                   </button>
                </div>
             </div>
          </div>

          {/* RESULTS AREA */}
          {hasSearched && (
            <div className="animate-fade-in-up" ref={tableRef}>
              <h3 className="text-white font-semibold mb-4 flex items-center">
                 <Tag className="w-5 h-5 mr-2 text-cyan-400" />
                 Search Results ({results.length})
              </h3>

              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-white/5 text-xs uppercase text-ocean-300">
                         <tr>
                            <th className="px-6 py-4 font-semibold w-[25%]">Route Info</th>
                            <th className="px-6 py-4 font-semibold w-[15%]">Load Details</th>
                            <th className="px-6 py-4 font-semibold w-[20%]">Schedule</th>
                            <th className="px-6 py-4 font-semibold w-[25%]">Posted By</th>
                            <th className="px-6 py-4 font-semibold text-right w-[15%]">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm text-ocean-100">
                         {results.length > 0 ? (
                           results.map(inq => {
                             const isExpanded = expandedRows.includes(inq.id);
                             const creator = getCreatorDetails(inq.createdBy);
                             
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

                                     {/* Load Details (Qty/Matrix + Load Type) */}
                                     <td className="px-6 py-4 align-top">
                                        <div className="flex flex-col">
                                           <span className="text-white font-bold text-lg">{inq.quantity} <span className="text-sm font-medium text-ocean-300">{inq.matrix}</span></span>
                                           <div className="flex items-center mt-1 text-white font-medium text-sm">
                                                <Box className="w-3.5 h-3.5 mr-2 text-indigo-400" /> {inq.loadType}
                                           </div>
                                        </div>
                                     </td>

                                     {/* Schedule */}
                                     <td className="px-6 py-4 align-top">
                                        <div className="flex items-center text-ocean-200">
                                           <Calendar className="w-4 h-4 mr-2 text-ocean-500 shrink-0" />
                                           <span className="font-bold">{inq.shipmentSchedule}</span>
                                        </div>
                                     </td>

                                     {/* Posted By (User Details) - CLICKABLE */}
                                     <td className="px-6 py-4 align-top" onClick={(e) => handleProfileClick(e, inq.createdBy)}>
                                        <div className="flex flex-col group/user">
                                           <div className="flex items-center">
                                              <User className="w-3.5 h-3.5 mr-2 text-ocean-400 shrink-0 group-hover/user:text-white" />
                                              <span className="text-white font-bold text-sm group-hover/user:underline decoration-dotted decoration-ocean-500 underline-offset-4">{creator.name} <span className="text-ocean-400 font-normal text-xs group-hover/user:text-ocean-300">({creator.designation})</span></span>
                                           </div>
                                           <div className="flex items-center mt-1">
                                              <Briefcase className="w-3.5 h-3.5 mr-2 text-ocean-400 shrink-0" />
                                              <span className="text-cyan-400 text-xs font-semibold">{creator.company}</span>
                                           </div>
                                        </div>
                                     </td>

                                     {/* Action */}
                                     <td className="px-6 py-4 text-right align-top">
                                        <button 
                                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 inline-flex items-center"
                                          onClick={(e) => handleSendOffer(e, inq)}
                                        >
                                          <Send className="w-3 h-3 mr-1.5" /> Send Offer
                                        </button>
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
                                                 {inq.inquiryType === 'GENERAL' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 bg-cyan-900/30 text-cyan-400 text-[10px] rounded border border-cyan-900/50 w-fit">Global</span>
                                                 ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 bg-indigo-900/30 text-indigo-400 text-[10px] rounded border border-indigo-900/50 w-fit">Network</span>
                                                 )}
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
                                  <Search className="w-8 h-8 mb-2 opacity-50" />
                                  <p>No inquiries found matching your criteria.</p>
                               </div>
                             </td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
