
import { UserProfile, SubscriptionPlan, EcrmTicket } from '../types';

const ADMIN_SETTINGS_KEY = 'ocean_admin_settings';
const ADMIN_PASSWORD_KEY = 'ocean_admin_password';
const ADMIN_PRICING_KEY = 'ocean_admin_pricing';
const DB_KEY = 'ocean_users_db'; // Same as authService
const TICKETS_KEY = 'ocean_ecrm_tickets';

interface AdminSettings {
  defaultTrialDays: number;
}

interface PlanLimits {
  maxSubUsers: number;
  maxDailyTransactions: number; // Offers + Inquiries
  allowFileUpload: boolean;
}

const DEFAULT_SETTINGS: AdminSettings = {
  defaultTrialDays: 30
};

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanLimits> = {
  'FREE': { maxSubUsers: 1, maxDailyTransactions: 5, allowFileUpload: false },
  'OFFICE': { maxSubUsers: 5, maxDailyTransactions: 9999, allowFileUpload: true }, // 9999 represents Unlimited
  'CORPORATE': { maxSubUsers: 25, maxDailyTransactions: 9999, allowFileUpload: true }
};

const DEFAULT_PRICING: Record<string, number> = {
  'FREE': 0,
  'OFFICE': 1999,
  'CORPORATE': 9999
};

export const adminService = {
  
  getGlobalSettings: (): AdminSettings => {
    const data = localStorage.getItem(ADMIN_SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },

  updateGlobalSettings: (settings: AdminSettings): void => {
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
  },

  // --- PRICING ---
  getPlanPricing: (): Record<string, number> => {
    const data = localStorage.getItem(ADMIN_PRICING_KEY);
    return data ? JSON.parse(data) : DEFAULT_PRICING;
  },

  updatePlanPricing: (pricing: Record<string, number>): void => {
    localStorage.setItem(ADMIN_PRICING_KEY, JSON.stringify(pricing));
  },

  getAllUsers: (): UserProfile[] => {
    const data = localStorage.getItem(DB_KEY);
    const db = data ? JSON.parse(data) : {};
    return Object.values(db);
  },

  // Mock function to manually expire a user for testing
  forceExpireUser: (email: string): void => {
    const data = localStorage.getItem(DB_KEY);
    if (data) {
        const db = JSON.parse(data);
        if (db[email]) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            db[email].expiryDate = yesterday.toISOString();
            db[email].subscriptionStatus = 'EXPIRED';
            localStorage.setItem(DB_KEY, JSON.stringify(db));
        }
    }
  },

  changeAdminPassword: (newPassword: string): void => {
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
  },

  getAdminPassword: (): string => {
    return localStorage.getItem(ADMIN_PASSWORD_KEY) || 'admin1234';
  },

  // ECRM for Admin
  getAdminTickets: (): EcrmTicket[] => {
    const data = localStorage.getItem(TICKETS_KEY);
    const allTickets: EcrmTicket[] = data ? JSON.parse(data) : [];
    // Admin sees tickets sent TO Admin (targetAdmin=true or partyType='ADMIN')
    return allTickets.filter(t => t.targetAdmin || t.partyType === 'ADMIN' || t.partyName.toUpperCase().includes('SEAFREX'));
  },

  getPermission: (plan: SubscriptionPlan) => {
    return PLAN_CONFIGS[plan];
  }
};
