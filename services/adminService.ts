"use client";

import { UserProfile, ProviderProfile, ClientProfile, Job, Review } from '@/types';

// User status types
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'BANNED';

// Admin action types
export type AdminAction =
    | 'APPROVE_PROVIDER'
    | 'REJECT_PROVIDER'
    | 'SUSPEND_USER'
    | 'UNSUSPEND_USER'
    | 'BAN_USER'
    | 'DELETE_REVIEW'
    | 'REFUND_JOB';

export interface AdminLog {
    id: string;
    adminId: string;
    action: AdminAction;
    targetId: string;
    targetType: 'USER' | 'JOB' | 'REVIEW';
    reason?: string;
    timestamp: string;
}

export interface PlatformMetrics {
    totalUsers: number;
    activeProviders: number;
    activeClients: number;
    pendingVerifications: number;
    totalJobs: number;
    completedJobs: number;
    cancelledJobs: number;
    totalRevenue: number;
    platformFees: number;
    avgProviderRating: number;
    avgJobValue: number;
}

// In-memory stores
const adminLogs: AdminLog[] = [];
const userStatuses: Map<string, UserStatus> = new Map();

/**
 * Get user status
 */
export function getUserStatus(userId: string): UserStatus {
    return userStatuses.get(userId) || 'ACTIVE';
}

/**
 * Set user status
 */
export function setUserStatus(userId: string, status: UserStatus): void {
    userStatuses.set(userId, status);
}

/**
 * Log admin action
 */
export function logAdminAction(
    adminId: string,
    action: AdminAction,
    targetId: string,
    targetType: 'USER' | 'JOB' | 'REVIEW',
    reason?: string
): AdminLog {
    const log: AdminLog = {
        id: `log-${Date.now()}`,
        adminId,
        action,
        targetId,
        targetType,
        reason,
        timestamp: new Date().toISOString(),
    };
    adminLogs.push(log);
    return log;
}

/**
 * Get admin action logs
 */
export function getAdminLogs(limit: number = 50): AdminLog[] {
    return adminLogs
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
}

/**
 * Approve provider verification
 */
export function approveProvider(adminId: string, providerId: string): boolean {
    setUserStatus(providerId, 'ACTIVE');
    logAdminAction(adminId, 'APPROVE_PROVIDER', providerId, 'USER');
    return true;
}

/**
 * Reject provider verification
 */
export function rejectProvider(adminId: string, providerId: string, reason: string): boolean {
    setUserStatus(providerId, 'PENDING_VERIFICATION');
    logAdminAction(adminId, 'REJECT_PROVIDER', providerId, 'USER', reason);
    return true;
}

/**
 * Suspend a user temporarily
 */
export function suspendUser(adminId: string, userId: string, reason: string): boolean {
    setUserStatus(userId, 'SUSPENDED');
    logAdminAction(adminId, 'SUSPEND_USER', userId, 'USER', reason);
    return true;
}

/**
 * Unsuspend a user
 */
export function unsuspendUser(adminId: string, userId: string): boolean {
    setUserStatus(userId, 'ACTIVE');
    logAdminAction(adminId, 'UNSUSPEND_USER', userId, 'USER');
    return true;
}

/**
 * Ban a user permanently
 */
export function banUser(adminId: string, userId: string, reason: string): boolean {
    setUserStatus(userId, 'BANNED');
    logAdminAction(adminId, 'BAN_USER', userId, 'USER', reason);
    return true;
}

/**
 * Calculate platform metrics
 */
export function calculatePlatformMetrics(users: UserProfile[], jobs: Job[]): PlatformMetrics {
    const providers = users.filter(u => u.role === 'PROVIDER') as ProviderProfile[];
    const clients = users.filter(u => u.role === 'CLIENT') as ClientProfile[];
    const activeProviders = providers.filter(p => p.verifiedStatus);
    const pendingVerifications = providers.filter(p => !p.verifiedStatus);

    const completedJobs = jobs.filter(j => j.status === 'COMPLETED' || j.status === 'PAID');
    const cancelledJobs = jobs.filter(j => j.status === 'CANCELLED');

    const totalRevenue = jobs.reduce((acc, j) => acc + j.priceTotal, 0);
    const platformFees = jobs.reduce((acc, j) => acc + j.agencyFee, 0);

    const avgProviderRating = activeProviders.length > 0
        ? activeProviders.reduce((acc, p) => acc + p.rating, 0) / activeProviders.length
        : 0;

    const avgJobValue = completedJobs.length > 0
        ? completedJobs.reduce((acc, j) => acc + j.priceTotal, 0) / completedJobs.length
        : 0;

    return {
        totalUsers: users.length,
        activeProviders: activeProviders.length,
        activeClients: clients.length,
        pendingVerifications: pendingVerifications.length,
        totalJobs: jobs.length,
        completedJobs: completedJobs.length,
        cancelledJobs: cancelledJobs.length,
        totalRevenue,
        platformFees,
        avgProviderRating: Math.round(avgProviderRating * 10) / 10,
        avgJobValue: Math.round(avgJobValue * 100) / 100,
    };
}

/**
 * Generate financial report data
 */
export function generateFinancialReport(jobs: Job[], period: 'week' | 'month' | 'year' = 'month'): {
    periodLabel: string;
    totalGMV: number;
    platformRevenue: number;
    providerPayouts: number;
    refunds: number;
    transactions: number;
}[] {
    const now = new Date();
    const reports: Map<string, {
        totalGMV: number;
        platformRevenue: number;
        providerPayouts: number;
        refunds: number;
        transactions: number;
    }> = new Map();

    jobs.forEach(job => {
        const jobDate = new Date(job.date);
        let periodLabel: string;

        if (period === 'week') {
            const weekNum = Math.ceil(jobDate.getDate() / 7);
            periodLabel = `Semana ${weekNum}`;
        } else if (period === 'month') {
            periodLabel = jobDate.toLocaleDateString('pt-PT', { month: 'short' });
        } else {
            periodLabel = jobDate.getFullYear().toString();
        }

        const existing = reports.get(periodLabel) || {
            totalGMV: 0,
            platformRevenue: 0,
            providerPayouts: 0,
            refunds: 0,
            transactions: 0,
        };

        existing.totalGMV += job.priceTotal;
        existing.platformRevenue += job.agencyFee;
        existing.providerPayouts += job.providerPayout;
        if (job.status === 'CANCELLED') existing.refunds += job.priceTotal;
        existing.transactions++;

        reports.set(periodLabel, existing);
    });

    return Array.from(reports.entries()).map(([periodLabel, data]) => ({
        periodLabel,
        ...data,
    }));
}

/**
 * Get reviews pending moderation (low ratings or flagged)
 */
export function getReviewsForModeration(users: UserProfile[]): Review[] {
    const allReviews: Review[] = [];

    users.forEach(user => {
        if ('reviewsReceived' in user && user.reviewsReceived) {
            user.reviewsReceived.forEach(review => {
                // Flag reviews with rating <= 2 or potentially problematic content
                if (review.rating <= 2) {
                    allReviews.push(review);
                }
            });
        }
    });

    return allReviews.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}
