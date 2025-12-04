
import { EcrmTicket } from '../types';

const STORAGE_KEY = 'ocean_ecrm_tickets';

const INITIAL_DATA: EcrmTicket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-001',
    type: 'SENT',
    partyType: 'NETWORK',
    partyName: 'Rahul Verma (Global Logistics)',
    subject: 'Delay in Shipment Document',
    message: 'We have not received the BL draft yet.',
    status: 'PENDING',
    date: '2024-05-15',
    history: [
      { date: '2024-05-15 10:00 AM', action: 'Ticket Created', by: 'You' }
    ],
    createdBy: 'main'
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    type: 'RECEIVED',
    partyType: 'INTERNAL',
    partyName: 'Amit Patel (Apex Logistics)',
    subject: 'Invoice Discrepancy',
    message: 'The amount in invoice #992 does not match the PO.',
    status: 'PENDING',
    date: '2024-05-14',
    history: [
      { date: '2024-05-14 09:30 AM', action: 'Ticket Received', by: 'System' },
      { date: '2024-05-14 11:00 AM', action: 'Response Added', by: 'You' }
    ],
    createdBy: 'main'
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-003',
    type: 'RECEIVED',
    partyType: 'NETWORK',
    partyName: 'Sarah Jenkins',
    subject: 'Container Damage Report',
    message: 'Container arrived with dent on left side.',
    status: 'RESOLVED',
    date: '2024-05-10',
    history: [
      { date: '2024-05-10 02:00 PM', action: 'Ticket Received', by: 'System' },
      { date: '2024-05-11 10:00 AM', action: 'Marked as Resolved', by: 'You' }
    ],
    createdBy: 'sub1@ocean.com'
  }
];

export const ecrmService = {
  getTickets: (): EcrmTicket[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    return JSON.parse(data);
  },

  getTicketById: (id: string): EcrmTicket | undefined => {
    return ecrmService.getTickets().find(t => t.id === id);
  },

  createTicket: (ticket: EcrmTicket): void => {
    const tickets = ecrmService.getTickets();
    tickets.unshift(ticket);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  },

  updateStatus: (id: string, newStatus: 'PENDING' | 'REPLIED' | 'RESOLVED'): void => {
    const tickets = ecrmService.getTickets();
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = newStatus;
      ticket.history.push({
        date: new Date().toLocaleString(),
        action: `Status changed to ${newStatus}`,
        by: 'System'
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    }
  },

  addResponse: (id: string, responseMessage: string, by: string): void => {
    const tickets = ecrmService.getTickets();
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
      ticket.history.push({
        date: new Date().toLocaleString(),
        action: `Response: ${responseMessage}`,
        by: by
      });
      
      // NOTE: Status remains PENDING even after response, unless manually resolved.
      // If it was RESOLVED and a response is added, it typically implies re-opening, 
      // but we handle that explicitly in UI via updateStatus.
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    }
  },

  generateId: (): string => {
    return `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
};
