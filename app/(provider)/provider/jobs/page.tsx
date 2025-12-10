"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckCircle, Briefcase } from "lucide-react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calculateDistance } from "@/lib/utils/location";

// Helper function to safely format dates
const safeFormatDate = (dateStr: string, formatStr: string, options?: { locale?: typeof ptBR }) => {
    const date = new Date(dateStr);
    return isValid(date) ? format(date, formatStr, options) : 'Data inválida';
};

export default function JobsPage() {
    const { user } = useAuth();
    const { jobs, updateJobStatus } = useStore();

    if (!user || user.role !== 'PROVIDER') return null;

    const myJobs = jobs.filter(j => j.providerId === user.id);

    const openJobs = jobs.filter(j => {
        if (j.status !== 'OPEN') return false;
        if (j.providerId) return false;
        if (user.location && j.location) {
            const dist = calculateDistance(user.location.lat, user.location.lng, j.location.lat, j.location.lng);
            return dist <= 20;
        }
        return true;
    });

    const handleAcceptJob = (id: string) => {
        updateJobStatus(id, 'CONFIRMED');
    };

    return (
        <div className="space-y-10 max-w-6xl mx-auto">

            {/* JOB RADAR SECTION */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <span className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                        </span>
                        Radar de Oportunidades
                    </h2>
                    <Badge variant="outline" className="text-slate-500 bg-white shadow-sm px-3 py-1">
                        {openJobs.length} disponíveis na área
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {openJobs.length === 0 ? (
                        <Card className="col-span-full bg-slate-50/50 border-dashed border-2 shadow-none">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Briefcase className="h-8 w-8 text-slate-400" />
                                </div>
                                <p className="text-slate-500 text-lg font-medium">Não há novos trabalhos na sua área no momento.</p>
                                <p className="text-sm text-slate-400">Verifique novamente mais tarde.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        openJobs.map((job) => (
                            <Card key={job.id} className="border-none shadow-lg bg-white/90 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none shadow-sm">Novo</Badge>
                                        <span className="font-bold text-xl text-green-700">€{job.providerPayout}</span>
                                    </div>
                                    <CardTitle className="mt-3 text-xl text-slate-900">
                                        {job.serviceType === 'DEEP' ? 'Limpeza Profunda' : 'Limpeza Regular'}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" /> {safeFormatDate(job.date, "d 'de' MMM", { locale: ptBR })} • {job.timeSlot}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-sm text-slate-600 space-y-3">
                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <span className="font-medium">{job.durationHours} horas</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span className="truncate">{job.location?.address || 'Endereço não informado'}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2">
                                    <Button className="w-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 font-bold" onClick={() => handleAcceptJob(job.id)}>
                                        Aceitar Trabalho
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* MY JOBS SECTION */}
            <div className="space-y-6 pt-8 border-t border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">Meus Trabalhos</h2>
                <div className="grid gap-4">
                    {myJobs.length === 0 ? (
                        <p className="text-slate-500 italic">Você ainda não tem trabalhos aceitos.</p>
                    ) : (
                        myJobs.map((job) => (
                            <Card key={job.id} className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-lg text-slate-900">
                                                    {job.serviceType === 'DEEP' ? 'Limpeza Profunda' : 'Limpeza Regular'}
                                                </span>
                                                <Badge variant="secondary" className={
                                                    job.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                                        job.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800 animate-pulse' :
                                                            job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                                                }>
                                                    {job.status}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-slate-500 flex flex-wrap items-center gap-4">
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {safeFormatDate(job.date, "dd/MM/yyyy")} às {job.timeSlot}</span>
                                                <span className="hidden md:inline">•</span>
                                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location?.address || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                            <span className="font-bold text-xl text-slate-700">€{job.providerPayout}</span>
                                            {job.status === 'CONFIRMED' && (
                                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 shadow-md" onClick={() => updateJobStatus(job.id, 'IN_PROGRESS')}>
                                                    Iniciar
                                                </Button>
                                            )}
                                            {job.status === 'IN_PROGRESS' && (
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 shadow-md" onClick={() => updateJobStatus(job.id, 'COMPLETED')}>
                                                    <CheckCircle className="mr-2 h-4 w-4" /> Finalizar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
