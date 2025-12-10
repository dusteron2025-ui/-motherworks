"use client";

import { supabase } from '@/lib/supabase';

// ============================================
// JOBS SERVICE
// ============================================

export interface JobData {
    clientId: string;
    providerId?: string;
    serviceId: string;
    serviceType: string;
    date: string;
    timeSlot: string;
    durationHours: number;
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    locationType: string;
    priceTotal: number;
    providerPayout: number;
    agencyFee: number;
    frequency: 'ONCE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
}

export async function createJob(data: JobData) {
    const { data: job, error } = await supabase
        .from('jobs')
        .insert({
            client_id: data.clientId,
            provider_id: data.providerId || null,
            service_id: data.serviceId,
            service_type: data.serviceType,
            date: data.date,
            time_slot: data.timeSlot,
            duration_hours: data.durationHours,
            location_lat: data.location.lat,
            location_lng: data.location.lng,
            location_address: data.location.address,
            location_type: data.locationType,
            price_total: data.priceTotal,
            provider_payout: data.providerPayout,
            agency_fee: data.agencyFee,
            frequency: data.frequency,
            status: 'OPEN',
        })
        .select()
        .single();

    return { job, error };
}

export async function getJobById(jobId: string) {
    const { data, error } = await supabase
        .from('jobs')
        .select(`
            *,
            client:users!jobs_client_id_fkey(id, name, email, avatar_url, phone),
            provider:users!jobs_provider_id_fkey(id, name, email, avatar_url, phone)
        `)
        .eq('id', jobId)
        .single();

    return { job: data, error };
}

export async function getJobsForUser(userId: string, role: 'CLIENT' | 'PROVIDER') {
    const query = supabase
        .from('jobs')
        .select(`
            *,
            client:users!jobs_client_id_fkey(id, name, avatar_url),
            provider:users!jobs_provider_id_fkey(id, name, avatar_url)
        `)
        .order('date', { ascending: false });

    if (role === 'CLIENT') {
        query.eq('client_id', userId);
    } else {
        query.eq('provider_id', userId);
    }

    const { data, error } = await query;
    return { jobs: data || [], error };
}

export async function updateJobStatus(jobId: string, status: string, providerId?: string) {
    const updates: Record<string, unknown> = { status };
    if (providerId) updates.provider_id = providerId;

    const { error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId);

    return { error };
}

export async function getOpenJobsInArea(lat: number, lng: number, radiusKm: number = 10) {
    // Simple bounding box query (for production, use PostGIS)
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const { data, error } = await supabase
        .from('jobs')
        .select(`
            *,
            client:users!jobs_client_id_fkey(id, name, avatar_url)
        `)
        .eq('status', 'OPEN')
        .gte('location_lat', lat - latDelta)
        .lte('location_lat', lat + latDelta)
        .gte('location_lng', lng - lngDelta)
        .lte('location_lng', lng + lngDelta)
        .order('created_at', { ascending: false });

    return { jobs: data || [], error };
}

// ============================================
// WALLETS SERVICE
// ============================================

export async function getWalletByUserId(userId: string) {
    const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

    return { wallet: data, error };
}

export async function getWalletTransactions(walletId: string, limit: number = 20) {
    const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', walletId)
        .order('created_at', { ascending: false })
        .limit(limit);

    return { transactions: data || [], error };
}

export async function addWalletTransaction(
    walletId: string,
    type: 'CREDIT' | 'DEBIT' | 'PAYOUT' | 'REFUND',
    amount: number,
    description: string,
    jobId?: string
) {
    const { data, error } = await supabase
        .from('wallet_transactions')
        .insert({
            wallet_id: walletId,
            type,
            amount,
            description,
            job_id: jobId || null,
            status: 'PENDING',
        })
        .select()
        .single();

    return { transaction: data, error };
}

export async function updateWalletBalance(
    userId: string,
    balanceChange: number,
    pendingChange: number
) {
    const result = await getWalletByUserId(userId);
    const wallet = result.wallet;
    if (!wallet) return { error: new Error('Wallet not found') };

    const { error } = await supabase
        .from('wallets')
        .update({
            balance: wallet.balance + balanceChange,
            pending_balance: wallet.pending_balance + pendingChange,
        })
        .eq('id', wallet.id);

    return { error };
}

