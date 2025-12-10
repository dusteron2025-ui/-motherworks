"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Euro, CheckCircle, XCircle, Briefcase, TrendingUp, Calendar, ChevronRight, Wallet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calculateDistance } from "@/lib/utils/location";
import Link from "next/link";

export default function ProviderDashboard() {
    const { user } = useAuth();
    const { jobs, updateJobStatus } = useStore();

    if (!user || user.role !== 'PROVIDER') return null;

    const myJobs = jobs.filter(j => j.providerId === user.id);
    const todaysJobs = myJobs.filter(j =>
        new Date(j.date).toDateString() === new Date().toDateString()
    );

    const openJobs = jobs.filter(j => {
        if (j.status !== 'OPEN') return false;
        if (j.providerId) return false;
        if (user.location && j.location) {
            const dist = calculateDistance(user.location.lat, user.location.lng, j.location.lat, j.location.lng);
            return dist <= 20;
        }
        return true;
    });

    const stats = [
        {
            title: "Ganhos Hoje",
            value: `€${todaysJobs.reduce((acc, j) => acc + j.providerPayout, 0).toFixed(2)}`,
            sub: `${todaysJobs.length} trabalhos`,
            icon: Wallet,
            color: "bg-purple-600 text-white",
            bg: "bg-purple-600"
        },
        {
            title: "Ativos",
            value: myJobs.filter(j => ['CONFIRMED', 'IN_PROGRESS'].includes(j.status)).length,
            sub: "Próximos dias",
            icon: Calendar,
            color: "bg-white text-slate-800",
            bg: "bg-white"
        },
        {
            title: "Oportunidades",
            value: openJobs.length,
            sub: "Na sua área",
            icon: MapPin,
            color: "bg-white text-green-600",
            bg: "bg-white"
        }
    ];

    return (
        <div className="space-y-8 pb-24 md:pb-0 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-sm font-medium">Painel Profissional</p>
                    <h1 className="text-2xl font-bold text-slate-800">Olá, {user.name?.split(' ')[0]}! 🚀</h1>
                </div>
                <Link href="/provider/profile">
                    <div className="w-12 h-12 rounded-full bg-purple-100 border-2 border-white shadow-sm flex items-center justify-center text-purple-700 font-bold text-lg">
                        {user.name?.charAt(0)}
                    </div>
                </Link>
            </div>

            {/* Stats Horizontal Scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {stats.map((stat, i) => (
                    <div key={i} className={`min-w-[160px] p-5 rounded-3xl shadow-sm flex flex-col justify-between h-40 ${stat.bg} ${stat.bg === 'bg-white' ? 'border border-slate-100' : 'shadow-lg shadow-purple-600/20'}`}>
                        <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-xl ${stat.bg === 'bg-white' ? 'bg-slate-50' : 'bg-white/20'}`}>
                                <stat.icon className={`h-5 w-5 ${stat.bg === 'bg-white' ? 'text-slate-600' : 'text-white'}`} />
                            </div>
                            {stat.title === "Oportunidades" && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                        </div>
                        <div>
                            <h3 className={`text-3xl font-bold ${stat.bg === 'bg-white' ? 'text-slate-800' : 'text-white'}`}>{stat.value}</h3>
                            <p className={`text-xs font-medium mt-1 ${stat.bg === 'bg-white' ? 'text-slate-500' : 'text-purple-100'}`}>{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Today's Agenda */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-bold text-slate-800">Agenda de Hoje</h2>
                    <Link href="/provider/schedule" className="text-sm text-purple-600 font-medium">Ver calendário</Link>
                </div>

                {todaysJobs.length === 0 ? (
                    <Card className="border-none shadow-sm bg-purple-50/50 rounded-3xl">
                        <CardContent className="p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <Briefcase className="h-8 w-8 text-purple-300" />
                            </div>
                            <p className="text-slate-600 font-medium mb-1">Dia livre!</p>
                            <p className="text-sm text-slate-400 mb-6">Aproveite para descansar ou buscar novos trabalhos.</p>
                            <Link href="/provider/jobs" className="w-full">
                                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-600/20">
                                    Buscar Oportunidades
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {todaysJobs.map((job) => (
                            <div key={job.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4 items-center">
                                <div className="flex flex-col items-center justify-center bg-purple-50 w-16 h-16 rounded-2xl text-purple-700">
                                    <span className="text-sm font-bold">{job.timeSlot.split(':')[0]}</span>
                                    <span className="text-xs">{job.timeSlot.split(':')[1]}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800">Limpeza Residencial</h3>
                                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" /> 5.2 km • {job.durationHours}h
                                    </p>
                                </div>
                                <Link href={`/provider/jobs/${job.id}`}>
                                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-slate-50">
                                        <ChevronRight className="h-5 w-5 text-slate-400" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
