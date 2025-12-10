"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { WalletDashboard } from "@/components/WalletDashboard";
import { getWallet, requestPayout, addPendingFunds, releaseFunds } from "@/services/walletService";
import { WalletTransaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WalletPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [balance, setBalance] = useState(0);
    const [pendingBalance, setPendingBalance] = useState(0);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (user) {
            const wallet = getWallet(user.id);
            setBalance(wallet.balance);
            setPendingBalance(wallet.pendingBalance);
            setTransactions(wallet.transactions);
        }
    }, [user, refreshKey]);

    // Show loading while auth is initializing
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    // Check if user is logged in
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Sessão expirada</h2>
                <p className="text-slate-500 mb-4">Faça login novamente para acessar sua carteira.</p>
                <Link href="/login">
                    <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                        Fazer Login
                    </Button>
                </Link>
            </div>
        );
    }

    // Check if user is a provider
    if (user.role !== 'PROVIDER') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Área exclusiva para provedoras</h2>
                <p className="text-slate-500 mb-4">
                    Esta página é exclusiva para profissionais cadastradas.
                    <br />
                    <span className="text-xs text-slate-400">Seu tipo de conta: {user.role || 'Não definido'}</span>
                </p>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/client')}
                        className="rounded-xl"
                    >
                        Ir para área do cliente
                    </Button>
                    <Link href="/signup">
                        <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                            Cadastrar como Provedora
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleRequestPayout = async (amount: number): Promise<boolean> => {
        const result = requestPayout(user.id, amount);
        if (result) {
            setRefreshKey(prev => prev + 1);
            return true;
        }
        return false;
    };

    // Demo: Add mock pending funds (for testing)
    const handleAddMockFunds = () => {
        addPendingFunds(user.id, 50, 'demo-job-' + Date.now(), 'Limpeza residencial - Demo');
        setRefreshKey(prev => prev + 1);
    };

    // Demo: Release pending funds (for testing)
    const handleReleaseFunds = () => {
        const wallet = getWallet(user.id);
        const pendingTxn = wallet.transactions.find(t => t.status === 'PENDING' && t.type === 'CREDIT');
        if (pendingTxn) {
            releaseFunds(user.id, pendingTxn.id);
            setRefreshKey(prev => prev + 1);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Minha Carteira</h1>
                    <p className="text-slate-500">Gerencie seus ganhos e solicite saques</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setRefreshKey(prev => prev + 1)}
                    className="rounded-xl"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                </Button>
            </div>

            {/* Demo Actions (remove in production) */}
            <Card className="border-dashed border-2 border-purple-200 bg-purple-50/50">
                <CardContent className="p-4">
                    <p className="text-sm text-purple-700 font-medium mb-3">🧪 Modo Demo - Ações de Teste</p>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleAddMockFunds}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 rounded-lg"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Simular Pagamento (€50)
                        </Button>
                        <Button
                            onClick={handleReleaseFunds}
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
                            disabled={pendingBalance === 0}
                        >
                            Liberar Fundos Pendentes
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Wallet Dashboard */}
            <WalletDashboard
                userId={user.id}
                balance={balance}
                pendingBalance={pendingBalance}
                transactions={transactions}
                onRequestPayout={handleRequestPayout}
            />
        </div>
    );
}
