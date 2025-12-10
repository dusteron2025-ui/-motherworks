import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase Configuration - MUST be set in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy initialization to prevent build errors
let _supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            'Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
        );
    }
    if (!_supabase) {
        _supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
            },
        });
    }
    return _supabase;
};

// For backward compatibility - will throw at runtime if env vars missing
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    })
    : ({} as SupabaseClient);

// Database Types (generated from schema)
export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    phone: string | null;
                    avatar_url: string | null;
                    role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
                    verified_status: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['users']['Insert']>;
            };
            provider_profiles: {
                Row: {
                    id: string;
                    user_id: string;
                    bio: string | null;
                    rating: number;
                    review_count: number;
                    service_count: number;
                    profile_score: number;
                    service_radius_km: number;
                    offered_services: string[];
                    accepted_location_types: string[];
                    accepts_subscriptions: boolean;
                    location_lat: number | null;
                    location_lng: number | null;
                    location_address: string | null;
                };
                Insert: Omit<Database['public']['Tables']['provider_profiles']['Row'], 'id'>;
                Update: Partial<Database['public']['Tables']['provider_profiles']['Insert']>;
            };
            jobs: {
                Row: {
                    id: string;
                    client_id: string;
                    provider_id: string | null;
                    service_id: string;
                    service_type: string;
                    status: 'OPEN' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | 'PAID';
                    date: string;
                    time_slot: string;
                    duration_hours: number;
                    location_lat: number;
                    location_lng: number;
                    location_address: string;
                    location_type: string;
                    price_total: number;
                    provider_payout: number;
                    agency_fee: number;
                    frequency: 'ONCE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['jobs']['Insert']>;
            };
            wallets: {
                Row: {
                    id: string;
                    user_id: string;
                    balance: number;
                    pending_balance: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['wallets']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['wallets']['Insert']>;
            };
            wallet_transactions: {
                Row: {
                    id: string;
                    wallet_id: string;
                    type: 'CREDIT' | 'DEBIT' | 'PAYOUT' | 'REFUND';
                    amount: number;
                    status: 'PENDING' | 'COMPLETED' | 'FAILED';
                    description: string;
                    job_id: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['wallet_transactions']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['wallet_transactions']['Insert']>;
            };
            reviews: {
                Row: {
                    id: string;
                    job_id: string;
                    author_id: string;
                    target_id: string;
                    rating: number;
                    comment: string | null;
                    type: 'CLIENT_TO_PROVIDER' | 'PROVIDER_TO_CLIENT';
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    type: string;
                    title: string;
                    message: string;
                    data: Record<string, unknown> | null;
                    read: boolean;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
            };
        };
    };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
