export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'organizer' | 'attendee';
  avatar?: string;
  bio?: string;
  organization?: string;
  website?: string;
  city?: string;
  phone?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  coverImage?: string;
  eventCount: number;
  isFeatured: boolean;
}

export interface Venue {
  _id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  capacity: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  photos: string[];
}

export interface Session {
  _id?: string;
  title: string;
  description: string;
  track?: string;
  startTime: string;
  endTime: string;
  speakerNames?: string[];
  location?: string;
}

export interface Speaker {
  _id?: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  photo: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface Sponsor {
  _id?: string;
  name: string;
  tier: 'Platinum' | 'Gold' | 'Silver' | 'Community';
  logo: string;
  website?: string;
}

export interface TicketType {
  _id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  totalQuantity: number;
  remainingQuantity: number;
  perUserLimit: number;
  salesStart: string;
  salesEnd: string;
  status: 'active' | 'sold_out' | 'hidden';
}

export interface EventItem {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: Category | string;
  organizerId: User | string;
  venueId?: Venue | null;
  format: 'in-person' | 'online' | 'hybrid';
  onlineUrl?: string;
  coverImage: string;
  galleryImages: string[];
  startDate: string;
  endDate: string;
  timezone: string;
  capacity: number;
  remainingCapacity: number;
  visibility: 'public' | 'private';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  tags: string[];
  featured: boolean;
  cancellationReason?: string;
  sessions: Session[];
  speakers: Speaker[];
  sponsors: Sponsor[];
  averageRating: number;
  reviewsCount: number;
  minPrice?: number;
  maxPrice?: number;
  isFree?: boolean;
  ticketTypes?: TicketType[];
  createdAt: string;
}

export interface Booking {
  _id: string;
  bookingReference: string;
  eventId: EventItem;
  userId: User;
  ticketTypeId: TicketType;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'refunded';
  paymentStatus: 'paid' | 'free' | 'refunded';
  paymentMethod: 'demo_card' | 'demo_paypal' | 'free';
  paymentReference: string;
  attendeeDetails: Array<{ name: string; email: string; phone?: string }>;
  qrCodeData: string;
  checkInStatus: 'not_checked_in' | 'checked_in';
  checkedInAt?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  eventId: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  comment: string;
  organizerReply?: {
    comment: string;
    repliedAt: string;
    repliedBy: {
      name: string;
      avatar?: string;
      organization?: string;
    };
  };
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'booking_confirmed' | 'event_updated' | 'event_cancelled' | 'reminder' | 'announcement' | 'system';
  link?: string;
  read: boolean;
  createdAt: string;
}
