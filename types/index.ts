export type Role = 'CLIENT' | 'PROVIDER' | 'ADMIN';

export type ServiceLocationType =
  | 'CASA_PARTICULAR'
  | 'COMUNIDADE'
  | 'LOCAL_COMERCIAL'
  | 'APARTAMENTO_TURISTICO'
  | 'FIM_DE_OBRA';

export const SERVICE_LOCATION_LABELS: Record<ServiceLocationType, string> = {
  CASA_PARTICULAR: 'Casa particular',
  COMUNIDADE: 'Comunidade',
  LOCAL_COMERCIAL: 'Local comercial',
  APARTAMENTO_TURISTICO: 'Apartamento turístico',
  FIM_DE_OBRA: 'Fim de obra',
};

export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface Address extends GeoLocation {
  id: string;
  label: string; // e.g., "Casa", "Trabalho"
  complement?: string;
  locationType?: ServiceLocationType;
}

export interface Review {
  id: string;
  rating: number; // 1-5
  comment: string;
  authorId: string;
  authorName: string;
  targetId: string;
  jobId: string;
  createdAt: string;
  type: 'CLIENT_TO_PROVIDER' | 'PROVIDER_TO_CLIENT';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: string; // Lucide icon name
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
  location?: GeoLocation; // Primary location
  password?: string; // Mock auth only
}

export type SubscriptionPlan = 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY';

export interface ClientProfile extends User {
  role: 'CLIENT';
  savedAddresses: Address[];
  reviewsReceived: Review[];
  serviceCount: number;
  averageRating: number;
  subscription?: SubscriptionPlan;
}

export interface ProviderProfile extends User {
  role: 'PROVIDER';
  bio: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  verifiedStatus: boolean;
  skills: string[];
  badges: string[];
  scheduleConstraints: {
    dayOfWeek: number; // 0-6
    startHour: number;
    endHour: number;
  }[];
  serviceRadiusKm: number;
  offeredServices: string[]; // Service IDs
  profileScore: number; // 0-100
  reviewsReceived: Review[];
  serviceCount: number;
  acceptsSubscriptions: boolean;
  acceptedLocationTypes: ServiceLocationType[];
}

export interface AdminProfile extends User {
  role: 'ADMIN';
}

export type UserProfile = ClientProfile | ProviderProfile | AdminProfile;

export interface Job {
  id: string;
  clientId: string;
  providerId?: string;
  status: 'OPEN' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID' | 'CANCELLED' | 'REJECTED';
  serviceType: string; // Now references Service ID or enum
  homeSize: number;
  frequency: 'ONCE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  date: string;
  timeSlot: string;
  durationHours: number;
  priceTotal: number;
  agencyFee: number;
  providerPayout: number;
  location: GeoLocation;
  locationType?: ServiceLocationType;
  createdAt: string;
  rejectionReason?: string;
  clientReview?: Review;
  providerReview?: Review;
  chatId?: string;
}

// Chat System Types
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderRole: Role;
  content: string;
  createdAt: string;
  readAt?: string;
}

export interface Chat {
  id: string;
  jobId: string;
  clientId: string;
  providerId: string;
  status: 'ACTIVE' | 'CLOSED';
  messages: ChatMessage[];
  createdAt: string;
  closedAt?: string;
}

// Wallet/Payment Types
export interface WalletTransaction {
  id: string;
  userId: string;
  jobId?: string;
  type: 'CREDIT' | 'DEBIT' | 'TRANSFER' | 'PAYOUT';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  description: string;
  createdAt: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  pendingBalance: number;
  transactions: WalletTransaction[];
}
