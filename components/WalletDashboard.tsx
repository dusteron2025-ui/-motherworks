"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Euro,
    RefreshCw,
    Loader2,
    Send
} from 'lucide-react';
import { WalletTransaction } from '@/types';
import { cn } from '@/lib/utils';

interface WalletDashboardProps {
    userId: string;
    balance: number;
    pendingBalance: number;
    transactions: WalletTransaction[];
    onRequestPayout?: (amount: number) => Promise<boolean>;
}

export function WalletDashboard({
    userId,
    balance,
    pendingBalance,
    transactions,
    onRequestPayout
}: WalletDashboardProps) {
    const [payoutAmount, setPayoutAmount] = useState<string>('');
    const [isRequesting, setIsRequesting] = useState(false);
    const [showPayoutForm, setShowPayoutForm] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handlePayout = async () => {
        const amount = parseFloat(payoutAmount);
        if (isNaN(amount) || amount <= 0 || amount > balance) return;

        setIsRequesting(true);
        if (onRequestPayout) {
            const success = await onRequestPayout(amount);
            if (success) {
                setPayoutAmount('');
                setShowPayoutForm(false);
            }
        }
        setIsRequesting(false);
    };

    const getTransactionIcon = (type: WalletTransaction['type']) => {
        switch (type) {
            case 'CREDIT':
                return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
            case 'DEBIT':
            case 'TRANSFER':
                return <ArrowUpRight className="h-4 w-4 text-red-500" />;
            case 'PAYOUT':
                return <Send className="h-4 w-4 text-blue-600" />;
        }
    };

    const getStatusBadge = (status: WalletTransaction['status']) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-green-100 text-green-700 border-none"><CheckCircle2 className="h-3 w-3 mr-1" />Concluído</Badge>;
            case 'PENDING':
                return <Badge className="bg-amber-100 text-amber-700 border-none"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
            case 'FAILED':
                return <Badge className="bg-red-100 text-red-700 border-none"><XCircle className="h-3 w-3 mr-1" />Falhou</Badge>;
            case 'REFUNDED':
                return <Badge className="bg-purple-100 text-purple-700 border-none"><RefreshCw className="h-3 w-3 mr-1" />Reembolsado</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Available Balance */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <span className="text-sm text-green-100">Saldo Disponível</span>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
                        <p className="text-sm text-green-100 mt-2">Disponível para saque</p>
                    </CardContent>
                </Card>

                {/* Pending Balance */}
                <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Clock className="h-5 w-5" />
                            </div>
                            <span className="text-sm text-amber-100">Saldo Pendente</span>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(pendingBalance)}</p>
                        <p className="text-sm text-amber-100 mt-2">Aguardando conclusão do serviço</p>
                    </CardContent>
                </Card>
            </div>

            {/* Payout Section */}
            <Card className="border-none shadow-md bg-white">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Send className="h-5 w-5 text-blue-600" />
                            Solicitar Saque
                        </CardTitle>
                        {!showPayoutForm && (
                            <Button
                                onClick={() => setShowPayoutForm(true)}
                                className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                                disabled={balance <= 0}
                            >
                                Sacar
                            </Button>
                        )}
                    </div>
                </CardHeader>
                {showPayoutForm && (
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="number"
                                    placeholder="Valor do saque"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                    className="pl-9 h-12 rounded-xl border-slate-200"
                                    max={balance}
                                />
                            </div>
                            <Button
                                onClick={handlePayout}
                                disabled={isRequesting || !payoutAmount || parseFloat(payoutAmount) > balance}
                                className="bg-blue-600 hover:bg-blue-700 rounded-xl h-12 px-6"
                            >
                                {isRequesting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Confirmar'
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowPayoutForm(false)}
                                className="rounded-xl h-12"
                            >
                                Cancelar
                            </Button>
                        </div>
                        <p className="text-sm text-slate-500">
                            Saldo disponível: <span className="font-bold text-green-600">{formatCurrency(balance)}</span>
                        </p>
                    </CardContent>
                )}
            </Card>

            {/* Transaction History */}
            <Card className="border-none shadow-md bg-white">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        Histórico de Transações
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <Wallet className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            <p>Nenhuma transação ainda</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((txn) => (
                                <div
                                    key={txn.id}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-2 rounded-xl",
                                            txn.type === 'CREDIT' ? "bg-green-100" :
                                                txn.type === 'PAYOUT' ? "bg-blue-100" : "bg-red-100"
                                        )}>
                                            {getTransactionIcon(txn.type)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{txn.description}</p>
                                            <p className="text-sm text-slate-500">{formatDate(txn.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "font-bold",
                                            txn.type === 'CREDIT' ? "text-green-600" : "text-slate-900"
                                        )}>
                                            {txn.type === 'CREDIT' ? '+' : '-'}{formatCurrency(txn.amount)}
                                        </p>
                                        {getStatusBadge(txn.status)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
