
import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, ShippingLine } from '../types';
import { bookingService } from '../services/bookingService';
import { masterService } from '../services/masterService';
import { Ship, CheckCircle, Save, X, ClipboardList, MapPin, Box, ArrowRight, AlertCircle, Lock } from 'lucide-react';

interface BookingWizardProps {
  booking: Booking;
  onClose: () => void;
  onSaveSuccess: () => void;
  currentUserEmail: string;
}

// Strict Status Order
const STATUS_ORDER: BookingStatus[] = [
  'PENDING', 
  'CREATED', 
  'DO_ISSUED', 
  'CUSTOM_CLEARANCE', 
  'CARGO_LOAD', 
  'GATE_IN', 
  'GATE_CLOSE', 
  'VESSEL_SAILED', 
  'LOAD_DISCHARGED'
];

export const BookingWizard: React.FC<BookingWizardProps> = ({ booking, onClose, onSaveSuccess, currentUserEmail }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingLines, setShippingLines] = useState<ShippingLine[]>([]);
  
  // Fields for Step 2 (Carrier Info)
  const [shippingLine, setShippingLine] = useState(booking.shippingLine || '');
  const [manualLine, setManualLine] = useState('');
  const [bookingRef, setBookingRef] = useState(booking.bookingRef === 'PENDING' ? '' : booking.bookingRef);
  
  // Status Logic
  const currentStatusIndex = STATUS_ORDER.indexOf(booking.status);
  const nextStatus = STATUS_ORDER[currentStatusIndex + 1];
  const isCompleted = currentStatusIndex === STATUS_ORDER.length - 1;

  useEffect(() => {
    setShippingLines(masterService.getShippingLines());
  }, []);

  // Handler to move status to CREATED (Step 2 Save)
  const handleCreateBooking = () => {
      const finalLine = manualLine || shippingLine;
      
      if (!bookingRef.trim()) {
          alert("Carrier Booking Reference is required to create a booking.");
          return;
      }
      if (!finalLine) {
          alert("Shipping Line is required to create a booking.");
          return;
      }

      bookingService.updateBooking(booking.id, {
          shippingLine: finalLine,
          bookingRef: bookingRef,
          status: 'CREATED'
      }, currentUserEmail);

      onSaveSuccess();
  };

  // Handler for Step 3 (Workflow bump)
  const handleBumpStatus = () => {
      if (nextStatus) {
          bookingService.updateBooking(booking.id, {
              status: nextStatus
          }, currentUserEmail);
          onSaveSuccess();
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-4xl bg-ocean-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="h-16 bg-gradient-to-r from-ocean-800 to-ocean-900 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                        <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white">Process Booking</h2>
                        <div className="flex items-center text-xs mt-0.5">
                            <span className="text-ocean-400 font-mono mr-2">{booking.id}</span>
                            <span className="bg-ocean-800 text-ocean-200 px-1.5 rounded text-[10px] uppercase">{booking.status.replace(/_/g, ' ')}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-ocean-300 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Steps Navigation */}
            <div className="px-6 py-4 bg-ocean-950/50 border-b border-white/5 flex items-center gap-4 shrink-0">
                <button onClick={() => setStep(1)} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${step === 1 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-ocean-700 text-ocean-500 hover:text-white'}`}>1. Review Detail</button>
                <button onClick={() => setStep(2)} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${step === 2 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-ocean-700 text-ocean-500 hover:text-white'}`}>2. Carrier Info</button>
                <button onClick={() => setStep(3)} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${step === 3 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-ocean-700 text-ocean-500 hover:text-white'}`}>3. Workflow</button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-ocean-900/50">
                
                {/* STEP 1: REVIEW (Read Only) */}
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                                <h3 className="text-ocean-300 font-bold uppercase text-xs mb-4 flex items-center"><Box className="w-3 h-3 mr-1"/> Cargo Details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-ocean-400 text-xs">Offer Ref</span><span className="text-white text-sm font-mono">{booking.offerNumber}</span></div>
                                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-ocean-400 text-xs">Commodity</span><span className="text-white text-sm">{booking.commodity}</span></div>
                                    <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-ocean-400 text-xs">Load</span><span className="text-white text-sm font-bold">{booking.quantity} x {booking.loadType}</span></div>
                                    <div className="flex justify-between"><span className="text-ocean-400 text-xs">Client</span><span className="text-cyan-400 text-sm font-bold">{booking.clientName}</span></div>
                                </div>
                            </div>
                            <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                                <h3 className="text-ocean-300 font-bold uppercase text-xs mb-4 flex items-center"><MapPin className="w-3 h-3 mr-1"/> Route & Schedule</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="text-emerald-400 font-bold">{booking.pol.split('(')[0]}</div>
                                        <div className="text-xs text-ocean-500">to</div>
                                        <div className="text-rose-400 font-bold">{booking.pod.split('(')[0]}</div>
                                    </div>
                                    <div className="bg-ocean-950/50 p-3 rounded-lg border border-white/5 flex items-center">
                                        <Ship className="w-8 h-8 text-ocean-600 mr-3" />
                                        <div>
                                            <div className="text-xs text-ocean-400">Vessel / Voyage</div>
                                            <div className="text-white font-bold text-sm">{booking.vesselName} <span className="font-normal text-ocean-300">({booking.voyage})</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: CARRIER INFO */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                            <h3 className="text-white font-bold mb-6 flex items-center"><Ship className="w-4 h-4 mr-2 text-blue-400"/> Carrier Information</h3>
                            
                            {booking.status !== 'PENDING' ? (
                                <div className="p-4 bg-emerald-900/20 border border-emerald-900/50 rounded-xl mb-4">
                                    <div className="flex items-center text-emerald-400 font-bold text-sm mb-2"><CheckCircle className="w-4 h-4 mr-2"/> Booking Created</div>
                                    <p className="text-xs text-ocean-300">Ref: {booking.bookingRef}</p>
                                    <p className="text-xs text-ocean-300">Line: {booking.shippingLine}</p>
                                    <p className="text-[10px] text-ocean-500 mt-2 italic">To modify details, please contact admin support.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ocean-300 uppercase">Carrier Booking Ref <span className="text-rose-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={bookingRef} 
                                            onChange={e => setBookingRef(e.target.value)}
                                            className="w-full bg-ocean-950 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder-ocean-600 font-mono"
                                            placeholder="e.g. MAEU123456789"
                                        />
                                        <p className="text-[10px] text-ocean-500 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Required to create booking.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-ocean-300 uppercase">Shipping Line <span className="text-rose-500">*</span></label>
                                        <select 
                                            value={shippingLine} 
                                            onChange={e => { setShippingLine(e.target.value); if(e.target.value !== 'OTHER') setManualLine(''); }}
                                            className="w-full bg-ocean-950 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="" disabled>-- Select Carrier --</option>
                                            {shippingLines.map(sl => (
                                                <option key={sl.id} value={sl.lineName}>{sl.lineName} ({sl.unitName})</option>
                                            ))}
                                            <option value="OTHER">Other / Manual Entry</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {booking.status === 'PENDING' && shippingLine === 'OTHER' && (
                                <div className="space-y-2 mt-4 animate-fade-in">
                                    <label className="text-xs font-bold text-ocean-300 uppercase">Enter Shipping Line Name</label>
                                    <input 
                                        type="text" 
                                        value={manualLine} 
                                        onChange={e => setManualLine(e.target.value)}
                                        className="w-full bg-ocean-950 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Carrier Name"
                                    />
                                </div>
                            )}
                            
                            {booking.status === 'PENDING' && (
                                <div className="mt-6 flex justify-end">
                                    <button onClick={handleCreateBooking} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg flex items-center transition-all">
                                        <Save className="w-4 h-4 mr-2" /> Save & Create Booking
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: WORKFLOW */}
                {step === 3 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="bg-black/20 rounded-xl p-6 border border-white/5">
                            <h3 className="text-white font-bold mb-6 flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-400"/> Shipment Workflow</h3>
                            
                            {/* Visual Timeline */}
                            <div className="relative flex flex-col space-y-0">
                                {STATUS_ORDER.map((s, idx) => {
                                    const isPast = idx < currentStatusIndex;
                                    const isCurrent = idx === currentStatusIndex;
                                    const isNext = idx === currentStatusIndex + 1;
                                    
                                    return (
                                        <div key={s} className="flex items-start relative pb-6 last:pb-0">
                                            {/* Line */}
                                            {idx !== STATUS_ORDER.length - 1 && (
                                                <div className={`absolute left-[15px] top-[30px] bottom-0 w-0.5 ${isPast ? 'bg-emerald-600' : 'bg-ocean-800'}`} />
                                            )}
                                            
                                            {/* Icon */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 
                                                ${isPast ? 'bg-emerald-600 text-white' : 
                                                  isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-900' : 
                                                  isNext ? 'bg-ocean-800 text-ocean-400 border border-ocean-600' : 
                                                  'bg-ocean-900 text-ocean-600 border border-ocean-800'}
                                            `}>
                                                {isPast ? <CheckCircle className="w-5 h-5" /> : (idx + 1)}
                                            </div>

                                            {/* Text */}
                                            <div className="ml-4 pt-1">
                                                <div className={`text-sm font-bold uppercase ${isPast ? 'text-emerald-400' : isCurrent ? 'text-blue-400' : 'text-ocean-500'}`}>
                                                    {s.replace(/_/g, ' ')}
                                                </div>
                                                {isCurrent && (
                                                    <div className="text-[10px] text-ocean-300 mt-1">Current Stage</div>
                                                )}
                                                {/* Lock icon for future steps */}
                                                {!isPast && !isCurrent && !isNext && <Lock className="w-3 h-3 text-ocean-600 mt-1" />}
                                            </div>

                                            {/* Action Button (Only for Next Step) */}
                                            {isNext && (
                                                <div className="ml-auto">
                                                    <button 
                                                        onClick={handleBumpStatus}
                                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg flex items-center transition-all animate-pulse"
                                                    >
                                                        Mark as {s.replace(/_/g, ' ')} <ArrowRight className="w-3 h-3 ml-2" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {isCompleted && (
                                <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-900/50 rounded-xl text-center text-emerald-400 font-bold">
                                    <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                                    Shipment process completed.
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex justify-between bg-ocean-900">
                <button onClick={onClose} className="px-6 py-2 text-ocean-300 hover:text-white transition-colors font-medium">Close</button>
            </div>
        </div>
    </div>
  );
};
