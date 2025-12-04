
import { Branch, SubUser, UserRole, ChargeHead, ShippingLine } from '../types';
import { authService } from './authService';

const STORAGE_KEY_BRANCH = 'ocean_branches';
const STORAGE_KEY_SUBUSERS = 'ocean_subusers';
const STORAGE_KEY_CHARGES = 'ocean_charges';
const STORAGE_KEY_SHIPPING = 'ocean_shipping_lines';

// Initial Mock Data
const INITIAL_BRANCHES: Branch[] = [
  { id: 'b1', branchName: 'Head Office', country: 'India', city: 'Mumbai', status: 'ACTIVE', isMainBranch: true, createdBy: 'main' },
  { id: 'b2', branchName: 'Dubai Branch', country: 'UAE', city: 'Dubai', status: 'ACTIVE', isMainBranch: false, createdBy: 'main' }
];

const INITIAL_SUBUSERS: SubUser[] = [
  { id: 'sub1@ocean.com', fullName: 'Rohit Sharma', email: 'sub1@ocean.com', mobile: '+919876543210', role: UserRole.FORWARDER_AGENT, branchId: 'b1', status: 'ACTIVE', designation: 'Operations Executive', createdBy: 'main' }
];

const INITIAL_CHARGES: ChargeHead[] = [
  {
    id: 'ch1',
    headName: '20 Feet Box Contain - Mundra Port',
    status: 'ACTIVE',
    items: [
      { id: 'ci1', name: 'THC', amount: 8500, matrix: 'Per Container', currency: 'INR' },
      { id: 'ci2', name: 'Documentation Charges', amount: 2500, matrix: 'Per Container', currency: 'INR' }
    ],
    createdBy: 'main'
  }
];

const INITIAL_SHIPPING_LINES: ShippingLine[] = [
  { id: 'sl1', lineName: 'Maersk Line', unitName: 'MAEU', country: 'Denmark', status: 'ACTIVE', createdBy: 'main' },
  { id: 'sl2', lineName: 'MSC', unitName: 'MSCU', country: 'Switzerland', status: 'ACTIVE', createdBy: 'main' },
  { id: 'sl3', lineName: 'CMA CGM', unitName: 'CMDU', country: 'France', status: 'ACTIVE', createdBy: 'main' }
];

export const masterService = {
  // --- Branches ---
  getBranches: (): Branch[] => {
    const data = localStorage.getItem(STORAGE_KEY_BRANCH);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_BRANCH, JSON.stringify(INITIAL_BRANCHES));
      return INITIAL_BRANCHES;
    }
    return JSON.parse(data);
  },

  saveBranch: (branch: Branch): void => {
    const branches = masterService.getBranches();
    const index = branches.findIndex(b => b.id === branch.id);
    if (index >= 0) {
      branches[index] = branch;
    } else {
      branches.push(branch);
    }
    localStorage.setItem(STORAGE_KEY_BRANCH, JSON.stringify(branches));
  },

  toggleBranchStatus: (id: string): void => {
    const branches = masterService.getBranches();
    const branch = branches.find(b => b.id === id);
    if (branch && !branch.isMainBranch) { // Cannot suspend main branch
      branch.status = branch.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      localStorage.setItem(STORAGE_KEY_BRANCH, JSON.stringify(branches));
    }
  },

  // --- Sub Users ---
  getSubUsers: (): SubUser[] => {
    const data = localStorage.getItem(STORAGE_KEY_SUBUSERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_SUBUSERS, JSON.stringify(INITIAL_SUBUSERS));
      return INITIAL_SUBUSERS;
    }
    return JSON.parse(data);
  },

  saveSubUser: (user: SubUser): void => {
    const users = masterService.getSubUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEY_SUBUSERS, JSON.stringify(users));
  },

  toggleSubUserStatus: (id: string): void => {
    const users = masterService.getSubUsers();
    const user = users.find(u => u.id === id);
    if (user) {
      const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      user.status = newStatus;
      localStorage.setItem(STORAGE_KEY_SUBUSERS, JSON.stringify(users));
      
      // Sync with Auth DB so they can't login
      authService.updateUserStatus(user.email, newStatus);
    }
  },

  // --- Charges ---
  getChargeHeads: (): ChargeHead[] => {
    const data = localStorage.getItem(STORAGE_KEY_CHARGES);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_CHARGES, JSON.stringify(INITIAL_CHARGES));
      return INITIAL_CHARGES;
    }
    return JSON.parse(data);
  },

  saveChargeHead: (chargeHead: ChargeHead): void => {
    const heads = masterService.getChargeHeads();
    const index = heads.findIndex(h => h.id === chargeHead.id);
    if (index >= 0) {
      heads[index] = chargeHead;
    } else {
      heads.push(chargeHead);
    }
    localStorage.setItem(STORAGE_KEY_CHARGES, JSON.stringify(heads));
  },

  deleteChargeHead: (id: string): void => {
    const heads = masterService.getChargeHeads().filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY_CHARGES, JSON.stringify(heads));
  },

  // --- Shipping Lines ---
  getShippingLines: (): ShippingLine[] => {
    const data = localStorage.getItem(STORAGE_KEY_SHIPPING);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_SHIPPING, JSON.stringify(INITIAL_SHIPPING_LINES));
      return INITIAL_SHIPPING_LINES;
    }
    return JSON.parse(data);
  },

  saveShippingLine: (line: ShippingLine): void => {
    const lines = masterService.getShippingLines();
    const index = lines.findIndex(l => l.id === line.id);
    if (index >= 0) {
      lines[index] = line;
    } else {
      lines.push(line);
    }
    localStorage.setItem(STORAGE_KEY_SHIPPING, JSON.stringify(lines));
  },

  toggleShippingLineStatus: (id: string): void => {
    const lines = masterService.getShippingLines();
    const line = lines.find(l => l.id === id);
    if (line) {
      line.status = line.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      localStorage.setItem(STORAGE_KEY_SHIPPING, JSON.stringify(lines));
    }
  },

  // Mock verification
  sendVerificationOtp: async (email: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`OTP for ${email}: 1234`);
    return '1234';
  },

  verifyOtp: async (otp: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return otp === '1234';
  }
};