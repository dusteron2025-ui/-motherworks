"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Bell,
    Check,
    CheckCircle2,
    Calendar,
    MessageCircle,
    Star,
    XCircle,
    Clock,
    CreditCard,
    Sparkles,
    ChevronRight,
} from 'lucide-react';
import { Notification, NotificationType, getUserNotifications, markAsRead, markAllAsRead } from '@/services/notificationService';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCenterProps {
    userId: string;
    onNotificationClick?: (notification: Notification) => void;
}

export function NotificationCenter({ userId, onNotificationClick }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        loadNotifications();
    }, [userId, filter]);

    const loadNotifications = () => {
        const notifs = getUserNotifications(userId, filter === 'unread');
        setNotifications(notifs);
    };

    const handleMarkAsRead = (notif: Notification) => {
        if (!notif.read) {
            markAsRead(userId, notif.id);
            loadNotifications();
        }
        onNotificationClick?.(notif);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead(userId);
        loadNotifications();
    };

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'BOOKING_CREATED':
                return <Calendar className="h-5 w-5 text-blue-600" />;
            case 'BOOKING_ACCEPTED':
                return <CheckCircle2 className="h-5 w-5 text-green-600" />;
            case 'BOOKING_REJECTED':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'BOOKING_CANCELLED':
                return <XCircle className="h-5 w-5 text-amber-500" />;
            case 'BOOKING_REMINDER':
                return <Clock className="h-5 w-5 text-purple-600" />;
            case 'SERVICE_STARTED':
                return <Sparkles className="h-5 w-5 text-teal-600" />;
            case 'SERVICE_COMPLETED':
                return <Check className="h-5 w-5 text-green-600" />;
            case 'PAYMENT_RECEIVED':
                return <CreditCard className="h-5 w-5 text-green-600" />;
            case 'REVIEW_RECEIVED':
                return <Star className="h-5 w-5 text-amber-500" />;
            case 'NEW_MESSAGE':
                return <MessageCircle className="h-5 w-5 text-blue-500" />;
            default:
                return <Bell className="h-5 w-5 text-slate-500" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Card className="border-none shadow-lg bg-white w-full max-w-md">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="h-5 w-5 text-purple-600" />
                        Notificações
                        {unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white border-none h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {unreadCount}
                            </Badge>
                        )}
                    </CardTitle>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>
                {/* Filter Tabs */}
                <div className="flex gap-2 mt-3">
                    <Button
                        variant={filter === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('all')}
                        className={cn(
                            "rounded-full text-xs",
                            filter === 'all' && "bg-purple-600 hover:bg-purple-700"
                        )}
                    >
                        Todas
                    </Button>
                    <Button
                        variant={filter === 'unread' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('unread')}
                        className={cn(
                            "rounded-full text-xs",
                            filter === 'unread' && "bg-purple-600 hover:bg-purple-700"
                        )}
                    >
                        Não lidas
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p>Nenhuma notificação</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {notifications.map((notif) => (
                                <button
                                    key={notif.id}
                                    onClick={() => handleMarkAsRead(notif)}
                                    className={cn(
                                        "w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3",
                                        !notif.read && "bg-purple-50/50"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-xl shrink-0",
                                        !notif.read ? "bg-white shadow" : "bg-slate-100"
                                    )}>
                                        {getNotificationIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={cn(
                                                "font-medium text-sm truncate",
                                                !notif.read ? "text-slate-900" : "text-slate-700"
                                            )}>
                                                {notif.title}
                                            </p>
                                            {!notif.read && (
                                                <span className="h-2 w-2 bg-purple-600 rounded-full shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">
                                            {notif.message}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {formatDistanceToNow(new Date(notif.createdAt), {
                                                addSuffix: true,
                                                locale: ptBR
                                            })}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
