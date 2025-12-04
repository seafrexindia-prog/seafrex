import { Booking, BookingStatus, Offer } from '../types';

const STORAGE_KEY = 'ocean_bookings';

const INITIAL_BOOKINGS: Booking[] = [
  // 1. INCOMING BOOKING (Client View)
  {
    id: 'BKG-1001',
    bookingRef: 'PENDING',
    offerId: '3',
    offerNumber: 'OFR-2024-9003',
    pol: 'Singapore (SGSIN)',
    pod: 'Mundra (INMUN)',
    loadType: '20 Feet Box',
    quantity: 20,
    commodity: 'Raw Materials',
    providerUser: 'exp_01', 
    clientUser: 'main',     
    clientName: 'Demo User',
    shippingLine: '',
    vesselName: 'MAERSK ALABAMA',
    voyage: 'MA-221',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      { status: 'PENDING', date: new Date().toISOString(), updatedBy: 'System', remarks: 'Offer Accepted' }
    ]
  },
  // 2. OUTGOING BOOKING (Provider View)
  {
    id: 'BKG-1002',
    bookingRef: 'PENDING',
    offerId: '5',
    offerNumber: 'OFR-2024-9500',
    pol: 'Nhava Sheva (INNSA)',
    pod: 'Dubai (AEDXB)',
    loadType: '40 Feet HC',
    quantity: 5,
    commodity: 'Garments',
    providerUser: 'main', 
    clientUser: 'exp_02', 
    clientName: 'Sarah Jenkins (Oceanic)',
    shippingLine: '',
    vesselName: 'COSCO SHIPPING',
    voyage: 'CS-101',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      { status: 'PENDING', date: new Date().toISOString(), updatedBy: 'System', remarks: 'Offer Accepted' }
    ]
  }
];

export const bookingService = {
  getBookings: (): Booking[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(data);
  },

  getBookingById: (id: string): Booking | undefined => {
    return bookingService.getBookings().find(b => b.id === id);
  },

  createBookingFromOffer: (offer: Offer, clientUser: string, clientName: string): void => {
    const bookings = bookingService.getBookings();
    const newBooking: Booking = {
      id: `BKG-${Date.now().toString().slice(-6)}`,
      bookingRef: 'PENDING', 
      offerId: offer.id,
      offerNumber: offer.offerNumber,
      pol: offer.pol,
      pod: offer.pod,
      loadType: offer.loadType,
      quantity: offer.quantity,
      commodity: offer.cargoDetail,
      vesselName: offer.vesselName,
      voyage: offer.voyage,
      providerUser: offer.createdBy,
      clientUser: clientUser,
      clientName: clientName,
      shippingLine: '', 
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { 
          status: 'PENDING', 
          date: new Date().toISOString(), 
          updatedBy: 'System', 
          remarks: 'Booking generated automatically from Accepted Offer' 
        }
      ]
    };
    bookings.unshift(newBooking);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  },

  updateBooking: (id: string, updates: Partial<Booking>, updatedBy: string): void => {
    const bookings = bookingService.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index >= 0) {
      const oldStatus = bookings[index].status;
      const newStatus = updates.status;
      const updatedBooking = { ...bookings[index], ...updates, updatedAt: new Date().toISOString() };
      
      if (newStatus && newStatus !== oldStatus) {
        let remarks = undefined;
        if (newStatus === 'CREATED') {
            remarks = `Booking Created. Carrier Ref: ${updatedBooking.bookingRef}`;
        }
        updatedBooking.timeline.push({
          status: newStatus,
          date: new Date().toISOString(),
          updatedBy: updatedBy,
          remarks: remarks
        });
      }
      bookings[index] = updatedBooking;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    }
  }
};