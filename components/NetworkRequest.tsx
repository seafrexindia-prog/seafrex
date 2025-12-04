import React, { useState } from 'react';
import { Home, Search, UserPlus, ArrowUpRight, ArrowDownLeft, Clock, User, Check, X, Building2, Briefcase } from 'lucide-react';

interface MockUser {
  id: string;
  name: string;
  company: string;
  designation: string;
  photoUrl: string | null;
}

interface RequestItem {
  id: string;
  user: MockUser;
  date: string;
  status: 'PENDING';
}

const SENT_REQUESTS: RequestItem[] = [
  { id: '101', user: { id: 'u1', name: 'John Smith', company: 'TransAtlantic Log.', designation: 'Manager', photoUrl: null }, date: '2024-05-14', status: 'PENDING' },
  { id: '102', user: { id: 'u2', name: 'Alice Wong', company: 'Asia Pacific Freight', designation: 'Director', photoUrl: null }, date: '2024-05-13', status: 'PENDING' },
];

const RECEIVED_REQUESTS: RequestItem[] = [
  { id: '201', user: { id: 'u3', name: 'Carlos Ruiz', company: 'Latam Cargo', designation: 'Operations', photoUrl: null }, date: '2024-05-15', status: 'PENDING' },
];

interface NetworkRequestProps {
  onBack: () => void;
}

