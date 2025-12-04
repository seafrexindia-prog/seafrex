
import React, { useState, useEffect } from 'react';
import { Home, MessageSquare, Send, Upload, X, CheckCircle, Clock, History, AlertCircle } from 'lucide-react';
import { EcrmTicket } from '../types';
import { ecrmService } from '../services/ecrmService';

interface ECRMUpdateProps {
  ticketId: string;
  onBack: () => void;
  onUpdateSuccess: () => void;
}

export const ECRMUpdate: React.FC<ECRMUpdateProps> = ({ ticketId, onBack, onUpdateSuccess }) => {
  const [ticket, setTicket] = useState<EcrmTicket | null>(null);
  const [response, setResponse] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const data = ecrmService.getTicketById(ticketId);
    if (data) {
      setTicket(data);
    }
  }, [ticketId]);

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim() || !ticket) return;

    ecrmService.addResponse(ticket.id, response + (fileName ? ` (Attached: ${fileName})` : ''), 'You');
    onUpdateSuccess();
  };

  const handleMarkResolved = () => {
    if (!ticket) return;
    if (window.confirm('Are you sure you want to mark this ticket as RESOLVED?')) {
        ecrmService.updateStatus(ticket.id, 'RESOLVED');
        onUpdateSuccess();
    }
  };

  if (!ticket) return <div className="p-8 text-center text-white">Loading ticket details...</div>;

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-rose-600/20 rounded-lg text-rose-400">
             <MessageSquare className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">Update Ticket: {ticket.ticketNumber}</span>
        </div>
        <button 
          onClick={onBack}
          className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          title="Back to List"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Top Info Panel */}
            <div className="bg-ocean-900/40 border border-white/10 rounded-2xl p-6 shadow-xl">
               <div className="flex flex-col md:flex-row justify-between mb-6 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{ticket.subject}</h2>
                    <p className="text-ocean-300 text-sm">Party: <span className="text-cyan-400 font-semibold">{ticket.partyName}</span> <span className="text-ocean-500 text-xs">({ticket.partyType})</span></p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-4">
                     <div className="text-right">
                       <p className="text-xs text-ocean-500 font-mono">Date: {ticket.date}</p>
                       <span className={`inline-flex items-center px-3 py-1 mt-1 rounded-full text-xs font-bold border
                            ${ticket.status === 'PENDING' ? 'bg-amber-900/20 text-amber-400 border-amber-900/30' : 
                              ticket.status === 'RESOLVED' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' :
                              'bg-blue-900/20 text-blue-400 border-blue-900/30'
                            }
                        `}>
                            {ticket.status}
                        </span>
                     </div>
                  </div>
               </div>
               
               <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                 <p className="text-xs text-ocean-500 uppercase font-bold mb-2">Original Message</p>
                 <p className="text-ocean-100 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
               </div>
            </div>

            {/* Response Form */}
            {ticket.status !== 'RESOLVED' && (
                <div className="bg-ocean-900/40 border border-white/10 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-white font-medium mb-4 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-rose-400" />
                        Add Response / Update
                    </h3>
                    <form onSubmit={handleSubmitResponse} className="space-y-4">
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={4}
                            className="w-full bg-black/20 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all resize-none placeholder-ocean-500"
                            placeholder="Type your response or update here..."
                            required
                        />
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                           {/* Attachment */}
                            <div className="w-full sm:w-auto flex-1">
                                <label className="flex items-center justify-between px-4 py-2 bg-ocean-950/50 border border-ocean-700 rounded-lg cursor-pointer hover:bg-ocean-900 transition-colors group">
                                    <div className="flex items-center truncate">
                                        <Upload className="w-4 h-4 mr-2 text-ocean-400 group-hover:text-rose-400" />
                                        <span className="text-sm text-ocean-300 truncate max-w-[200px]">
                                            {fileName || "Attach File (Optional)"}
                                        </span>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                                    />
                                    {fileName && <button type="button" onClick={(e) => { e.preventDefault(); setFileName(''); }}><X className="w-4 h-4 text-ocean-500 hover:text-white"/></button>}
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                                <button
                                    type="button"
                                    onClick={handleMarkResolved}
                                    className="px-4 py-2 bg-emerald-900/20 text-emerald-400 border border-emerald-900/50 hover:bg-emerald-900/40 rounded-xl text-sm font-medium transition-colors flex items-center"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Resolved
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-900/20 transition-all flex items-center"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Response
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* History Feed */}
            <div className="bg-ocean-900/40 border border-white/10 rounded-2xl p-6 shadow-xl">
                 <h3 className="text-white font-medium mb-6 flex items-center border-b border-white/5 pb-4">
                    <History className="w-4 h-4 mr-2 text-cyan-400" />
                    Ticket History
                 </h3>
                 <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-ocean-800 before:via-ocean-700 before:to-transparent">
                    {ticket.history.slice().reverse().map((log, idx) => (
                      <div key={idx} className="relative flex group pl-8">
                        <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-ocean-950
                             ${log.action.includes('Created') ? 'border-blue-500 text-blue-500' : 
                               log.action.includes('Response') ? 'border-cyan-500 text-cyan-500' :
                               log.action.includes('Resolved') ? 'border-emerald-500 text-emerald-500' :
                               'border-ocean-600 text-ocean-400'}
                        `}>
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                        </div>
                        
                        <div className="flex-1 bg-white/5 p-4 rounded-xl border border-white/5 shadow-sm">
                           <div className="flex justify-between items-start mb-2">
                             <span className="text-xs font-mono text-ocean-500">{log.date}</span>
                             <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-ocean-950/50">{log.by}</span>
                           </div>
                           <p className="text-sm text-ocean-200">{log.action}</p>
                        </div>
                      </div>
                    ))}
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};
