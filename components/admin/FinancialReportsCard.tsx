"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialReportData {
    periodLabel: string;
    totalGMV: number;
    platformRevenue: number;
    providerPayouts: number;
    refunds: number;
    transactions: number;
}

interface FinancialReportsCardProps {
    data: FinancialReportData[];
    period: 'week' | 'month' | 'year';
}

export function FinancialReportsCard({ data, period }: FinancialReportsCardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const totals = data.reduce((acc, item) => ({
        gmv: acc.gmv + item.totalGMV,
        revenue: acc.revenue + item.platformRevenue,
        payouts: acc.payouts + item.providerPayouts,
        refunds: acc.refunds + item.refunds,
        transactions: acc.transactions + item.transactions,
    }), { gmv: 0, revenue: 0, payouts: 0, refunds: 0, transactions: 0 });

    // Pie chart data
    const pieData = [
        { name: 'Receita Plataforma', value: totals.revenue, color: '#10b981' },
        { name: 'Pagamentos Provedores', value: totals.payouts, color: '#8b5cf6' },
        { name: 'Reembolsos', value: totals.refunds, color: '#ef4444' },
    ];

    // Calculate month-over-month change (mock)
    const momChange = 12.5;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <DollarSign className="h-8 w-8 opacity-80" />
                            <Badge className="bg-white/20 text-white border-none">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                {momChange}%
                            </Badge>
                        </div>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(totals.gmv)}</p>
                        <p className="text-sm opacity-80">GMV Total</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Wallet className="h-8 w-8 opacity-80" />
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">~20%</span>
                        </div>
                        <p className="text-2xl font-bold mt-2">{formatCurrency(totals.revenue)}</p>
                        <p className="text-sm opacity-80">Receita Plataforma</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <CreditCard className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-2xl font-bold mt-2 text-slate-900">{formatCurrency(totals.payouts)}</p>
                        <p className="text-sm text-slate-500">Pagamentos a Provedores</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <Receipt className="h-8 w-8 text-slate-400" />
                            <Badge className="bg-red-100 text-red-600 border-none text-xs">{totals.transactions} txns</Badge>
                        </div>
                        <p className="text-2xl font-bold mt-2 text-red-600">{formatCurrency(totals.refunds)}</p>
                        <p className="text-sm text-slate-500">Reembolsos</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <Card className="md:col-span-2 border-none shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">GMV por Período</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="periodLabel"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `€${v}`}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
                                        }}
                                        formatter={(value: number) => formatCurrency(value)}
                                    />
                                    <Bar dataKey="totalGMV" fill="#10b981" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Distribuição</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-2 justify-center">
                            {pieData.map((item) => (
                                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-slate-600">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card className="border-none shadow-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Detalhes por Período</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Período</TableHead>
                                <TableHead className="text-right">GMV</TableHead>
                                <TableHead className="text-right">Receita</TableHead>
                                <TableHead className="text-right">Payouts</TableHead>
                                <TableHead className="text-right">Reembolsos</TableHead>
                                <TableHead className="text-right">Txns</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row.periodLabel}>
                                    <TableCell className="font-medium">{row.periodLabel}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(row.totalGMV)}</TableCell>
                                    <TableCell className="text-right text-emerald-600">{formatCurrency(row.platformRevenue)}</TableCell>
                                    <TableCell className="text-right text-purple-600">{formatCurrency(row.providerPayouts)}</TableCell>
                                    <TableCell className="text-right text-red-500">{formatCurrency(row.refunds)}</TableCell>
                                    <TableCell className="text-right">{row.transactions}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
