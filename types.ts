
export enum UserRole {
  SHIPPER_EXPORTER = 'Shipper / Exporter',
  LINER_OPERATOR = 'Ship Liner / Operator',
  FORWARDER_AGENT = 'Forwarder / Agent'
}

export interface UserProfile {
  email: string;
  mobile: string;
  role: UserRole;
  fullName: string;
  designation: string;
  companyName: string;
  address: string;
  photoBase64: string | null;
  logoBase64: string | null;
  onboardingAnalysis?: string; // AI generated text
  isMainUser?: boolean; // True if this is the account owner
  branchId?: string; // ID of the branch this user belongs to
  status?: 'ACTIVE' | 'SUSPENDED'; // Account status
}

export interface Branch {
  id: string;
  branchName: string;
  country: string;
  city: string;
  status: 'ACTIVE' | 'SUSPENDED';
  isMainBranch: boolean;
  createdBy?: string; // User email who created this record
}

export interface SubUser {
  id: string; // usually email
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  designation: string;
  branchId: string;
  status: 'ACTIVE' | 'SUSPENDED';
  photoBase64?: string | null;
  createdBy?: string; // User email who created this record
}

export interface InternalParty {
  id: string;
  contactPerson: string;
  companyName: string;
  email: string;
  designation: string;
  mobile: string;
  address: string;
  city: string;
  createdBy?: string; // User email who created this record
}

export interface NetworkParty {
  id: string;
  name: string;
  company: string;
  designation: string;
  mobile: string;
  email: string;
  city: string;
  photoUrl: string | null;
  createdBy?: string; // User email who created this record
}

export interface TicketHistory {
  date: string;
  action: string;
  by: string;
}

export interface EcrmTicket {
  id: string;
  ticketNumber: string; // Auto-generated ID (e.g. TKT-1001)
  type: 'SENT' | 'RECEIVED';
  partyType: 'NETWORK' | 'INTERNAL';
  partyName: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'REPLIED' | 'RESOLVED';
  date: string;
  history: TicketHistory[];
  createdBy?: string; // User email who created this record
}

// --- CHARGES MASTER TYPES ---

export type ChargeMatrix = 'Per Container' | 'Per Tone' | 'Per KG' | 'Per BOX';
export type Currency = 'INR' | 'USD';

export interface ChargeItem {
  id: string;
  name: string;
  amount: number;
  matrix: ChargeMatrix;
  currency: Currency;
}

export interface ChargeHead {
  id: string;
  headName: string;
  items: ChargeItem[];
  status: 'ACTIVE' | 'SUSPENDED';
  createdBy?: string; // User email who created this record
}

// --- INQUIRY TYPES ---

export type InquiryType = 'GENERAL' | 'SPECIFIC';
export type InquiryGroup = 'GLOBAL' | 'NETWORK' | 'NETWORK_PARTY' | 'INTERNAL_PARTY';
export type LoadType = '20 Feet Box' | '40 Feet Box' | '40 Feet HC' | 'LCL' | 'Bulk' | '20 ft OC' | '20 ft Tanker' | 'Bulk Vessel';
export type InquiryMatrix = 'Container' | 'Box' | 'Tone' | 'Kgs';

export interface Inquiry {
  id: string;
  inquiryNumber: string;
  inquiryType: InquiryType;
  inquiryGroup: InquiryGroup;
  targetPartyId?: string; // ID of Network or Internal Party
  targetPartyName?: string; // Snapshot of Company Name
  targetUserName?: string; // Snapshot of User Name (Designation)
  targetPartyDisplay?: string; // Legacy/Backup Snapshot
  pol: string; // Port of Loading
  pod: string; // Port of Discharge
  loadType: LoadType;
  cargoDetail: string;
  quantity: number;
  matrix: InquiryMatrix;
  shipmentSchedule: string; // ISO Date String (Start)
  shipmentScheduleEnd: string; // ISO Date String (End)
  isHazardous: boolean;
  hazardousDetail?: string;
  validUntil: string; // ISO String Date only
  status: 'LIVE' | 'EXPIRED' | 'SUSPENDED' | 'REJECTED';
  createdAt: string;
  createdBy: string;
}

// --- OFFER TYPES ---

export type OfferType = 'GENERAL' | 'SPECIFIC';
export type OfferGroup = 'GLOBAL' | 'NETWORK' | 'NETWORK_PARTY' | 'INTERNAL_PARTY';

export interface Offer {
  id: string;
  offerNumber: string;
  offerType: OfferType;
  offerGroup: OfferGroup;
  
  targetPartyId?: string;
  targetPartyName?: string;
  targetUserName?: string;
  targetPartyDisplay?: string;

  pol: string;
  pod: string;
  transitPort: string;

  loadType: LoadType;
  cargoDetail: string;
  quantity: number;
  matrix: InquiryMatrix;
  freightRate: number; // Base Freight Rate in USD
  shipmentSchedule: string; // Weekly schedule string
  
  isHazardous: boolean;
  hazardousDetail?: string;

  charges: ChargeItem[];
  
  vesselName: string;
  voyage: string;
  gateCloseDate: string; // ISO Date only
  validUntil: string; // ISO Date Time

  status: 'LIVE' | 'EXPIRED' | 'SUSPENDED' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  createdBy: string;
}

export type AuthState = 'LOGIN_EMAIL' | 'LOGIN_OTP' | 'SIGNUP' | 'DASHBOARD';
