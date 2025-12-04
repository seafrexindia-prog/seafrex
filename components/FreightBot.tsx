
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Filter, 
  AlertCircle, 
  Clock, 
  Bell,
  Search,
  Home,
  Activity,
  ArrowRight
} from 'lucide-react';

type MessageCategory = 'NEW' | 'ACTION' | 'PENDING' | 'OLD';
type TargetModule = 'INQUIRY' | 'OFFER' | 'ECRM' | 'BOOKING';

interface BotMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  category: MessageCategory;
  isOutgoing: boolean;
  avatarInitials?: string;
  reactions?: string[];
  actionRequired?: boolean; 
  targetModule?: TargetModule;
  targetId?: string;
}

const INITIAL_MESSAGES: BotMessage[] = [
  { 
    id: '1', 
    sender: 'Rakesh Kumar', 
    text: 'Sent Inquiry for UAE: Need 20ft container rates urgently. Cargo ready by 20th.', 
    timestamp: '10:30 AM', 
    category: 'ACTION', 
    isOutgoing: false,
    avatarInitials: 'RK',
    actionRequired: true,
    targetModule: 'INQUIRY',
    targetId: '1'
  },
  { 
    id: '2', 
    sender: 'Bansal Vikas', 
    text: 'Send Offer for MUNDRA: $1200 all in rate available. Valid until tomorrow.', 
    timestamp: '09:15 AM', 
    category: 'NEW', 
    isOutgoing: false,
    avatarInitials: 'BV',
    actionRequired: true,
    targetModule: 'OFFER',
    targetId: '2'
  },
  { 
    id: '3', 
    sender: 'You', 
    text: 'Sent offer to Rakesh Kumar for UAE: $1400 valid till Friday.', 
    timestamp: 'Yesterday', 
    category: 'OLD', 
    isOutgoing: true,
    targetModule: 'OFFER',
    targetId: '3'
  },
  { 
    id: '4', 
    sender: 'System', 
    text: 'Booking #BKG-992 is pending carrier confirmation. Please check documents.', 
    timestamp: 'Yesterday', 
    category: 'PENDING', 
    isOutgoing: false,
    avatarInitials: 'SYS',
    actionRequired: true,
    targetModule: 'BOOKING',
    targetId: '992'
  },
  { 
    id: '5', 
    sender: 'Freight Bot', 
    text: 'Welcome to Seafrex Activity Feed. I will track all your logistics events here.', 
    timestamp: '2 days ago', 
    category: 'OLD', 
    isOutgoing: false,
    avatarInitials: 'BOT'
  },
];

interface FreightBotProps {
  onBack?: () => void;
  onNavigate?: (module: string, id?: string) => void;
}

