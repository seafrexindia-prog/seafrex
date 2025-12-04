
import React, { useState, useEffect } from 'react';
import { Home, Save, User, Building2, Briefcase, Phone, MapPin, X, Mail } from 'lucide-react';
import { InternalParty } from '../types';
import { partyService } from '../services/partyService';

interface InternalPartyFormProps {
  initialData?: InternalParty | null;
  onBack: () => void;
  onSaveSuccess: () => void;
}

export const InternalPartyForm: React.FC<InternalPartyFormProps> = ({ initialData, onBack, onSaveSuccess }) => {
  const [formData, setFormData] = useState<InternalParty>({
    id: '',
    contactPerson: '',
    email: '',
    companyName: '',
    designation: '',
    mobile: '',
    address: '',
    city: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: Date.now().toString(),
        contactPerson: '',
        email: '',
        companyName: '',
        designation: '',
        mobile: '',
        address: '',
        city: ''
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    partyService.saveParty(formData);
    onSaveSuccess();
  };

  return (
    <div className="flex flex-col h-full w-full bg-ocean-950/80 overflow-hidden animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="shrink-0 h-14 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
           <div className="p-2 bg-emerald-600/20 rounded-lg text-emerald-400">
             {initialData ? <EditIcon className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
           </div>
           <span className="font-semibold text-lg text-white">
             {initialData ? 'Edit Internal Party' : 'Create Internal Party'}
           </span>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Person */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Contact Person</label>
                <div className="relative group">
                   <User className="absolute left-3 top-3 w-5 h-5 text-ocean-500 group-focus-within:text-emerald-500 transition-colors" />
                   <input 
                     type="text" 
                     name="contactPerson"
                     required
                     value={formData.contactPerson}
                     onChange={handleChange}
                     className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                     placeholder="John Doe"
                   />
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Company Name</label>
                <div className="relative group">
                   <Building2 className="absolute left-3 top-3 w-5 h-5 text-ocean-500 group-focus-within:text-emerald-500 transition-colors" />
                   <input 
                     type="text" 
                     name="companyName"
                     required
                     value={formData.companyName}
                     onChange={handleChange}
                     className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                     placeholder="Company Ltd"
                   />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                   <Mail className="absolute left-3 top-3 w-5 h-5 text-ocean-500 group-focus-within:text-emerald-500 transition-colors" />
                   <input 
                     type="email" 
                     name="email"
                     value={formData.email}
                     onChange={handleChange}
                     className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                     placeholder="contact@company.com"
                   />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Mobile Number</label>
                <div className="relative group">
                   <Phone className="absolute left-3 top-3 w-5 h-5 text-ocean-500 group-focus-within:text-emerald-500 transition-colors" />
                   <input 
                     type="tel" 
                     name="mobile"
                     required
                     value={formData.mobile}
                     onChange={handleChange}
                     className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                     placeholder="+1 234 567 890"
                   />
                </div>
              </div>

              {/* Designation */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Designation</label>
                <div className="relative group">
                   <Briefcase className="absolute left-3 top-3 w-5 h-5 text-ocean-500 group-focus-within:text-emerald-500 transition-colors" />
                   <input 
                     type="text" 
                     name="designation"
                     value={formData.designation}
                     onChange={handleChange}
                     className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                     placeholder="Manager"
                   />
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">City</label>
                <div className="relative group">
                   <MapPin className="absolute left-3 top-3 w-5 h-5 text-ocean-500 group-focus-within:text-emerald-500 transition-colors" />
                   <input 
                     type="text" 
                     name="city"
                     required
                     value={formData.city}
                     onChange={handleChange}
                     className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                     placeholder="New York"
                   />
                </div>
              </div>
            </div>

            {/* Address (Full Width) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ocean-300 uppercase tracking-wider">Address</label>
              <div className="relative group">
                 <MapPin className="absolute left-3 top-3 w-5 h-5 text-ocean-500 group-focus-within:text-emerald-500 transition-colors" />
                 <textarea 
                   name="address"
                   rows={3}
                   value={formData.address}
                   onChange={handleChange}
                   className="w-full bg-black/20 border border-ocean-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all resize-none"
                   placeholder="Street Address, Area..."
                 />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 flex items-center justify-end space-x-4 border-t border-white/10 mt-8">
              <button 
                type="button" 
                onClick={onBack}
                className="px-6 py-3 text-ocean-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg transform hover:scale-[1.02] transition-all flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Party
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

// Helper icon
const EditIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);