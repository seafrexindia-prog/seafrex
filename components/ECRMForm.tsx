
import React, { useState, useEffect } from 'react';
import { Home, MessageSquare, Send, Upload, User, Building2, Globe, Users, X, Shield } from 'lucide-react';
import { EcrmTicket, UserProfile } from '../types';
import { ecrmService } from '../services/ecrmService';
import { partyService } from '../services/partyService';

interface ECRMFormProps {
  onBack: () => void;
  onSaveSuccess: () => void;
  currentUser?: UserProfile;
}

export const ECRMForm: React.FC<ECRMFormProps> = ({ onBack, onSaveSuccess, currentUser }) => {
  const [ticketId, setTicketId] = useState('');
  const [partyType, setPartyType] = useState<'NETWORK' | 'INTERNAL' | 'ADMIN'>('NETWORK');
  const [selectedParty, setSelectedParty] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  
  // Internal parties from service
  const internalParties = partyService.getParties();
  
  // Mock Network parties (since they are local in NetworkList, we mock for dropdown here)
  const networkParties = [
    { id: '1', name: 'Rahul Verma (Global Logistics)' },
    { id: '2', name: 'Sarah Jenkins (Oceanic Freight)' },
    { id: '3', name: 'David Chen (Pacific Shipping)' }
  ];

  useEffect(() => {
    setTicketId(ecrmService.generateId());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find name based on ID
    let pName = '';
    if (partyType === 'INTERNAL') {
      const p = internalParties.find(i => i.id === selectedParty);
      pName = p ? `${p.contactPerson} (${p.companyName})` : 'Unknown Internal';
    } else if (partyType === 'NETWORK') {
      const p = networkParties.find(n => n.id === selectedParty);
      pName = p ? p.name : 'Unknown Network';
    } else if (partyType === 'ADMIN') {
        pName = 'SEAFREX (Admin)';
    }

    // Determine createdBy: if main user then 'main', else email
    const creator = currentUser?.isMainUser !== false ? 'main' : (currentUser?.email || 'main');

    const newTicket: EcrmTicket = {
      id: Date.now().toString(),
      ticketNumber: ticketId,
      type: 'SENT',
      partyType,
      partyName: pName,
      subject,
      message,
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0],
      history: [
        { date: new Date().toLocaleString(), action: 'Ticket Created', by: 'You' }
      ],
      createdBy: creator,
      targetAdmin: partyType === 'ADMIN' // Set flag for admin
    };

    ecrmService.createTicket(newTicket);
    onSaveSuccess();
  };

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-rose-600/20 rounded-lg text-rose-400">
             <MessageSquare className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">Create New Ticket</span>
        </div>
        <button 
          onClick={onBack}
          className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          title="Back to Dashboard"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center custom-scrollbar">
        <div className="w-full max-w-3xl bg-ocean-900/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Ticket ID (Read Only) */}
            <div className="p-4 bg-ocean-950/50 rounded-xl border border-white/5 flex items-center justify-between">
               <div>
                 <p className="text-xs text-ocean-400 uppercase font-bold">Ticket ID</p>
                 <p className="text-xl font-mono text-cyan-400 font-bold">{ticketId}</p>
               </div>
               <div className="px-3 py-1 bg-amber-900/30 text-amber-400 text-xs rounded-full border border-amber-900/50">
                 Status: Pending
               </div>
            </div>

            {/* Party Selection Type */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Select Party Type</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => { setPartyType('NETWORK'); setSelectedParty(''); }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${partyType === 'NETWORK' ? 'bg-rose-600 text-white border-rose-500 shadow-lg' : 'bg-black/20 text-ocean-400 border-ocean-700 hover:bg-white/5'}`}
                >
                  <Globe className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">Network Party</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPartyType('INTERNAL'); setSelectedParty(''); }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${partyType === 'INTERNAL' ? 'bg-rose-600 text-white border-rose-500 shadow-lg' : 'bg-black/20 text-ocean-400 border-ocean-700 hover:bg-white/5'}`}
                >
                  <Users className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">Internal Party</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPartyType('ADMIN'); setSelectedParty('admin'); }}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${partyType === 'ADMIN' ? 'bg-rose-600 text-white border-rose-500 shadow-lg' : 'bg-black/20 text-ocean-400 border-ocean-700 hover:bg-white/5'}`}
                >
                  <Shield className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">SEAFREX (Admin)</span>
                </button>
              </div>
            </div>

            {/* Dynamic Dropdown */}
            {partyType !== 'ADMIN' && (
                <div className="space-y-2">
                   <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Select Party</label>
                   <select 
                     required
                     value={selectedParty}
                     onChange={(e) => setSelectedParty(e.target.value)}
                     className="w-full bg-black/20 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all appearance-none"
                   >
                     <option value="" disabled>-- Choose {partyType === 'NETWORK' ? 'Network' : 'Internal'} Party --</option>
                     {partyType === 'INTERNAL' ? (
                        internalParties.map(p => (
                          <option key={p.id} value={p.id}>{p.contactPerson} - {p.companyName}</option>
                        ))
                     ) : (
                        networkParties.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))
                     )}
                   </select>
                </div>
            )}

            {/* Subject */}
            <div className="space-y-2">
               <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Subject</label>
               <input 
                 type="text" 
                 required
                 value={subject}
                 onChange={(e) => setSubject(e.target.value)}
                 className="w-full bg-black/20 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all"
                 placeholder="Brief summary of the issue..."
               />
            </div>

            {/* Message */}
            <div className="space-y-2">
               <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Detailed Message</label>
               <textarea 
                 required
                 rows={5}
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 className="w-full bg-black/20 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all resize-none"
                 placeholder="Describe the query or issue in detail..."
               />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
               <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Attachment (Optional)</label>
               <div className="border-2 border-dashed border-ocean-700 rounded-xl p-6 flex flex-col items-center justify-center text-ocean-400 hover:bg-white/5 transition-colors relative">
                  {fileName ? (
                    <div className="flex items-center text-white">
                      <span className="mr-2 font-medium">{fileName}</span>
                      <button type="button" onClick={() => setFileName('')} className="p-1 hover:bg-white/10 rounded-full"><X className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-sm">Click to upload document or image</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                  />
               </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex items-center justify-end space-x-4 border-t border-white/10">
              <button 
                type="button" 
                onClick={onBack}
                className="px-6 py-2 text-ocean-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transform hover:scale-[1.02] transition-all flex items-center text-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Ticket
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
