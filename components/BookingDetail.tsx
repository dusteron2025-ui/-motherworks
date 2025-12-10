"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Calendar,
    Clock,
    MapPin,
    Star,
    Phone,
    MessageCircle,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    CreditCard,
    User,
    Home,
    Sparkles,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import { Job, ProviderProfile, ClientProfile } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculateCancellation, getPolicyDescription, CancellationPolicy } from '@/services/cancellationService';

interface BookingDetailProps {
    job: Job;
    provider?: ProviderProfile;
    client?: ClientProfile;
    userRole: 'CLIENT' | 'PROVIDER';
    onAccept?: () => Promise<void>;
    onReject?: (reason: string) => Promise<void>;
    onCancel?: () => Promise<void>;
    onContact?: () => void;
    onReview?: () => void;
    onPay?: () => void;
}

export function BookingDetail({
    job,
    provider,
    client,
    userRole,
    onAccept,
    onReject,
    onCancel,
    onContact,
    onReview,
    onPay,
}: BookingDetailProps) {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const otherPerson = userRole === 'CLIENT' ? provider : client;
    const cancellationResult = calculateCancellation(job, 'MODERATE');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const getStatusBadge = (status: Job['status']) => {
        const statusConfig: Record<Job['status'], { label: string; className: string; icon: React.ReactNode }> = {
            OPEN: { label: 'Pendente', className: 'bg-amber-100 text-amber-700', icon: <Clock className="h-3 w-3" /> },
            CONFIRMED: { label: 'Confirmado', className: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-3 w-3" /> },
            REJECTED: { label: 'Recusado', className: 'bg-red-100 text-red-700', icon: <XCircle className="h-3 w-3" /> },
            IN_PROGRESS: { label: 'Em andamento', className: 'bg-blue-100 text-blue-700', icon: <Sparkles className="h-3 w-3" /> },
            COMPLETED: { label: 'Concluído', className: 'bg-purple-100 text-purple-700', icon: <CheckCircle2 className="h-3 w-3" /> },
            CANCELLED: { label: 'Cancelado', className: 'bg-slate-100 text-slate-600', icon: <XCircle className="h-3 w-3" /> },
            PAID: { label: 'Pago', className: 'bg-green-100 text-green-700', icon: <CreditCard className="h-3 w-3" /> },
        };
        const config = statusConfig[status];
        return (
            <Badge className={cn("border-none gap-1", config.className)}>
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    const handleAction = async (action: () => Promise<void>, actionName: string) => {
        setIsLoading(actionName);
        try {
            await action();
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Main Card */}
            <Card className="border-none shadow-lg bg-white overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-200">Serviço #{job.id.slice(-6)}</p>
                            <h2 className="text-xl font-bold mt-1">{job.serviceType || 'Limpeza Residencial'}</h2>
                        </div>
                        {getStatusBadge(job.status)}
                    </div>
                </div>

                <CardContent className="p-6 space-y-6">
                    {/* Date & Time */}
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">
                                {format(new Date(job.date), "EEEE, d 'de' MMMM", { locale: ptBR })}
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {job.timeSlot} • {job.durationHours}h de serviço
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Location */}
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-teal-100 rounded-xl">
                            <MapPin className="h-6 w-6 text-teal-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900">{job.location?.address}</p>
                            <p className="text-sm text-slate-500">{job.locationType || 'Casa particular'}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Other Person */}
                    {otherPerson && (
                        <>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 ring-2 ring-purple-100">
                                    <AvatarImage src={otherPerson.avatarUrl} />
                                    <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                                        {otherPerson.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900">{otherPerson.name}</p>
                                    {'rating' in otherPerson && (
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                            {otherPerson.rating.toFixed(1)} • {otherPerson.reviewCount} avaliações
                                        </div>
                                    )}
                                </div>
                                {onContact && (
                                    <Button variant="outline" size="sm" onClick={onContact} className="rounded-xl">
                                        <MessageCircle className="h-4 w-4 mr-1" />
                                        Chat
                                    </Button>
                                )}
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Price */}
                    <div className="bg-slate-50 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600">Valor do serviço</span>
                            <span className="font-bold text-lg text-slate-900">{formatCurrency(job.priceTotal)}</span>
                        </div>
                        {userRole === 'PROVIDER' && (
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                                <span className="text-slate-600">Você receberá</span>
                                <span className="font-bold text-green-600">{formatCurrency(job.providerPayout)}</span>
                            </div>
                        )}
                    </div>

                    {/* Cancellation Policy */}
                    {(job.status === 'OPEN' || job.status === 'CONFIRMED') && (
                        <div className="bg-amber-50 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-800">Política de Cancelamento</p>
                                    <p className="text-sm text-amber-700 mt-1">{getPolicyDescription('MODERATE')}</p>
                                    {cancellationResult.allowed && (
                                        <p className="text-sm text-amber-600 mt-2">{cancellationResult.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
                {/* Provider Actions for OPEN bookings */}
                {userRole === 'PROVIDER' && job.status === 'OPEN' && (
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => onReject?.('Indisponível')}
                            disabled={!!isLoading}
                            className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                        >
                            {isLoading === 'reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                            Recusar
                        </Button>
                        <Button
                            onClick={() => handleAction(onAccept!, 'accept')}
                            disabled={!!isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
                        >
                            {isLoading === 'accept' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Aceitar
                        </Button>
                    </div>
                )}

                {/* Cancel button for eligible statuses */}
                {cancellationResult.allowed && onCancel && (
                    <>
                        {!showCancelConfirm ? (
                            <Button
                                variant="outline"
                                onClick={() => setShowCancelConfirm(true)}
                                className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                            >
                                Cancelar Serviço
                            </Button>
                        ) : (
                            <Card className="border-red-200 bg-red-50">
                                <CardContent className="p-4">
                                    <p className="text-sm text-red-800 mb-3">{cancellationResult.message}</p>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowCancelConfirm(false)}
                                            className="flex-1 rounded-xl"
                                        >
                                            Voltar
                                        </Button>
                                        <Button
                                            onClick={() => handleAction(onCancel, 'cancel')}
                                            disabled={!!isLoading}
                                            className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl"
                                        >
                                            {isLoading === 'cancel' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Cancelamento'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* Payment button for clients */}
                {userRole === 'CLIENT' && job.status === 'CONFIRMED' && onPay && (
                    <Button
                        onClick={onPay}
                        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-xl h-12"
                    >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pagar {formatCurrency(job.priceTotal)}
                    </Button>
                )}

                {/* Review button after completion */}
                {job.status === 'COMPLETED' && onReview && (
                    <Button
                        onClick={onReview}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl h-12"
                    >
                        <Star className="h-4 w-4 mr-2" />
                        Avaliar Serviço
                    </Button>
                )}
            </div>
        </div>
    );
}
