"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, MessageCircle, Calendar, Star, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Notification {
    id: string;
    type: 'booking' | 'message' | 'review' | 'payment' | 'system';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

// Real notifications will be fetched from Supabase via notificationService
// Starting with empty array - no mock data
const initialNotifications: Notification[] = [];

const getIconForType = (type: Notification['type']) => {
    switch (type) {
        case 'booking':
            return <Calendar className="h-4 w-4 text-teal-600" />;
        case 'message':
            return <MessageCircle className="h-4 w-4 text-blue-600" />;
        case 'review':
            return <Star className="h-4 w-4 text-yellow-500" />;
        case 'payment':
            return <CreditCard className="h-4 w-4 text-green-600" />;
        default:
            return <Bell className="h-4 w-4 text-slate-600" />;
    }
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
};

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="font-semibold text-sm">Notificações</span>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-teal-600 hover:text-teal-700"
                        >
                            Marcar todas como lidas
                        </button>
                    )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-slate-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">Nenhuma notificação</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex items-start gap-3 px-4 py-3 cursor-pointer",
                                    !notification.read && "bg-teal-50/50"
                                )}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="p-2 rounded-full bg-slate-100">
                                    {getIconForType(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium text-sm truncate">{notification.title}</span>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                            {formatTimeAgo(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{notification.message}</p>
                                </div>
                                {!notification.read && (
                                    <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2" />
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                    <Button variant="ghost" className="w-full text-sm text-slate-600 hover:text-teal-600">
                        Ver todas as notificações
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
