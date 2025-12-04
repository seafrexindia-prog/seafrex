
import React, { useState, useEffect } from 'react';
import { AuthState, UserProfile } from './types';
import { authService } from '../services/authService';
import { LoginForm } from '../components/LoginForm';
import { SignupForm } from '../components/SignupForm';
import { Dashboard } from '../components/Dashboard';
import { AdminPanel } from '../components/AdminPanel';
import { SubscriptionPage } from '../components/SubscriptionPage';

const App: React.FC = () => {
  const [view, setView] = useState<AuthState>('LOGIN_EMAIL');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [tempEmail, setTempEmail] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Initial load check
  useEffect(() => {
    const initApp = () => {
      const user = authService.getCurrentUser();
      if (user) {
        // Check for expiry on reload
        if (new Date(user.expiryDate) < new Date()) {
            setTempEmail(user.email);
            setView('SUBSCRIPTION_EXPIRED');
        } else {
            setCurrentUser(user);
            setView('DASHBOARD');
        }
      } else {
        setView('LOGIN_EMAIL');
      }
      setIsInitializing(false);
    };

    initApp();
  }, []);

  const handleLoginSuccess = (email: string) => {
    const user = authService.loginUser(email);
    if (user) {
      setCurrentUser(user);
      setView('DASHBOARD');
    } else {
      alert("User record missing locally. Please sign up.");
      setTempEmail(email);
      setView('SIGNUP');
    }
  };

  const handleUserNotFound = (email: string) => {
    setTempEmail(email);
    setView('SIGNUP');
  };

  const handleSignupSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setView('DASHBOARD');
  };

  const handleAdminLogin = () => {
      setView('ADMIN_PANEL');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setTempEmail('');
    setView('LOGIN_EMAIL');
  };

  const handleCancelSignup = () => {
    setView('LOGIN_EMAIL');
    setTempEmail('');
  };

  const handleSubscriptionExpired = (email: string) => {
      setTempEmail(email);
      setView('SUBSCRIPTION_EXPIRED');
  };

  const handleSubscriptionSuccess = () => {
      const user = authService.getUser(tempEmail);
      if (user) {
          authService.loginUser(user);
          setCurrentUser(user);
          setView('DASHBOARD');
      }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-ocean-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-ocean-300">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${view === 'ADMIN_PANEL' ? 'bg-slate-950' : 'bg-ocean-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ocean-800 via-ocean-950 to-black'} text-white flex items-center justify-center relative overflow-hidden`}>
      
      {/* Ambient Background Effects (Not for Dashboard/Admin which take full width) */}
      {view !== 'DASHBOARD' && view !== 'ADMIN_PANEL' && (
        <>
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {view === 'DASHBOARD' && currentUser ? (
          <div className="w-full h-screen z-10">
            <Dashboard user={currentUser} onLogout={handleLogout} />
          </div>
        ) : view === 'ADMIN_PANEL' ? (
          <div className="w-full h-screen z-10">
            <AdminPanel onLogout={handleLogout} />
          </div>
        ) : view === 'SUBSCRIPTION_EXPIRED' ? (
          <div className="w-full h-screen z-10 overflow-y-auto">
            <SubscriptionPage userEmail={tempEmail} onSuccess={handleSubscriptionSuccess} onLogout={handleLogout} />
          </div>
        ) : (
          <main className="relative z-10 w-full flex justify-center p-4">
            {(view === 'LOGIN_EMAIL' || view === 'LOGIN_OTP' || view === 'LOGIN_PASS') ? (
              <LoginForm 
                onLoginSuccess={handleLoginSuccess}
                onUserNotFound={handleUserNotFound}
                onAdminLogin={handleAdminLogin}
                onSubscriptionExpired={handleSubscriptionExpired}
              />
            ) : view === 'SIGNUP' ? (
              <SignupForm 
                initialEmail={tempEmail}
                onSignupSuccess={handleSignupSuccess}
                onCancel={handleCancelSignup}
              />
            ) : null}
          </main>
      )}

      {/* Footer only on login/signup screens */}
      {(view === 'LOGIN_EMAIL' || view === 'LOGIN_OTP' || view === 'LOGIN_PASS' || view === 'SIGNUP') && (
        <footer className="absolute bottom-4 w-full text-center text-xs text-ocean-600/50">
          &copy; {new Date().getFullYear()} Seafrex.in. Secure Logistics Portal.
        </footer>
      )}
    </div>
  );
};

export default App;
