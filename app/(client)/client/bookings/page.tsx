"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, DollarSign, Star, CheckCircle2 } from "lucide-react";
import { RatingDialog } from "@/components/RatingDialog";
import { cn } from "@/lib/utils";

// Helper function to safely format dates
const safeFormatDate = (dateStr: string, formatStr: string, options?: { locale?: typeof ptBR }) => {
    const date = new Date(dateStr);
    return isValid(date) ? format(date, formatStr, options) : 'N/A';
};

export default function ClientBookingsPage() {
    const { user } = useAuth();
    const { jobs, users } = useStore();
    const [ratedJobs, setRatedJobs] = useState<string[]>([]);

    const myJobs = jobs.filter(j => j.clientId === user?.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getProviderName = (providerId?: string) => {
        if (!providerId) return null;
        const provider = users.find(u => u.id === providerId);
        return provider?.name || "Provedora";
    };

    const getServiceTypeName = (type: string) => {
        const names: Record<string, string> = {
            'REGULAR': 'Limpeza Regular',
            'DEEP': 'Limpeza Profunda',
            'IRONING': 'Engomadoria',
            'MOVING': 'Mudança'
        };
        return names[type] || type;
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'COMPLETED': 'bg-green-100 text-green-700 border-green-200',
            'CONFIRMED': 'bg-blue-100 text-blue-700 border-blue-200',
            'OPEN': 'bg-amber-100 text-amber-700 border-amber-200',
            'IN_PROGRESS': 'bg-purple-100 text-purple-700 border-purple-200',
            'CANCELLED': 'bg-red-100 text-red-700 border-red-200'
        };
        const labels: Record<string, string> = {
            'COMPLETED': 'Concluído',
            'CONFIRMED': 'Confirmado',
            'OPEN': 'Aberto',
            'IN_PROGRESS': 'Em Andamento',
            'CANCELLED': 'Cancelado'
        };
        return { style: styles[status] || 'bg-slate-100 text-slate-700', label: labels[status] || status };
    };

    const handleRatingSubmit = (jobId: string, rating: number, comment: string) => {
        console.log("Rating submitted:", { jobId, rating, comment });
        setRatedJobs(prev => [...prev, jobId]);
        // In a real app, this would call an API to save the review
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Minhas Limpezas</h1>
                    <p className="text-slate-500 mt-1">Acompanhe seus agendamentos e avalie os serviços</p>
                </div>
            </div>

            <div className="grid gap-4">
                {myJobs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                        <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg font-medium">Nenhum agendamento encontrado.</p>
                        <p className="text-slate-400 text-sm mt-1">Agende sua primeira limpeza agora!</p>
                        <Button className="mt-4 rounded-xl bg-teal-600 hover:bg-teal-700">
                            Agendar Limpeza
                        </Button>
                    </div>
                ) : (
                    myJobs.map((job) => {
                        const providerName = getProviderName(job.providerId);
                        const statusBadge = getStatusBadge(job.status);
                        const isCompleted = job.status === 'COMPLETED';
                        const isRated = ratedJobs.includes(job.id);

                        return (
                            <Card key={job.id} className="border-none shadow-md bg-white hover:shadow-lg transition-all duration-300 overflow-hidden rounded-2xl">
                                <CardContent className="p-6">
                                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                                        {/* Left: Job Info */}
                                        <div className="space-y-4 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {getServiceTypeName(job.serviceType)}
                                                </h3>
                                                <Badge className={cn("rounded-lg border font-medium", statusBadge.style)}>
                                                    {statusBadge.label}
                                                </Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-slate-600 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-slate-100 rounded-lg">
                                                        <Calendar className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <span className="font-medium">{safeFormatDate(job.date, "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-slate-100 rounded-lg">
                                                        <Clock className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <span className="font-medium">{job.timeSlot} ({job.durationHours}h)</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-slate-100 rounded-lg">
                                                        <DollarSign className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <span className="font-bold text-slate-900">€{job.priceTotal}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Provider + Actions */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            {providerName && (
                                                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl">
                                                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold border-2 border-white shadow-sm">
                                                        {providerName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Provedora</p>
                                                        <p className="font-bold text-slate-900">{providerName}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {isCompleted && providerName && (
                                                isRated ? (
                                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span className="font-medium text-sm">Avaliado</span>
                                                    </div>
                                                ) : (
                                                    <RatingDialog
                                                        providerName={providerName}
                                                        jobId={job.id}
                                                        onSubmit={(rating, comment) => handleRatingSubmit(job.id, rating, comment)}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
