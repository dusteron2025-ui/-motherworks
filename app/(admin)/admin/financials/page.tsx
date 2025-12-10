"use client";

import { useStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, isValid } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, DollarSign, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Helper function to safely format dates
const safeFormatDate = (dateStr: string, formatStr: string) => {
    const date = new Date(dateStr);
    return isValid(date) ? format(date, formatStr) : 'N/A';
};

export default function FinancialsPage() {
    const { jobs, users } = useStore();

    // Filter completed jobs that need payout or have been paid
    const financialJobs = jobs.filter(j => ['COMPLETED', 'PAID'].includes(j.status));

    const getProviderName = (id?: string) => {
        if (!id) return 'Desconhecido';
        const provider = users.find(u => u.id === id);
        return provider ? provider.name : 'Desconhecido';
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                        Financeiro
                    </h1>
                    <p className="text-lg text-slate-600">
                        Controle total do fluxo de caixa e repasses.
                    </p>
                </div>
                <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-slate-200 hover:bg-white">
                    <Download className="mr-2 h-4 w-4" /> Exportar Relatório
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-slate-900 text-white border-none shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Receita Total (Agência)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">€12,450.00</div>
                        <div className="flex items-center text-xs text-green-400 mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> +20.1% este mês
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-md border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Repasses Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">€2,340.00</div>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                            45 pagamentos agendados
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-md border-none shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Ticket Médio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">€42.50</div>
                        <div className="flex items-center text-xs text-green-600 mt-1">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> +5% vs semana passada
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-teal-600" />
                        Transações Recentes
                    </CardTitle>
                    <CardDescription>Histórico detalhado de todos os pagamentos processados.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="font-bold text-slate-700">ID</TableHead>
                                <TableHead className="font-bold text-slate-700">Data</TableHead>
                                <TableHead className="font-bold text-slate-700">Profissional</TableHead>
                                <TableHead className="font-bold text-slate-700">Valor Total</TableHead>
                                <TableHead className="font-bold text-green-700">Agência (20%)</TableHead>
                                <TableHead className="font-bold text-slate-700">Repasse (80%)</TableHead>
                                <TableHead className="font-bold text-slate-700">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {financialJobs.map((job) => (
                                <TableRow key={job.id} className="hover:bg-slate-50/80 border-slate-100 transition-colors">
                                    <TableCell className="font-mono text-xs text-slate-500">#{job.id.slice(-6)}</TableCell>
                                    <TableCell className="text-slate-600">{safeFormatDate(job.date, "dd/MM/yyyy")}</TableCell>
                                    <TableCell className="font-medium text-slate-900">{getProviderName(job.providerId)}</TableCell>
                                    <TableCell className="text-slate-600">€{(job.priceTotal ?? 0).toFixed(2)}</TableCell>
                                    <TableCell className="text-green-600 font-bold bg-green-50/50 rounded-lg">+€{(job.agencyFee ?? 0).toFixed(2)}</TableCell>
                                    <TableCell className="font-bold text-slate-900">€{(job.providerPayout ?? 0).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={job.status === 'PAID' ? 'default' : 'secondary'}
                                            className={job.status === 'PAID' ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200'}
                                        >
                                            {job.status === 'PAID' ? 'Pago' : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