// ============================================
// REVIEWS SERVICE
// ============================================

export async function createReview(data: {
    jobId: string;
    authorId: string;
    targetId: string;
    rating: number;
    comment?: string;
    type: 'CLIENT_TO_PROVIDER' | 'PROVIDER_TO_CLIENT';
}) {
    const { data: review, error } = await supabase
        .from('reviews')
        .insert({
            job_id: data.jobId,
            author_id: data.authorId,
            target_id: data.targetId,
            rating: data.rating,
            comment: data.comment || null,
            type: data.type,
        })
        .select()
        .single();

    return { review, error };
}

export async function getReviewsForUser(userId: string) {
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            *,
            author:users!reviews_author_id_fkey(id, name, avatar_url)
        `)
        .eq('target_id', userId)
        .order('created_at', { ascending: false });

    return { reviews: data || [], error };
}

// ============================================
// NOTIFICATIONS SERVICE
// ============================================

export async function getNotifications(userId: string, unreadOnly: boolean = false) {
    let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (unreadOnly) {
        query = query.eq('read', false);
    }

    const { data, error } = await query;
    return { notifications: data || [], error };
}

export async function createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    data?: Record<string, unknown>
) {
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            type,
            title,
            message,
            data: data || null,
            read: false,
        });

    return { error };
}

export async function markNotificationAsRead(notificationId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

    return { error };
}

export async function markAllNotificationsAsRead(userId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

    return { error };
}

// ============================================
// PROVIDERS SERVICE
// ============================================

export async function getProviderProfile(userId: string) {
    const { data, error } = await supabase
        .from('provider_profiles')
        .select(`
            *,
            user:users!provider_profiles_user_id_fkey(id, name, email, avatar_url, phone, verified_status)
        `)
        .eq('user_id', userId)
        .single();

    return { profile: data, error };
}

export async function updateProviderProfile(userId: string, updates: {
    bio?: string;
    serviceRadiusKm?: number;
    offeredServices?: string[];
    acceptedLocationTypes?: string[];
    acceptsSubscriptions?: boolean;
    location?: { lat: number; lng: number; address: string };
}) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.serviceRadiusKm !== undefined) dbUpdates.service_radius_km = updates.serviceRadiusKm;
    if (updates.offeredServices !== undefined) dbUpdates.offered_services = updates.offeredServices;
    if (updates.acceptedLocationTypes !== undefined) dbUpdates.accepted_location_types = updates.acceptedLocationTypes;
    if (updates.acceptsSubscriptions !== undefined) dbUpdates.accepts_subscriptions = updates.acceptsSubscriptions;
    if (updates.location) {
        dbUpdates.location_lat = updates.location.lat;
        dbUpdates.location_lng = updates.location.lng;
        dbUpdates.location_address = updates.location.address;
    }

    const { error } = await supabase
        .from('provider_profiles')
        .update(dbUpdates)
        .eq('user_id', userId);

    return { error };
}

export async function searchProviders(filters: {
    serviceId?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
}) {
    let query = supabase
        .from('provider_profiles')
        .select(`
            *,
            user:users!provider_profiles_user_id_fkey(id, name, email, avatar_url, verified_status)
        `)
        .order('rating', { ascending: false });

    if (filters.serviceId) {
        query = query.contains('offered_services', [filters.serviceId]);
    }

    // Location filtering (simple bounding box)
    if (filters.lat && filters.lng && filters.radiusKm) {
        const latDelta = filters.radiusKm / 111;
        const lngDelta = filters.radiusKm / (111 * Math.cos(filters.lat * Math.PI / 180));

        query = query
            .gte('location_lat', filters.lat - latDelta)
            .lte('location_lat', filters.lat + latDelta)
            .gte('location_lng', filters.lng - lngDelta)
            .lte('location_lng', filters.lng + lngDelta);
    }

    const { data, error } = await query;
    return { providers: data || [], error };
}

// ============================================
// SERVICES CATALOG
// ============================================

export async function getServices() {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('name');

    return { services: data || [], error };
}
