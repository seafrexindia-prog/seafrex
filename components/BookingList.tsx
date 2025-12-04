
import React, { useState, useEffect } from 'react';
import { Home, ClipboardList, Search, Ship, MapPin, Box, Eye, Edit, RefreshCw } from 'lucide-react';
import { Booking, UserProfile } from '../types';
import { bookingService } from '../services/bookingService';
import { BookingWizard } from './BookingWizard';

interface BookingListProps {
  onBack: () => void;
  currentUser: UserProfile;
}

export const BookingList: React.FC<BookingListProps> = ({ onBack, currentUser }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [displayedBookings, setDisplayedBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED'>('ALL');
  
  // Modal States
  const [selectedBookingForUpdate, setSelectedBookingForUpdate] = useState<Booking | null>(null);
  const [selectedBookingForView, setSelectedBookingForView] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (bookings.length > 0) applyFilters();
  }, [bookings]);

  const loadData = () => {
    const all = bookingService.getBookings();
    // Logic: Main user sees bookings where they are Provider OR Client
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
              (b.pod || '').toLowerCase().includes(searchTerm.toLowerCase());
            
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

  const handleUpdate = (booking: Booking) => {
      setSelectedBookingForUpdate(booking);
  };

  const handleView = (booking: Booking) => {
      setSelectedBookingForView(booking);
  };

  const handleWizardSuccess = () => {
      setSelectedBookingForUpdate(null);
      loadData(); 
  };

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up relative">
      
      {/* Header */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
             <ClipboardList className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">Bookings & Shipments</span>
        </div>
        <button onClick={onBack} className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
         <div className="space-y-6">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-lg">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-ocean-400" />
                    <input
                        type="text"
                        placeholder="Search Booking ID, Route..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-ocean-900/50 border border-ocean-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                
                <div className="flex items-center space-x-2 bg-ocean-950/50 rounded-lg p-1 border border-ocean-700">
                    {(['ALL', 'PENDING', 'ACTIVE', 'COMPLETED'] as const).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'text-ocean-400 hover:text-white'}`}>{s}</button>
                    ))}
                </div>

                <button onClick={applyFilters} disabled={isLoading} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg flex items-center disabled:opacity-50">
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin"/> : 'GO'}
                </button>
            </div>

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
               <div className="overflow-x-auto" style={{minHeight: '200px'}}>
                 <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs uppercase text-ocean-300">
                       <tr>
                          <th className="px-6 py-4 font-semibold">Booking Ref</th>
                          <th className="px-6 py-4 font-semibold">Route</th>
                          <th className="px-6 py-4 font-semibold">Cargo</th>
                          <th className="px-6 py-4 font-semibold">Partner</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-ocean-100">
                       {displayedBookings.length > 0 ? displayedBookings.map(b => {
                           const isProvider = b.providerUser === (currentUser.email || 'main');
                           const statusColor = b.status === 'PENDING' ? 'bg-amber-900/30 text-amber-400' :
                                               b.status === 'LOAD_DISCHARGED' ? 'bg-emerald-900/30 text-emerald-400' :
                                               'bg-blue-900/30 text-blue-400';

                           return (
                               <tr key={b.id} className="hover:bg-white/5 transition-colors">
                                   <td className="px-6 py-4">
                                       <div className="font-mono font-bold text-white">{b.bookingRef}</div>
                                       {b.shippingLine && <div className="text-xs text-ocean-400 mt-1">{b.shippingLine}</div>}
                                       <div className="text-[10px] text-ocean-600 mt-0.5">ID: {b.id}</div>
                                   </td>
                                   <td className="px-6 py-4">
                                       <div className="flex flex-col space-y-1">
                                           <span className="flex items-center text-white text-xs font-bold"><MapPin className="w-3 h-3 mr-1 text-emerald-400" /> {b.pol.split('(')[0]}</span>
                                           <span className="flex items-center text-white text-xs font-bold"><MapPin className="w-3 h-3 mr-1 text-rose-400" /> {b.pod.split('(')[0]}</span>
                                       </div>
                                   </td>
                                   <td className="px-6 py-4">
                                       <div className="font-medium text-white">{b.commodity}</div>
                                       <div className="text-xs text-ocean-400 mt-1"><Box className="w-3 h-3 inline mr-1"/>{b.quantity} x {b.loadType}</div>
                                   </td>
                                   <td className="px-6 py-4">
                                       {isProvider ? (
                                           <div><span className="text-xs text-ocean-400 block">Client:</span><span className="text-white font-bold">{b.clientName}</span></div>
                                       ) : (
                                           <div><span className="text-xs text-ocean-400 block">Provider:</span><span className="text-cyan-400 font-bold">Service Provider</span></div>
                                       )}
                                   </td>
                                   <td className="px-6 py-4">
                                       <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                                           {b.status.replace(/_/g, ' ')}
                                       </span>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                       {isProvider ? (
                                           <button onClick={() => handleUpdate(b)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg flex items-center ml-auto">
                                               <Edit className="w-3 h-3 mr-1.5" /> Process
                                           </button>
                                       ) : (
                                           <button onClick={() => handleView(b)} className="bg-ocean-800 hover:bg-ocean-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-ocean-600 flex items-center ml-auto">
                                               <Eye className="w-3 h-3 mr-1.5" /> Track Status
                                           </button>
                                       )}
                                   </td>
                               </tr>
                           );
                       }) : (
                           <tr><td colSpan={6} className="px-6 py-12 text-center text-ocean-400">No bookings found.</td></tr>
                       )}
                    </tbody>
                 </table>
               </div>
            </div>
         </div>
      </div>

      {/* UPDATE WIZARD (Provider Only) */}
      {selectedBookingForUpdate && (
          <BookingWizard 
             booking={selectedBookingForUpdate} 
             onClose={() => setSelectedBookingForUpdate(null)}
             onSaveSuccess={handleWizardSuccess}
             currentUserEmail={currentUser.email || 'main'}
          />
      )}

      {/* VIEW / TIMELINE MODAL (Client Only) */}
      {selectedBookingForView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-lg bg-ocean-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="h-14 bg-white/5 border-b border-white/10 flex items-center justify-between px-6">
                      <h3 className="font-bold text-white flex items-center"><Ship className="w-4 h-4 mr-2 text-cyan-400"/> Shipment Tracking</h3>
                      <button onClick={() => setSelectedBookingForView(null)} className="text-ocean-400 hover:text-white"><Eye className="w-5 h-5" /></button>
                  </div>
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      <div className="mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
                          <div className="flex justify-between items-start">
                              <div>
                                  <p className="text-xs text-ocean-500 uppercase font-bold">Booking Ref</p>
                                  <p className="text-xl text-white font-mono font-bold">{selectedBookingForView.bookingRef}</p>
                              </div>
                              <div className="text-right">
                                  <p className="text-xs text-ocean-500 uppercase font-bold">Line</p>
                                  <p className="text-white">{selectedBookingForView.shippingLine || '-'}</p>
                              </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                              <span className="text-emerald-400 font-bold">{selectedBookingForView.pol.split('(')[0]}</span>
                              <div className="h-0.5 bg-ocean-700 flex-1 mx-3 relative">
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ocean-900 px-2 text-[10px] text-ocean-400">VIA {selectedBookingForView.vesselName}</div>
                              </div>
                              <span className="text-rose-400 font-bold">{selectedBookingForView.pod.split('(')[0]}</span>
                          </div>
                      </div>

                      {/* Client View Timeline */}
                      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-ocean-800 before:via-ocean-700 before:to-transparent pl-8">
                          {selectedBookingForView.timeline.slice().reverse().map((log, idx) => (
                              <div key={idx} className="relative group">
                                  <div className={`absolute -left-8 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-ocean-950 ${idx === 0 ? 'border-blue-500 text-blue-500 shadow-lg shadow-blue-900/50' : 'border-ocean-600 text-ocean-600'}`}>
                                      <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-current' : 'bg-transparent'}`} />
                                  </div>
                                  <div>
                                      <p className={`text-sm font-bold ${idx === 0 ? 'text-white' : 'text-ocean-300'}`}>{log.status.replace(/_/g, ' ')}</p>
                                      <p className="text-xs text-ocean-500 font-mono mt-0.5">{new Date(log.date).toLocaleString()}</p>
                                      {log.remarks && <p className="text-xs text-ocean-400 mt-1 italic">"{log.remarks}"</p>}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
