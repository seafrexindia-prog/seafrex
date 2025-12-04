
import { UserProfile, SubscriptionPlan } from '../types';
import { adminService } from './adminService';

const DB_KEY = 'ocean_users_db';
const CURRENT_USER_KEY = 'ocean_current_user';

export const authService = {
  
  // Check if email exists
  checkUserExists: (email: string): boolean => {
    if (email === 'admin') return true;
    const db = getDb();
    return !!db[email];
  },

  // Get full user object (Internal helper exposed for login checks)
  getUser: (email: string): UserProfile | null => {
    const db = getDb();
    return db[email] || null;
  },

  // Update user status (Called by Master Service or Admin)
  updateUserStatus: (email: string, status: 'ACTIVE' | 'SUSPENDED'): void => {
    const db = getDb();
    if (db[email]) {
      db[email].status = status;
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
  },

  // Update Subscription (Called by Admin or Payment Success)
  updateSubscription: (email: string, plan: SubscriptionPlan, daysToAdd: number): void => {
    const db = getDb();
    if (db[email]) {
      const user = db[email];
      user.plan = plan;
      
      // Calculate new expiry
      const currentExpiry = new Date(user.expiryDate);
      const now = new Date();
      // If expired, start from now. If active, add to existing expiry.
      const baseDate = currentExpiry > now ? currentExpiry : now;
      baseDate.setDate(baseDate.getDate() + daysToAdd);
      
      user.expiryDate = baseDate.toISOString();
      user.subscriptionStatus = 'ACTIVE';
      
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      
      // If this is the current logged in user, update session
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.email === email) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }
    }
  },

  // Send OTP
  sendOtp: async (email: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const otp = '1234'; 
    console.log(`[Mock Auth] OTP for ${email} is ${otp}`);
    return otp;
  },

  // Verify OTP & Subscription Status
  verifyOtp: async (email: string, inputOtp: string): Promise<{ success: boolean; error?: string; expired?: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (inputOtp !== '1234') {
      return { success: false, error: 'Invalid OTP' };
    }

    const user = authService.getUser(email);
    if (!user) return { success: false, error: 'User not found' };

    if (user.status === 'SUSPENDED') {
      return { success: false, error: 'Your account has been Suspended. Contact Admin.' };
    }

    // Check Subscription Expiry
    const now = new Date();
    const expiry = new Date(user.expiryDate);
    
    if (expiry < now) {
      // Update DB to mark as expired
      const db = getDb();
      db[email].subscriptionStatus = 'EXPIRED';
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      return { success: false, expired: true };
    }

    return { success: true };
  },

  // Register User
  registerUser: (user: UserProfile): void => {
    const db = getDb();
    
    // Calculate Trial Expiry
    const settings = adminService.getGlobalSettings();
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(now.getDate() + settings.defaultTrialDays);

    const userWithStatus: UserProfile = { 
      ...user, 
      status: user.status || 'ACTIVE',
      plan: 'FREE',
      subscriptionStatus: 'ACTIVE',
      registrationDate: now.toISOString(),
      expiryDate: expiry.toISOString()
    };
    
    // Save to local Mock DB
    db[user.email] = userWithStatus;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    
    // Only auto-login if it's the main user registering themselves
    if (user.isMainUser) {
      authService.loginUser(userWithStatus);
    }
  },

  // Login User (Set Session)
  loginUser: (user: UserProfile | string): UserProfile | null => {
    if (typeof user === 'string') {
      const db = getDb();
      const foundUser = db[user];
      if (foundUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
        return foundUser;
      }
      return null;
    } else {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Get Current Session
  getCurrentUser: (): UserProfile | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  // --- ADMIN AUTH ---
  verifyAdminPassword: (password: string): boolean => {
    const currentAdminPass = adminService.getAdminPassword();
    return password === currentAdminPass;
  }
};

// Helper to get DB from local storage
function getDb(): Record<string, UserProfile> {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : {};
}
