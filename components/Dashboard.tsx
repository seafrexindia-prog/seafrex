
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, InternalParty, UserRole, Offer, Inquiry } from '../types';
import { NetworkList } from './NetworkList';
import { NetworkRequest } from './NetworkRequest';
import { InternalPartyList } from './InternalPartyList';
import { InternalPartyForm } from './InternalPartyForm';
import { ECRMList } from './ECRMList';
import { ECRMForm } from './ECRMForm';
import { ECRMUpdate } from './ECRMUpdate';
import { BranchMaster } from './BranchMaster';
import { SubUserMaster } from './SubUserMaster';
import { ChargesMaster } from './ChargesMaster';
import { ShippingLineMaster } from './ShippingLineMaster';
// AdminMasters Import Removed
import { InquiryForm } from './InquiryForm';
import { InquiryList } from './InquiryList';
import { InquiryExplore } from './InquiryExplore';
import { InquiryReceived } from './InquiryReceived';
import { OfferForm } from './OfferForm';
import { OfferList } from './OfferList';
import { OfferExplore } from './OfferExplore';
import { OfferReceived } from './OfferReceived';
import { UserProfileModal } from './UserProfileModal';
import { SubscriptionPage } from './SubscriptionPage';
import { BookingList } from './BookingList'; 
import { BookingReport } from './BookingReport'; 
import { 
  LogOut, 
  User, 
  Box, 
  Anchor,
  Globe,
  Search,
  Tag,
  ClipboardList,
  MessageSquare,
  Database,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  AlertCircle,
  PlusCircle,
  Crown,
  Clock,
  Zap
} from 'lucide-react';

// --- Menu Configuration ---

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  subItems?: { id: string; label: string }[];
  action?: 'logout';
  highlight?: boolean;
};

const MENU_STRUCTURE: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Box,
  },
  {
    id: 'network',
    label: 'Network',
    icon: Globe,
    subItems: [
      { id: 'network-pending', label: 'Pending Request' },
      { id: 'network-my', label: 'My Network' },
      { id: 'network-send', label: 'Send Request' },
    ]
  },
  {
    id: 'internal',
    label: 'Internal Party',
    icon: Users,
    subItems: [
      { id: 'internal-list', label: 'Party List' },
      { id: 'internal-create', label: 'Create Party' },
    ]
  },
  {
    id: 'inquiries',
    label: 'Inquiries',
    icon: Search,
    subItems: [
      { id: 'inquiries-create', label: 'Create' },
      { id: 'inquiries-explore', label: 'Explore' },
      { id: 'inquiries-my', label: 'My Inquiries' },
      { id: 'inquiries-received', label: 'Received' },
    ]
  },
  {
    id: 'offers',
    label: 'Offers',
    icon: Tag,
    subItems: [
      { id: 'offers-create', label: 'Create' },
      { id: 'offers-explore', label: 'Explore' },
      { id: 'offers-my', label: 'My Offers' },
      { id: 'offers-received', label: 'Received' },
    ]
  },
  {
    id: 'booking',
    label: 'Booking',
    icon: ClipboardList,
    subItems: [
      { id: 'booking-pending', label: 'Pending' },
      { id: 'booking-report', label: 'Booking Report' },
    ]
  },
  {
    id: 'ecrm',
    label: 'ECRM',
    icon: MessageSquare,
    subItems: [
      { id: 'ecrm-create', label: 'Create Ticket' },
      { id: 'ecrm-list', label: 'Ticket List' },
    ]
  },
  {
    id: 'masters',
    label: 'Masters',
    icon: Database,
    subItems: [
      { id: 'masters-charges', label: 'Charges' },
      { id: 'masters-branch', label: 'Branch' },
      { id: 'masters-subuser', label: 'Sub-User' },
      { id: 'masters-shipping-lines', label: 'Shipping Lines' },
      // Admin Masters REMOVED from User Dashboard
    ]
  }
];

// --- Mock Data ---

