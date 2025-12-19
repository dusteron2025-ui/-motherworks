"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, Wallet } from "lucide-react";

export default function EarningsPage() {
    const { user } = useAuth();
    const { jobs } = useStore();

    if (!user || user.role !== 'PROVIDER') return null;

    const myJobs = jobs.filter(j => j.providerId === user.id && (j.status === 'COMPLETED' || j.status === 'PAID'));

    const totalEarnings = myJobs.reduce((acc, job) => acc + job.providerPayout, 0);
    const thisMonthEarnings = myJobs
        .filter(j => new Date(j.date).getMonth() === new Date().getMonth())
        .reduce((acc, job) => acc + job.providerPayout, 0);

    // Mock data for chart
    const data = [
        { name: 'Seg', valor: 45 },
        { name: 'Ter', valor: 60 },
        { name: 'Qua', valor: 30 },
        { name: 'Qui', valor: 90 },
        { name: 'Sex', valor: 45 },
        { name: 'Sab', valor: 120 },
        { name: 'Dom', valor: 0 },
    ];

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Hub de Ganhos</h1>
                <p className="text-lg text-slate-600">Acompanhe sua performance financeira em tempo real.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-none shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-purple-100">Ganhos Totais</CardTitle>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Wallet className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-4xl font-bold mb-1">€{totalEarnings.toFixed(2)}</div>
                        <p className="text-xs text-purple-200 flex items-center gap-1">
                            <span className="bg-green-400/20 text-green-300 px-1.5 py-0.5 rounded text-[10px] font-bold">+15%</span>
                            vs mês passado
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md hover:bg-white/90 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Este Mês</CardTitle>
                        <div className="p-2 bg-teal-100 rounded-lg">
                            <Calendar className="h-4 w-4 text-teal-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">€{thisMonthEarnings.toFixed(2)}</div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                            Projeção: €{(thisMonthEarnings * 1.2).toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md hover:bg-white/90 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Média por Hora</CardTitle>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">€15.50</div>
                        <p className="text-xs text-slate-500 mt-1">Top 10% da região</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-800">Histórico Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minHeight={350}>
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `€${value}`}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        padding: '12px'
                                    }}
                                />
                                <Bar
                                    dataKey="valor"
                                    fill="url(#colorValor)"
                                    radius={[8, 8, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
