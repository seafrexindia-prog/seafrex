
import { UserProfile } from '../types';

const DB_KEY = 'ocean_users_db';
const CURRENT_USER_KEY = 'ocean_current_user';

// NOTE FOR DEPLOYMENT TO SEAFREX.IN:
// This service currently mimics a backend using LocalStorage for demonstration.
// For your live website, you must replace the `sendOtp` and `registerUser`
// functions to fetch() data from your real backend server (e.g., PHP, Node.js).

export const authService = {
  
  // Check if email exists
  checkUserExists: (email: string): boolean => {
    const db = getDb();
    return !!db[email];
  },

  // Get full user object (Internal helper exposed for login checks)
  getUser: (email: string): UserProfile | null => {
    const db = getDb();
    return db[email] || null;
  },

  // Update user status (Called by Master Service)
  updateUserStatus: (email: string, status: 'ACTIVE' | 'SUSPENDED'): void => {
    const db = getDb();
    if (db[email]) {
      db[email].status = status;
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
  },

  // Send OTP
  sendOtp: async (email: string): Promise<string> => {
    // REAL WORLD IMPLEMENTATION ON SEAFREX.IN:
    // const response = await fetch('https://api.seafrex.in/api/send-otp.php', { 
    //   method: 'POST', 
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email }) 
    // });
    
    // DEMO IMPLEMENTATION:
    await new Promise(resolve => setTimeout(resolve, 1000));
    const otp = '1234'; // Fixed for demo simplicity
    console.log(`[Mock Auth] OTP for ${email} is ${otp}`);
    return otp;
  },

  // Verify OTP
  verifyOtp: async (email: string, inputOtp: string): Promise<boolean> => {
    // REAL WORLD IMPLEMENTATION ON SEAFREX.IN:
    // const response = await fetch('https://api.seafrex.in/api/verify-otp.php', { 
    //    method: 'POST', 
    //    headers: { 'Content-Type': 'application/json' },
    //    body: JSON.stringify({ email, otp: inputOtp }) 
    // });
    
    // DEMO IMPLEMENTATION:
    await new Promise(resolve => setTimeout(resolve, 500));
    return inputOtp === '1234';
  },

  // Register User
  registerUser: (user: UserProfile): void => {
    const db = getDb();
    // Ensure default status is ACTIVE
    const userWithStatus = { ...user, status: user.status || 'ACTIVE' };
    
    // Save to local Mock DB
    db[user.email] = userWithStatus;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    
    // IN PRODUCTION (SEAFREX.IN):
    // await fetch('https://api.seafrex.in/api/register.php', { 
    //   method: 'POST', 
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(user) 
    // });
    
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
  }
};

// Helper to get DB from local storage
function getDb(): Record<string, UserProfile> {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : {};
}
