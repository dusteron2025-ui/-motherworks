"use client";

import { Job, ProviderProfile, ClientProfile } from '@/types';

// Notification Types
export type NotificationType =
    | 'BOOKING_CREATED'
    | 'BOOKING_ACCEPTED'
    | 'BOOKING_REJECTED'
    | 'BOOKING_CANCELLED'
    | 'BOOKING_REMINDER'
    | 'SERVICE_STARTED'
    | 'SERVICE_COMPLETED'
    | 'PAYMENT_RECEIVED'
    | 'REVIEW_RECEIVED'
    | 'NEW_MESSAGE';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    read: boolean;
    createdAt: string;
}

// In-memory notification store
const notifications: Map<string, Notification[]> = new Map();

/**
 * Get all notifications for a user
 */
export function getUserNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    const userNotifs = notifications.get(userId) || [];
    if (unreadOnly) {
        return userNotifs.filter(n => !n.read);
    }
    return userNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Add a notification for a user
 */
export function addNotification(userId: string, notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification {
    const userNotifs = notifications.get(userId) || [];

    const newNotif: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        read: false,
        createdAt: new Date().toISOString(),
    };

    userNotifs.push(newNotif);
    notifications.set(userId, userNotifs);

    return newNotif;
}

/**
 * Mark notification as read
 */
export function markAsRead(userId: string, notificationId: string): boolean {
    const userNotifs = notifications.get(userId);
    if (!userNotifs) return false;

    const notifIndex = userNotifs.findIndex(n => n.id === notificationId);
    if (notifIndex === -1) return false;

    userNotifs[notifIndex].read = true;
    notifications.set(userId, userNotifs);
    return true;
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(userId: string): number {
    const userNotifs = notifications.get(userId);
    if (!userNotifs) return 0;

    let count = 0;
    userNotifs.forEach(n => {
        if (!n.read) {
            n.read = true;
            count++;
        }
    });
    notifications.set(userId, userNotifs);
    return count;
}

/**
 * Get unread notification count
 */
export function getUnreadCount(userId: string): number {
    const userNotifs = notifications.get(userId) || [];
    return userNotifs.filter(n => !n.read).length;
}

// ===== BOOKING NOTIFICATION HELPERS =====

/**
 * Notify provider about new booking request
 */
export function notifyNewBooking(job: Job, client: ClientProfile, provider: ProviderProfile): void {
    addNotification(provider.id, {
        userId: provider.id,
        type: 'BOOKING_CREATED',
        title: 'Nova solicitação de serviço!',
        message: `${client.name} solicitou um serviço para ${job.date}`,
        data: { jobId: job.id, clientId: client.id },
    });
}

/**
 * Notify client that booking was accepted
 */
export function notifyBookingAccepted(job: Job, provider: ProviderProfile): void {
    addNotification(job.clientId, {
        userId: job.clientId,
        type: 'BOOKING_ACCEPTED',
        title: 'Solicitação aceita!',
        message: `${provider.name} aceitou seu pedido para ${job.date}`,
        data: { jobId: job.id, providerId: provider.id },
    });
}

/**
 * Notify client that booking was rejected
 */
export function notifyBookingRejected(job: Job, provider: ProviderProfile, reason?: string): void {
    addNotification(job.clientId, {
        userId: job.clientId,
        type: 'BOOKING_REJECTED',
        title: 'Solicitação não aceita',
        message: reason || `${provider.name} não pôde aceitar seu pedido`,
        data: { jobId: job.id, providerId: provider.id },
    });
}

/**
 * Notify both parties about cancellation
 */
export function notifyBookingCancelled(job: Job, cancelledBy: 'CLIENT' | 'PROVIDER', reason?: string): void {
    const isClientCancelling = cancelledBy === 'CLIENT';

    // Notify the other party
    addNotification(isClientCancelling ? job.providerId! : job.clientId, {
        userId: isClientCancelling ? job.providerId! : job.clientId,
        type: 'BOOKING_CANCELLED',
        title: 'Serviço cancelado',
        message: reason || `O serviço de ${job.date} foi cancelado`,
        data: { jobId: job.id, cancelledBy },
    });
}

/**
 * Send reminder notification (1 day before)
 */
export function notifyBookingReminder(job: Job, client: ClientProfile, provider: ProviderProfile): void {
    // Remind provider
    addNotification(provider.id, {
        userId: provider.id,
        type: 'BOOKING_REMINDER',
        title: 'Lembrete: Serviço amanhã',
        message: `Você tem um serviço agendado com ${client.name} amanhã às ${job.timeSlot}`,
        data: { jobId: job.id },
    });

    // Remind client
    addNotification(client.id, {
        userId: client.id,
        type: 'BOOKING_REMINDER',
        title: 'Lembrete: Serviço amanhã',
        message: `${provider.name} chegará amanhã às ${job.timeSlot}`,
        data: { jobId: job.id },
    });
}

/**
 * Notify service completion
 */
export function notifyServiceCompleted(job: Job, provider: ProviderProfile): void {
    addNotification(job.clientId, {
        userId: job.clientId,
        type: 'SERVICE_COMPLETED',
        title: 'Serviço concluído!',
        message: `${provider.name} finalizou o serviço. Por favor, avalie!`,
        data: { jobId: job.id, providerId: provider.id },
    });
}

/**
 * Notify about new review
 */
export function notifyReviewReceived(targetUserId: string, reviewerName: string, rating: number): void {
    addNotification(targetUserId, {
        userId: targetUserId,
        type: 'REVIEW_RECEIVED',
        title: 'Nova avaliação!',
        message: `${reviewerName} deu ${rating} estrelas para você`,
        data: { rating },
    });
}

/**
 * Notify about new message
 */
export function notifyNewMessage(userId: string, senderName: string, preview: string): void {
    addNotification(userId, {
        userId: userId,
        type: 'NEW_MESSAGE',
        title: `Mensagem de ${senderName}`,
        message: preview.substring(0, 100) + (preview.length > 100 ? '...' : ''),
        data: { senderName },
    });
}
