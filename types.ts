
export enum UserRole {
  SHIPPER_EXPORTER = 'Shipper / Exporter',
  LINER_OPERATOR = 'Ship Liner / Operator',
  FORWARDER_AGENT = 'Forwarder / Agent'
}

export type SubscriptionPlan = 'FREE' | 'OFFICE' | 'CORPORATE';

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
  onboardingAnalysis?: string;
  isMainUser?: boolean;
  branchId?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  
  // Subscription Fields
  plan: SubscriptionPlan;
  subscriptionStatus: 'ACTIVE' | 'EXPIRED';
  registrationDate: string;
  expiryDate: string;
}

export interface Branch {
  id: string;
  branchName: string;
  country: string;
  city: string;
  status: 'ACTIVE' | 'SUSPENDED';
  isMainBranch: boolean;
  createdBy?: string;
}

export interface SubUser {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  designation: string;
  branchId: string;
  status: 'ACTIVE' | 'SUSPENDED';
  photoBase64?: string | null;
  createdBy?: string;
}

export interface ShippingLine {
  id: string;
  lineName: string;
  unitName: string;
  country: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdBy?: string;
}

// --- ADMIN MASTERS ---

export interface PortMaster { id: string; name: string; shortName: string; fullName: string; country: string; }
export interface LoadTypeMaster { id: string; loadType: string; detail: string; }
export interface CurrencyMaster { id: string; currency: string; country: string; }
export interface MatrixMaster { id: string; name: string; }

export interface InternalParty {
  id: string;
  contactPerson: string;
  companyName: string;
  email: string;
  designation: string;
  mobile: string;
  address: string;
  city: string;
  createdBy?: string;
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
  createdBy?: string;
}

export interface TicketHistory {
  date: string;
  action: string;
  by: string;
}

export interface EcrmTicket {
  id: string;
  ticketNumber: string;
  type: 'SENT' | 'RECEIVED';
  partyType: 'NETWORK' | 'INTERNAL' | 'ADMIN';
  partyName: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'REPLIED' | 'RESOLVED';
  date: string;
  history: TicketHistory[];
  createdBy?: string;
  targetAdmin?: boolean;
}

export type ChargeMatrix = string;
export type Currency = string;

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
  createdBy?: string;
}

export type InquiryType = 'GENERAL' | 'SPECIFIC';
export type InquiryGroup = 'GLOBAL' | 'NETWORK' | 'NETWORK_PARTY' | 'INTERNAL_PARTY';
export type LoadType = string;
export type InquiryMatrix = string;

export interface Inquiry {
  id: string;
  inquiryNumber: string;
  inquiryType: InquiryType;
  inquiryGroup: InquiryGroup;
  targetPartyId?: string;
  targetPartyName?: string;
  targetUserName?: string;
  targetPartyDisplay?: string;
  pol: string;
  pod: string;
  loadType: LoadType;
  cargoDetail: string;
  quantity: number;
  matrix: InquiryMatrix;
  shipmentSchedule: string;
  shipmentScheduleEnd: string;
  isHazardous: boolean;
  hazardousDetail?: string;
  validUntil: string;
  status: 'LIVE' | 'EXPIRED' | 'SUSPENDED' | 'REJECTED';
  createdAt: string;
  createdBy: string;
}

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
  freightRate: number;
  shipmentSchedule: string;
  isHazardous: boolean;
  hazardousDetail?: string;
  charges: ChargeItem[];
  vesselName: string;
  voyage: string;
  gateCloseDate: string;
  validUntil: string;
  status: 'LIVE' | 'EXPIRED' | 'SUSPENDED' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  createdBy: string;
}

// --- BOOKING TYPES ---

export type BookingStatus = 
  'PENDING' | 
  'CREATED' | 
  'DO_ISSUED' | 
  'CUSTOM_CLEARANCE' | 
  'CARGO_LOAD' | 
  'GATE_IN' | 
  'GATE_CLOSE' | 
  'VESSEL_SAILED' | 
  'LOAD_DISCHARGED';

export interface Booking {
  id: string;
  bookingRef: string; // Carrier Booking Reference. 'PENDING' until created.
  
  // Linked Offer & Copy of Data (Snapshot)
  offerId: string;
  offerNumber: string;
  pol: string;
  pod: string;
  loadType: string;
  quantity: number;
  commodity: string;
  vesselName: string;
  voyage: string;
  
  // Parties
  providerUser: string; // Creator of the Offer (Service Provider)
  clientUser: string;   // Acceptor of the Offer (Client)
  clientName: string;   // Snapshot Name of Client
  
  // Carrier Info
  shippingLine: string;

  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  
  timeline: {
    status: BookingStatus;
    date: string;
    updatedBy: string;
    remarks?: string;
  }[];
}

export type AuthState = 'LOGIN_EMAIL' | 'LOGIN_PASS' | 'LOGIN_OTP' | 'SIGNUP' | 'DASHBOARD' | 'ADMIN_PANEL' | 'SUBSCRIPTION_EXPIRED';
