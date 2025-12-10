"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Plus, Star, ArrowRight, Search, Filter, Home, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

// Helper function to safely format dates
const safeFormatDate = (dateStr: string, formatStr: string, options?: { locale?: typeof ptBR }) => {
    const date = new Date(dateStr);
    return isValid(date) ? format(date, formatStr, options) : 'N/A';
};

export default function ClientDashboard() {
    const { user } = useAuth();
    const { jobs } = useStore();

    if (!user) return null;

    const myJobs = jobs
        .filter(j => j.clientId === user.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const upcomingJobs = myJobs.filter(j => ['OPEN', 'CONFIRMED', 'IN_PROGRESS'].includes(j.status));

    const categories = [
        { name: "Limpeza", icon: Sparkles, color: "bg-blue-100 text-blue-600" },
        { name: "Reparos", icon: Home, color: "bg-orange-100 text-orange-600" },
        { name: "Elétrica", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
        { name: "Jardinagem", icon: MapPin, color: "bg-green-100 text-green-600" },
    ];

    return (
        <div className="space-y-8 pb-24 md:pb-0 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-sm font-medium">Bom dia,</p>
                    <h1 className="text-2xl font-bold text-slate-800">{user.name?.split(' ')[0]}! 👋</h1>
                </div>
                <Link href="/client/profile">
                    <div className="w-12 h-12 rounded-full bg-teal-100 border-2 border-white shadow-sm flex items-center justify-center text-teal-700 font-bold text-lg">
                        {user.name?.charAt(0)}
                    </div>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                    placeholder="O que você precisa hoje?"
                    className="h-14 pl-12 pr-14 rounded-3xl border-none bg-white shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] text-slate-700 placeholder:text-slate-400"
                />
                <Button size="icon" className="absolute right-2 top-2 h-10 w-10 rounded-full bg-teal-600 hover:bg-teal-700 shadow-md">
                    <Filter className="h-4 w-4 text-white" />
                </Button>
            </div>

            {/* Categories Horizontal Scroll */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-bold text-slate-800">Categorias</h2>
                    <Link href="#" className="text-sm text-teal-600 font-medium">Ver todas</Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    {categories.map((cat) => (
                        <div key={cat.name} className="flex flex-col items-center gap-2 min-w-[80px]">
                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-sm ${cat.color}`}>
                                <cat.icon className="h-7 w-7" />
                            </div>
                            <span className="text-xs font-medium text-slate-600">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming Jobs Card */}
            <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-800 px-1">Próximo Agendamento</h2>
                {upcomingJobs.length > 0 ? (
                    <Card className="border-none shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] bg-white rounded-3xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
                        <CardContent className="p-5 pl-7">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <Badge variant="secondary" className="bg-teal-50 text-teal-700 hover:bg-teal-100 mb-2">
                                        {upcomingJobs[0].serviceType === 'DEEP' ? 'Limpeza Profunda' : 'Limpeza Regular'}
                                    </Badge>
                                    <h3 className="font-bold text-lg text-slate-800">Limpeza Residencial</h3>
                                </div>
                                <div className="bg-slate-100 p-2 rounded-xl">
                                    <Calendar className="h-5 w-5 text-slate-600" />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {upcomingJobs[0].timeSlot}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {safeFormatDate(upcomingJobs[0].date, "d MMM", { locale: ptBR })}
                                </div>
                            </div>

                            <Link href={`/client/bookings/${upcomingJobs[0].id}`}>
                                <Button className="w-full bg-slate-900 text-white rounded-xl h-10 shadow-lg shadow-slate-900/20">
                                    Ver Detalhes
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-none shadow-sm bg-teal-50/50 rounded-3xl">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                <Plus className="h-6 w-6 text-teal-600" />
                            </div>
                            <p className="text-slate-600 font-medium mb-1">Nenhum agendamento</p>
                            <p className="text-xs text-slate-400 mb-4">Agende sua primeira limpeza hoje!</p>
                            <Link href="/client/book" className="w-full">
                                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20">
                                    Agendar Agora
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Promo Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-lg shadow-purple-600/20">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                    <Badge className="bg-white/20 text-white border-none mb-3 hover:bg-white/30">Novo</Badge>
                    <h3 className="text-xl font-bold mb-1">Indique e Ganhe</h3>
                    <p className="text-purple-100 text-sm mb-4 max-w-[200px]">Ganhe €10 de desconto para cada amigo que usar seu código.</p>
                    <Button size="sm" className="bg-white text-purple-700 hover:bg-purple-50 font-bold rounded-xl border-none">
                        Convidar Amigos
                    </Button>
                </div>
            </div>
        </div>
    );
}
