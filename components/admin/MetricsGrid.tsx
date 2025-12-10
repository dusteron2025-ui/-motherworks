"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    Users,
    TrendingUp,
    Star,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { PlatformMetrics } from '@/services/adminService';
import { cn } from '@/lib/utils';

interface MetricsGridProps {
    metrics: PlatformMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const cards = [
        {
            title: 'Total de Usuários',
            value: metrics.totalUsers,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: '+5%',
            trendUp: true,
        },
        {
            title: 'Provedores Ativos',
            value: metrics.activeProviders,
            icon: CheckCircle2,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            trend: '+3',
            trendUp: true,
        },
        {
            title: 'Clientes Ativos',
            value: metrics.activeClients,
            icon: Users,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            trend: '+12%',
            trendUp: true,
        },
        {
            title: 'Verificações Pendentes',
            value: metrics.pendingVerifications,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            trend: null,
            trendUp: null,
        },
        {
            title: 'Total de Jobs',
            value: metrics.totalJobs,
            icon: CheckCircle2,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            trend: '+18%',
            trendUp: true,
        },
        {
            title: 'Jobs Completados',
            value: metrics.completedJobs,
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-50',
            trend: `${Math.round((metrics.completedJobs / metrics.totalJobs) * 100)}%`,
            trendUp: true,
        },
        {
            title: 'Jobs Cancelados',
            value: metrics.cancelledJobs,
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            trend: `-${Math.round((metrics.cancelledJobs / metrics.totalJobs) * 100)}%`,
            trendUp: false,
        },
        {
            title: 'Rating Médio',
            value: metrics.avgProviderRating.toFixed(1),
            icon: Star,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            trend: null,
            trendUp: null,
        },
        {
            title: 'Receita Total',
            value: formatCurrency(metrics.totalRevenue),
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            trend: '+20%',
            trendUp: true,
        },
        {
            title: 'Taxas da Plataforma',
            value: formatCurrency(metrics.platformFees),
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-50',
            trend: '+15%',
            trendUp: true,
        },
        {
            title: 'Valor Médio Job',
            value: formatCurrency(metrics.avgJobValue),
            icon: TrendingUp,
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            trend: '+8%',
            trendUp: true,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <Card
                    key={index}
                    className="border-none shadow-sm hover:shadow-md transition-shadow bg-white"
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className={cn("p-2 rounded-xl", card.bg)}>
                                <card.icon className={cn("h-5 w-5", card.color)} />
                            </div>
                            {card.trend && (
                                <span className={cn(
                                    "text-xs font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-full",
                                    card.trendUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                                )}>
                                    {card.trendUp ? (
                                        <ArrowUpRight className="h-3 w-3" />
                                    ) : (
                                        <ArrowDownRight className="h-3 w-3" />
                                    )}
                                    {card.trend}
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                        <p className="text-sm text-slate-500 mt-1">{card.title}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
