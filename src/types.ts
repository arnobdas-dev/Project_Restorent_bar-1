export interface MenuItem {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  category: 'food' | 'drink' | 'dessert';
  tags: string[];
  isSpecial: boolean;
}

export interface ClubEvent {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  price: number;
  djLineup: string[];
  category: 'club' | 'restaurant' | 'special';
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  type: 'restaurant' | 'vip';
  section: string; // 'main_hall' | 'patio' | 'vip_lounge' | 'dj_booth_side'
  status: 'pending' | 'approved' | 'declined';
  specialRequests: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  ip: string;
  action: string;
  details: string;
  status: 'success' | 'failed' | 'info';
}

export interface WebsiteSettings {
  clubName: string;
  tagline: string;
  restaurantAbout: string;
  clubAbout: string;
  address: string;
  phone: string;
  email: string;
  googleMapUrl: string;
  seoDescription: string;
  seoKeywords: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    soundcloud: string;
    twitter: string;
  };
  hours: {
    restaurant: string;
    club: string;
  };
  sectionsVisibility: {
    hero: boolean;
    about: boolean;
    menu: boolean;
    events: boolean;
    reservations: boolean;
    testimonials: boolean;
    contact: boolean;
  };
  worldSettings: {
    soundVolume: number;
    soundMuted: boolean;
    ambientAudioUrl: string;
  };
  analytics: {
    totalVisits: number;
    reservationsCount: number;
    messagesCount: number;
  };
}

export interface AppData {
  menu: MenuItem[];
  events: ClubEvent[];
  reservations: Reservation[];
  testimonials: Testimonial[];
  settings: WebsiteSettings;
  messages: ContactMessage[];
  logs: ActivityLog[];
}
