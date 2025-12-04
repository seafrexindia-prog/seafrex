
import React from 'react';
import { X, MapPin, Mail, Phone, Briefcase, User, Building2 } from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  user: Partial<UserProfile> & { photoUrl?: string | null; city?: string; company?: string };
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  // Normalize data keys
  const photo = user.photoBase64 || user.photoUrl;
  const company = user.companyName || user.company || 'Unknown Company';
  const location = user.address || user.city || 'Location not specified';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        {/* Modal Content - Stop propagation to prevent closing when clicking inside */}
        <div className="relative w-full max-w-md bg-ocean-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-all scale-100" onClick={e => e.stopPropagation()}>
            
            {/* Header / Banner */}
            <div className="h-28 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 relative">
                <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10">
                    <X className="w-5 h-5" />
                </button>
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>

            {/* Profile Content */}
            <div className="px-8 pb-8 relative bg-ocean-900">
                {/* Avatar */}
                <div className="absolute -top-12 left-8">
                    <div className="w-24 h-24 rounded-full border-[4px] border-ocean-900 bg-ocean-800 flex items-center justify-center overflow-hidden shadow-lg group">
                        {photo ? (
                            <img src={photo} className="w-full h-full object-cover" alt={user.fullName} />
                        ) : (
                            <User className="w-12 h-12 text-ocean-400 group-hover:text-white transition-colors" />
                        )}
                    </div>
                </div>

                {/* Identity */}
                <div className="mt-14 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{user.fullName || 'Unknown User'}</h2>
                            <div className="flex items-center text-ocean-300 mt-1 font-medium">
                                <Briefcase className="w-4 h-4 mr-1.5 text-cyan-400" />
                                <span>{user.designation || 'Designation N/A'}</span>
                            </div>
                        </div>
                        {user.role && (
                            <span className="px-3 py-1 bg-ocean-800 border border-ocean-700 rounded-full text-[10px] text-cyan-400 font-bold uppercase tracking-wider shadow-sm">
                                {user.role}
                            </span>
                        )}
                    </div>
                </div>

                {/* Details Card */}
                <div className="bg-white/5 rounded-xl border border-white/5 p-5 space-y-5 shadow-inner">
                    {/* Company */}
                    <div className="flex items-center space-x-4 pb-4 border-b border-white/5">
                        <div className="w-12 h-12 rounded-lg bg-ocean-800 flex items-center justify-center border border-white/5 shadow-sm">
                            {user.logoBase64 ? <img src={user.logoBase64} className="w-8 h-8 object-contain"/> : <Building2 className="w-6 h-6 text-emerald-400" />}
                        </div>
                        <div>
                            <p className="text-[10px] text-ocean-400 uppercase font-bold tracking-wider">Company</p>
                            <p className="text-white font-bold text-lg leading-tight">{company}</p>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <div className="flex items-center text-sm text-ocean-200 group">
                            <div className="w-8 flex justify-center"><Mail className="w-4 h-4 text-ocean-500 group-hover:text-cyan-400 transition-colors" /></div>
                            <span className="font-medium">{user.email || 'Email not visible'}</span>
                        </div>
                        <div className="flex items-center text-sm text-ocean-200 group">
                            <div className="w-8 flex justify-center"><Phone className="w-4 h-4 text-ocean-500 group-hover:text-cyan-400 transition-colors" /></div>
                            <span className="font-medium">{user.mobile || 'Mobile not visible'}</span>
                        </div>
                        <div className="flex items-start text-sm text-ocean-200 group">
                            <div className="w-8 flex justify-center mt-0.5"><MapPin className="w-4 h-4 text-ocean-500 group-hover:text-cyan-400 transition-colors" /></div>
                            <span className="leading-snug">{location}</span>
                        </div>
                    </div>
                </div>
                
                {/* Footer / AI Insight Placeholder */}
                {user.onboardingAnalysis && (
                    <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-lg">
                        <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1">AI Profile Insight</p>
                        <p className="text-xs text-indigo-100 line-clamp-2">User is highly active in {location} region focusing on bulk shipments.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