export const NetworkRequest: React.FC<NetworkRequestProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'SENT' | 'RECEIVED'>('RECEIVED');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<MockUser | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [sentList, setSentList] = useState(SENT_REQUESTS);
  const [receivedList, setReceivedList] = useState(RECEIVED_REQUESTS);
  const [requestSentMessage, setRequestSentMessage] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResult(null);
    setRequestSentMessage('');

    // Simulate API search
    setTimeout(() => {
      setIsSearching(false);
      // Dummy logic: if query length > 3, find a user
      if (searchQuery.length > 3) {
        setSearchResult({
          id: `new-${Date.now()}`,
          name: 'Michael Scott',
          company: 'Dunder Mifflin Logistics',
          designation: 'Regional Manager',
          photoUrl: null
        });
      }
    }, 800);
  };

  const sendRequest = () => {
    if (!searchResult) return;
    
    const newReq: RequestItem = {
      id: Date.now().toString(),
      user: searchResult,
      date: new Date().toISOString().split('T')[0],
      status: 'PENDING'
    };

    setSentList([newReq, ...sentList]);
    setSearchResult(null);
    setSearchQuery('');
    setRequestSentMessage(`Request sent to ${searchResult.name}!`);
    setTimeout(() => setRequestSentMessage(''), 3000);
  };

  const handleAccept = (id: string) => {
    setReceivedList(prev => prev.filter(r => r.id !== id));
    // In real app, add to My Network
  };

  const handleReject = (id: string) => {
    setReceivedList(prev => prev.filter(r => r.id !== id));
  };

  const handleCancelSent = (id: string) => {
    setSentList(prev => prev.filter(r => r.id !== id));
  };

  // Helper to render table rows
  const renderRows = (list: RequestItem[], type: 'SENT' | 'RECEIVED') => {
    if (list.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="px-6 py-12 text-center text-ocean-400">
             <div className="flex flex-col items-center justify-center">
               <div className="w-12 h-12 bg-ocean-900/50 rounded-full flex items-center justify-center mb-3">
                 {type === 'RECEIVED' ? <ArrowDownLeft className="w-6 h-6 opacity-50" /> : <ArrowUpRight className="w-6 h-6 opacity-50" />}
               </div>
               <p>No pending {type.toLowerCase()} requests.</p>
             </div>
          </td>
        </tr>
      );
    }

    return list.map(req => (
      <tr key={req.id} className="hover:bg-white/5 transition-colors">
        <td className="px-6 py-4">
           <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-ocean-800 rounded-full flex items-center justify-center text-sm font-bold text-white border border-ocean-600 shrink-0">
                {req.user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                 <h5 className="font-bold text-white text-sm">{req.user.name}</h5>
                 <span className="text-[11px] text-ocean-400 flex items-center mt-0.5">
                   <Briefcase className="w-3 h-3 mr-1 opacity-70" /> {req.user.designation}
                 </span>
              </div>
           </div>
        </td>
        <td className="px-6 py-4 text-white font-medium">
          {req.user.company}
        </td>
        <td className="px-6 py-4 text-ocean-300 text-sm">
           <div className="flex items-center">
             <Clock className="w-3.5 h-3.5 mr-1.5" /> {req.date}
           </div>
        </td>
        <td className="px-6 py-4 text-right">
           {type === 'RECEIVED' ? (
             <div className="flex items-center justify-end space-x-2">
               <button onClick={() => handleAccept(req.id)} className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-900/30 rounded-lg transition-all text-xs font-medium flex items-center" title="Accept">
                 <Check className="w-3.5 h-3.5 mr-1" /> Accept
               </button>
               <button onClick={() => handleReject(req.id)} className="px-3 py-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-900/30 rounded-lg transition-all text-xs font-medium flex items-center" title="Reject">
                 <X className="w-3.5 h-3.5 mr-1" /> Reject
               </button>
             </div>
           ) : (
             <button 
                onClick={() => handleCancelSent(req.id)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-ocean-300 hover:text-white rounded-lg text-xs font-medium border border-white/10 transition-colors inline-flex items-center"
              >
                <X className="w-3.5 h-3.5 mr-1.5" /> Cancel Request
              </button>
           )}
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-cyan-600/20 rounded-lg text-cyan-400">
             <UserPlus className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">Network Requests</span>
        </div>
        <button 
          onClick={onBack}
          className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          title="Back to Dashboard"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
        
        {/* Search Panel */}
        <div className="bg-ocean-900/40 border border-white/10 rounded-2xl p-6 shadow-xl">
          <h3 className="text-white font-medium mb-4 flex items-center">
            <Search className="w-4 h-4 mr-2 text-ocean-400" />
            Find & Connect
          </h3>
          
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input 
                type="text" 
                placeholder="Search by Mobile or Email..." 
                className="flex-1 bg-black/20 border border-ocean-700 rounded-xl px-4 py-3 text-white placeholder-ocean-500 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>

          {/* Search Result Card */}
          {searchResult && (
             <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between animate-fade-in-up">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="w-16 h-16 bg-ocean-800 rounded-full flex items-center justify-center text-2xl font-bold text-ocean-400 border-2 border-ocean-600">
                    {searchResult.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{searchResult.name}</h4>
                    <p className="text-sm text-cyan-400 font-medium">{searchResult.company}</p>
                    <p className="text-xs text-ocean-400 flex items-center mt-1">
                      <Briefcase className="w-3 h-3 mr-1" /> {searchResult.designation}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={sendRequest}
                  className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center shadow-lg shadow-green-900/20"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Request
                </button>
             </div>
          )}
          {requestSentMessage && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-xl text-center text-sm animate-pulse">
              {requestSentMessage}
            </div>
          )}
        </div>

        {/* Pending Requests Section (Styled like ECRM) */}
        <div className="space-y-4">
           
           {/* Tabs */}
           <div className="flex bg-ocean-900/50 p-1 rounded-xl border border-white/5 self-start w-fit">
              <button 
                onClick={() => setActiveTab('RECEIVED')}
                className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${activeTab === 'RECEIVED' ? 'bg-ocean-700 text-white shadow-md' : 'text-ocean-400 hover:text-white'}`}
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Received ({receivedList.length})
              </button>
              <button 
                onClick={() => setActiveTab('SENT')}
                className={`px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${activeTab === 'SENT' ? 'bg-ocean-700 text-white shadow-md' : 'text-ocean-400 hover:text-white'}`}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Sent ({sentList.length})
              </button>
           </div>

           {/* List Container - Converted to Table for consistent column alignment */}
           <div className="bg-ocean-900/40 border border-white/10 rounded-xl overflow-hidden shadow-xl min-h-[300px]">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-white/5 text-xs uppercase text-ocean-300 font-semibold tracking-wider">
                   <tr>
                     <th className="px-6 py-4">User Details</th>
                     <th className="px-6 py-4">Company</th>
                     <th className="px-6 py-4">Date</th>
                     <th className="px-6 py-4 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-sm">
                   {renderRows(activeTab === 'RECEIVED' ? receivedList : sentList, activeTab)}
                 </tbody>
               </table>
           </div>
        </div>

      </div>
    </div>
  );
};