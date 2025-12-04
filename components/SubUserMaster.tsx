
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Home, User, Mail, Smartphone, Plus, Shield, CheckCircle, Loader2, Briefcase, Upload, XCircle, Power, Search } from 'lucide-react';
import { SubUser, UserRole, Branch, UserProfile } from '../types';
import { masterService } from '../services/masterService';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';

interface SubUserMasterProps {
  onBack: () => void;
  currentUser: UserProfile;
  onViewProfile?: (profile: Partial<UserProfile>) => void;
}

export const SubUserMaster: React.FC<SubUserMasterProps> = ({ onBack, currentUser, onViewProfile }) => {
  const [view, setView] = useState<'LIST' | 'CREATE'>('LIST');
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Creation State
  const [createStep, setCreateStep] = useState<'EMAIL' | 'OTP' | 'DETAILS'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<SubUser>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setSubUsers(masterService.getSubUsers());
    setBranches(masterService.getBranches());
  };

  const filteredUsers = subUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    masterService.toggleSubUserStatus(id);
    loadData();
  };

  const handleProfileClick = (user: SubUser) => {
    if (onViewProfile) {
        onViewProfile({
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            designation: user.designation,
            photoBase64: user.photoBase64,
            companyName: currentUser.companyName,
            isMainUser: false,
            // Additional details if available
        });
    }
  };

  // --- Logic for Creation ---
  const handleStartCreate = () => {
      // Check Plan Limit
      const mySubUsers = subUsers.filter(u => u.createdBy === 'main' || u.createdBy === currentUser.email);
      const limit = adminService.getPermission(currentUser.plan).maxSubUsers;
      
      if (mySubUsers.length >= limit) {
          alert(`You have reached the maximum number of sub-users (${limit}) allowed on your ${currentUser.plan} plan. Upgrade to add more.`);
          return;
      }

      resetForm();
      setView('CREATE');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await masterService.sendVerificationOtp(email);
    setIsLoading(false);
    setCreateStep('OTP');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const valid = await masterService.verifyOtp(otp);
    setIsLoading(false);
    if (valid) {
      setCreateStep('DETAILS');
      setFormData(prev => ({ ...prev, email }));
    } else {
      alert('Invalid OTP (Try 1234)');
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Save to Master Service (For management list)
    const newUser: SubUser = {
      id: formData.email!,
      email: formData.email!,
      fullName: formData.fullName || '',
      mobile: formData.mobile || '',
      role: currentUser.role, // Auto-assign Main User's Role
      designation: formData.designation || '',
      branchId: formData.branchId || '',
      photoBase64: formData.photoBase64,
      status: 'ACTIVE',
      createdBy: currentUser.email || 'main'
    };
    masterService.saveSubUser(newUser);

    // 2. Register in Auth Service (So they can log in)
    // We create a UserProfile matching the SubUser details
    const subUserProfile: UserProfile = {
      email: formData.email!,
      mobile: formData.mobile || '',
      role: currentUser.role,
      fullName: formData.fullName || '',
      designation: formData.designation || '',
      companyName: currentUser.companyName || '', // Inherit Main User's Company
      address: '', // Could be branch address, left empty for now
      photoBase64: formData.photoBase64 || null,
      logoBase64: currentUser.logoBase64 || null,
      isMainUser: false, // Explicitly false for sub-users
      branchId: formData.branchId,
      status: 'ACTIVE',
      // Inherit subscription from main user (required by UserProfile type)
      plan: currentUser.plan,
      subscriptionStatus: currentUser.subscriptionStatus,
      registrationDate: currentUser.registrationDate,
      expiryDate: currentUser.expiryDate
    };
    authService.registerUser(subUserProfile);

    loadData();
    resetForm();
    setView('LIST');
  };

  const resetForm = () => {
    setEmail('');
    setOtp('');
    setCreateStep('EMAIL');
    setFormData({});
  };

  // Check if main user (default to true if undefined for legacy support)
  const canCreate = currentUser.isMainUser !== false;

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-orange-600/20 rounded-lg text-orange-400">
             <User className="w-5 h-5" />
           </div>
           <span className="font-semibold text-lg text-white">Sub-User Management</span>
        </div>
        <button onClick={onBack} className="p-2 text-ocean-300 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          <Home className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {view === 'LIST' ? (
          <div className="space-y-6">
            
            {/* Toolbar: Search + Create */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
               <div className="relative flex-1 max-w-md">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-ocean-400" />
                   <input
                       type="text"
                       placeholder="Search Sub-Users..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full bg-ocean-900/50 border border-ocean-700 rounded-xl pl-10 pr-4 py-2 text-white placeholder-ocean-500 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                   />
                </div>
                {canCreate && (
                  <button onClick={handleStartCreate} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl font-medium flex items-center shadow-lg transition-all">
                    <Plus className="w-4 h-4 mr-2" /> Create Sub-User
                  </button>
                )}
            </div>

            <div className="bg-ocean-900/40 border border-white/10 rounded-xl overflow-hidden shadow-xl">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-xs uppercase text-ocean-300 font-semibold tracking-wider">
                     <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Branch</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                     {filteredUsers.map(user => {
                       const branch = branches.find(b => b.id === user.branchId);
                       return (
                         <tr key={user.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-white cursor-pointer" onClick={() => handleProfileClick(user)}>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-ocean-800 border border-ocean-600 overflow-hidden shrink-0 flex items-center justify-center">
                                  {user.photoBase64 ? (
                                    <img src={user.photoBase64} alt={user.fullName} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-xs font-bold text-ocean-400">{user.fullName.charAt(0)}</span>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium hover:text-orange-400 transition-colors underline decoration-dotted decoration-ocean-600 underline-offset-4">{user.fullName}</div>
                                  <div className="text-[11px] text-ocean-400 flex items-center mt-0.5">
                                    <Briefcase className="w-3 h-3 mr-1 opacity-70" />
                                    {user.designation}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-ocean-300">{user.role}</td>
                            <td className="px-6 py-4 text-ocean-300">{branch?.branchName || '-'}</td>
                            <td className="px-6 py-4 text-ocean-400 text-xs">
                              <div>{user.email}</div>
                              <div>{user.mobile}</div>
                            </td>
                            <td className="px-6 py-4">
                               {user.status === 'ACTIVE' ? (
                                 <span className="inline-flex items-center text-emerald-400 text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1"/> Active</span>
                               ) : (
                                 <span className="inline-flex items-center text-rose-400 text-xs font-bold"><XCircle className="w-3 h-3 mr-1"/> Suspended</span>
                               )}
                            </td>
                            <td className="px-6 py-4 text-right">
                               {canCreate && (
                                 <button 
                                   onClick={() => handleToggleStatus(user.id)}
                                   className={`p-2 rounded-lg border transition-colors ${user.status === 'ACTIVE' ? 'border-rose-900/50 text-rose-400 hover:bg-rose-900/20' : 'border-emerald-900/50 text-emerald-400 hover:bg-emerald-900/20'}`}
                                   title={user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                                 >
                                   <Power className="w-4 h-4" />
                                 </button>
                               )}
                            </td>
                         </tr>
                       );
                     })}
                  </tbody>
               </table>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-full max-w-xl bg-ocean-900/40 border border-white/10 rounded-2xl p-8 shadow-2xl">
               <h3 className="text-xl font-bold text-white mb-6">Create New Sub-User</h3>
               
               {/* Step 1: Email */}
               {createStep === 'EMAIL' && (
                 <form onSubmit={handleSendOtp} className="space-y-4">
                    <p className="text-sm text-ocean-300 mb-4">Enter the email address of the new user to verify.</p>
                    <div className="relative">
                       <Mail className="absolute left-3 top-3 w-5 h-5 text-ocean-500" />
                       <input 
                         required type="email" value={email} onChange={e => setEmail(e.target.value)}
                         className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                         placeholder="user@company.com"
                       />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button type="button" onClick={() => setView('LIST')} className="px-4 py-2 text-ocean-300">Cancel</button>
                      <button type="submit" disabled={isLoading} className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold flex items-center">
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>} Send OTP
                      </button>
                    </div>
                 </form>
               )}

               {/* Step 2: OTP */}
               {createStep === 'OTP' && (
                 <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <p className="text-sm text-ocean-300 mb-2">OTP sent to {email}</p>
                    <input 
                      required type="text" value={otp} onChange={e => setOtp(e.target.value)}
                      className="w-full text-center text-2xl tracking-widest bg-black/20 border border-ocean-700 rounded-xl py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="1234"
                    />
                    <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-orange-600 text-white rounded-xl font-bold">
                        {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                 </form>
               )}

               {/* Step 3: Details */}
               {createStep === 'DETAILS' && (
                 <form onSubmit={handleSaveUser} className="space-y-6">
                    
                    {/* User Photo Upload */}
                    <div className="flex justify-center">
                       <div className="relative group">
                         <div className="w-24 h-24 rounded-full border-2 border-dashed border-ocean-600 flex items-center justify-center bg-black/20 overflow-hidden">
                           {formData.photoBase64 ? (
                             <img src={formData.photoBase64} alt="Preview" className="w-full h-full object-cover" />
                           ) : (
                             <User className="w-8 h-8 text-ocean-500" />
                           )}
                         </div>
                         <label className="absolute inset-0 w-full h-full cursor-pointer flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                           <Upload className="w-6 h-6 text-white" />
                           <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                         </label>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-ocean-300 uppercase">Full Name</label>
                      <input required type="text" className="w-full bg-black/20 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-ocean-300 uppercase">Designation</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-5 h-5 text-ocean-500" />
                        <input required type="text" className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                          onChange={e => setFormData({...formData, designation: e.target.value})}
                          placeholder="e.g. Sales Executive"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-ocean-300 uppercase">Mobile</label>
                      <input required type="tel" className="w-full bg-black/20 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
                        onChange={e => setFormData({...formData, mobile: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-ocean-300 uppercase">Role</label>
                       <div className="w-full bg-black/20 border border-ocean-700 rounded-xl px-4 py-3 text-ocean-400 italic">
                         {currentUser.role} (Auto-Assigned)
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-ocean-300 uppercase">Assign Branch</label>
                       <select required className="w-full bg-black/20 border border-ocean-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                         onChange={e => setFormData({...formData, branchId: e.target.value})} defaultValue=""
                       >
                         <option value="" disabled>Select Branch</option>
                         {branches.filter(b => b.status === 'ACTIVE').map(b => (
                           <option key={b.id} value={b.id}>{b.branchName} ({b.city})</option>
                         ))}
                       </select>
                    </div>
                    
                    <button type="submit" className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold shadow-lg">Create Sub-User</button>
                 </form>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
