
import { Offer } from '../types';

const STORAGE_KEY = 'ocean_offers';

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

const INITIAL_DATA: Offer[] = [
  {
    id: '1',
    offerNumber: 'OFR-2024-8001',
    offerType: 'GENERAL',
    offerGroup: 'GLOBAL',
    pol: 'Mundra (INMUN)',
    pod: 'Jebel Ali (AEJEA)',
    transitPort: 'Direct',
    loadType: '20 Feet Box',
    cargoDetail: 'General Cargo',
    quantity: 10,
    matrix: 'Container',
    freightRate: 1200,
    shipmentSchedule: getCurrentScheduleString(),
    isHazardous: false,
    charges: [
      { id: 'c1', name: 'Documentation Fee', amount: 4500, currency: 'INR', matrix: 'Per Container' },
      { id: 'c2', name: 'THC', amount: 8000, currency: 'INR', matrix: 'Per Container' }
    ],
    vesselName: 'MV OCEAN PRIDE',
    voyage: 'V-001',
    gateCloseDate: '',
    validUntil: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'LIVE',
    createdAt: new Date().toISOString(),
    createdBy: 'main'
  },
  {
    id: '2',
    offerNumber: 'OFR-2024-9002',
    offerType: 'GENERAL',
    offerGroup: 'GLOBAL',
    pol: 'Shanghai (CNSHA)',
    pod: 'Rotterdam (NLRTM)',
    transitPort: 'Singapore',
    loadType: '40 Feet HC',
    cargoDetail: 'Electronics & Gadgets',
    quantity: 50,
    matrix: 'Container',
    freightRate: 3500,
    shipmentSchedule: getCurrentScheduleString(),
    isHazardous: false,
    charges: [],
    vesselName: 'COSCO STAR',
    voyage: 'CS-992',
    gateCloseDate: '',
    validUntil: new Date(Date.now() + 86400000 * 10).toISOString(),
    status: 'LIVE',
    createdAt: new Date().toISOString(),
    createdBy: 'exp_02' // External User
  },
  {
    id: '3',
    offerNumber: 'OFR-2024-9003',
    offerType: 'GENERAL',
    offerGroup: 'NETWORK',
    pol: 'Singapore (SGSIN)',
    pod: 'Mundra (INMUN)',
    transitPort: 'Direct',
    loadType: '20 Feet Box',
    cargoDetail: 'Raw Materials',
    quantity: 20,
    matrix: 'Container',
    freightRate: 850,
    shipmentSchedule: getCurrentScheduleString(),
    isHazardous: true,
    hazardousDetail: 'Class 3 Flammable',
    charges: [],
    vesselName: 'MAERSK ALABAMA',
    voyage: 'MA-221',
    gateCloseDate: '',
    validUntil: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'LIVE',
    createdAt: new Date().toISOString(),
    createdBy: 'exp_01' // External Network User
  },
  {
    // New Mock Offer RECEIVED by 'main' user
    id: '4',
    offerNumber: 'OFR-2024-9900',
    offerType: 'SPECIFIC',
    offerGroup: 'NETWORK_PARTY',
    // Target is 'main' (My Company)
    targetPartyName: 'My Company', 
    targetUserName: 'Demo User (Manager)',
    targetPartyDisplay: 'Demo User (Manager) - My Company',
    
    pol: 'London (GBLON)',
    pod: 'New York (USNYC)',
    transitPort: 'Direct',
    loadType: '40 Feet Box',
    cargoDetail: 'Luxury Textiles',
    quantity: 5,
    matrix: 'Container',
    freightRate: 4200,
    shipmentSchedule: getCurrentScheduleString(),
    isHazardous: false,
    charges: [],
    vesselName: 'CMA CGM MARCO POLO',
    voyage: 'UK-US-005',
    gateCloseDate: '',
    validUntil: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days left
    status: 'LIVE',
    createdAt: new Date().toISOString(),
    createdBy: 'exp_01' // Sent BY Rajesh Kumar
  }
];

export const offerService = {
  getOffers: (): Offer[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    let offers: Offer[] = data ? JSON.parse(data) : INITIAL_DATA;

    // Check for expired status dynamically
    const now = new Date();
    
    offers = offers.map(o => {
      const validDate = new Date(o.validUntil);
      if (o.status === 'LIVE' && validDate < now) {
        return { ...o, status: 'EXPIRED' };
      }
      return o;
    });
    
    // Save back updated statuses
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
    
    return offers;
  },

  saveOffer: (offer: Offer): void => {
    const offers = offerService.getOffers();
    const index = offers.findIndex(o => o.id === offer.id);
    
    if (index >= 0) {
      // Update existing
      offers[index] = offer;
    } else {
      // Create new
      offers.unshift(offer);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
  },

  updateStatus: (id: string, status: 'LIVE' | 'SUSPENDED' | 'ACCEPTED' | 'REJECTED'): void => {
    const offers = offerService.getOffers();
    const offer = offers.find(o => o.id === id);
    if (offer) {
      offer.status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
    }
  },

  generateOfferNumber: (): string => {
    return `OFR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
};
