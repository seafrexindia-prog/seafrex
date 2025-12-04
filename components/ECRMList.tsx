
import React, { useState, useEffect } from 'react';
import { Home, MessageSquare, CheckCircle, Clock, Filter, History, Eye, ArrowUpRight, ArrowDownLeft, X, Edit, CornerUpLeft, Search, RefreshCw } from 'lucide-react';
import { EcrmTicket, TicketHistory, UserProfile } from '../types';
import { ecrmService } from '../services/ecrmService';
import { masterService } from '../services/masterService';

interface ECRMListProps {
  onBack: () => void;
  onCreateNew: () => void;
  onSelectTicket: (ticketId: string) => void;
  currentUser?: UserProfile;
  onViewProfile?: (profile: Partial<UserProfile>) => void;
}

export const ECRMList: React.FC<ECRMListProps> = ({ onBack, onCreateNew, onSelectTicket, currentUser, onViewProfile }) => {
  const [tickets, setTickets] = useState<EcrmTicket[]>([]);
  const [displayedTickets, setDisplayedTickets] = useState<EcrmTicket[]>([]);
  const [activeTab, setActiveTab] = useState<'SENT' | 'RECEIVED'>('RECEIVED');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');
  const [selectedHistory, setSelectedHistory] = useState<EcrmTicket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // User Filter for Main User
  const [filterUser, setFilterUser] = useState<string>('ME');
  const [isLoading, setIsLoading] = useState(false);
  const subUsers = masterService.getSubUsers();

  useEffect(() => {
    setTickets(ecrmService.getTickets());
  }, []);

  // Initial Load Trigger (once data is set)
  useEffect(() => {
    if (tickets.length > 0) {
        applyFilters();
    }
  }, [tickets]);

  const applyFilters = () => {
    setIsLoading(true);
    setTimeout(() => {
        const filtered = tickets.filter(t => {
            // 1. Tab Filter
            const matchTab = t.type === activeTab;
            
            // 2. Status Filter
            const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
        
            // 3. Search Filter
            const matchSearch = 
                t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.partyName.toLowerCase().includes(searchTerm.toLowerCase());
            
            // 4. User Filter
            let matchUser = true;
            if (currentUser?.isMainUser !== false) {
               // Main User logic
               if (filterUser === 'ME') {
                 matchUser = t.createdBy === 'main';
               } else if (filterUser !== 'ALL') {
                 matchUser = t.createdBy === filterUser;
               }
            } else {
               // Sub User logic
               matchUser = t.createdBy === currentUser?.email;
            }
        
            return matchTab && matchStatus && matchUser && matchSearch;
          });

          setDisplayedTickets(filtered);
          setIsLoading(false);
    }, 300);
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB');

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up relative">
      
      {/* Header Bar */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-rose-600/20 rounded-lg text-rose-400">
             <MessageSquare className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">ECRM Tickets</span>
        </div>
        <button 
          onClick={onBack}
          className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          title="Back to Dashboard"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="shrink-0 px-6 pt-6 pb-2 space-y-4">
        
        {/* Top Controls: Tabs + Filters + Create Button */}
        <div className="flex flex-col xl:flex-row justify-between gap-4">
           {/* Tabs */}
           <div className="flex bg-ocean-900/50 p-1 rounded-xl border border-white/5 self-start shrink-0">
              <button 
                onClick={() => setActiveTab('RECEIVED')}
                className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${activeTab === 'RECEIVED' ? 'bg-ocean-700 text-white shadow-md' : 'text-ocean-400 hover:text-white'}`}
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Received
              </button>
              <button 
                onClick={() => setActiveTab('SENT')}
                className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${activeTab === 'SENT' ? 'bg-ocean-700 text-white shadow-md' : 'text-ocean-400 hover:text-white'}`}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Sent
              </button>
           </div>

           <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
             
             {/* Search Input */}
             <div className="relative flex-1 w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-ocean-400" />
                <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-ocean-900/50 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-ocean-500 focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm h-10"
                />
             </div>

             {/* Filter Dropdown for Main User */}
             {(!currentUser || currentUser.isMainUser) && (
                <select 
                  className="bg-ocean-900/50 border border-ocean-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 outline-none text-sm h-10 w-full sm:w-auto"
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
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all hover:scale-105 h-10 disabled:opacity-50"
             >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin"/> : 'GO'}
             </button>

             <button 
               onClick={onCreateNew}
               className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl font-medium flex items-center shadow-lg shadow-rose-900/20 transition-all hover:scale-105 h-10 whitespace-nowrap w-full sm:w-auto justify-center text-sm"
             >
               <MessageSquare className="w-4 h-4 mr-2" />
               Create Ticket
             </button>
           </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar pb-2">
           <Filter className="w-4 h-4 text-ocean-500 mr-2 shrink-0" />
           {['PENDING', 'ALL', 'RESOLVED'].map((status) => (
             <button
               key={status}
               onClick={() => setStatusFilter(status as any)}
               className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap
                 ${statusFilter === status 
                    ? 'bg-ocean-100 text-ocean-900 border-ocean-100' 
                    : 'bg-transparent text-ocean-400 border-ocean-700 hover:border-ocean-500'
                  }
               `}
             >
               {status === 'ALL' ? 'All Tickets' : status.charAt(0) + status.slice(1).toLowerCase()}
             </button>
           ))}
        </div>
      </div>

      {/* Content Area - Table */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="bg-ocean-900/40 border border-white/10 rounded-xl overflow-hidden shadow-xl">
           <table className="w-full text-left border-collapse">
              <thead className="bg-white/5 text-xs uppercase text-ocean-300 font-semibold tracking-wider">
                 <tr>
                    <th className="px-6 py-4">Ticket ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Party</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                 {displayedTickets.length > 0 ? (
                     displayedTickets.map(ticket => (
                         <tr key={ticket.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => onSelectTicket(ticket.id)}>
                            <td className="px-6 py-4 font-mono text-ocean-300 text-xs">
                              {ticket.ticketNumber}
                            </td>
                            <td className="px-6 py-4 text-ocean-300">{formatDate(ticket.date)}</td>
                            <td className="px-6 py-4">
                               <div className="flex flex-col">
                                  <span className="text-white font-medium">{ticket.partyName}</span>
                                  <span className="text-[10px] text-ocean-500 uppercase">{ticket.partyType}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-ocean-100 font-medium">{ticket.subject}</td>
                            <td className="px-6 py-4">
                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                 ${ticket.status === 'RESOLVED' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' :
                                   'bg-amber-900/20 text-amber-400 border-amber-900/30'
                                 }
                               `}>
                                 {ticket.status === 'RESOLVED' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                 {ticket.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex items-center justify-end space-x-2">
                                 <button 
                                   title="Response / Update"
                                   onClick={(e) => { e.stopPropagation(); onSelectTicket(ticket.id); }}
                                   className="p-1.5 text-cyan-400 hover:bg-cyan-900/30 rounded transition-colors flex items-center bg-cyan-950/30 border border-cyan-900/50"
                                 >
                                    <CornerUpLeft className="w-3.5 h-3.5 mr-1" />
                                    <span className="text-xs">Response</span>
                                 </button>
                                 
                                 <button 
                                   title="View History" 
                                   onClick={(e) => { e.stopPropagation(); setSelectedHistory(ticket); }}
                                   className="p-1.5 text-ocean-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                 >
                                   <History className="w-4 h-4" />
                                 </button>
                               </div>
                            </td>
                         </tr>
                     ))
                 ) : (
                     <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-ocean-400">
                           <div className="flex flex-col items-center justify-center">
                              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                              <p>No tickets found. Click GO to refresh.</p>
                           </div>
                         </td>
                     </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>

      {/* History Modal Overlay */}
      {selectedHistory && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-ocean-900 border border-white/20 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in-up">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                 <h3 className="text-white font-bold flex items-center">
                   <History className="w-4 h-4 mr-2 text-cyan-400" />
                   Record History: {selectedHistory.ticketNumber}
                 </h3>
                 <button onClick={() => setSelectedHistory(null)} className="text-ocean-400 hover:text-white">
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-ocean-700 before:to-transparent">
                    {selectedHistory.history.map((log, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full border border-ocean-600 bg-ocean-800 group-[.is-active]:bg-cyan-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-[10px]">
                          {idx + 1}
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-white/10 bg-white/5 shadow-sm">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <span className="font-bold text-ocean-200 text-sm">{log.action}</span>
                            <time className="font-mono text-[10px] text-ocean-500">{formatDate(log.date)}</time>
                          </div>
                          <div className="text-xs text-ocean-400">
                             By: <span className="text-cyan-400">{log.by}</span>
                          </div>
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
