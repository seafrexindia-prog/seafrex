
import { InternalParty } from '../types';

const STORAGE_KEY = 'ocean_internal_parties';

const INITIAL_DATA: InternalParty[] = [
  { id: '1', contactPerson: 'Amit Patel', email: 'amit.p@apexlogistics.com', companyName: 'Apex Logistics', designation: 'Manager', mobile: '+91 9876543210', address: '101, Cargo Complex, Port Road', city: 'Mumbai' },
  { id: '2', contactPerson: 'John Dsouza', email: 'john@oceanblue.com', companyName: 'Ocean Blue Inc', designation: 'Director', mobile: '+91 9822334455', address: '45, Marine Drive, South Block', city: 'Chennai' },
  { id: '3', contactPerson: 'Sneha Gupta', email: 'sneha.ops@fasttrack.in', companyName: 'FastTrack Forwarders', designation: 'Ops Head', mobile: '+91 9988776655', address: 'B-22, Industrial Area, Phase 2', city: 'Delhi' },
];

export const partyService = {
  getParties: (): InternalParty[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Initialize with mock data if empty
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(data);
  },

  saveParty: (party: InternalParty): void => {
    const parties = partyService.getParties();
    const existingIndex = parties.findIndex(p => p.id === party.id);
    
    if (existingIndex >= 0) {
      parties[existingIndex] = party;
    } else {
      parties.unshift(party);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parties));
  },

  deleteParty: (id: string): void => {
    const parties = partyService.getParties().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parties));
  }
};