export const FreightBot: React.FC<FreightBotProps> = ({ onBack, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<MessageCategory | 'ALL'>('ALL');
  const [messages, setMessages] = useState<BotMessage[]>(INITIAL_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeFilter]);

  const handleActionClick = (msg: BotMessage) => {
    if (onNavigate && msg.targetModule) {
        onNavigate(msg.targetModule, msg.targetId);
    } else {
        alert("Navigation not linked for this demo.");
    }
  };

  const filteredMessages = activeFilter === 'ALL' 
    ? messages 
    : messages.filter(m => m.category === activeFilter);

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      
      {/* Internal Header Bar */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <Activity className="w-5 h-5 text-cyan-400" />
           <span className="font-semibold text-lg text-white">Activity Feed</span>
        </div>
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Back to Dashboard"
          >
            <Home className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Toolbar: Filters */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-ocean-900/40 border-b border-white/5 space-x-4">
          <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar flex-1">
            <Filter className="w-3 h-3 text-ocean-500 mr-1 shrink-0" />
            <button onClick={() => setActiveFilter('ALL')} className={`flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${activeFilter === 'ALL' ? 'bg-ocean-700 text-white' : 'text-ocean-400 hover:bg-ocean-800/50'}`}>All</button>
            <button onClick={() => setActiveFilter('ACTION')} className={`flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${activeFilter === 'ACTION' ? 'bg-rose-900/40 text-rose-300 border border-rose-900' : 'text-ocean-400 hover:bg-ocean-800/50'}`}><AlertCircle className="w-3 h-3 mr-1.5" /> Action</button>
            <button onClick={() => setActiveFilter('NEW')} className={`flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${activeFilter === 'NEW' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-900' : 'text-ocean-400 hover:bg-ocean-800/50'}`}><Bell className="w-3 h-3 mr-1.5" /> New</button>
            <button onClick={() => setActiveFilter('PENDING')} className={`flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${activeFilter === 'PENDING' ? 'bg-amber-900/40 text-amber-300 border border-amber-900' : 'text-ocean-400 hover:bg-ocean-800/50'}`}><Clock className="w-3 h-3 mr-1.5" /> Pending</button>
          </div>
          <div className="relative w-40 shrink-0 hidden md:block">
            <Search className="absolute left-2.5 top-1.5 w-3 h-3 text-ocean-500" />
            <input type="text" placeholder="Search..." className="w-full bg-ocean-950/50 border border-ocean-800/50 rounded-lg pl-8 pr-3 py-1 text-[10px] text-white focus:outline-none focus:border-cyan-500/30 transition-all" />
          </div>
      </div>

      {/* MESSAGES AREA - Compact & Centered */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-ocean-950/30 flex flex-col items-center">
         <div className="w-full max-w-2xl px-4 py-4 space-y-4">
            {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-ocean-600 opacity-60">
                  <MessageSquare className="w-12 h-12 mb-3" />
                  <p className="text-sm font-medium">No activity in this category</p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <div key={msg.id} className={`flex w-full group ${msg.isOutgoing ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex w-full max-w-[85%] ${msg.isOutgoing ? 'flex-row-reverse' : 'flex-row'}`}>
                      
                      {/* Compact Avatar */}
                      <div className={`
                        flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border border-white/10 mt-1 shadow-lg
                        ${msg.isOutgoing ? 'ml-2 bg-ocean-600 text-white' : 'mr-2 bg-ocean-800 text-ocean-200'}
                      `}>
                        {msg.isOutgoing ? 'ME' : msg.avatarInitials || 'BOT'}
                      </div>

                      {/* Content Column */}
                      <div className={`flex flex-col ${msg.isOutgoing ? 'items-end' : 'items-start'} flex-1 min-w-0`}>
                        
                        {/* Name & Time */}
                        <div className={`flex items-center mb-0.5 space-x-2 ${msg.isOutgoing ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                          <span className="text-[10px] font-bold text-ocean-400">{msg.sender}</span>
                          <span className="text-[9px] text-ocean-600">{msg.timestamp}</span>
                        </div>

                        {/* Bubble */}
                        <div className={`
                          px-3 py-2.5 rounded-xl text-xs shadow-sm relative group border border-white/5
                          ${msg.isOutgoing 
                            ? 'bg-gradient-to-br from-ocean-700 to-ocean-800 text-white rounded-tr-none' 
                            : 'bg-ocean-900 text-ocean-200 rounded-tl-none border-ocean-800'}
                        `}>
                           <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                           
                           {/* Action Button (Load Record) */}
                           {msg.targetModule && (
                             <div className={`mt-2 pt-2 border-t ${msg.isOutgoing ? 'border-white/10' : 'border-ocean-800'} flex justify-end`}>
                                <button 
                                    onClick={() => handleActionClick(msg)}
                                    className={`flex items-center px-2 py-1 rounded-md text-[10px] font-bold transition-all shadow
                                       ${msg.isOutgoing ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-cyan-900/40 text-cyan-400 hover:bg-cyan-900/60'}
                                    `}
                                >
                                   View Record <ArrowRight className="w-2.5 h-2.5 ml-1" />
                                </button>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
         </div>
      </div>

    </div>
  );
};
