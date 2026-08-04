export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  imageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  ticketTypes: TicketType[];
  registrations: Registration[];
  organizer?: User;
  createdAt: string;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  available: number;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  ticketTypeId: string;
  quantity: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  ticketType?: TicketType;
  user?: User;
  event?: Event;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
