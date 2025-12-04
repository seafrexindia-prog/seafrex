
import React, { useState, ChangeEvent } from 'react';
import { UserProfile, UserRole } from '../types';
import { Upload, User, Briefcase, MapPin, Smartphone, ArrowRight, Loader2, Ship, Globe, Anchor } from 'lucide-react';
import { authService } from '../services/authService';
import { geminiService } from '../services/geminiService';

interface SignupFormProps {
  initialEmail: string;
  onSignupSuccess: (user: UserProfile) => void;
  onCancel: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ initialEmail, onSignupSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const [formData, setFormData] = useState<Omit<UserProfile, 'onboardingAnalysis'>>({
    email: initialEmail,
    mobile: '',
    role: UserRole.SHIPPER_EXPORTER,
    fullName: '',
    designation: '',
    companyName: '',
    address: '',
    photoBase64: null,
    logoBase64: null,
    // Placeholders - these will be overwritten by authService.registerUser
    plan: 'FREE',
    subscriptionStatus: 'ACTIVE',
    registrationDate: new Date().toISOString(),
    expiryDate: new Date().toISOString(),
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: 'photoBase64' | 'logoBase64') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoadingMessage('Creating your account...');

    try {
      // 1. Generate AI Onboarding Analysis
      setLoadingMessage('Consulting AI for role implications...');
      const analysis = await geminiService.generateOnboardingGuidance(
        formData.fullName,
        formData.role,
        formData.companyName
      );

      // 2. Construct final user profile
      const newUser: UserProfile = {
        ...formData,
        onboardingAnalysis: analysis,
        isMainUser: true, // Explicitly set as Main User for public signups
      };

      // 3. Register locally
      setLoadingMessage('Finalizing registration...');
      authService.registerUser(newUser);

      // 4. Success callback
      onSignupSuccess(newUser);
    } catch (error) {
      console.error(error);
      setLoadingMessage('Error during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in-up">
      
      {/* Left Sidebar - Guidance */}
      <div className="w-full md:w-1/3 bg-ocean-900/60 p-8 flex flex-col justify-between border-r border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Join the Network</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-3 text-ocean-200">
              <Ship className="w-6 h-6 text-ocean-400 mt-1 shrink-0" />
              <p className="text-sm">Connect with global shippers and forwarders in a unified ecosystem.</p>
            </div>
            <div className="flex items-start space-x-3 text-ocean-200">
              <Anchor className="w-6 h-6 text-ocean-400 mt-1 shrink-0" />
              <p className="text-sm">AI-powered insights tailored to your specific role in the supply chain.</p>
            </div>
            <div className="flex items-start space-x-3 text-ocean-200">
              <Globe className="w-6 h-6 text-ocean-400 mt-1 shrink-0" />
              <p className="text-sm">Secure, verified document exchange and tracking.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-ocean-400 mb-2">Need to sign in instead?</p>
          <button onClick={onCancel} className="text-sm font-semibold text-white hover:text-ocean-300 transition-colors">
            &larr; Back to Login
          </button>
        </div>
      </div>

      {/* Right Content - Form */}
      <div className="w-full md:w-2/3 p-8 bg-white/5">
        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Onboarding Details</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-xs font-semibold text-ocean-300 uppercase tracking-wider mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full bg-ocean-950/50 border border-ocean-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-ocean-500 focus:border-transparent outline-none"
              >
                {Object.values(UserRole).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-ocean-300 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-ocean-500" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-ocean-950/50 border border-ocean-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-ocean-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-xs font-semibold text-ocean-300 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full bg-ocean-950/30 border border-ocean-800 rounded-lg px-4 py-2.5 text-ocean-400 cursor-not-allowed"
              />
            </div>
             <div>
              <label className="block text-xs font-semibold text-ocean-300 uppercase tracking-wider mb-1">Mobile</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-2.5 h-5 w-5 text-ocean-500" />
                <input
                  type="tel"
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full bg-ocean-950/50 border border-ocean-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-ocean-500 outline-none"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>
          </div>

          {/* Section: Company */}
          <div className="border-t border-white/10 pt-4">
             <h4 className="text-sm font-medium text-ocean-200 mb-4">Company Information</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-ocean-300 uppercase tracking-wider mb-1">Company Name</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-ocean-500" />
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full bg-ocean-950/50 border border-ocean-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-ocean-500 outline-none"
                      placeholder="Oceanic Global Ltd"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ocean-300 uppercase tracking-wider mb-1">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    required
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full bg-ocean-950/50 border border-ocean-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-ocean-500 outline-none"
                    placeholder="Operations Manager"
                  />
                </div>
             </div>
             
             <div className="mb-4">
               <label className="block text-xs font-semibold text-ocean-300 uppercase tracking-wider mb-1">Company Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-ocean-500" />
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-ocean-950/50 border border-ocean-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-ocean-500 outline-none resize-none"
                    placeholder="123 Port Road, Maritime City"
                  />
                </div>
             </div>
          </div>

          {/* Section: Uploads */}
          <div className="border-t border-white/10 pt-4">
             <h4 className="text-sm font-medium text-ocean-200 mb-4">Documents & Branding</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* User Photo */}
               <div className="relative group">
                 <label className="block text-xs font-semibold text-ocean-300 uppercase tracking-wider mb-1">User Photo</label>
                 <div className="relative h-24 w-full border-2 border-dashed border-ocean-700 rounded-lg flex flex-col items-center justify-center bg-ocean-950/30 hover:bg-ocean-900/50 transition-colors">
                   {formData.photoBase64 ? (
                     <img src={formData.photoBase64} alt="Preview" className="h-full w-full object-cover rounded-lg opacity-80" />
                   ) : (
                     <div className="text-center p-2">
                       <Upload className="h-6 w-6 text-ocean-500 mx-auto mb-1" />
                       <span className="text-[10px] text-ocean-400">Click to upload photo</span>
                     </div>
                   )}
                   <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'photoBase64')} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                   />
                 </div>
               </div>
               
               {/* Company Logo */}
               <div className="relative group">
                 <label className="block text-xs font-semibold text-ocean-300 uppercase tracking-wider mb-1">Company Logo</label>
                 <div className="relative h-24 w-full border-2 border-dashed border-ocean-700 rounded-lg flex flex-col items-center justify-center bg-ocean-950/30 hover:bg-ocean-900/50 transition-colors">
                   {formData.logoBase64 ? (
                     <img src={formData.logoBase64} alt="Preview" className="h-full w-full object-contain p-2 rounded-lg opacity-80" />
                   ) : (
                     <div className="text-center p-2">
                       <Upload className="h-6 w-6 text-ocean-500 mx-auto mb-1" />
                       <span className="text-[10px] text-ocean-400">Click to upload logo</span>
                     </div>
                   )}
                   <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleFileChange(e, 'logoBase64')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                   />
                 </div>
               </div>
             </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/50 transition-all transform hover:scale-[1.01] mt-6"
          >
            {isSubmitting ? (
              <>
                 <Loader2 className="w-5 h-5 animate-spin mr-3" />
                 {loadingMessage}
              </>
            ) : (
              <>
                Complete Registration <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
