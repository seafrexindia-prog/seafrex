import React, { useState, useEffect } from 'react';
import { AuthState, UserProfile } from './types';
import { authService } from './services/authService';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<AuthState>('LOGIN_EMAIL');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [tempEmail, setTempEmail] = useState('');

  // Initial load check
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setView('DASHBOARD');
    }
  }, []);

  const handleLoginSuccess = (email: string) => {
    // In a real app, verifyOtp would return the user object or token. 
    // Here we mocked checking the "DB" in authService.
    const user = authService.loginUser(email);
    if (user) {
      setCurrentUser(user);
      setView('DASHBOARD');
    } else {
      // Should not happen if logic flows correctly, but fallback
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

  return (
    <div className="min-h-screen bg-ocean-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ocean-800 via-ocean-950 to-black text-white flex items-center justify-center relative overflow-hidden">
      
      {/* Ambient Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {view === 'DASHBOARD' && currentUser ? (
          // Dashboard takes full screen, remove generic layout constraints
          <div className="w-full h-screen z-10">
            <Dashboard user={currentUser} onLogout={handleLogout} />
          </div>
        ) : (
          <main className="relative z-10 w-full flex justify-center p-4">
            {view === 'LOGIN_EMAIL' || view === 'LOGIN_OTP' ? (
              <LoginForm 
                onLoginSuccess={handleLoginSuccess}
                onUserNotFound={handleUserNotFound}
              />
            ) : view === 'SIGNUP' ? (
              <SignupForm 
                initialEmail={tempEmail}
                onSignupSuccess={handleSignupSuccess}
                onCancel={handleCancelSignup}
              />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-ocean-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-ocean-300">Loading Seafrex Portal...</p>
              </div>
            )}
          </main>
      )}

      {/* Footer only on login/signup screens */}
      {view !== 'DASHBOARD' && (
        <footer className="absolute bottom-4 w-full text-center text-xs text-ocean-600/50">
          &copy; {new Date().getFullYear()} Seafrex.in. Secure Logistics Portal.
        </footer>
      )}
    </div>
  );
};

export default App;