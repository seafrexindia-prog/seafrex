import React, { useState, useEffect, useRef } from 'react';
import { Home, ClipboardList, Search, Ship, MapPin, Box, ChevronRight, ChevronUp, ChevronDown, RefreshCw, Eye, Printer, Mail, MoreVertical, Calendar, Anchor, Hash, CheckCircle, Clock, FileText } from 'lucide-react';
import { Booking, UserProfile } from '../types';
import { bookingService } from '../services/bookingService';

interface BookingReportProps {
  onBack: () => void;
  currentUser: UserProfile;
}

export const BookingReport: React.FC<BookingReportProps> = ({ onBack, currentUser }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [displayedBookings, setDisplayedBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL');
  
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (bookings.length > 0) applyFilters(); }, [bookings]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openActionId && !target.closest('.action-menu-container')) { setOpenActionId(null); }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openActionId]);

  const loadData = () => {
    const all = bookingService.getBookings();
    const myBookings = all.filter(b => 
        b.clientUser === (currentUser.email || 'main') || 
        b.providerUser === (currentUser.email || 'main') ||
        (currentUser.isMainUser && (b.clientUser === 'main' || b.providerUser === 'main'))
    );
    setBookings(myBookings);
  };

  const applyFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
        const filtered = bookings.filter(b => {
            const searchMatch = 
                (b.bookingRef || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                (b.pol || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (b.pod || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (b.offerNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            let statusMatch = true;
            if (statusFilter === 'PENDING') statusMatch = b.status === 'PENDING';
            if (statusFilter === 'ACTIVE') statusMatch = !['PENDING', 'LOAD_DISCHARGED'].includes(b.status);
            if (statusFilter === 'COMPLETED') statusMatch = b.status === 'LOAD_DISCHARGED';

            return searchMatch && statusMatch;
        });
        setDisplayedBookings(filtered);
        setIsLoading(false);
    }, 300);
  };

  const toggleRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedRowIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const toggleActionMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenActionId(prev => prev === id ? null : id);
  };

  const handlePrint = (b: Booking) => {
      setOpenActionId(null);
      alert(`Printing Booking Report for Ref: ${b.bookingRef}...`);
  };

  const handleEmail = (b: Booking) => {
      setOpenActionId(null);
      alert(`Emailing status report for Ref: ${b.bookingRef} to client.`);
  };

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up relative">
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3"><div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400"><FileText className="w-5 h-5" /></div><span className="font-semibold text-lg text-white">Booking Report</span></div>
        <button onClick={onBack} className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"><Home className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
         <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
                <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-ocean-400" /><input type="text" placeholder="Search Ref, Route, Offer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"/></div>
                <div className="flex items-center space-x-2 bg-ocean-950/50 rounded-lg p-1 border border-ocean-700">{(['ALL', 'PENDING', 'ACTIVE', 'COMPLETED'] as const).map(s => (<button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${statusFilter === s ? 'bg-indigo-600 text-white' : 'text-ocean-400 hover:text-white'}`}>{s}</button>))}</div>
                <button onClick={applyFilters} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg flex items-center disabled:opacity-50">{isLoading ? <RefreshCw className="w-4 h-4 animate-spin"/> : 'GO'}</button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl" ref={tableRef}>
               <div className="overflow-x-auto" style={{minHeight: '200px'}}>
                 <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs uppercase text-ocean-300"><tr><th className="px-6 py-4 font-semibold w-[20%]">Ref / Date</th><th className="px-6 py-4 font-semibold w-[20%]">Route</th><th className="px-6 py-4 font-semibold w-[20%]">Carrier</th><th className="px-6 py-4 font-semibold w-[15%]">Cargo</th><th className="px-6 py-4 font-semibold w-[15%]">Status</th><th className="px-6 py-4 font-semibold text-right w-[10%]">Action</th></tr></thead>
                    <tbody className="divide-y divide-white/5 text-sm text-ocean-100">
                       {displayedBookings.length > 0 ? displayedBookings.map(b => {
                           const isExpanded = expandedRowIds.includes(b.id);
                           const statusColor = b.status === 'PENDING' ? 'bg-amber-900/30 text-amber-400' : b.status === 'LOAD_DISCHARGED' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-blue-900/30 text-blue-400';
                           return (
                               <React.Fragment key={b.id}>
                                   <tr className={`hover:bg-white/5 transition-colors cursor-pointer ${isExpanded ? 'bg-white/5' : ''}`} onClick={(e) => toggleRow(b.id, e)}>
                                       <td className="px-6 py-4 align-top"><div className="font-mono font-bold text-white text-sm">{b.bookingRef !== 'PENDING' ? b.bookingRef : 'PENDING'}</div><div className="text-[10px] text-ocean-400 mt-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> {new Date(b.createdAt).toLocaleDateString()}</div></td>
                                       <td className="px-6 py-4 align-top"><div className="flex flex-col space-y-1"><span className="flex items-center text-white text-xs font-bold"><MapPin className="w-3 h-3 mr-1 text-emerald-400" /> {b.pol.split('(')[0]}</span><span className="flex items-center text-white text-xs font-bold"><MapPin className="w-3 h-3 mr-1 text-rose-400" /> {b.pod.split('(')[0]}</span></div></td>
                                       <td className="px-6 py-4 align-top"><div className="font-medium text-white text-xs">{b.shippingLine || '-'}</div><div className="text-[10px] text-ocean-400 mt-1 flex items-center"><Anchor className="w-3 h-3 mr-1"/> {b.vesselName}</div></td>
                                       <td className="px-6 py-4 align-top"><div className="font-medium text-white">{b.commodity}</div><div className="text-xs text-ocean-400 mt-1">{b.quantity} x {b.loadType}</div></td>
                                       <td className="px-6 py-4 align-top"><span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>{b.status.replace(/_/g, ' ')}</span></td>
                                       <td className="px-6 py-4 text-right align-top relative"><div className="flex flex-col items-end gap-2 action-menu-container" onClick={e => e.stopPropagation()}><div className="relative"><button onClick={(e) => toggleActionMenu(b.id, e)} className="px-2 py-1 bg-ocean-800 hover:bg-ocean-700 text-ocean-200 rounded border border-ocean-600 flex items-center text-xs font-medium transition-colors">Action <MoreVertical className="w-3 h-3 ml-1" /></button>{openActionId === b.id && (<div className="absolute right-0 top-full mt-1 w-36 bg-ocean-900 border border-ocean-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in-up"><button onClick={(e) => { e.stopPropagation(); toggleRow(b.id, e); setOpenActionId(null); }} className="w-full text-left px-3 py-2 text-xs text-cyan-400 hover:bg-white/10 flex items-center"><Eye className="w-3 h-3 mr-2" /> View Details</button><button onClick={(e) => { e.stopPropagation(); handlePrint(b); }} className="w-full text-left px-3 py-2 text-xs text-ocean-300 hover:bg-white/10 flex items-center"><Printer className="w-3 h-3 mr-2" /> Print Report</button><button onClick={(e) => { e.stopPropagation(); handleEmail(b); }} className="w-full text-left px-3 py-2 text-xs text-ocean-300 hover:bg-white/10 flex items-center"><Mail className="w-3 h-3 mr-2" /> Email Status</button></div>)}</div><button onClick={(e) => toggleRow(b.id, e)} className="text-xs flex items-center text-indigo-400 hover:text-white mt-1">{isExpanded ? 'Collapse' : 'Expand'} {isExpanded ? <ChevronUp className="w-3 h-3 ml-1"/> : <ChevronDown className="w-3 h-3 ml-1"/>}</button></div></td>
                                   </tr>
                                   {isExpanded && (<tr className="bg-ocean-900/30 border-b border-white/5 animate-fade-in-up" onClick={e => e.stopPropagation()}><td colSpan={6} className="px-6 py-4"><div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs"><div className="col-span-1 border-r border-white/5 pr-4"><p className="text-ocean-500 font-bold uppercase mb-3">Partner Information</p><div className="space-y-2"><div className="flex justify-between"><span className="text-ocean-400">Offer Ref:</span><span className="text-white font-mono">{b.offerNumber}</span></div><div className="flex justify-between"><span className="text-ocean-400">Client:</span><span className="text-white">{b.clientName}</span></div><div className="flex justify-between"><span className="text-ocean-400">Provider:</span><span className="text-white">{b.providerUser}</span></div></div></div><div className="col-span-2"><p className="text-ocean-500 font-bold uppercase mb-3">Recent Status History</p><div className="space-y-3 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/50 before:to-transparent pl-4">{b.timeline.slice().reverse().slice(0, 3).map((log, idx) => (<div key={idx} className="relative"><div className={`absolute -left-4 top-1 w-3 h-3 rounded-full border border-ocean-950 ${idx === 0 ? 'bg-emerald-500' : 'bg-ocean-700'}`}></div><div className="flex justify-between items-start"><div><span className={`font-bold ${idx === 0 ? 'text-white' : 'text-ocean-400'}`}>{log.status.replace(/_/g, ' ')}</span>{log.remarks && <p className="text-ocean-500 italic mt-0.5">{log.remarks}</p>}</div><div className="text-right"><div className="text-ocean-400">{new Date(log.date).toLocaleDateString()}</div><div className="text-ocean-600 text-[10px]">{new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div></div></div></div>))}</div></div></div></td></tr>)}
                               </React.Fragment>
                           );
                       }) : (<tr><td colSpan={6} className="px-6 py-12 text-center text-ocean-400">No bookings found matching criteria.</td></tr>)}
                    </tbody>
                 </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};