const MOCK_STATS = [
  { label: 'Pending Inquiries', value: 12, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: Search },
  { label: 'Received Offers', value: 5, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: Tag },
  { label: 'Pending Tickets', value: 3, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', icon: MessageSquare },
  { label: 'Draft Bookings', value: 2, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: ClipboardList },
];

const RECENT_PENDING_DATA = [
  { id: 'INQ-2024-001', module: 'Inquiry', subject: '20ft Container to Shanghai', date: '2024-05-10', status: 'Pending' },
  { id: 'TKT-9921', module: 'ECRM', subject: 'Login issue for sub-user', date: '2024-05-11', status: 'Urgent' },
  { id: 'OFR-8821', module: 'Offers', subject: 'Special Rate: Mumbai to Dubai', date: '2024-05-12', status: 'Review' },
  { id: 'BKG-1102', module: 'Booking', subject: 'Pending confirmation from carrier', date: '2024-05-12', status: 'Draft' },
  { id: 'INQ-2024-005', module: 'Inquiry', subject: 'LCL Cargo to Rotterdam', date: '2024-05-13', status: 'New' },
];

// --- Main Dashboard Component ---

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeMenuId, setActiveMenuId] = useState<string>('dashboard');
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  // Subscription View State
  const [showSubscription, setShowSubscription] = useState(false);

  // Internal Party State
  const [editingParty, setEditingParty] = useState<InternalParty | null>(null);
  
  // ECRM State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Offer State
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [inquiryToOfferTemplate, setInquiryToOfferTemplate] = useState<Offer | null>(null);

  // Inquiry State
  const [offerToInquiryTemplate, setOfferToInquiryTemplate] = useState<Inquiry | null>(null);

  // Profile Popup State
  const [selectedUserProfile, setSelectedUserProfile] = useState<Partial<UserProfile> | null>(null);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => {
      const isCurrentlyOpen = prev.includes(menuId);
      return isCurrentlyOpen ? [] : [menuId];
    });
  };

  const handleSubMenuClick = (menuId: string, subId: string) => {
    setActiveMenuId(menuId);
    setActiveSubId(subId);
    setShowSubscription(false);
    
    // Reset specific module states
    if (menuId !== 'internal') setEditingParty(null);
    if (menuId !== 'ecrm') setSelectedTicketId(null);
    else if (subId === 'ecrm-create') setSelectedTicketId(null);
    
    if (menuId !== 'offers' || subId === 'offers-create') {
        if (subId === 'offers-create' && editingOffer) {
            setEditingOffer(null);
        }
        if (menuId !== 'offers' || subId !== 'offers-create') {
           setInquiryToOfferTemplate(null);
        }
    }

    if (menuId !== 'inquiries' || subId !== 'inquiries-create') {
        setOfferToInquiryTemplate(null);
    }

    if (menuId === 'internal' && subId === 'internal-create') {
      setEditingParty(null);
    }
    
    if (window.innerWidth < 768) setIsMobileMenuOpen(false);
  };

  const handleMainMenuClick = (item: MenuItem) => {
    if (item.subItems && item.subItems.length > 0) {
      toggleMenu(item.id);
      return; 
    }

    setActiveMenuId(item.id);
    setActiveSubId(null);
    setShowSubscription(false);
    setEditingParty(null);
    setSelectedTicketId(null);
    setEditingOffer(null);
    setInquiryToOfferTemplate(null);
    setOfferToInquiryTemplate(null);
    
    if (window.innerWidth < 768) setIsMobileMenuOpen(false);
  };

  // Callbacks
  const handleEditInternalParty = (party: InternalParty) => {
    setEditingParty(party);
    setActiveSubId('internal-create'); 
  };

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setActiveSubId('ecrm-update');
  };

  const handleReviseOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setInquiryToOfferTemplate(null);
    setActiveSubId('offers-create'); 
  };

  const handleReplyWithOffer = (inquiry: Inquiry, senderInfo?: { name: string, company: string }) => {
      const templateOffer: any = {
          offerType: 'SPECIFIC',
          offerGroup: 'NETWORK_PARTY',
          targetPartyId: inquiry.createdBy, 
          targetPartyName: senderInfo?.company || 'Unknown Company',
          targetUserName: senderInfo?.name || 'Unknown User',
          targetPartyDisplay: senderInfo ? `${senderInfo.name} - ${senderInfo.company}` : inquiry.createdBy,
          pol: inquiry.pol,
          pod: inquiry.pod,
          loadType: inquiry.loadType,
          quantity: inquiry.quantity,
          matrix: inquiry.matrix,
          cargoDetail: inquiry.cargoDetail,
          isHazardous: inquiry.isHazardous,
          hazardousDetail: inquiry.hazardousDetail,
          id: '',
          offerNumber: '', 
          freightRate: 0,
          shipmentSchedule: inquiry.shipmentSchedule, 
          charges: [],
          vesselName: '',
          voyage: '',
          gateCloseDate: '',
          validUntil: '',
          transitPort: 'Direct',
          status: 'LIVE'
      };

      setInquiryToOfferTemplate(templateOffer);
      setEditingOffer(null); 
      setActiveMenuId('offers');
      setActiveSubId('offers-create');
  };

  const handleReplyWithInquiry = (offer: Offer, senderInfo?: { name: string, company: string }) => {
      const templateInquiry: any = {
          inquiryType: 'SPECIFIC',
          inquiryGroup: 'NETWORK_PARTY',
          targetPartyId: offer.createdBy,
          targetPartyName: senderInfo?.company || 'Unknown Company',
          targetUserName: senderInfo?.name || 'Unknown User',
          targetPartyDisplay: senderInfo ? `${senderInfo.name} - ${senderInfo.company}` : offer.createdBy,
          pol: offer.pol,
          pod: offer.pod,
          loadType: offer.loadType,
          quantity: offer.quantity,
          matrix: offer.matrix,
          cargoDetail: offer.cargoDetail,
          isHazardous: offer.isHazardous,
          hazardousDetail: offer.hazardousDetail,
          shipmentSchedule: offer.shipmentSchedule,
          id: '',
          inquiryNumber: '',
          status: 'LIVE',
          validUntil: ''
      };

      setOfferToInquiryTemplate(templateInquiry);
      setActiveMenuId('inquiries');
      setActiveSubId('inquiries-create');
  };

  // -- Profile View Handler --
  const handleViewProfile = (profile: Partial<UserProfile>) => {
      setSelectedUserProfile(profile);
  };

  const handleSubscriptionSuccess = () => {
      setShowSubscription(false);
      // Ideally trigger a user data refresh here via prop or context
      window.location.reload(); // Simple reload to fetch fresh user data including new plan
  };

  const getVisibleSubItems = (menuId: string, subItems?: {id: string, label: string}[]) => {
    if (!subItems) return undefined;
    
    // LINER OPERATOR RESTRICTIONS
    if (user.role === UserRole.LINER_OPERATOR) {
      if (menuId === 'inquiries') return subItems.filter(item => !['inquiries-create', 'inquiries-my'].includes(item.id));
      if (menuId === 'offers') return subItems.filter(item => !['offers-explore', 'offers-received'].includes(item.id));
      if (menuId === 'masters') return subItems.filter(item => item.id !== 'masters-shipping-lines');
    }
    
    // SHIPPER EXPORTER RESTRICTIONS
    if (user.role === UserRole.SHIPPER_EXPORTER) {
      if (menuId === 'inquiries') return subItems.filter(item => !['inquiries-explore', 'inquiries-received'].includes(item.id));
      if (menuId === 'offers') return subItems.filter(item => !['offers-create', 'offers-my'].includes(item.id));
      if (menuId === 'masters') return subItems.filter(item => item.id !== 'masters-charges' && item.id !== 'masters-shipping-lines');
    }

    // FORWARDER AGENT (Access to Shipping Lines)
    if (user.role === UserRole.FORWARDER_AGENT) {
       return subItems;
    } else {
       if (menuId === 'masters') return subItems.filter(item => item.id !== 'masters-shipping-lines');
    }

    return subItems;
  };

  // Helper for Date Display
  const formatDate = (isoString: string) => {
      return new Date(isoString).toLocaleDateString('en-GB');
  };

  // Days Remaining Calculation for FREE plan
  const getDaysRemaining = () => {
      if (user.plan !== 'FREE') return null;
      const expiry = new Date(user.expiryDate);
      const now = new Date();
      const diffTime = Math.abs(expiry.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  const TopBar = () => (
    <header className="fixed top-0 left-0 right-0 h-16 bg-ocean-900 border-b border-white/10 z-50 flex items-center justify-between px-4 md:px-6 shadow-md">
      <div className="flex items-center space-x-4">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-ocean-200 hover:text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-ocean-800 rounded-lg border border-white/10">
             <Anchor className="w-6 h-6 text-cyan-400" />
           </div>
           <span className="text-xl font-bold tracking-wide text-white">
             SEAFREX <span className="text-ocean-400 font-light">PORTAL</span>
           </span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* Subscription Badge */}
        <div className="hidden sm:flex items-center px-3 py-1 bg-ocean-800/50 rounded-full border border-ocean-700/50">
            <Crown className="w-3.5 h-3.5 mr-2 text-amber-400" />
            <span className="text-xs text-ocean-200 font-medium mr-1">{user.plan || 'Free'}</span>
            <span className="text-[10px] text-ocean-500">Exp: {formatDate(user.expiryDate)}</span>
        </div>

        {/* Free Plan Days Remaining Alert + Subscribe Button */}
        {daysRemaining !== null && (
            <div className="flex items-center space-x-2">
                <div className={`hidden md:flex items-center px-3 py-1 rounded-full text-xs font-bold border ${daysRemaining < 7 ? 'bg-rose-900/40 text-rose-300 border-rose-800' : 'bg-ocean-800/40 text-ocean-300 border-ocean-700'}`}>
                    <Clock className="w-3 h-3 mr-2" />
                    {daysRemaining} Days Left
                </div>
                <button onClick={() => setShowSubscription(true)} className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-full shadow-lg transition-all flex items-center">
                    <Zap className="w-3 h-3 mr-1" /> Upgrade
                </button>
            </div>
        )}

        <div className="relative">
            <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center space-x-3 focus:outline-none group p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white group-hover:text-ocean-100">{user.fullName}</p>
                <p className="text-xs text-ocean-400 group-hover:text-ocean-300">{user.companyName}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-ocean-700 border border-ocean-500 flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-ocean-500/50 transition-all">
                {user.photoBase64 ? <img src={user.photoBase64} alt="User" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-ocean-200" />}
            </div>
            <ChevronDown className={`w-4 h-4 text-ocean-400 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isProfileDropdownOpen && (
            <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 animate-fade-in-up">
                <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                    <p className="text-sm font-bold text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.companyName}</p>
                </div>
                <button onClick={() => { setActiveMenuId('profile'); setIsProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-ocean-50 hover:text-ocean-600 flex items-center">
                    <User className="w-4 h-4 mr-2" /> View Profile
                </button>
                <button onClick={() => { setShowSubscription(true); setIsProfileDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-ocean-50 hover:text-ocean-600 flex items-center">
                    <Crown className="w-4 h-4 mr-2 text-amber-500" /> Subscription
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
                </div>
            </>
            )}
        </div>
      </div>
    </header>
  );

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950 text-white overflow-hidden font-sans">
      <TopBar />
      <div className="flex flex-1 pt-16 overflow-hidden">
        <aside className={`fixed inset-y-0 left-0 top-16 bottom-0 z-40 w-64 bg-ocean-900/95 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col shadow-2xl`}>
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {MENU_STRUCTURE.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedMenus.includes(item.id);
              const isActive = activeMenuId === item.id;
              const visibleSubItems = getVisibleSubItems(item.id, item.subItems);
              return (
                <div key={item.id}>
                  <button onClick={() => handleMainMenuClick(item)} className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive && !visibleSubItems ? 'bg-ocean-600 text-white shadow-lg shadow-ocean-900/50' : 'text-ocean-200 hover:bg-ocean-800 hover:text-white'}`}>
                    <div className="flex items-center space-x-3"><Icon className="w-5 h-5" /><span>{item.label}</span></div>
                    {visibleSubItems && visibleSubItems.length > 0 && <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                  </button>
                  {visibleSubItems && visibleSubItems.length > 0 && isExpanded && (
                    <div className="mt-1 ml-4 border-l border-white/10 space-y-1">
                      {visibleSubItems.map((sub) => (
                        <button key={sub.id} onClick={(e) => { e.stopPropagation(); handleSubMenuClick(item.id, sub.id); }} className={`w-full flex items-center pl-6 pr-3 py-2 text-xs rounded-r-lg transition-colors ${activeSubId === sub.id ? 'bg-ocean-800/50 text-ocean-200 border-l-2 border-ocean-400' : 'text-ocean-400 hover:text-white hover:bg-white/5'}`}>
                           {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-gradient-to-br from-ocean-950 to-black">
          {showSubscription ? (
              <SubscriptionPage userEmail={user.email} onSuccess={handleSubscriptionSuccess} onCancel={() => setShowSubscription(false)} />
          ) : (
            <>
                <div className="h-12 bg-white/5 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center text-sm">
                        <span className="text-ocean-400 font-medium">{MENU_STRUCTURE.find(m => m.id === activeMenuId)?.label || 'Dashboard'}</span>
                        {activeSubId && (
                        <>
                            <ChevronRight className="w-4 h-4 mx-2 text-ocean-600" />
                            <span className="text-white">
                            {activeSubId === 'ecrm-update' ? 'Update Ticket' : 
                            (activeSubId === 'offers-create' && editingOffer) ? 'Revise Offer' :
                            (activeSubId === 'offers-create' && inquiryToOfferTemplate) ? 'Reply with Offer' :
                            (activeSubId === 'inquiries-create' && offerToInquiryTemplate) ? 'Send Inquiry from Offer' :
                            MENU_STRUCTURE.find(m => m.id === activeMenuId)?.subItems?.find(s => s.id === activeSubId)?.label || activeSubId}
                            </span>
                        </>
                        )}
                    </div>
                </div>

                {activeMenuId === 'network' ? (
                    activeSubId === 'network-my' ? <NetworkList onBack={() => setActiveMenuId('dashboard')} onSendRequest={() => setActiveSubId('network-send')} currentUser={user} onViewProfile={handleViewProfile} /> : <NetworkRequest onBack={() => setActiveMenuId('dashboard')} />
                ) : activeMenuId === 'internal' ? (
                    activeSubId === 'internal-create' ? <InternalPartyForm initialData={editingParty} onBack={() => { setActiveSubId('internal-list'); setEditingParty(null); }} onSaveSuccess={() => { setActiveSubId('internal-list'); setEditingParty(null); }} /> : <InternalPartyList onBack={() => setActiveMenuId('dashboard')} onEdit={handleEditInternalParty} onCreateNew={() => { setEditingParty(null); setActiveSubId('internal-create'); }} currentUser={user} onViewProfile={handleViewProfile} />
                ) : activeMenuId === 'ecrm' ? (
                    activeSubId === 'ecrm-create' ? <ECRMForm onBack={() => setActiveSubId('ecrm-list')} onSaveSuccess={() => setActiveSubId('ecrm-list')} currentUser={user} /> : activeSubId === 'ecrm-update' && selectedTicketId ? <ECRMUpdate ticketId={selectedTicketId} onBack={() => { setActiveSubId('ecrm-list'); setSelectedTicketId(null); }} onUpdateSuccess={() => { setActiveSubId('ecrm-list'); setSelectedTicketId(null); }} currentUser={user} /> : <ECRMList onBack={() => setActiveMenuId('dashboard')} onCreateNew={() => setActiveSubId('ecrm-create')} onSelectTicket={handleSelectTicket} currentUser={user} onViewProfile={handleViewProfile} />
                ) : activeMenuId === 'masters' ? (
                    activeSubId === 'masters-branch' ? <BranchMaster onBack={() => setActiveMenuId('dashboard')} currentUser={user} /> : 
                    activeSubId === 'masters-subuser' ? <SubUserMaster onBack={() => setActiveMenuId('dashboard')} currentUser={user} onViewProfile={handleViewProfile} /> : 
                    activeSubId === 'masters-charges' ? <ChargesMaster onBack={() => setActiveMenuId('dashboard')} currentUser={user} /> :
                    activeSubId === 'masters-shipping-lines' ? <ShippingLineMaster onBack={() => setActiveMenuId('dashboard')} currentUser={user} /> : null
                ) : activeMenuId === 'inquiries' ? (
                    activeSubId === 'inquiries-create' ? (
                        <InquiryForm 
                            onBack={() => { setActiveSubId('inquiries-my'); setOfferToInquiryTemplate(null); }} 
                            onSaveSuccess={() => { setActiveSubId('inquiries-my'); setOfferToInquiryTemplate(null); }} 
                            currentUser={user} 
                            initialData={offerToInquiryTemplate}
                            isResponseMode={!!offerToInquiryTemplate}
                        />
                    ) : activeSubId === 'inquiries-explore' ? (
                        <InquiryExplore onBack={() => setActiveMenuId('dashboard')} currentUser={user} onReplyWithOffer={handleReplyWithOffer} onViewProfile={handleViewProfile} />
                    ) : activeSubId === 'inquiries-received' ? (
                        <InquiryReceived onBack={() => setActiveMenuId('dashboard')} currentUser={user} onReplyWithOffer={handleReplyWithOffer} onViewProfile={handleViewProfile} />
                    ) : (
                        <InquiryList onBack={() => setActiveMenuId('dashboard')} onCreateNew={() => setActiveSubId('inquiries-create')} currentUser={user} onViewProfile={handleViewProfile} />
                    )
                ) : activeMenuId === 'offers' ? (
                    activeSubId === 'offers-create' ? (
                        <OfferForm 
                        onBack={() => { setActiveSubId('offers-my'); setEditingOffer(null); setInquiryToOfferTemplate(null); }}
                        onSaveSuccess={() => { setActiveSubId('offers-my'); setEditingOffer(null); setInquiryToOfferTemplate(null); }}
                        currentUser={user}
                        initialData={editingOffer || inquiryToOfferTemplate}
                        isReviseMode={!!editingOffer} 
                        isResponseMode={!!inquiryToOfferTemplate}
                        />
                    ) : activeSubId === 'offers-explore' ? (
                        <OfferExplore onBack={() => setActiveMenuId('dashboard')} currentUser={user} onReplyWithInquiry={handleReplyWithInquiry} onViewProfile={handleViewProfile} />
                    ) : activeSubId === 'offers-received' ? (
                        <OfferReceived onBack={() => setActiveMenuId('dashboard')} currentUser={user} onViewProfile={handleViewProfile} />
                    ) : (
                        <OfferList 
                        onBack={() => setActiveMenuId('dashboard')}
                        onCreateNew={() => { setEditingOffer(null); setInquiryToOfferTemplate(null); setActiveSubId('offers-create'); }}
                        onRevise={handleReviseOffer}
                        currentUser={user}
                        onViewProfile={handleViewProfile}
                        />
                    )
                ) : activeMenuId === 'booking' ? (
                    activeSubId === 'booking-report' ? (
                        <BookingReport 
                            onBack={() => setActiveMenuId('dashboard')} 
                            currentUser={user} 
                        />
                    ) : (
                        <BookingList 
                            onBack={() => setActiveMenuId('dashboard')} 
                            currentUser={user} 
                        />
                    )
                ) : activeMenuId === 'profile' ? (
                    <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                        <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-24 h-24 rounded-full bg-ocean-800 border-4 border-ocean-600 overflow-hidden mb-4">{user.photoBase64 ? <img src={user.photoBase64} className="w-full h-full object-cover"/> : <User className="w-12 h-12 m-auto mt-4 text-ocean-400"/>}</div>
                            <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
                            <p className="text-ocean-300">{user.designation} at {user.companyName}</p>
                            <span className="mt-2 px-3 py-1 bg-ocean-600 rounded-full text-xs font-semibold">{user.role}</span>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-ocean-900/50 rounded-lg border border-white/5"><label className="text-xs text-ocean-400 uppercase font-bold">Contact Email</label><p className="text-white">{user.email}</p></div>
                            <div className="p-4 bg-ocean-900/50 rounded-lg border border-white/5"><label className="text-xs text-ocean-400 uppercase font-bold">Mobile</label><p className="text-white">{user.mobile}</p></div>
                            <div className="p-4 bg-ocean-900/50 rounded-lg border border-white/5"><label className="text-xs text-ocean-400 uppercase font-bold">Address</label><p className="text-white">{user.address}</p></div>
                            <div className="p-4 bg-gradient-to-r from-ocean-900/50 to-emerald-900/20 rounded-lg border border-emerald-500/20 flex justify-between items-center">
                                <div>
                                    <label className="text-xs text-emerald-400 uppercase font-bold">Subscription</label>
                                    <p className="text-white font-bold">{user.plan || 'Free'} Plan <span className="text-xs font-normal text-ocean-400">(Expires: {formatDate(user.expiryDate)})</span></p>
                                </div>
                                <button onClick={() => setShowSubscription(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg">
                                    Subscribe / Upgrade
                                </button>
                            </div>
                        </div>
                        </div>
                    </div>
                ) : activeMenuId === 'dashboard' ? (
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {MOCK_STATS.map((stat, idx) => (
                            <div key={idx} className={`bg-ocean-900/40 border ${stat.border} rounded-xl p-5 flex flex-col justify-between hover:bg-ocean-900/60 transition-colors`}>
                            <div className="flex items-center justify-between mb-4"><span className={`text-sm font-medium ${stat.color}`}>{stat.label}</span><div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`w-4 h-4 ${stat.color}`} /></div></div>
                            <div><span className="text-3xl font-bold text-white">{stat.value}</span><span className="text-xs text-ocean-400 ml-2">Updates</span></div>
                            </div>
                        ))}
                        {user.role !== UserRole.SHIPPER_EXPORTER && (
                            <div onClick={() => { setActiveMenuId('inquiries'); setActiveSubId('inquiries-explore'); }} className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-xl p-5 flex flex-col justify-between hover:shadow-lg hover:shadow-cyan-900/20 transition-all cursor-pointer group">
                                <div className="flex items-center justify-between mb-4"><span className="text-sm font-bold text-cyan-300">Explore Market</span><div className="p-2 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors"><Globe className="w-4 h-4 text-cyan-400" /></div></div>
                                <div><span className="text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">Find Inquiries</span><p className="text-xs text-cyan-400/70 mt-1">Search global & network loads</p></div>
                            </div>
                        )}
                        {user.role !== UserRole.LINER_OPERATOR && (
                            <div onClick={() => { setActiveMenuId('offers'); setActiveSubId('offers-explore'); }} className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-500/30 rounded-xl p-5 flex flex-col justify-between hover:shadow-lg hover:shadow-emerald-900/20 transition-all cursor-pointer group">
                                <div className="flex items-center justify-between mb-4"><span className="text-sm font-bold text-emerald-300">Explore Market</span><div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors"><Tag className="w-4 h-4 text-emerald-400" /></div></div>
                                <div><span className="text-lg font-bold text-white group-hover:text-emerald-200 transition-colors">Find Offers</span><p className="text-xs text-emerald-400/70 mt-1">Search competitive freight rates</p></div>
                            </div>
                        )}
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between"><h3 className="font-semibold text-lg flex items-center"><AlertCircle className="w-5 h-5 mr-2 text-ocean-400" /> Pending Items Overview</h3><button className="text-xs text-ocean-300 hover:text-white transition-colors">View All</button></div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                            <thead className="bg-white/5 text-xs uppercase text-ocean-300"><tr><th className="px-6 py-4 font-semibold">Reference ID</th><th className="px-6 py-4 font-semibold">Module</th><th className="px-6 py-4 font-semibold">Subject</th><th className="px-6 py-4 font-semibold">Date</th><th className="px-6 py-4 font-semibold">Status</th><th className="px-6 py-4 font-semibold text-right">Action</th></tr></thead>
                            <tbody className="divide-y divide-white/5 text-sm text-ocean-100">
                                {RECENT_PENDING_DATA.map((row, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-ocean-400">{row.id}</td>
                                    <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ocean-800 text-ocean-200">{row.module}</span></td>
                                    <td className="px-6 py-4 font-medium text-white">{row.subject}</td>
                                    <td className="px-6 py-4 text-ocean-400">{row.date}</td>
                                    <td className="px-6 py-4"><span className="text-amber-400 flex items-center text-xs"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2"></div>{row.status}</span></td>
                                    <td className="px-6 py-4 text-right"><button className="text-ocean-400 hover:text-white"><ChevronRight className="w-4 h-4" /></button></td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                        <div className="w-20 h-20 bg-ocean-800/50 rounded-full flex items-center justify-center mb-6">{MENU_STRUCTURE.find(m => m.id === activeMenuId)?.icon && React.createElement(MENU_STRUCTURE.find(m => m.id === activeMenuId)!.icon, { className: "w-10 h-10 text-ocean-400" })}</div>
                        <h3 className="text-2xl font-bold text-white mb-2">{activeSubId ? MENU_STRUCTURE.find(m => m.id === activeMenuId)?.subItems?.find(s => s.id === activeSubId)?.label : MENU_STRUCTURE.find(m => m.id === activeMenuId)?.label}</h3>
                        <p className="text-ocean-300 max-w-md">This module is currently under development. You will be able to manage your {activeMenuId} here.</p>
                        <button className="mt-8 px-6 py-3 bg-ocean-600 hover:bg-ocean-500 text-white rounded-lg font-medium transition-colors flex items-center"><PlusCircle className="w-5 h-5 mr-2" /> Create New Record</button>
                    </div>
                    </div>
                )}
            </>
          )}
        </main>
      </div>

      {/* GLOBAL USER PROFILE MODAL */}
      {selectedUserProfile && (
          <UserProfileModal 
              user={selectedUserProfile} 
              onClose={() => setSelectedUserProfile(null)} 
          />
      )}
    </div>
  );
};
