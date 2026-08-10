export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  venueName?: string;
  venueAddress?: string;
  category?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  basePrice?: number;
  organizerId?: string;
}

export interface TicketType {
  id: string;
  name: string;
  price?: number;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  status: string;
  createdAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
