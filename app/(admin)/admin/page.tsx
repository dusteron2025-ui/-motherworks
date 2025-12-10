"use client";

import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, DollarSign, Activity, TrendingUp, ArrowUpRight, MapPin, ShieldCheck, Briefcase } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const { jobs, users } = useStore();

    const totalRevenue = jobs.reduce((acc, j) => acc + j.agencyFee, 0);
    const activeProviders = users.filter(u => u.role === 'PROVIDER' && u.verifiedStatus).length;
    const activeClients = users.filter(u => u.role === 'CLIENT').length;
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED' || j.status === 'PAID').length;

    // Mock Data for Charts
    const revenueData = [
        { name: 'Jul', total: 4500 },
        { name: 'Aug', total: 5200 },
        { name: 'Sep', total: 4800 },
        { name: 'Oct', total: 6100 },
        { name: 'Nov', total: 5800 },
        { name: 'Dec', total: 7200 },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Centro de Comando</h1>
                    <p className="text-slate-500">Visão geral do sistema em tempo real.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Sistema Operacional
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: "Receita Total", value: `€${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+20.1%" },
                    { title: "Provedoras", value: activeProviders, icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50", trend: "+3 novas" },
                    { title: "Clientes", value: activeClients, icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%" },
                    { title: "Trabalhos", value: completedJobs, icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50", trend: "98% Sucesso" },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-50 flex flex-col justify-between h-40 hover:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.bg} ${kpi.color}`}>
                                {kpi.trend}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-slate-800">{kpi.value}</h3>
                            <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* GMV Trend Chart */}
                <div className="md:col-span-2 bg-white p-6 rounded-[2rem] shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-50">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-800">Crescimento da Receita</h3>
                        <p className="text-sm text-slate-500">Volume bruto de transações (GMV)</p>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `€${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#059669', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Active Jobs Map Placeholder */}
                <div className="bg-white p-6 rounded-[2rem] shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-50 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-800">Mapa ao Vivo</h3>
                        <p className="text-sm text-slate-500">Atividade em tempo real</p>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/subtle-dots.png')] opacity-30"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute"></div>
                                <div className="w-4 h-4 bg-emerald-500 rounded-full relative border-2 border-white shadow-lg"></div>
                            </div>
                            <div className="relative ml-8 -mt-10">
                                <div className="w-4 h-4 bg-purple-500 rounded-full animate-ping absolute delay-700"></div>
                                <div className="w-4 h-4 bg-purple-500 rounded-full relative border-2 border-white shadow-lg delay-700"></div>
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-sm text-xs font-medium text-slate-600 text-center">
                            Lisboa: Alta demanda
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
