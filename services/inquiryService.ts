
import { Inquiry } from '../types';

const STORAGE_KEY = 'ocean_inquiries';

// Helper to generate a dynamic current schedule for mock data
const getCurrentScheduleString = () => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'short' }).toUpperCase();
    const year = now.getFullYear().toString().slice(-2);
    const date = now.getDate();
    let prefix = 'LAST';
    if (date <= 7) prefix = '1ST';
    else if (date <= 14) prefix = '2ND';
    else if (date <= 21) prefix = '3RD';
    return `${prefix}-WEEK-${month}-${year}`;
};

const INITIAL_DATA: Inquiry[] = [
  {
    id: '1',
    inquiryNumber: 'INQ-2024-001',
    inquiryType: 'GENERAL',
    inquiryGroup: 'GLOBAL',
    pol: 'Mundra (INMUN)',
    pod: 'Jebel Ali (AEJEA)',
    loadType: '20 Feet Box',
    cargoDetail: 'Basmati Rice',
    quantity: 10,
    matrix: 'Container',
    shipmentSchedule: getCurrentScheduleString(), 
    shipmentScheduleEnd: '', 
    isHazardous: false,
    validUntil: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days from now
    status: 'LIVE',
    createdAt: new Date().toISOString(),
    createdBy: 'exp_01' // Simulating an external Exporter user
  },
  {
    id: '2',
    inquiryNumber: 'INQ-2024-002',
    inquiryType: 'SPECIFIC',
    inquiryGroup: 'NETWORK_PARTY',
    pol: 'Shanghai (CNSHA)',
    pod: 'Rotterdam (NLRTM)',
    loadType: '40 Feet HC',
    cargoDetail: 'Electronics',
    quantity: 5,
    matrix: 'Box',
    shipmentSchedule: getCurrentScheduleString(),
    shipmentScheduleEnd: '',
    isHazardous: true,
    hazardousDetail: 'Lithium Batteries, Class 9',
    validUntil: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'LIVE',
    createdAt: new Date().toISOString(),
    createdBy: 'exp_02'
  },
  {
    id: '3',
    inquiryNumber: 'INQ-2024-003',
    inquiryType: 'SPECIFIC',
    inquiryGroup: 'NETWORK_PARTY',
    targetPartyName: 'My Company', // Simulate target is current user
    targetUserName: 'Demo User (Manager)',
    targetPartyDisplay: 'Demo User (Manager) - My Company',
    pol: 'Singapore (SGSIN)',
    pod: 'Mundra (INMUN)',
    loadType: '20 Feet Box',
    cargoDetail: 'Machinery Parts',
    quantity: 2,
    matrix: 'Container',
    shipmentSchedule: getCurrentScheduleString(),
    shipmentScheduleEnd: '',
    isHazardous: false,
    validUntil: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    status: 'LIVE',
    createdAt: new Date().toISOString(),
    createdBy: 'exp_01' // Sender
  },
  {
    id: '4',
    inquiryNumber: 'INQ-2024-004',
    inquiryType: 'SPECIFIC',
    inquiryGroup: 'NETWORK_PARTY',
    targetPartyName: 'Oceanic Global Ltd', // Matches Default Signup Company
    targetUserName: 'John Doe (Manager)',
    targetPartyDisplay: 'John Doe (Manager) - Oceanic Global Ltd',
    pol: 'Rotterdam (NLRTM)',
    pod: 'Jebel Ali (AEJEA)',
    loadType: '40 Feet HC',
    cargoDetail: 'Automotive Components',
    quantity: 4,
    matrix: 'Container',
    shipmentSchedule: getCurrentScheduleString(),
    shipmentScheduleEnd: '',
    isHazardous: false,
    validUntil: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
    status: 'LIVE',
    createdAt: new Date().toISOString(),
    createdBy: 'exp_02'
  },
  {
    id: '5',
    inquiryNumber: 'INQ-2024-005',
    inquiryType: 'SPECIFIC',
    inquiryGroup: 'NETWORK_PARTY',
    targetPartyName: 'My Company',
    targetUserName: 'Demo User',
    targetPartyDisplay: 'Demo User - My Company',
    pol: 'New York (USNYC)',
    pod: 'Mundra (INMUN)',
    loadType: 'LCL',
    cargoDetail: 'Medical Equipment',
    quantity: 15,
    matrix: 'Box',
    shipmentSchedule: getCurrentScheduleString(),
    shipmentScheduleEnd: '',
    isHazardous: true,
    hazardousDetail: 'Sensitive, Temp Controlled',
    validUntil: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    status: 'LIVE',
    createdAt: new Date().toISOString(),
    createdBy: 'exp_01'
  },
  {
    id: '6',
    inquiryNumber: 'INQ-2024-006',
    inquiryType: 'SPECIFIC',
    inquiryGroup: 'NETWORK_PARTY',
    targetPartyName: 'Oceanic Global Ltd',
    targetUserName: 'John Doe',
    targetPartyDisplay: 'John Doe - Oceanic Global Ltd',
    pol: 'Jebel Ali (AEJEA)',
    pod: 'Singapore (SGSIN)',
    loadType: '20 ft Tanker',
    cargoDetail: 'Liquid Chemicals',
    quantity: 1,
    matrix: 'Container',
    shipmentSchedule: getCurrentScheduleString(),
    shipmentScheduleEnd: '',
    isHazardous: true,
    hazardousDetail: 'Corrosive Class 8',
    validUntil: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    status: 'LIVE',
    createdAt: new Date().toISOString(),
    createdBy: 'exp_02'
  }
];

export const inquiryService = {
  getInquiries: (): Inquiry[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    let inquiries: Inquiry[] = data ? JSON.parse(data) : INITIAL_DATA;

    // Check for expired status dynamically
    const now = new Date();
    now.setHours(0,0,0,0);

    inquiries = inquiries.map(inq => {
      const validDate = new Date(inq.validUntil);
      if (inq.status === 'LIVE' && validDate < now) {
        return { ...inq, status: 'EXPIRED' };
      }
      return inq;
    });
    
    // Save back updated statuses
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
    
    return inquiries;
  },

  saveInquiry: (inquiry: Inquiry): void => {
    const inquiries = inquiryService.getInquiries();
    inquiries.unshift(inquiry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
  },

  suspendInquiry: (id: string): void => {
    const inquiries = inquiryService.getInquiries();
    const inq = inquiries.find(i => i.id === id);
    if (inq) {
      inq.status = 'SUSPENDED';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
    }
  },

  updateStatus: (id: string, status: 'LIVE' | 'SUSPENDED' | 'EXPIRED' | 'REJECTED'): void => {
    const inquiries = inquiryService.getInquiries();
    const inq = inquiries.find(i => i.id === id);
    if (inq) {
      inq.status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
    }
  },

  generateInquiryNumber: (): string => {
    return `INQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  }
};
