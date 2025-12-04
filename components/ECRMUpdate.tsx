
import React, { useState, useEffect } from 'react';
import { Home, MessageSquare, Send, Upload, X, CheckCircle, Clock, History, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { EcrmTicket, UserProfile } from '../types';
import { ecrmService } from '../services/ecrmService';
import { adminService } from '../services/adminService';

interface ECRMUpdateProps {
  ticketId: string;
  onBack: () => void;
  onUpdateSuccess: () => void;
  currentUser?: UserProfile;
  isAdminView?: boolean;
}

export const ECRMUpdate: React.FC<ECRMUpdateProps> = ({ ticketId, onBack, onUpdateSuccess, currentUser, isAdminView = false }) => {
  const [ticket, setTicket] = useState<EcrmTicket | null>(null);
  const [response, setResponse] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const data = ecrmService.getTicketById(ticketId);
    if (data) {
      setTicket(data);
    }
  }, [ticketId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Check Plan Permission
      if (currentUser && !isAdminView) {
          const limits = adminService.getPermission(currentUser.plan);
          if (!limits.allowFileUpload) {
              alert("Your current plan (FREE) does not allow file uploads in ticket responses. Please upgrade to Office or Corporate.");
              e.target.value = ''; // Reset input
              return;
          }
      }
      setFileName(e.target.files?.[0]?.name || '');
  };

  if (!ticket) return <div className="p-8 text-center text-white">Loading ticket details...</div>;

  // --- ROLE LOGIC ---
  // Determine if current user is the CREATOR of the ticket
  let isCreator = false;
  if (isAdminView) {
      // In Admin View: Admin is creator if ticket created by 'main'. Admin is receiver if created by user.
      // Usually tickets sent TO admin have partyType='ADMIN' or targetAdmin=true.
      isCreator = ticket.createdBy === 'main';
  } else {
      // In User View:
      // If user is Main User, they own tickets created by 'main' or themselves.
      if (currentUser?.isMainUser !== false) {
          isCreator = ticket.createdBy === 'main' || ticket.createdBy === currentUser?.email;
      } else {
          isCreator = ticket.createdBy === currentUser?.email;
      }
  }

  // --- WORKFLOW RULES (Strict Ping-Pong) ---
  // 1. PENDING: Creator waits. Receiver acts (Resolve).
  // 2. RESOLVED: Receiver waits (Read-only). Creator acts (Re-open/Pending).
  
  const canEdit = (ticket.status === 'PENDING' && !isCreator) || 
                  (ticket.status === 'RESOLVED' && isCreator);

  // Calculate Next Status and Label based on current state
  const nextStatus = ticket.status === 'PENDING' ? 'RESOLVED' : 'PENDING';
  const actionLabel = ticket.status === 'PENDING' ? 'Submit Response & Resolve' : 'Re-open Ticket (Set Pending)';
  const buttonColor = ticket.status === 'PENDING' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500';
  const ButtonIcon = ticket.status === 'PENDING' ? CheckCircle : RefreshCw;

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim() || !ticket) return;

    if (!canEdit) return;

    const responder = isAdminView ? 'Admin' : (currentUser?.fullName || 'User');
    
    // 1. Add Response Message
    ecrmService.addResponse(ticket.id, response + (fileName ? ` (Attached: ${fileName})` : ''), responder);
    
    // 2. Update Status automatically based on workflow
    ecrmService.updateStatus(ticket.id, nextStatus as any);
    
    onUpdateSuccess();
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB');

  return (
    <div className={`flex flex-col h-full w-full ${isAdminView ? 'bg-transparent' : 'bg-ocean-950/80'} overflow-hidden animate-fade-in-up`}>
      
      {/* Header Bar - Hidden in Admin View */}
      {!isAdminView && (
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
      )}

      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Top Info Panel */}
            <div className={`border rounded-2xl p-6 shadow-xl ${isAdminView ? 'bg-slate-900 border-slate-800' : 'bg-ocean-900/40 border-white/10'}`}>
               <div className="flex flex-col md:flex-row justify-between mb-6 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{ticket.subject}</h2>
                    <p className="text-ocean-300 text-sm">Party: <span className="text-cyan-400 font-semibold">{ticket.partyName}</span> <span className="text-ocean-500 text-xs">({ticket.partyType})</span></p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-4">
                     <div className="text-right">
                       <p className="text-xs text-ocean-500 font-mono">Date: {formatDate(ticket.date)}</p>
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

            {/* Workflow Action Area */}
            {canEdit ? (
                <div className={`border rounded-2xl p-6 shadow-xl ${isAdminView ? 'bg-slate-900 border-slate-800' : 'bg-ocean-900/40 border-white/10'}`}>
                    <h3 className="text-white font-medium mb-4 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-rose-400" />
                        {ticket.status === 'RESOLVED' ? 'Re-open Ticket' : 'Provide Resolution'}
                    </h3>
                    <form onSubmit={handleSubmitResponse} className="space-y-4">
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={4}
                            className="w-full bg-black/20 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all resize-none placeholder-ocean-500"
                            placeholder="Type your response here..."
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
                                        onChange={handleFileUpload}
                                    />
                                    {fileName && <button type="button" onClick={(e) => { e.preventDefault(); setFileName(''); }}><X className="w-4 h-4 text-ocean-500 hover:text-white"/></button>}
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                                {isAdminView && (
                                    <button
                                        type="button"
                                        onClick={onBack}
                                        className="px-4 py-2 text-ocean-400 hover:text-white border border-transparent hover:border-ocean-600 rounded-xl text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className={`px-6 py-2 rounded-xl font-bold shadow-lg transition-all flex items-center ${buttonColor} text-white`}
                                >
                                    <ButtonIcon className="w-4 h-4 mr-2" />
                                    {actionLabel}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                // READ ONLY STATE PANEL
                <div className={`border rounded-2xl p-6 shadow-xl flex items-center justify-between ${isAdminView ? 'bg-slate-900 border-slate-800' : 'bg-ocean-900/40 border-white/10'}`}>
                    <div className="flex items-center">
                        {ticket.status === 'PENDING' ? (
                            <div className="flex items-center text-amber-400">
                                <Clock className="w-8 h-8 mr-3" />
                                <div>
                                    <h3 className="text-lg font-bold">Waiting for Response</h3>
                                    <p className="text-sm text-ocean-400">You created this ticket. Please wait for the receiver to reply and resolve it.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center text-emerald-400">
                                <Lock className="w-8 h-8 mr-3" />
                                <div>
                                    <h3 className="text-lg font-bold">Ticket is Resolved</h3>
                                    <p className="text-sm text-ocean-400">Only the ticket creator can re-open this ticket.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Admin Back Button if Read Only */}
                    {isAdminView && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="px-4 py-2 text-ocean-400 hover:text-white border border-ocean-700 hover:border-ocean-500 rounded-xl text-sm font-medium transition-colors"
                        >
                            Back to List
                        </button>
                    )}
                </div>
            )}

            {/* History Feed */}
            <div className={`border rounded-2xl p-6 shadow-xl ${isAdminView ? 'bg-slate-900 border-slate-800' : 'bg-ocean-900/40 border-white/10'}`}>
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
                             <span className="text-xs font-mono text-ocean-500">{formatDate(log.date)}</span>
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
