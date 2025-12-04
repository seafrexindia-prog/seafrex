
import { PortMaster, LoadTypeMaster, CurrencyMaster, MatrixMaster } from '../types';

const STORAGE_KEYS = {
  PORTS: 'ocean_admin_ports',
  LOAD_TYPES: 'ocean_admin_load_types',
  CURRENCY: 'ocean_admin_currency',
  MATRIX: 'ocean_admin_matrix'
};

// --- INITIAL SEED DATA ---

const INITIAL_PORTS: PortMaster[] = [
  { id: '1', name: 'Mundra', shortName: 'INMUN', fullName: 'Adani Port Mundra', country: 'India' },
  { id: '2', name: 'Jebel Ali', shortName: 'AEJEA', fullName: 'Jebel Ali Port', country: 'UAE' },
  { id: '3', name: 'Singapore', shortName: 'SGSIN', fullName: 'Port of Singapore', country: 'Singapore' },
  { id: '4', name: 'Shanghai', shortName: 'CNSHA', fullName: 'Port of Shanghai', country: 'China' },
  { id: '5', name: 'Dubai', shortName: 'AEDXB', fullName: 'Dubai Port', country: 'UAE' },
  { id: '6', name: 'Nhava Sheva', shortName: 'INNSA', fullName: 'Jawaharlal Nehru Port', country: 'India' },
  { id: '7', name: 'Colombo', shortName: 'LKCMB', fullName: 'Port of Colombo', country: 'Sri Lanka' },
  { id: '8', name: 'Salalah', shortName: 'OMSLL', fullName: 'Port of Salalah', country: 'Oman' },
  { id: '9', name: 'Rotterdam', shortName: 'NLRTM', fullName: 'Port of Rotterdam', country: 'Netherlands' },
  { id: '10', name: 'New York', shortName: 'USNYC', fullName: 'Port of New York', country: 'USA' }
];

const INITIAL_LOAD_TYPES: LoadTypeMaster[] = [
  { id: '1', loadType: '20 Feet Box', detail: '' },
  { id: '2', loadType: '40 Feet Box', detail: '' },
  { id: '3', loadType: '20 Feet Tanker', detail: '' },
  { id: '4', loadType: '40 Feet Tanker', detail: '' },
  { id: '5', loadType: '20 Feet Reefer', detail: '' },
  { id: '6', loadType: '40 Feet Reefer', detail: '' },
  { id: '7', loadType: 'Bulk Vessel Dry', detail: '' },
  { id: '8', loadType: 'Break Bulk Dry', detail: '' },
  { id: '9', loadType: 'Bulk Oil', detail: '' }
];

const INITIAL_CURRENCY: CurrencyMaster[] = [
  { id: '1', currency: 'INR', country: 'India' },
  { id: '2', currency: 'USD', country: 'USA' }
];

const INITIAL_MATRIX: MatrixMaster[] = [
  { id: '1', name: 'Container' },
  { id: '2', name: 'Tone' },
  { id: '3', name: 'Box' },
  { id: '4', name: 'Kg' },
  { id: '5', name: 'Cartons' },
  { id: '6', name: 'Bags' }
];

// --- HELPER GENERIC FUNCTIONS ---

function get<T>(key: string, initial: T[]): T[] {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

function save<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

// --- SERVICE EXPORT ---

export const adminMasterService = {
  // PORTS
  getPorts: () => get<PortMaster>(STORAGE_KEYS.PORTS, INITIAL_PORTS),
  savePort: (item: PortMaster) => {
    const list = get<PortMaster>(STORAGE_KEYS.PORTS, INITIAL_PORTS);
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) list[idx] = item; else list.push(item);
    save(STORAGE_KEYS.PORTS, list);
  },
  deletePort: (id: string) => {
    const list = get<PortMaster>(STORAGE_KEYS.PORTS, INITIAL_PORTS).filter(i => i.id !== id);
    save(STORAGE_KEYS.PORTS, list);
  },

  // LOAD TYPES
  getLoadTypes: () => get<LoadTypeMaster>(STORAGE_KEYS.LOAD_TYPES, INITIAL_LOAD_TYPES),
  saveLoadType: (item: LoadTypeMaster) => {
    const list = get<LoadTypeMaster>(STORAGE_KEYS.LOAD_TYPES, INITIAL_LOAD_TYPES);
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) list[idx] = item; else list.push(item);
    save(STORAGE_KEYS.LOAD_TYPES, list);
  },
  deleteLoadType: (id: string) => {
    const list = get<LoadTypeMaster>(STORAGE_KEYS.LOAD_TYPES, INITIAL_LOAD_TYPES).filter(i => i.id !== id);
    save(STORAGE_KEYS.LOAD_TYPES, list);
  },

  // CURRENCY
  getCurrencies: () => get<CurrencyMaster>(STORAGE_KEYS.CURRENCY, INITIAL_CURRENCY),
  saveCurrency: (item: CurrencyMaster) => {
    const list = get<CurrencyMaster>(STORAGE_KEYS.CURRENCY, INITIAL_CURRENCY);
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) list[idx] = item; else list.push(item);
    save(STORAGE_KEYS.CURRENCY, list);
  },
  deleteCurrency: (id: string) => {
    const list = get<CurrencyMaster>(STORAGE_KEYS.CURRENCY, INITIAL_CURRENCY).filter(i => i.id !== id);
    save(STORAGE_KEYS.CURRENCY, list);
  },

  // MATRIX
  getMatrices: () => get<MatrixMaster>(STORAGE_KEYS.MATRIX, INITIAL_MATRIX),
  saveMatrix: (item: MatrixMaster) => {
    const list = get<MatrixMaster>(STORAGE_KEYS.MATRIX, INITIAL_MATRIX);
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) list[idx] = item; else list.push(item);
    save(STORAGE_KEYS.MATRIX, list);
  },
  deleteMatrix: (id: string) => {
    const list = get<MatrixMaster>(STORAGE_KEYS.MATRIX, INITIAL_MATRIX).filter(i => i.id !== id);
    save(STORAGE_KEYS.MATRIX, list);
  }
};
