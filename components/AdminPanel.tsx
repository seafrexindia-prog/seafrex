
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Database, 
  LogOut, 
  Search, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Shield, 
  CreditCard, 
  Save, 
  Menu, 
  X, 
  MessageSquare, 
  Lock, 
  BarChart, 
  Crown,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { UserProfile, EcrmTicket } from '../types';
import { adminService, PLAN_CONFIGS } from '../services/adminService';
import { authService } from '../services/authService';
import { AdminMasters } from './AdminMasters';
import { ECRMUpdate } from './ECRMUpdate';

interface AdminPanelProps {
  onLogout: () => void;
}

// Mock Admin Profile for ECRM context
const ADMIN_PROFILE: any = {
    email: 'admin',
    fullName: 'Super Admin',
    role: 'Admin',
    plan: 'CORPORATE' // Admin has max permissions
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'USERS' | 'MASTERS' | 'ECRM' | 'PLANS' | 'SETTINGS'>('DASHBOARD');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState(adminService.getGlobalSettings());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tickets, setTickets] = useState<EcrmTicket[]>([]);
  const [displayedTickets, setDisplayedTickets] = useState<EcrmTicket[]>([]);
  
  // ECRM States
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketSearch, setTicketSearch] = useState('');
  // Default to PENDING as requested
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Pricing State
  const [pricing, setPricing] = useState<Record<string, number>>({});
  
  // Settings State
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // When tab changes to ECRM, ensure data is loaded and defaults applied
  useEffect(() => {
      if (activeTab === 'ECRM') {
          applyTicketFilters();
      }
  }, [activeTab]);

  const loadData = () => {
    setUsers(adminService.getAllUsers());
    setSettings(adminService.getGlobalSettings());
    
    // Load tickets but don't display all immediately
    const allTickets = adminService.getAdminTickets();
    setTickets(allTickets);
    
    setPricing(adminService.getPlanPricing());
  };

  const applyTicketFilters = () => {
      setIsLoadingTickets(true);
      // Simulate delay for "reduced load" UX
      setTimeout(() => {
          const filtered = tickets.filter(t => {
              const uDetails = getUserDetails(t.createdBy || '');
              const matchSearch = t.ticketNumber.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                                  t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                                  uDetails.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                                  (t.createdBy || '').toLowerCase().includes(ticketSearch.toLowerCase());
              
              const matchStatus = ticketStatusFilter === 'ALL' || t.status === ticketStatusFilter;
              return matchSearch && matchStatus;
          });
          setDisplayedTickets(filtered);
          setIsLoadingTickets(false);
      }, 300);
  };

  const handleUpdateTrialDays = (days: number) => {
    const newSettings = { ...settings, defaultTrialDays: days };
    adminService.updateGlobalSettings(newSettings);
    setSettings(newSettings);
    alert('Global settings updated. New users will receive ' + days + ' trial days.');
  };

  const handleUserStatus = (email: string, currentStatus: string) => {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      if(window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
          authService.updateUserStatus(email, newStatus as any);
          loadData();
      }
  };

  const handleExtendTrial = (email: string) => {
      authService.updateSubscription(email, 'FREE', 30);
      loadData();
      alert("Trial extended by 30 days.");
  };

  const handleForceExpire = (email: string) => {
      if(window.confirm("This will expire the user's subscription immediately. Continue?")) {
          adminService.forceExpireUser(email);
          loadData();
      }
  };

  const handleChangePassword = () => {
      if(newPassword.length < 4) {
          alert("Password too short");
          return;
      }
      adminService.changeAdminPassword(newPassword);
      alert("Admin Password Updated Successfully");
      setNewPassword('');
  };

  const handlePricingChange = (plan: string, val: number) => {
      setPricing(prev => ({ ...prev, [plan]: val }));
  };

  const savePricing = () => {
      adminService.updatePlanPricing(pricing);
      alert("Plan Pricing Updated.");
  };

  const handleRespondTicket = (ticketId: string) => {
      setSelectedTicketId(ticketId);
  };

  const handleTicketUpdateSuccess = () => {
      setSelectedTicketId(null);
      // Reload tickets to get updated status
      const allTickets = adminService.getAdminTickets();
      setTickets(allTickets);
      // Re-apply filters immediately or wait for GO? 
      // Usually re-applying keeps context.
      setDisplayedTickets(prev => prev.map(t => {
          const updated = allTickets.find(at => at.id === t.id);
          return updated || t;
      }));
  };

  const getUserDetails = (email: string) => {
      const u = users.find(user => user.email === email);
      return u ? `${u.fullName} - ${u.companyName}` : email;
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingTicketsCount = tickets.filter(t => t.status === 'PENDING').length;

  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex items-center space-x-4 shadow-lg">
       <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
         <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
       </div>
       <div>
         <p className="text-slate-400 text-sm">{label}</p>
         <p className="text-2xl font-bold text-white">{value}</p>
       </div>
    </div>
  );

  // --- CHART HELPERS ---
  const getMonthlyOnboarding = () => {
      return [10, 40, 30, 70, 50, 90]; 
  };
  const getQuarterlyOnboarding = () => {
      return [40, 80, 60, 100];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
       
       {/* Sidebar */}
       <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
             <Shield className="w-6 h-6 text-emerald-500 mr-3" />
             <span className="text-xl font-bold text-white">Admin Panel</span>
             <button className="md:hidden ml-auto text-slate-400" onClick={() => setIsMobileMenuOpen(false)}><X /></button>
          </div>
          <nav className="p-4 space-y-2">
             <button onClick={() => { setActiveTab('DASHBOARD'); setSelectedTicketId(null); }} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'DASHBOARD' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
             </button>
             <button onClick={() => { setActiveTab('USERS'); setSelectedTicketId(null); }} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'USERS' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Users className="w-5 h-5 mr-3" /> User Management
             </button>
             <button onClick={() => { setActiveTab('MASTERS'); setSelectedTicketId(null); }} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'MASTERS' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Database className="w-5 h-5 mr-3" /> Master Data
             </button>
             <button onClick={() => { setActiveTab('ECRM'); setSelectedTicketId(null); }} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'ECRM' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <MessageSquare className="w-5 h-5 mr-3" /> ECRM Panel
                {pendingTicketsCount > 0 && <span className="ml-auto bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingTicketsCount}</span>}
             </button>
             <button onClick={() => { setActiveTab('PLANS'); setSelectedTicketId(null); }} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'PLANS' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Crown className="w-5 h-5 mr-3" /> User Plans
             </button>
             <button onClick={() => { setActiveTab('SETTINGS'); setSelectedTicketId(null); }} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'SETTINGS' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Settings className="w-5 h-5 mr-3" /> Settings
             </button>
          </nav>
          <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
             <button onClick={onLogout} className="w-full flex items-center justify-center px-4 py-2 text-rose-400 hover:bg-rose-900/20 rounded-lg transition-colors">
                <LogOut className="w-5 h-5 mr-2" /> Logout
             </button>
          </div>
       </aside>

       {/* Content */}
       <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Bar Mobile Trigger */}
          <div className="md:hidden h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4">
             <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-300"><Menu /></button>
             <span className="ml-4 font-bold">Seafrex Admin</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-950 relative">
             
             {/* If ECRM is active and a ticket is selected, show update component IN PLACE */}
             {activeTab === 'ECRM' && selectedTicketId ? (
                 <div className="h-full flex flex-col animate-fade-in-up">
                     <div className="flex items-center mb-4">
                         <button onClick={() => setSelectedTicketId(null)} className="text-slate-400 hover:text-white flex items-center mr-4">
                             <ArrowLeft className="w-5 h-5 mr-1" /> Back to List
                         </button>
                         <h2 className="text-2xl font-bold text-white">Manage Ticket</h2>
                     </div>
                     <div className="flex-1 overflow-hidden bg-slate-900/50 border border-slate-800 rounded-xl">
                         <ECRMUpdate 
                            ticketId={selectedTicketId} 
                            onBack={() => setSelectedTicketId(null)} 
                            onUpdateSuccess={handleTicketUpdateSuccess}
                            currentUser={ADMIN_PROFILE}
                            isAdminView={true} // Enable admin mode
                         />
                     </div>
                 </div>
             ) : activeTab === 'ECRM' ? (
                <div className="space-y-6 animate-fade-in-up h-full flex flex-col">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                      <h2 className="text-2xl font-bold text-white flex items-center">
                        <MessageSquare className="w-6 h-6 mr-3 text-rose-400"/> 
                        ECRM Support Panel
                      </h2>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                         {/* Search */}
                         <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Search ID, Subject, User..." 
                                className="bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-rose-500 text-white w-full sm:w-56" 
                                value={ticketSearch} 
                                onChange={e => setTicketSearch(e.target.value)} 
                            />
                         </div>
                         
                         {/* Filter - Doesn't trigger fetch immediately, just sets state */}
                         <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                            {(['ALL', 'PENDING', 'RESOLVED'] as const).map(s => (
                                <button 
                                    key={s}
                                    onClick={() => setTicketStatusFilter(s)}
                                    className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${ticketStatusFilter === s ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {s}
                                </button>
                            ))}
                         </div>

                         {/* GO Button */}
                         <button 
                            onClick={applyTicketFilters} 
                            disabled={isLoadingTickets}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center shadow-lg disabled:opacity-50"
                         >
                            {isLoadingTickets ? <RefreshCw className="w-4 h-4 animate-spin"/> : 'GO'}
                         </button>
                      </div>
                   </div>

                   <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex-1">
                      <div className="overflow-y-auto h-full custom-scrollbar">
                          <table className="w-full text-left">
                             <thead className="bg-slate-800 text-xs uppercase text-slate-400 sticky top-0 z-10">
                                <tr>
                                   <th className="px-6 py-4">Ticket Info</th>
                                   <th className="px-6 py-4">Sender (User Details)</th>
                                   <th className="px-6 py-4">Subject</th>
                                   <th className="px-6 py-4">Status</th>
                                   <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-800 text-sm">
                                {displayedTickets.length > 0 ? displayedTickets.map(t => (
                                   <tr key={t.id} className="hover:bg-slate-800/50">
                                      <td className="px-6 py-4">
                                         <div className="font-mono text-slate-300 font-bold">{t.ticketNumber}</div>
                                         <div className="text-xs text-slate-500 mt-1">{formatDate(t.date)}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                         <div className="font-medium text-white">{getUserDetails(t.createdBy || '')}</div>
                                         <div className="text-xs text-slate-500 mt-0.5">{t.partyType} • {t.createdBy}</div>
                                      </td>
                                      <td className="px-6 py-4 text-slate-300 font-medium">
                                         {t.subject}
                                      </td>
                                      <td className="px-6 py-4">
                                         <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'PENDING' ? 'bg-amber-900/30 text-amber-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                                            {t.status}
                                         </span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <button 
                                            onClick={() => handleRespondTicket(t.id)} 
                                            className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-rose-900/20"
                                          >
                                            Response / Action
                                          </button>
                                      </td>
                                   </tr>
                                )) : (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <Search className="w-8 h-8 mb-2 opacity-50"/>
                                            <p>No tickets match criteria. Click GO to refresh.</p>
                                        </div>
                                    </td></tr>
                                )}
                             </tbody>
                          </table>
                      </div>
                   </div>
                </div>
             ) : (
                 // OTHER TABS
                 <>
                     {activeTab === 'DASHBOARD' && (
                        <div className="space-y-8 animate-fade-in-up">
                           <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                              <StatCard label="Pending Tickets" value={pendingTicketsCount} icon={MessageSquare} color="bg-rose-500" />
                              <StatCard label="Total Users" value={users.length} icon={Users} color="bg-blue-500" />
                              <StatCard label="Active Free Plan" value={users.filter(u => u.plan === 'FREE' && u.subscriptionStatus === 'ACTIVE').length} icon={CheckCircle} color="bg-emerald-500" />
                              <StatCard label="Active Office Plan" value={users.filter(u => u.plan === 'OFFICE' && u.subscriptionStatus === 'ACTIVE').length} icon={CheckCircle} color="bg-blue-600" />
                              <StatCard label="Active Corporate" value={users.filter(u => u.plan === 'CORPORATE' && u.subscriptionStatus === 'ACTIVE').length} icon={Crown} color="bg-amber-500" />
                           </div>
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
                                 <h3 className="text-white font-bold mb-4 flex items-center"><BarChart className="w-4 h-4 mr-2 text-emerald-400"/> Monthly Onboarding Trend</h3>
                                 <div className="h-48 flex items-end justify-between gap-2 px-4 border-b border-slate-700 pb-2">
                                    {getMonthlyOnboarding().map((h, i) => (
                                        <div key={i} className="w-full bg-emerald-500/50 hover:bg-emerald-500 rounded-t-sm relative group" style={{height: `${h}%`}}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{h} Users</div>
                                        </div>
                                    ))}
                                 </div>
                                 <div className="flex justify-between text-xs text-slate-500 mt-2 px-4">
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                 </div>
                              </div>
                              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
                                 <h3 className="text-white font-bold mb-4 flex items-center"><BarChart className="w-4 h-4 mr-2 text-blue-400"/> Quarterly Growth</h3>
                                 <div className="h-48 flex items-end justify-between gap-4 px-8 border-b border-slate-700 pb-2">
                                    {getQuarterlyOnboarding().map((h, i) => (
                                        <div key={i} className="w-full bg-blue-500/50 hover:bg-blue-500 rounded-t-md relative group" style={{height: `${h}%`}}>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{h} Users</div>
                                        </div>
                                    ))}
                                 </div>
                                 <div className="flex justify-between text-xs text-slate-500 mt-2 px-8">
                                    <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {activeTab === 'USERS' && (
                        <div className="space-y-6 animate-fade-in-up">
                           <div className="flex justify-between items-center">
                              <h2 className="text-2xl font-bold text-white">User Management</h2>
                              <div className="relative">
                                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                 <input type="text" placeholder="Search users..." className="bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500 text-white w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                              </div>
                           </div>
                           <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                              <table className="w-full text-left">
                                 <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                                    <tr>
                                       <th className="px-6 py-4">User Details</th>
                                       <th className="px-6 py-4">Company</th>
                                       <th className="px-6 py-4">Plan & Expiry</th>
                                       <th className="px-6 py-4">Status</th>
                                       <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-800 text-sm">
                                    {filteredUsers.map(u => (
                                       <tr key={u.email} className="hover:bg-slate-800/50">
                                          <td className="px-6 py-4">
                                             <div className="font-bold text-white">{u.fullName}</div>
                                             <div className="text-slate-500 text-xs">{u.email}</div>
                                             <div className="text-slate-500 text-xs">{u.mobile}</div>
                                          </td>
                                          <td className="px-6 py-4 text-slate-300">{u.companyName}</td>
                                          <td className="px-6 py-4">
                                             <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.plan === 'CORPORATE' ? 'bg-amber-900/30 text-amber-400' : u.plan === 'OFFICE' ? 'bg-blue-900/30 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>{u.plan}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.subscriptionStatus === 'ACTIVE' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'}`}>{u.subscriptionStatus}</span>
                                             </div>
                                             <div className="text-xs text-slate-500 mt-1">Exp: {formatDate(u.expiryDate)}</div>
                                          </td>
                                          <td className="px-6 py-4">
                                             {u.status === 'ACTIVE' ? <span className="text-emerald-500 flex items-center text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1"/> Active</span> : <span className="text-rose-500 flex items-center text-xs font-bold"><XCircle className="w-3 h-3 mr-1"/> Suspended</span>}
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                             <div className="flex justify-end gap-2">
                                                <button onClick={() => handleUserStatus(u.email, u.status || 'ACTIVE')} className="text-slate-400 hover:text-white p-1" title="Toggle Status"><CreditCard className="w-4 h-4" /></button>
                                                <button onClick={() => handleExtendTrial(u.email)} className="text-emerald-400 hover:text-emerald-300 p-1" title="Extend +30 Days"><Calendar className="w-4 h-4" /></button>
                                                <button onClick={() => handleForceExpire(u.email)} className="text-rose-400 hover:text-rose-300 p-1" title="Force Expire"><LogOut className="w-4 h-4" /></button>
                                             </div>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     )}

                     {activeTab === 'MASTERS' && (
                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 h-full flex flex-col">
                           <h2 className="text-xl font-bold text-white mb-4 shrink-0">Master Data Management</h2>
                           <div className="flex-1 overflow-hidden rounded-lg bg-slate-950/50 p-2 border border-slate-800">
                              <AdminMasters onBack={() => {}} /> 
                           </div>
                        </div>
                     )}

                     {activeTab === 'PLANS' && (
                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                           <h2 className="text-xl font-bold text-white mb-6">User Plan Configuration</h2>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                              {Object.entries(PLAN_CONFIGS).map(([plan, limits]) => (
                                  <div key={plan} className="bg-slate-800 border border-slate-700 rounded-xl p-6 relative overflow-hidden">
                                      <div className="absolute top-0 right-0 p-4 opacity-10">
                                          {plan === 'FREE' ? <Users className="w-20 h-20"/> : plan === 'OFFICE' ? <Database className="w-20 h-20"/> : <Crown className="w-20 h-20"/>}
                                      </div>
                                      <h3 className="text-lg font-bold text-emerald-400 mb-4">{plan} Plan</h3>
                                      <div className="mb-4">
                                          <label className="text-xs text-slate-400 uppercase font-bold block mb-1">Yearly Price (₹)</label>
                                          <input 
                                            type="number" 
                                            className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white"
                                            value={pricing[plan]}
                                            onChange={(e) => handlePricingChange(plan, parseInt(e.target.value))}
                                            disabled={plan === 'FREE'}
                                          />
                                      </div>
                                      <ul className="space-y-3 text-sm text-slate-300 pt-4 border-t border-slate-700">
                                          <li className="flex justify-between border-b border-slate-700 pb-2">
                                              <span>Max Sub-Users</span>
                                              <span className="font-bold text-white">{limits.maxSubUsers}</span>
                                          </li>
                                          <li className="flex justify-between border-b border-slate-700 pb-2">
                                              <span>Daily Transactions</span>
                                              <span className="font-bold text-white">{limits.maxDailyTransactions > 1000 ? 'Unlimited' : limits.maxDailyTransactions}</span>
                                          </li>
                                          <li className="flex justify-between border-b border-slate-700 pb-2">
                                              <span>Explore Market</span>
                                              <span className="font-bold text-white">Unlimited</span>
                                          </li>
                                          <li className="flex justify-between">
                                              <span>Basic Features</span>
                                              <span className="font-bold text-emerald-400">Included</span>
                                          </li>
                                      </ul>
                                  </div>
                              ))}
                           </div>
                           <div className="flex justify-end">
                               <button onClick={savePricing} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center">
                                   <Save className="w-4 h-4 mr-2" /> Save Pricing Changes
                               </button>
                           </div>
                        </div>
                     )}

                     {activeTab === 'SETTINGS' && (
                        <div className="max-w-2xl mx-auto animate-fade-in-up space-y-8">
                           <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
                              <h2 className="text-xl font-bold text-white mb-6">Global Configuration</h2>
                              <div>
                                 <label className="block text-slate-400 text-sm font-bold mb-2">Default Free Trial Duration (Days)</label>
                                 <div className="flex items-center gap-4">
                                    <input type="number" min="1" className="bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-3 w-32 focus:ring-2 focus:ring-emerald-500 outline-none" value={settings.defaultTrialDays} onChange={e => setSettings({...settings, defaultTrialDays: parseInt(e.target.value)})} />
                                    <button onClick={() => handleUpdateTrialDays(settings.defaultTrialDays)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold flex items-center"><Save className="w-4 h-4 mr-2" /> Save Setting</button>
                                 </div>
                                 <p className="text-slate-500 text-xs mt-2">This setting applies to all new user registrations.</p>
                              </div>
                           </div>
                           <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
                              <h2 className="text-xl font-bold text-white mb-6 flex items-center"><Lock className="w-5 h-5 mr-2 text-rose-400" /> Admin Security</h2>
                              <div>
                                 <label className="block text-slate-400 text-sm font-bold mb-2">Change Admin Password</label>
                                 <div className="flex items-center gap-4">
                                    <input type="password" placeholder="New Password" className="bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-rose-500 outline-none" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                    <button onClick={handleChangePassword} className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-lg font-bold flex items-center whitespace-nowrap"><Save className="w-4 h-4 mr-2" /> Update Password</button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}
                 </>
             )}

          </div>
       </main>
    </div>
  );
};
