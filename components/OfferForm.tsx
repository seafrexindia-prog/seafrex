
import React, { useState, useEffect } from 'react';
import { Home, Search, Ship, MapPin, Box, Save, ArrowRight, ArrowLeft, CheckCircle, DollarSign, Plus, Trash2, Anchor, ChevronDown, User, Briefcase, Lock } from 'lucide-react';
import { Offer, OfferType, OfferGroup, LoadType, InquiryMatrix, UserProfile, ChargeItem } from '../types';
import { offerService } from '../services/offerService';
import { partyService } from '../services/partyService';
import { masterService } from '../services/masterService';
import { adminMasterService } from '../services/adminMasterService';
import { adminService } from '../services/adminService';

const MOCK_NETWORK_PARTIES = [
  { id: '1', name: 'Rahul Verma', designation: 'Senior Manager', company: 'Global Logistics Pvt Ltd' },
  { id: '2', name: 'Sarah Jenkins', designation: 'Director', company: 'Oceanic Freight' },
  { id: '3', name: 'David Chen', designation: 'Operations Head', company: 'Pacific Shipping Co.' },
];

const PortSearchInput = ({ label, value, onChange, iconColor, disabled, options }: { label: string; value: string; onChange: (val: string) => void; iconColor: string; disabled?: boolean; options: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));

  return (
    <div className="space-y-1 relative">
      <label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider flex items-center justify-between">{label}{disabled && <Lock className="w-3 h-3 text-ocean-500" />}</label>
      <div className="relative">
          <MapPin className={`absolute left-3 top-2.5 w-3.5 h-3.5 ${iconColor} ${disabled ? 'opacity-50' : ''}`} />
          <input 
            type="text" required value={value} 
            onChange={e => { onChange(e.target.value); setIsOpen(true); }}
            onFocus={() => !disabled && setIsOpen(true)} onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl pl-9 pr-8 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs h-[38px] placeholder-ocean-500 transition-all ${disabled ? 'opacity-60 cursor-not-allowed bg-ocean-900/30' : ''}`}
            placeholder="Search port..." autoComplete="off" disabled={disabled}
          />
          {!disabled && <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-ocean-600 pointer-events-none" />}
      </div>
      {!disabled && isOpen && filteredOptions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-ocean-900 border border-ocean-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
            {filteredOptions.map((opt, idx) => (
                <div key={idx} className="px-4 py-2.5 text-xs text-ocean-100 hover:bg-ocean-800 cursor-pointer border-b border-white/5 last:border-0" onMouseDown={(e) => { e.preventDefault(); onChange(opt); setIsOpen(false); }}>{opt}</div>
            ))}
        </div>
      )}
    </div>
  );
};

const SearchableSelect = ({ label, options, value, onChange, placeholder, disabled }: { label: string; options: { id: string; label: string }[]; value: string; onChange: (id: string) => void; placeholder: string; disabled?: boolean; }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const selected = options.find(o => o.id === value);
    if (selected) { setSearchTerm(selected.label); } else { setSearchTerm(''); }
  }, [value, options]);

  const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (option: { id: string, label: string }) => {
    onChange(option.id); setSearchTerm(option.label); setIsOpen(false);
  };

  return (
    <div className="space-y-1 relative">
      <label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <User className={`absolute left-3 top-2.5 w-3.5 h-3.5 text-ocean-500 ${disabled ? 'opacity-50' : ''}`} />
        <input
          type="text" value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); if (e.target.value === '') onChange(''); }}
          onFocus={() => { if(!disabled) { setSearchTerm(''); setIsOpen(true); } }} 
          onBlur={() => { setTimeout(() => { const selected = options.find(o => o.id === value); if (selected) setSearchTerm(selected.label); setIsOpen(false); }, 200); }}
          className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl pl-9 pr-8 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs h-[38px] placeholder-ocean-500 transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          placeholder={placeholder} autoComplete="off" disabled={disabled}
        />
        <ChevronDown className="absolute right-3 top-2.5 w-3.5 h-3.5 text-ocean-600 pointer-events-none" />
      </div>
      {!disabled && isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-ocean-900 border border-ocean-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar p-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div key={opt.id} onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }} className={`flex items-center px-3 py-2 cursor-pointer rounded-lg hover:bg-white/5 transition-colors ${value === opt.id ? 'bg-emerald-900/20 text-emerald-400' : 'text-ocean-300'}`}>
                <Briefcase className="w-3 h-3 mr-2 opacity-50 shrink-0" /> <span className="text-xs truncate">{opt.label}</span>
              </div>
            ))
          ) : <div className="px-3 py-2 text-xs text-ocean-500 text-center italic">No parties found</div>}
        </div>
      )}
    </div>
  );
};

const generateScheduleOptions = (): string[] => {
  const options: string[] = [];
  let currentDate = new Date();
  while (options.length < 12) {
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = currentDate.getFullYear().toString().slice(-2);
    let prefix = '';
    if (day <= 7) prefix = '1ST'; else if (day <= 14) prefix = '2ND'; else if (day <= 21) prefix = '3RD'; else prefix = 'LAST';
    const scheduleStr = `${prefix}-WEEK-${month}-${year}`;
    if (options.length === 0 || options[options.length - 1] !== scheduleStr) { options.push(scheduleStr); }
    currentDate.setDate(currentDate.getDate() + 7);
  }
  return options;
};

interface OfferFormProps {
  initialData?: Offer | null;
  isReviseMode?: boolean;
  isResponseMode?: boolean;
  onBack: () => void;
  onSaveSuccess: () => void;
  currentUser: UserProfile;
}

export const OfferForm: React.FC<OfferFormProps> = ({ initialData, isReviseMode = false, isResponseMode = false, onBack, onSaveSuccess, currentUser }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [offerType, setOfferType] = useState<OfferType>('GENERAL');
  const [offerGroup, setOfferGroup] = useState<OfferGroup>('GLOBAL');
  const [targetPartyId, setTargetPartyId] = useState<string>('');
  const [pol, setPol] = useState('');
  const [pod, setPod] = useState('');
  const [transitPort, setTransitPort] = useState('Direct');

  const [loadType, setLoadType] = useState<LoadType>('20 Feet Box');
  const [cargoDetail, setCargoDetail] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [matrix, setMatrix] = useState<InquiryMatrix>('Container');
  const [freightRate, setFreightRate] = useState<number>(0);
  const [shipmentSchedule, setShipmentSchedule] = useState('');
  const [isHazardous, setIsHazardous] = useState(false);
  const [hazardousDetail, setHazardousDetail] = useState('');

  const [chargesMode, setChargesMode] = useState<'MANUAL' | 'MASTER'>('MASTER');
  const [selectedMasterHeadId, setSelectedMasterHeadId] = useState('');
  const [charges, setCharges] = useState<ChargeItem[]>([]);
  const [manualCharge, setManualCharge] = useState<Partial<ChargeItem>>({ name: '', amount: 0, currency: 'USD', matrix: 'Per Container' });

  const [vesselName, setVesselName] = useState('To Be Declared Later');
  const [voyage, setVoyage] = useState('');
  const [gateCloseDate, setGateCloseDate] = useState('');
  const [validUntil, setValidUntil] = useState('');

  // Master Data States
  const [portOptions, setPortOptions] = useState<string[]>([]);
  const [loadTypeOptions, setLoadTypeOptions] = useState<string[]>([]);
  const [matrixOptions, setMatrixOptions] = useState<string[]>([]);
  const [currencyOptions, setCurrencyOptions] = useState<string[]>([]);

  const internalParties = partyService.getParties();
  const chargeHeads = masterService.getChargeHeads();
  const scheduleOptions = generateScheduleOptions();

  useEffect(() => {
    setPortOptions(adminMasterService.getPorts().map(p => `${p.name} (${p.shortName})`));
    setLoadTypeOptions(adminMasterService.getLoadTypes().map(l => l.loadType));
    setMatrixOptions(adminMasterService.getMatrices().map(mx => mx.name));
    setCurrencyOptions(adminMasterService.getCurrencies().map(c => c.currency));
  }, []);

  useEffect(() => {
    if (initialData) {
        setOfferType(initialData.offerType);
        setOfferGroup(initialData.offerGroup);
        setTargetPartyId(initialData.targetPartyId || '');
        setPol(initialData.pol);
        setPod(initialData.pod);
        setTransitPort(initialData.transitPort || 'Direct');
        setLoadType(initialData.loadType);
        setCargoDetail(initialData.cargoDetail);
        setQuantity(initialData.quantity);
        setMatrix(initialData.matrix);
        setFreightRate(initialData.freightRate || 0);
        setShipmentSchedule(initialData.shipmentSchedule);
        setIsHazardous(initialData.isHazardous);
        setHazardousDetail(initialData.hazardousDetail || '');
        setCharges(initialData.charges || []);
        setVesselName(initialData.vesselName || 'To Be Declared Later');
        setVoyage(initialData.voyage || '');
        setGateCloseDate(initialData.gateCloseDate || '');
        setValidUntil(initialData.validUntil || '');
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData) {
        if (offerType === 'GENERAL') setOfferGroup('GLOBAL');
        else setOfferGroup('NETWORK_PARTY');
        setTargetPartyId('');
    }
  }, [offerType, initialData]);

  const handleAddManualCharge = () => {
    if (!manualCharge.name || !manualCharge.amount) return;
    if (charges.length >= 5) { alert("Maximum 5 charges allowed in Manual mode."); return; }
    const newCharge: ChargeItem = {
        id: Date.now().toString(),
        name: manualCharge.name,
        amount: Number(manualCharge.amount),
        currency: manualCharge.currency as any,
        matrix: manualCharge.matrix as any
    };
    setCharges([...charges, newCharge]);
    setManualCharge({ name: '', amount: 0, currency: 'USD', matrix: 'Per Container' });
  };

  const handleSelectMasterHead = (headId: string) => {
      setSelectedMasterHeadId(headId);
      const head = chargeHeads.find(h => h.id === headId);
      if (head) { setCharges(head.items); }
  };

  const handleRemoveCharge = (id: string) => { setCharges(charges.filter(c => c.id !== id)); };

  const totalUSD = charges.filter(c => c.currency === 'USD').reduce((sum, c) => sum + c.amount, 0);
  const totalINR = charges.filter(c => c.currency === 'INR').reduce((sum, c) => sum + c.amount, 0);

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) { if (offerType === 'SPECIFIC' && !targetPartyId) return false; if (!pol || !pod) return false; }
    if (currentStep === 2) { if (!cargoDetail || quantity < 1) return false; if (!freightRate || freightRate <= 0) return false; if (!shipmentSchedule) return false; if (isHazardous && !hazardousDetail) return false; }
    if (currentStep === 3) { if (charges.length === 0) return false; }
    if (currentStep === 4) { if (!vesselName) return false; if (!validUntil) return false; }
    return true;
  };

  const handleNext = () => { if (validateStep(step)) setStep(prev => (prev + 1) as any); else alert("Please fill all required fields correctly."); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- DAILY LIMIT CHECK ---
    const today = new Date().toISOString().split('T')[0];
    const myOffersToday = offerService.getOffers().filter(o => 
       o.createdBy === (currentUser.email || 'main') && o.createdAt.startsWith(today)
    ).length;
    const limit = adminService.getPermission(currentUser.plan).maxDailyTransactions;
    
    // If updating, skip check (unless strict). Assuming limit applies to CREATE.
    if (!isReviseMode && myOffersToday >= limit) {
        alert(`Daily limit of ${limit} offers reached for your ${currentUser.plan} plan.`);
        return;
    }
    // --------------------------

    try {
        const creator = currentUser.isMainUser !== false ? 'main' : (currentUser.email || 'main');
        let targetPartyName = initialData?.targetPartyName || '';
        let targetUserName = initialData?.targetUserName || '';
        if (offerType === 'SPECIFIC' && targetPartyId && (!targetPartyName || !isReviseMode)) {
          if (offerGroup === 'INTERNAL_PARTY') {
              const p = internalParties.find(p => p.id === targetPartyId);
              if (p) { targetPartyName = p.companyName; targetUserName = `${p.contactPerson} (${p.designation})`; }
          } else if (offerGroup === 'NETWORK_PARTY') {
              const p = MOCK_NETWORK_PARTIES.find(p => p.id === targetPartyId);
              if (p) { targetPartyName = p.company; targetUserName = `${p.name} (${p.designation})`; }
          }
        }
        if (isResponseMode && initialData?.targetPartyDisplay) {
           if (!targetPartyName) targetPartyName = initialData.targetPartyName || 'Unknown';
           if (!targetUserName) targetUserName = initialData.targetUserName || 'Unknown';
        }
        const offerData: Offer = {
          id: isReviseMode && initialData ? initialData.id : Date.now().toString(),
          offerNumber: isReviseMode && initialData ? initialData.offerNumber : offerService.generateOfferNumber(),
          offerType, offerGroup,
          targetPartyId: (offerType === 'SPECIFIC' && targetPartyId) ? targetPartyId : undefined,
          targetPartyName, targetUserName,
          targetPartyDisplay: targetUserName ? `${targetUserName} - ${targetPartyName}` : initialData?.targetPartyDisplay,
          pol, pod, transitPort, loadType, cargoDetail, quantity, matrix, freightRate, shipmentSchedule, isHazardous, hazardousDetail,
          charges: [...charges], vesselName, voyage, gateCloseDate, validUntil,
          status: 'LIVE', createdAt: isReviseMode && initialData ? initialData.createdAt : new Date().toISOString(),
          createdBy: isReviseMode && initialData ? initialData.createdBy : creator
        };
        offerService.saveOffer(offerData); onSaveSuccess();
    } catch (error) { console.error("Error saving offer:", error); alert("Failed to save offer. Please try again."); }
  };

  const partyOptions = offerGroup === 'NETWORK_PARTY' ? MOCK_NETWORK_PARTIES.map(p => ({ id: p.id, label: `${p.name} - ${p.company}` })) : internalParties.map(p => ({ id: p.id, label: `${p.contactPerson} - ${p.companyName}` }));
  const isLocked = isReviseMode || isResponseMode;

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3"><div className="p-2 bg-emerald-600/20 rounded-lg text-emerald-400"><DollarSign className="w-5 h-5" /></div><span className="font-semibold text-lg text-white">{isReviseMode ? `Revise Offer: ${initialData?.offerNumber}` : (isResponseMode ? 'Send Offer Response' : 'Create New Offer')}</span></div>
        <button onClick={onBack} className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"><Home className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar flex justify-center">
        <div className="w-full max-w-4xl bg-ocean-900/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2 px-1">{[1, 2, 3, 4].map(s => (<span key={s} className={`text-[10px] font-bold uppercase tracking-wider ${step >= s ? 'text-emerald-400' : 'text-ocean-600'}`}>Step {s}</span>))}</div>
            <div className="w-full h-2 bg-ocean-950 rounded-full overflow-hidden flex">{[1, 2, 3, 4].map(s => (<div key={s} className={`h-full transition-all duration-300 ${step >= s ? 'bg-emerald-500' : 'bg-transparent'} flex-1 border-r border-ocean-900 last:border-0`} />))}</div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="animate-fade-in-up bg-black/20 p-5 rounded-xl border border-white/5 space-y-4">
                  <h3 className="text-white font-bold flex items-center border-b border-white/10 pb-2"><Ship className="w-4 h-4 mr-2 text-emerald-400" /> Offer Scope & Route {isLocked && <span className="ml-2 text-xs text-rose-400 font-normal italic flex items-center"><Lock className="w-3 h-3 mr-1"/> (Locked)</span>}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Offer Type</label><div className="flex bg-ocean-950 rounded-lg p-1 border border-ocean-700 h-[38px]"><button type="button" disabled={isLocked} onClick={() => setOfferType('GENERAL')} className={`flex-1 text-xs font-medium rounded-md transition-all ${offerType === 'GENERAL' ? 'bg-emerald-600 text-white shadow' : 'text-ocean-400 hover:text-white'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>General</button><button type="button" disabled={isLocked} onClick={() => setOfferType('SPECIFIC')} className={`flex-1 text-xs font-medium rounded-md transition-all ${offerType === 'SPECIFIC' ? 'bg-emerald-600 text-white shadow' : 'text-ocean-400 hover:text-white'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>Specific</button></div></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Offer Group</label><select disabled={isLocked} value={offerGroup} onChange={(e) => setOfferGroup(e.target.value as OfferGroup)} className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none h-[38px] text-xs ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>{offerType === 'GENERAL' ? (<> <option value="GLOBAL">Global</option> <option value="NETWORK">My Network</option> </>) : (<> <option value="NETWORK_PARTY">Network Party</option> <option value="INTERNAL_PARTY">Internal Party</option> </>)}</select></div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Send To</label>{isResponseMode ? (<div className="w-full bg-ocean-900/30 border border-ocean-700 rounded-xl px-4 py-2.5 text-white flex items-center text-xs h-[38px] cursor-not-allowed"><CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-400" /><span className="font-semibold">{initialData?.targetPartyDisplay || 'Inquiry Creator'}</span><span className="ml-auto text-ocean-500 text-[10px] italic">Target Locked</span></div>) : offerType === 'GENERAL' ? (<div className={`w-full bg-ocean-800/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-ocean-300 italic flex items-center text-xs h-[38px] ${isReviseMode ? 'opacity-60' : ''}`}><CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-400" />{offerGroup === 'GLOBAL' ? 'Broadcast to All Global Partners' : 'Broadcast to All My Network Connections'}</div>) : (<SearchableSelect label={offerGroup === 'NETWORK_PARTY' ? 'Select Network Party' : 'Select Internal Party'} options={partyOptions} value={targetPartyId} onChange={setTargetPartyId} placeholder="Type to search party..." disabled={isReviseMode}/>)}</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3"><PortSearchInput label="POL" value={pol} onChange={setPol} iconColor="text-emerald-500" disabled={isLocked} options={portOptions} /><PortSearchInput label="POD" value={pod} onChange={setPod} iconColor="text-rose-500" disabled={isLocked} options={portOptions} /><div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Transit Port</label><input disabled={isReviseMode} type="text" value={transitPort} onChange={e => setTransitPort(e.target.value)} className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs h-[38px] ${isReviseMode ? 'opacity-60 cursor-not-allowed' : ''}`} /></div></div>
              </div>
            )}
            {step === 2 && (
              <div className="animate-fade-in-up bg-black/20 p-5 rounded-xl border border-white/5 space-y-6">
                  <h3 className="text-white font-bold flex items-center border-b border-white/10 pb-2"><Box className="w-4 h-4 mr-2 text-emerald-400" /> Cargo & Rate Details {isResponseMode && <span className="ml-2 text-xs text-rose-400 font-normal italic flex items-center"><Lock className="w-3 h-3 mr-1"/> (Cargo details matched to inquiry)</span>}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider flex items-center justify-between">Load Type {isLocked && <Lock className="w-3 h-3 text-ocean-500" />}</label><select disabled={isLocked} value={loadType} onChange={(e) => setLoadType(e.target.value as LoadType)} className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm ${isLocked ? 'opacity-60 cursor-not-allowed bg-ocean-900/30' : ''}`}>{loadTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider flex items-center justify-between">Quantity {isLocked && <Lock className="w-3 h-3 text-ocean-500" />}</label><input type="number" min="1" required disabled={isLocked} value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm ${isLocked ? 'opacity-60 cursor-not-allowed bg-ocean-900/30' : ''}`} /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider flex items-center justify-between">Matrix {isLocked && <Lock className="w-3 h-3 text-ocean-500" />}</label><select disabled={isLocked} value={matrix} onChange={(e) => setMatrix(e.target.value as any)} className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm ${isLocked ? 'opacity-60 cursor-not-allowed bg-ocean-900/30' : ''}`}>{matrixOptions.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider flex items-center justify-between">Cargo Description {isLocked && <Lock className="w-3 h-3 text-ocean-500" />}</label><textarea disabled={isLocked} required rows={1} value={cargoDetail} onChange={e => setCargoDetail(e.target.value)} className={`w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none ${isLocked ? 'opacity-60 cursor-not-allowed bg-ocean-900/30' : ''}`} placeholder="Description..." /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Freight Rate (USD)</label><input type="number" min="1" required value={freightRate || ''} onChange={e => setFreightRate(parseFloat(e.target.value))} className="w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" placeholder="Amount in USD"/></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Shipment Schedule</label><select required value={shipmentSchedule} onChange={e => setShipmentSchedule(e.target.value)} className="w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"><option value="" disabled>Select Schedule</option>{scheduleOptions.map((opt, idx) => (<option key={idx} value={opt}>{opt}</option>))}</select></div>
                  </div>
                  <div className="border-t border-white/5 pt-4"><div className="flex items-center space-x-4 mb-3"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider flex items-center">Hazardous ? {isLocked && <Lock className="w-3 h-3 text-ocean-500 ml-2" />}</label><div className={`flex items-center space-x-4 ${isLocked ? 'opacity-60 pointer-events-none' : ''}`}><label className="flex items-center space-x-2"><input type="radio" checked={!isHazardous} onChange={() => setIsHazardous(false)} className="text-emerald-500" /> <span className="text-sm text-white">No</span></label><label className="flex items-center space-x-2"><input type="radio" checked={isHazardous} onChange={() => setIsHazardous(true)} className="text-emerald-500" /> <span className="text-sm text-white">Yes</span></label></div></div>{isHazardous && (<textarea disabled={isLocked} required rows={2} value={hazardousDetail} onChange={e => setHazardousDetail(e.target.value)} className={`w-full bg-rose-950/10 border border-rose-900/50 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-rose-500 outline-none resize-none text-sm ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`} placeholder="Hazardous details..." />)}</div>
              </div>
            )}
            {step === 3 && (
               <div className="animate-fade-in-up bg-black/20 p-5 rounded-xl border border-white/5 space-y-6">
                  <h3 className="text-white font-bold flex items-center border-b border-white/10 pb-2"><DollarSign className="w-4 h-4 mr-2 text-emerald-400" /> Additional Charges</h3>
                  <div className="flex bg-ocean-950 rounded-lg p-1 border border-ocean-700 w-fit"><button type="button" onClick={() => setChargesMode('MASTER')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${chargesMode === 'MASTER' ? 'bg-emerald-600 text-white shadow' : 'text-ocean-400 hover:text-white'}`}>Select from Master</button><button type="button" onClick={() => setChargesMode('MANUAL')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${chargesMode === 'MANUAL' ? 'bg-emerald-600 text-white shadow' : 'text-ocean-400 hover:text-white'}`}>Manual Entry</button></div>
                  {chargesMode === 'MASTER' ? (<div className="space-y-2"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Select Charge Head</label><select value={selectedMasterHeadId} onChange={(e) => handleSelectMasterHead(e.target.value)} className="w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"><option value="" disabled>-- Select Pre-defined Charges --</option>{chargeHeads.map(h => <option key={h.id} value={h.id}>{h.headName}</option>)}</select></div>) : (<div className="grid grid-cols-12 gap-2 items-end bg-white/5 p-3 rounded-xl border border-white/5"><div className="col-span-4"><label className="text-[10px] font-bold text-ocean-400 uppercase">Name</label><input type="text" value={manualCharge.name} onChange={e=>setManualCharge({...manualCharge, name:e.target.value})} className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2 py-1.5 text-sm text-white" /></div><div className="col-span-3"><label className="text-[10px] font-bold text-ocean-400 uppercase">Amount</label><input type="number" value={manualCharge.amount || ''} onChange={e=>setManualCharge({...manualCharge, amount:parseFloat(e.target.value)})} className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2 py-1.5 text-sm text-white" /></div><div className="col-span-2"><label className="text-[10px] font-bold text-ocean-400 uppercase">Currency</label><select value={manualCharge.currency} onChange={e=>setManualCharge({...manualCharge, currency:e.target.value as any})} className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2 py-1.5 text-sm text-white">{currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div className="col-span-2"><label className="text-[10px] font-bold text-ocean-400 uppercase">Matrix</label><select value={manualCharge.matrix} onChange={e=>setManualCharge({...manualCharge, matrix:e.target.value as any})} className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2 py-1.5 text-sm text-white">{matrixOptions.map(m => <option key={m} value={m}>{m}</option>)}</select></div><div className="col-span-1"><button type="button" onClick={handleAddManualCharge} className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg"><Plus className="w-4 h-4"/></button></div></div>)}
                  {charges.length > 0 && (<div className="bg-ocean-950/50 rounded-xl overflow-hidden border border-white/10"><table className="w-full text-left text-sm"><thead className="bg-white/5 text-xs text-ocean-300 uppercase"><tr><th className="px-4 py-2">Charge</th><th className="px-4 py-2">Amount</th><th className="px-4 py-2">Matrix</th><th className="px-4 py-2 text-right">Action</th></tr></thead><tbody className="divide-y divide-white/5">{charges.map(c => (<tr key={c.id}><td className="px-4 py-2 text-white">{c.name}</td><td className="px-4 py-2 font-mono text-emerald-400">{c.amount} {c.currency}</td><td className="px-4 py-2 text-ocean-400 text-xs">{c.matrix}</td><td className="px-4 py-2 text-right"><button type="button" onClick={()=>handleRemoveCharge(c.id)} className="text-rose-400 hover:text-white"><Trash2 className="w-3.5 h-3.5"/></button></td></tr>))}</tbody><tfoot className="bg-white/5 border-t border-white/10"><tr><td colSpan={4} className="px-4 py-2 text-right"><span className="text-xs text-ocean-400 mr-4">Total Payables:</span>{totalUSD > 0 && <span className="text-emerald-400 font-bold mr-4">{totalUSD} USD</span>}{totalINR > 0 && <span className="text-emerald-400 font-bold">{totalINR} INR</span>}</td></tr></tfoot></table></div>)}
               </div>
            )}
            {step === 4 && (<div className="animate-fade-in-up bg-black/20 p-5 rounded-xl border border-white/5 space-y-6"><h3 className="text-white font-bold flex items-center border-b border-white/10 pb-2"><Anchor className="w-4 h-4 mr-2 text-emerald-400" /> Vessel & Validity</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Vessel Name</label><input type="text" required value={vesselName} onChange={e=>setVesselName(e.target.value)} className="w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" /></div><div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Voyage (Optional)</label><input type="text" value={voyage} onChange={e=>setVoyage(e.target.value)} className="w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" placeholder="Optional" /></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Gate Close Date (Optional)</label><input type="date" value={gateCloseDate} onChange={e=>setGateCloseDate(e.target.value)} className="w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" /></div><div className="space-y-1"><label className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider">Valid Upto (Date & Time)</label><input type="datetime-local" required value={validUntil} onChange={e=>setValidUntil(e.target.value)} className="w-full bg-ocean-950/50 border border-ocean-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm" /></div></div></div>)}
            <div className="pt-4 flex justify-between items-center border-t border-white/10 mt-6"><button type="button" onClick={onBack} className="px-6 py-3 text-ocean-300 hover:text-white transition-colors">Cancel</button><div className="flex space-x-3">{step > 1 && <button type="button" onClick={() => setStep(prev => (prev - 1) as any)} className="px-6 py-3 bg-ocean-800 hover:bg-ocean-700 text-white font-bold rounded-xl shadow-lg flex items-center transition-all"><ArrowLeft className="w-4 h-4 mr-2" /> Back</button>}{step < 4 ? (<button type="button" onClick={handleNext} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center transition-all">Next Step <ArrowRight className="w-4 h-4 ml-2" /></button>) : (<button type="submit" className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg flex items-center transition-all"><Save className="w-4 h-4 mr-2" /> {isReviseMode ? 'Update & Live' : (isResponseMode ? 'Send Response' : 'Publish Offer')}</button>)}</div></div>
          </form>
        </div>
      </div>
    </div>
  );
};
