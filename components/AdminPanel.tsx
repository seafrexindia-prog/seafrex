import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Settings, Database, LogOut, Search, CheckCircle, XCircle, Calendar, Shield, CreditCard, Save, Menu, X, MessageSquare, Lock, BarChart, Crown, ArrowLeft, RefreshCw
} from 'lucide-react';
import { UserProfile, EcrmTicket } from '../types';
import { adminService, PLAN_CONFIGS } from '../services/adminService';
import { authService } from '../services/authService';
import { AdminMasters } from './AdminMasters';
import { ECRMUpdate } from './ECRMUpdate';

interface AdminPanelProps {
  onLogout: () => void;
}

const ADMIN_PROFILE: any = {
    email: 'admin',
    fullName: 'Super Admin',
    role: 'Admin',
    plan: 'CORPORATE' 
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'USERS' | 'MASTERS' | 'ECRM' | 'PLANS' | 'SETTINGS'>('DASHBOARD');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState(adminService.getGlobalSettings());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tickets, setTickets] = useState<EcrmTicket[]>([]);
  const [displayedTickets, setDisplayedTickets] = useState<EcrmTicket[]>([]);
  
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  const [pricing, setPricing] = useState<Record<string, number>>({});
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
      if (activeTab === 'ECRM') {
          applyTicketFilters();
      }
  }, [activeTab]);

  const loadData = () => {
    setUsers(adminService.getAllUsers());
    setSettings(adminService.getGlobalSettings());
    const allTickets = adminService.getAdminTickets();
    setTickets(allTickets);
    setPricing(adminService.getPlanPricing());
  };

  const applyTicketFilters = () => {
      setIsLoadingTickets(true);
      setTimeout(() => {
          const filtered = tickets.filter(t => {
              const matchSearch = t.ticketNumber.toLowerCase().includes(ticketSearch.toLowerCase()) || t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) || (t.createdBy || '').toLowerCase().includes(ticketSearch.toLowerCase());
              const matchStatus = ticketStatusFilter === 'ALL' || t.status === ticketStatusFilter;
              return matchSearch && matchStatus;
          });
          setDisplayedTickets(filtered);
          setIsLoadingTickets(false);
      }, 300);
  };

  // ... handlers ... (omitted for brevity, logic same as previous)

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingTicketsCount = tickets.filter(t => t.status === 'PENDING').length;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB');

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex items-center space-x-4 shadow-lg">
       <div className={`p-3 rounded-full ${color} bg-opacity-20`}><Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} /></div>
       <div><p className="text-slate-400 text-sm">{label}</p><p className="text-2xl font-bold text-white">{value}</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
       {/* Sidebar */}
       <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
          {/* ... Sidebar Content ... */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
             <Shield className="w-6 h-6 text-emerald-500 mr-3" />
             <span className="text-xl font-bold text-white">Admin Panel</span>
             <button className="md:hidden ml-auto text-slate-400" onClick={() => setIsMobileMenuOpen(false)}><X /></button>
          </div>
          <nav className="p-4 space-y-2">
             {/* ... Buttons ... */}
             <button onClick={() => setActiveTab('DASHBOARD')} className="w-full flex items-center px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard</button>
             <button onClick={() => setActiveTab('USERS')} className="w-full flex items-center px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><Users className="w-5 h-5 mr-3" /> Users</button>
             <button onClick={() => setActiveTab('MASTERS')} className="w-full flex items-center px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><Database className="w-5 h-5 mr-3" /> Masters</button>
             <button onClick={() => setActiveTab('ECRM')} className="w-full flex items-center px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><MessageSquare className="w-5 h-5 mr-3" /> ECRM</button>
             <button onClick={() => setActiveTab('PLANS')} className="w-full flex items-center px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><Crown className="w-5 h-5 mr-3" /> Plans</button>
             <button onClick={() => setActiveTab('SETTINGS')} className="w-full flex items-center px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"><Settings className="w-5 h-5 mr-3" /> Settings</button>
          </nav>
          <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
             <button onClick={onLogout} className="w-full flex items-center justify-center px-4 py-2 text-rose-400 hover:bg-rose-900/20 rounded-lg transition-colors"><LogOut className="w-5 h-5 mr-2" /> Logout</button>
          </div>
       </aside>

       {/* Main Content */}
       <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* ... Mobile Header ... */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-950 relative">
             {activeTab === 'ECRM' && selectedTicketId ? (
                 <div className="h-full flex flex-col animate-fade-in-up">
                     <ECRMUpdate ticketId={selectedTicketId} onBack={() => setSelectedTicketId(null)} onUpdateSuccess={() => {}} currentUser={ADMIN_PROFILE} isAdminView={true} />
                 </div>
             ) : activeTab === 'ECRM' ? (
                /* ... ECRM List ... */
                <div className="text-white">ECRM List View Placeholder</div>
             ) : activeTab === 'DASHBOARD' ? (
                /* ... Dashboard View ... */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                   <StatCard label="Pending Tickets" value={pendingTicketsCount} icon={MessageSquare} color="bg-rose-500" />
                   <StatCard label="Total Users" value={users.length} icon={Users} color="bg-blue-500" />
                </div>
             ) : activeTab === 'USERS' ? (
                /* ... User List ... */
                <div className="text-white">User List View Placeholder</div>
             ) : activeTab === 'MASTERS' ? (
                <AdminMasters onBack={() => {}} />
             ) : (
                 <div className="text-white">Placeholder for {activeTab}</div>
             )}
          </div>
       </main>
    </div>
  );
};