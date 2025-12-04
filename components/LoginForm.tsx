
import React, { useState } from 'react';
import { Mail, ArrowRight, Lock, Loader2, Anchor } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginFormProps {
  onLoginSuccess: (email: string) => void;
  onUserNotFound: (email: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onUserNotFound }) => {
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError('');

    try {
      const exists = authService.checkUserExists(email);
      if (exists) {
        await authService.sendOtp(email);
        setStep('OTP');
      } else {
        // Direct flow to signup if user doesn't exist
        onUserNotFound(email);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    setError('');

    try {
      const isValid = await authService.verifyOtp(email, otp);
      if (isValid) {
        // Check Status
        const user = authService.getUser(email);
        if (user && user.status === 'SUSPENDED') {
          setError('Your account has been Suspended. Please contact your administrator.');
        } else {
          onLoginSuccess(email);
        }
      } else {
        setError('Invalid OTP. Please try "1234"');
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
            <Anchor className="h-10 w-10 text-cyan-400" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Seafrex Portal</h2>
        <p className="text-ocean-200">Secure access for logistics partners</p>
      </div>

      {step === 'EMAIL' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ocean-100 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ocean-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
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
                Continue with Email <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>
        </form>
      ) : (
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

          {error && <p className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg">{error}</p>}

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
    </div>
  );
};
