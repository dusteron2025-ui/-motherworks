"use client";

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, FileText, ShieldAlert, UserCheck } from "lucide-react";
import { ProviderProfile } from "@/types";

export default function VerificationsPage() {
    const { users, updateUser } = useStore();

    const pendingProviders = users.filter(
        (u): u is ProviderProfile => u.role === 'PROVIDER' && !u.verifiedStatus
    );

    const handleApprove = (provider: ProviderProfile) => {
        updateUser({ ...provider, verifiedStatus: true });
    };

    const handleReject = (provider: ProviderProfile) => {
        alert(`Provedora ${provider.name} rejeitada.`);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                    Fila de Verificação
                </h1>
                <p className="text-lg text-slate-600">
                    Gestão de segurança e compliance. Aprove novos talentos com responsabilidade.
                </p>
            </div>

            <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <UserCheck className="h-5 w-5 text-teal-600" />
                                Solicitações Pendentes
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {pendingProviders.length} provedoras aguardando análise de documentos.
                            </CardDescription>
                        </div>
                        {pendingProviders.length > 0 && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1">
                                Ação Necessária
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {pendingProviders.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center justify-center bg-slate-50/30">
                            <div className="bg-green-100 p-4 rounded-full mb-4 animate-pulse">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 text-xl">Tudo em dia!</h3>
                            <p className="text-slate-500 mt-2">Nenhuma verificação pendente no momento.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="hover:bg-transparent border-slate-100">
                                    <TableHead className="font-bold text-slate-700">Profissional</TableHead>
                                    <TableHead className="font-bold text-slate-700">Contato</TableHead>
                                    <TableHead className="font-bold text-slate-700">Data Cadastro</TableHead>
                                    <TableHead className="font-bold text-slate-700">Documentação</TableHead>
                                    <TableHead className="text-right font-bold text-slate-700">Decisão</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingProviders.map((provider) => (
                                    <TableRow key={provider.id} className="hover:bg-slate-50/80 border-slate-100 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-4">
                                                <img src={provider.avatarUrl} alt={provider.name} className="h-10 w-10 rounded-full border-2 border-white shadow-sm" />
                                                <div>
                                                    <p className="font-bold text-slate-900">{provider.name}</p>
                                                    <p className="text-xs text-slate-500">ID: {provider.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p className="text-slate-900">{provider.email}</p>
                                                <p className="text-slate-500 text-xs">IP: 192.168.1.1</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">
                                                {new Date(provider.createdAt).toLocaleDateString()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" className="h-8 text-xs bg-white hover:bg-blue-50 hover:text-blue-600 border-slate-200">
                                                    <FileText className="mr-1.5 h-3 w-3" /> CC/BI
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-8 text-xs bg-white hover:bg-purple-50 hover:text-purple-600 border-slate-200">
                                                    <ShieldAlert className="mr-1.5 h-3 w-3" /> Criminal
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleReject(provider)}
                                                >
                                                    <X className="h-4 w-4 mr-1" /> Rejeitar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
                                                    onClick={() => handleApprove(provider)}
                                                >
                                                    <Check className="h-4 w-4 mr-1" /> Aprovar
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
