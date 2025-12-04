
import React, { useState, useEffect } from 'react';
import { Home, Search, Calendar, Ship, MapPin, AlertTriangle, Box, Save, ArrowRight, Clock, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { Inquiry, InquiryType, InquiryGroup, LoadType, InquiryMatrix, UserProfile } from '../types';
import { inquiryService } from '../services/inquiryService';
import { partyService } from '../services/partyService';
import { adminMasterService } from '../services/adminMasterService';
import { adminService } from '../services/adminService';

const MOCK_NETWORK_PARTIES = [
  { id: '1', name: 'Rahul Verma', designation: 'Senior Manager', company: 'Global Logistics Pvt Ltd' },
  { id: '2', name: 'Sarah Jenkins', designation: 'Director', company: 'Oceanic Freight' },
  { id: '3', name: 'David Chen', designation: 'Operations Head', company: 'Pacific Shipping Co.' },
];

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

// Helper Component for Searchable Port Input
const PortSearchInput = ({ 
  label, 
  value, 
  onChange, 
  options, 
  iconColor,
  disabled
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  options: string[]; 
  iconColor: string;
  disabled?: boolean; 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="space-y-1 relative">
      <label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider flex items-center justify-between">
          {label}
          {disabled && <Lock className="w-3 h-3 text-ocean-500" />}
      </label>
      <div className="relative">
          <MapPin className={`absolute left-3 top-2.5 w-3.5 h-3.5 ${iconColor} ${disabled ? 'opacity-50' : ''}`} />
          <input 
            type="text"
            required
            value={value} 
            onChange={e => { onChange(e.target.value); setIsOpen(true); }}
            onFocus={() => !disabled && setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl pl-9 pr-8 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs h-[38px] placeholder-ocean-500 transition-all ${disabled ? 'opacity-60 cursor-not-allowed bg-ocean-900/30' : ''}`}
            placeholder="Search port..."
            autoComplete="off"
            disabled={disabled}
          />
          {!disabled && <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-ocean-600 pointer-events-none" />}
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-ocean-900 border border-ocean-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar animate-fade-in-up">
            {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => (
                    <div 
                        key={idx}
                        className="px-4 py-2.5 text-xs text-ocean-100 hover:bg-ocean-800 hover:text-white cursor-pointer transition-colors border-b border-white/5 last:border-0 flex items-center"
                        onMouseDown={(e) => {
                            e.preventDefault(); 
                            onChange(opt);
                            setIsOpen(false);
                        }}
                    >
                        {opt}
                    </div>
                ))
            ) : (
                <div className="px-4 py-3 text-xs text-ocean-400 italic text-center">
                    No matching ports found
                </div>
            )}
        </div>
      )}
    </div>
  );
};

interface InquiryFormProps {
  onBack: () => void;
  onSaveSuccess: () => void;
  currentUser: UserProfile;
  initialData?: Inquiry | null;
  isResponseMode?: boolean; 
}

export const InquiryForm: React.FC<InquiryFormProps> = ({ onBack, onSaveSuccess, currentUser, initialData, isResponseMode = false }) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [inquiryType, setInquiryType] = useState<InquiryType>('GENERAL');
  const [inquiryGroup, setInquiryGroup] = useState<InquiryGroup>('GLOBAL');
  const [targetPartyId, setTargetPartyId] = useState('');
  
  const [pol, setPol] = useState('');
  const [pod, setPod] = useState('');
  const [loadType, setLoadType] = useState<LoadType>('20 Feet Box');
  const [cargoDetail, setCargoDetail] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [matrix, setMatrix] = useState<InquiryMatrix>('Container');
  const [shipmentSchedule, setShipmentSchedule] = useState('');
  const [isHazardous, setIsHazardous] = useState(false);
  const [hazardousDetail, setHazardousDetail] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // Master Data States
  const [portOptions, setPortOptions] = useState<string[]>([]);
  const [loadTypeOptions, setLoadTypeOptions] = useState<string[]>([]);
  const [matrixOptions, setMatrixOptions] = useState<string[]>([]);

  const internalParties = partyService.getParties();
  const scheduleOptions = generateScheduleOptions();

  useEffect(() => {
    // Load Admin Masters
    const p = adminMasterService.getPorts().map(p => `${p.name} (${p.shortName})`);
    const l = adminMasterService.getLoadTypes().map(l => l.loadType);
    const m = adminMasterService.getMatrices().map(mx => mx.name);
    
    setPortOptions(p);
    setLoadTypeOptions(l);
    setMatrixOptions(m);
  }, []);

  useEffect(() => {
    if (initialData) {
        setInquiryType(initialData.inquiryType);
        setInquiryGroup(initialData.inquiryGroup);
        setTargetPartyId(initialData.targetPartyId || '');
        setPol(initialData.pol);
        setPod(initialData.pod);
        setLoadType(initialData.loadType);
        setCargoDetail(initialData.cargoDetail);
        setQuantity(initialData.quantity);
        setMatrix(initialData.matrix);
        setShipmentSchedule(initialData.shipmentSchedule);
        setIsHazardous(initialData.isHazardous);
        setHazardousDetail(initialData.hazardousDetail || '');
    }
  }, [initialData]);

  useEffect(() => {
    if (!isResponseMode && !initialData) {
        if (inquiryType === 'GENERAL') {
        setInquiryGroup('GLOBAL');
        } else {
        setInquiryGroup('NETWORK_PARTY');
        }
        setTargetPartyId('');
    }
  }, [inquiryType, isResponseMode, initialData]);

  const validateStep1 = () => {
    if (inquiryType === 'SPECIFIC' && !targetPartyId && !initialData?.targetPartyDisplay) {
      alert('Please select a Target Party.');
      return false;
    }
    if (!pol.trim()) {
      alert('Please select Port of Loading (POL).');
      return false;
    }
    if (!pod.trim()) {
      alert('Please select Port of Discharge (POD).');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- DAILY LIMIT CHECK ---
    const today = new Date().toISOString().split('T')[0];
    const myInquiriesToday = inquiryService.getInquiries().filter(i => 
       i.createdBy === (currentUser.email || 'main') && i.createdAt.startsWith(today)
    ).length;
    const limit = adminService.getPermission(currentUser.plan).maxDailyTransactions;
    if (myInquiriesToday >= limit) {
        alert(`Daily limit of ${limit} inquiries reached for your ${currentUser.plan} plan.`);
        return;
    }
    // --------------------------

    let targetPartyName = initialData?.targetPartyName || '';
    let targetUserName = initialData?.targetUserName || '';

    if (!isResponseMode || (!targetPartyName && targetPartyId)) {
        if (inquiryGroup === 'INTERNAL_PARTY') {
            const p = internalParties.find(p => p.id === targetPartyId);
            if (p) { targetPartyName = p.companyName; targetUserName = `${p.contactPerson} (${p.designation})`; }
        } else if (inquiryGroup === 'NETWORK_PARTY') {
            const p = MOCK_NETWORK_PARTIES.find(p => p.id === targetPartyId);
            if (p) { targetPartyName = p.company; targetUserName = `${p.name} (${p.designation})`; }
        }
    }

    if (isResponseMode && initialData?.targetPartyDisplay) {
        if(!targetPartyName) targetPartyName = initialData.targetPartyName || 'Unknown';
        if(!targetUserName) targetUserName = initialData.targetUserName || 'Unknown';
    }

    const creator = currentUser.isMainUser !== false ? 'main' : (currentUser.email || 'main');

    const newInquiry: Inquiry = {
      id: Date.now().toString(),
      inquiryNumber: inquiryService.generateInquiryNumber(),
      inquiryType,
      inquiryGroup,
      targetPartyId: (inquiryType === 'SPECIFIC') ? targetPartyId : undefined,
      targetPartyName,
      targetUserName,
      targetPartyDisplay: targetUserName ? `${targetUserName} - ${targetPartyName}` : initialData?.targetPartyDisplay,
      pol,
      pod,
      loadType,
      cargoDetail,
      quantity,
      matrix,
      shipmentSchedule,
      shipmentScheduleEnd: '', 
      isHazardous,
      hazardousDetail: isHazardous ? hazardousDetail : undefined,
      validUntil,
      status: 'LIVE',
      createdAt: new Date().toISOString(),
      createdBy: creator
    };

    inquiryService.saveInquiry(newInquiry);
    onSaveSuccess();
  };

  const isLocked = isResponseMode;

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400">
             <Search className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">
             {isResponseMode ? 'Send Inquiry against Offer' : 'Create New Inquiry'}
           </span>
        </div>
        <button onClick={onBack} className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar flex justify-center">
        <div className="w-full max-w-4xl bg-ocean-900/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
          
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'text-indigo-400' : 'text-ocean-600'}`}>Step 1: Scope & Route</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'text-indigo-400' : 'text-ocean-600'}`}>Step 2: Cargo Details</span>
            </div>
            <div className="w-full h-2 bg-ocean-950 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-300 ease-in-out" style={{ width: step === 1 ? '50%' : '100%' }} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* STEP 1 */}
            {step === 1 && (
              <div className="animate-fade-in-up">
                <div className="bg-black/20 p-5 rounded-xl border border-white/5 space-y-4">
                  <h3 className="text-white font-bold flex items-center border-b border-white/10 pb-2">
                    <Ship className="w-4 h-4 mr-2 text-indigo-400" /> Inquiry Scope & Route
                    {isLocked && <span className="ml-2 text-xs text-rose-400 font-normal italic flex items-center"><Lock className="w-3 h-3 mr-1"/> (Locked to Offer)</span>}
                  </h3>
                  
                  {/* Type & Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Inquiry Type</label>
                      <div className="flex bg-ocean-950 rounded-lg p-1 border border-ocean-700 h-[38px]">
                          <button type="button" disabled={isLocked} onClick={() => setInquiryType('GENERAL')} className={`flex-1 text-xs font-medium rounded-md transition-all ${inquiryType === 'GENERAL' ? 'bg-indigo-600 text-white shadow' : 'text-ocean-400 hover:text-white'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>General</button>
                          <button type="button" disabled={isLocked} onClick={() => setInquiryType('SPECIFIC')} className={`flex-1 text-xs font-medium rounded-md transition-all ${inquiryType === 'SPECIFIC' ? 'bg-indigo-600 text-white shadow' : 'text-ocean-400 hover:text-white'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>Specific</button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Inquiry Group</label>
                      <select disabled={isLocked} value={inquiryGroup} onChange={(e) => setInquiryGroup(e.target.value as InquiryGroup)} className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-[38px] text-xs ${isLocked ? 'opacity-60 cursor-not-allowed bg-ocean-900/30' : ''}`}>
                        {inquiryType === 'GENERAL' ? (
                          <> <option value="GLOBAL">Global</option> <option value="NETWORK">My Network (All)</option> </>) : (
                          <> <option value="NETWORK_PARTY">Network Party</option> <option value="INTERNAL_PARTY">Internal Party</option> </>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Send To */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Send To</label>
                    {isResponseMode ? (
                        <div className="w-full bg-ocean-900/30 border border-ocean-700 rounded-xl px-4 py-2.5 text-white flex items-center text-xs h-[38px] cursor-not-allowed">
                          <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                          <span className="font-semibold">{initialData?.targetPartyDisplay || 'Offer Creator'}</span>
                          <span className="ml-auto text-ocean-500 text-[10px] italic">Locked</span>
                        </div>
                    ) : inquiryType === 'GENERAL' ? (
                        <div className="w-full bg-ocean-800/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-ocean-300 italic flex items-center text-xs h-[38px]">
                          <CheckCircle className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                          {inquiryGroup === 'GLOBAL' ? 'Broadcast to All Global Partners' : 'Broadcast to All My Network Connections'}
                        </div>
                    ) : (
                        <select required value={targetPartyId} onChange={(e) => setTargetPartyId(e.target.value)} className="w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs h-[38px]">
                          <option value="" disabled>Select {inquiryGroup === 'NETWORK_PARTY' ? 'Network' : 'Internal'} Party</option>
                          {inquiryGroup === 'NETWORK_PARTY' ? MOCK_NETWORK_PARTIES.map(p => <option key={p.id} value={p.id}>{p.name} - {p.company}</option>) : internalParties.map(p => <option key={p.id} value={p.id}>{p.contactPerson} - {p.companyName}</option>)}
                        </select>
                    )}
                  </div>

                  {/* Route */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <PortSearchInput label="Port of Loading (POL)" value={pol} onChange={setPol} options={portOptions} iconColor="text-emerald-500" disabled={isLocked} />
                      <PortSearchInput label="Port of Discharge (POD)" value={pod} onChange={setPod} options={portOptions} iconColor="text-rose-500" disabled={isLocked} />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="animate-fade-in-up space-y-8">
                <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-6">
                  <h3 className="text-white font-bold flex items-center border-b border-white/10 pb-2">
                      <Box className="w-4 h-4 mr-2 text-indigo-400" /> Cargo & Schedule
                      {isLocked && <span className="ml-2 text-xs text-rose-400 font-normal italic flex items-center"><Lock className="w-3 h-3 mr-1"/> (Pre-filled from Offer)</span>}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider flex items-center justify-between">Load Type {isLocked && <Lock className="w-3 h-3 text-ocean-500" />}</label>
                        <select disabled={isLocked} value={loadType} onChange={(e) => setLoadType(e.target.value as LoadType)} className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none ${isLocked ? 'opacity-60 cursor-not-allowed bg-ocean-900/30' : ''}`}>
                          {loadTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider flex items-center justify-between">Quantity {isLocked && <Lock className="w-3 h-3 text-ocean-500" />}</label>
                        <input type="number" min="1" required disabled={isLocked} value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none ${isLocked ? 'opacity-60 cursor-not-allowed bg-ocean-900/30' : ''}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider flex items-center justify-between">Matrix {isLocked && <Lock className="w-3 h-3 text-ocean-500" />}</label>
                        <select disabled={isLocked} value={matrix} onChange={(e) => setMatrix(e.target.value as InquiryMatrix)} className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none ${isLocked ? 'opacity-60 cursor-not-allowed bg-ocean-900/30' : ''}`}>
                          {matrixOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider flex items-center justify-between">Cargo Details {isLocked && <Lock className="w-3 h-3 text-ocean-500" />}</label>
                        <textarea required rows={1} disabled={isLocked} value={cargoDetail} onChange={e => setCargoDetail(e.target.value)} className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none ${isLocked ? 'opacity-60 cursor-not-allowed bg-ocean-900/30' : ''}`} placeholder="E.g. Rice Bags" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider flex items-center"><Clock className="w-3 h-3 mr-1" /> Shipment Schedule {isLocked && <Lock className="w-3 h-3 text-ocean-500 ml-2" />}</label>
                        <select required disabled={isLocked} value={shipmentSchedule} onChange={e => setShipmentSchedule(e.target.value)} className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none ${isLocked ? 'opacity-60 cursor-not-allowed bg-ocean-900/30' : ''}`}>
                           <option value="" disabled>Select Schedule</option>
                           {scheduleOptions.map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                              <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider flex items-center">Hazardous ? {isLocked && <Lock className="w-3 h-3 text-ocean-500 ml-2" />}</label>
                              <div className={`flex items-center space-x-4 bg-ocean-950 px-3 py-1 rounded-lg border border-ocean-700 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}>
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={!isHazardous} onChange={() => setIsHazardous(false)} className="text-indigo-500" /><span className="text-sm text-white">No</span></label>
                                <label className="flex items-center space-x-2 cursor-pointer"><input type="radio" checked={isHazardous} onChange={() => setIsHazardous(true)} className="text-indigo-500" /><span className="text-sm text-white">Yes</span></label>
                              </div>
                          </div>
                          {isHazardous && (
                            <div className="animate-fade-in-up">
                                <label className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center mb-2"><AlertTriangle className="w-3 h-3 mr-1" /> Hazardous Details</label>
                                <textarea required rows={2} disabled={isLocked} value={hazardousDetail} onChange={e => setHazardousDetail(e.target.value)} className={`w-full bg-rose-950/10 border border-rose-900/50 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-rose-500 outline-none resize-none ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`} placeholder="UN Number, Class, etc..." />
                            </div>
                          )}
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider flex items-center"><Calendar className="w-3 h-3 mr-1" /> Valid Upto</label>
                          <input type="date" required value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-between items-center border-t border-white/10 mt-6">
               <button type="button" onClick={onBack} className="px-6 py-3 text-ocean-300 hover:text-white transition-colors">Cancel</button>
               <div className="flex space-x-3">
                 {step === 2 && <button type="button" onClick={() => setStep(1)} className="px-6 py-3 bg-ocean-800 hover:bg-ocean-700 text-white font-bold rounded-xl shadow-lg flex items-center transition-all"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>}
                 {step === 1 ? (
                   <button type="button" onClick={handleNext} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg flex items-center transition-all">Next Step <ArrowRight className="w-4 h-4 ml-2" /></button>
                 ) : (
                   <button type="submit" className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg flex items-center transition-all">
                     <Save className="w-4 h-4 mr-2" /> {isResponseMode ? 'Send Inquiry' : 'Save Inquiry'}
                   </button>
                 )}
               </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
