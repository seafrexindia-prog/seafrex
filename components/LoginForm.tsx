
import React, { useState } from 'react';
import { Mail, ArrowRight, Lock, Loader2, Anchor, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginFormProps {
  onLoginSuccess: (email: string) => void;
  onUserNotFound: (email: string) => void;
  onAdminLogin: () => void;
  onSubscriptionExpired: (email: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onUserNotFound, onAdminLogin, onSubscriptionExpired }) => {
  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'ADMIN_PASS'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');

    // Admin Check
    if (email.toLowerCase() === 'admin') {
        setStep('ADMIN_PASS');
        return;
    }

    setIsLoading(true);
    try {
      const exists = authService.checkUserExists(email);
      if (exists) {
        await authService.sendOtp(email);
        setStep('OTP');
      } else {
        onUserNotFound(email);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (authService.verifyAdminPassword(password)) {
          onAdminLogin();
      } else {
          setError('Invalid Admin Credentials');
      }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.verifyOtp(email, otp);
      if (result.success) {
          onLoginSuccess(email);
      } else if (result.expired) {
          onSubscriptionExpired(email);
      } else {
          setError(result.error || 'Verification failed');
      }
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-ocean-900/50 rounded-full border border-ocean-700 shadow-xl">
            {step === 'ADMIN_PASS' ? <ShieldCheck className="h-10 w-10 text-emerald-400" /> : <Anchor className="h-10 w-10 text-cyan-400" />}
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">{step === 'ADMIN_PASS' ? 'Admin Access' : 'Seafrex Portal'}</h2>
        <p className="text-ocean-200">{step === 'ADMIN_PASS' ? 'Restricted Area' : 'Secure access for logistics partners'}</p>
      </div>

      {step === 'EMAIL' && (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ocean-100 mb-2">
              Email Address / User ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ocean-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="text"
                id="email"
                required
                className="block w-full pl-10 pr-3 py-3 bg-ocean-900/50 border border-ocean-700 rounded-xl text-white placeholder-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-400 hover:to-ocean-500 text-white font-semibold rounded-xl shadow-lg shadow-ocean-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continue <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}

      {step === 'OTP' && (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="text-center mb-4">
             <p className="text-sm text-ocean-200">We sent a code to <span className="font-semibold text-white">{email}</span></p>
             <button type="button" onClick={() => setStep('EMAIL')} className="text-xs text-ocean-400 hover:text-white underline mt-1">Change email</button>
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-ocean-100 mb-2">
              One-Time Password
            </label>
            <input
              type="text"
              id="otp"
              required
              maxLength={4}
              className="block w-full text-center text-2xl tracking-widest py-3 bg-ocean-900/50 border border-ocean-700 rounded-xl text-white placeholder-ocean-600 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
              placeholder="••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-500/20">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-400 hover:to-ocean-500 text-white font-semibold rounded-xl shadow-lg shadow-ocean-500/30 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Verify & Login"
            )}
          </button>
        </form>
      )}

      {step === 'ADMIN_PASS' && (
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="text-center mb-4">
               <p className="text-sm text-ocean-200">Hello, <span className="font-semibold text-white">Super Admin</span></p>
               <button type="button" onClick={() => { setStep('EMAIL'); setEmail(''); }} className="text-xs text-ocean-400 hover:text-white underline mt-1">Not Admin? Go Back</button>
            </div>
  
            <div>
              <label htmlFor="pass" className="block text-sm font-medium text-ocean-100 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ocean-400">
                    <Lock className="h-5 w-5" />
                </div>
                <input
                    type="password"
                    id="pass"
                    required
                    className="block w-full pl-10 pr-3 py-3 bg-ocean-900/50 border border-ocean-700 rounded-xl text-white placeholder-ocean-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
  
            {error && <p className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-500/20">{error}</p>}
  
            <button
              type="submit"
              className="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
            >
              Access Admin Panel
            </button>
          </form>
      )}
    </div>
  );
};
