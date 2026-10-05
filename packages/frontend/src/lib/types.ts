export type Role = 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ATTENDEE' | 'ORGANIZER';
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Event {
  id: string;
  name: string;
  description: string;
  venueName: string;
  venueAddress: string;
  category: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  basePrice: number;
  totalSeats: number;
  availableSeats: number;
  currency: string;
  imageUrl?: string | null;
  organizerId: string;
}

export interface EventInput {
  name: string;
  description: string;
  venueName: string;
  venueAddress: string;
  category: string;
  startDate: string;
  endDate: string;
  totalSeats: number;
  basePrice: number;
}

export interface Seat {
  id: string;
  eventId: string;
  section: string;
  row: string;
  seatNumber: string;
  price: number;
  isAvailable: boolean;
  isHeld: boolean;
}

export interface SeatMapSection {
  name: string;
  seats: Seat[];
}

export interface SeatMap {
  eventId: string;
  sections: SeatMapSection[];
}

export interface SeatHold {
  seatIds: string[];
  heldUntil: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  seatId: string | null;
  qrCode: string;
  status: 'VALID' | 'USED' | 'REFUNDED' | 'TRANSFERRED';
  purchasePrice: number;
  checkedInAt: string | null;
  seat?: Seat | null;
  event?: Event;
}

export interface Payout {
  id: string;
  eventId: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  requestedAt: string;
  processedAt: string | null;
  event?: Event;
}

export interface CheckinStats {
  totalTickets: number;
  checkedIn: number;
  pending: number;
  checkInRate: number;
}
