"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Heart, Loader2, Mail, Lock, Eye, EyeOff, Users, Sparkles } from "lucide-react";

// Usuários de demonstração
const DEMO_USERS = [
    { id: 'demo-client', name: '👤 Cliente Demo', email: 'cliente.demo@teste.com', password: 'Teste123!', role: 'CLIENT' },
    { id: 'demo-admin', name: '🔑 Admin Demo', email: 'admin.demo@teste.com', password: 'Teste123!', role: 'ADMIN' },
    { id: 'separator', name: '── Provedoras de Alagoas ──', email: '', password: '', role: '' },
    { id: 'maria', name: '👩 Maria Silva (Maceió)', email: 'maria.silva@teste.com', password: 'Teste123!', role: 'PROVIDER' },
    { id: 'ana', name: '👩 Ana Paula (Maceió)', email: 'ana.oliveira@teste.com', password: 'Teste123!', role: 'PROVIDER' },
    { id: 'juliana', name: '👩 Juliana Costa (Arapiraca)', email: 'juliana.costa@teste.com', password: 'Teste123!', role: 'PROVIDER' },
    { id: 'fernanda', name: '👩 Fernanda Lima (Maceió)', email: 'fernanda.lima@teste.com', password: 'Teste123!', role: 'PROVIDER' },
    { id: 'camila', name: '👩 Camila Rocha (Rio Largo)', email: 'camila.rocha@teste.com', password: 'Teste123!', role: 'PROVIDER' },
    { id: 'beatriz', name: '👩 Beatriz Martins (Palmeira)', email: 'beatriz.martins@teste.com', password: 'Teste123!', role: 'PROVIDER' },
    { id: 'larissa', name: '👩 Larissa Nascimento (Maceió)', email: 'larissa.nascimento@teste.com', password: 'Teste123!', role: 'PROVIDER' },
    { id: 'patricia', name: '👩 Patricia Gomes (Penedo)', email: 'patricia.gomes@teste.com', password: 'Teste123!', role: 'PROVIDER' },
    { id: 'amanda', name: '👩 Amanda Carvalho (Maceió)', email: 'amanda.carvalho@teste.com', password: 'Teste123!', role: 'PROVIDER' },
    { id: 'gabriela', name: '👩 Gabriela Mendes (Marechal)', email: 'gabriela.mendes@teste.com', password: 'Teste123!', role: 'PROVIDER' },
];

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showDemoMode, setShowDemoMode] = useState(false);
    const [selectedDemoUser, setSelectedDemoUser] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await login(email, password, rememberMe);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
            if (errorMessage.includes('Email not confirmed')) {
                setError("Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.");
            } else if (errorMessage.includes('Invalid login credentials')) {
                setError("Email ou senha incorretos.");
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        if (!selectedDemoUser) return;

        const user = DEMO_USERS.find(u => u.id === selectedDemoUser);
        if (!user || !user.email) return;

        setIsLoading(true);
        setError("");

        try {
            await login(user.email, user.password, false);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
            setError(`Erro no login demo: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FE] flex flex-col relative overflow-hidden">
            {/* Top Section: Illustration & Branding */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
                <div className="w-64 h-64 bg-teal-100/50 rounded-full blur-3xl absolute top-10 left-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg shadow-teal-100 mb-6">
                        <Heart className="w-8 h-8 text-teal-500 fill-teal-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Bem-vindo de volta!</h1>
                    <p className="text-slate-500">Encontre os melhores profissionais para o seu lar.</p>
                </div>
            </div>

            {/* Bottom Section: White Sheet Form */}
            <div className="bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] p-8 pb-12 relative z-20 animate-in slide-in-from-bottom-10 duration-500">
                <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>

                {/* Demo Mode Toggle */}
                <div className="max-w-md mx-auto mb-6">
                    <button
                        type="button"
                        onClick={() => setShowDemoMode(!showDemoMode)}
                        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-semibold transition-all ${showDemoMode
                                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                                : 'bg-slate-50 text-slate-600 border-2 border-transparent hover:bg-slate-100'
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        {showDemoMode ? 'Modo Demo Ativo' : 'Ativar Modo Demo'}
                        <Users className="w-4 h-4" />
                    </button>
                </div>

                {/* Demo Mode Panel */}
                {showDemoMode && (
                    <div className="max-w-md mx-auto mb-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-100">
                        <h3 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Selecione um usuário de demonstração
                        </h3>
                        <Select value={selectedDemoUser} onValueChange={setSelectedDemoUser}>
                            <SelectTrigger className="w-full h-12 bg-white border-purple-200 rounded-xl">
                                <SelectValue placeholder="Escolha um usuário..." />
                            </SelectTrigger>
                            <SelectContent>
                                {DEMO_USERS.map((user) => (
                                    user.id === 'separator' ? (
                                        <div key={user.id} className="px-2 py-1 text-xs font-bold text-slate-400 bg-slate-50">
                                            {user.name}
                                        </div>
                                    ) : (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name}
                                        </SelectItem>
                                    )
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            type="button"
                            onClick={handleDemoLogin}
                            disabled={!selectedDemoUser || isLoading}
                            className="w-full h-12 mt-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-600/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Entrando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" /> Entrar como Demo
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-purple-600 text-center mt-2">
                            Usuários criados para demonstração do sistema
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-600 font-medium ml-1">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 pl-12 bg-slate-50 border-none rounded-2xl text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-teal-500/20"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <Label htmlFor="password" className="text-slate-600 font-medium">Senha</Label>
                            <Link href="/forgot-password" className="text-xs text-teal-600 font-semibold hover:underline">
                                Esqueceu?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 pl-12 pr-12 bg-slate-50 border-none rounded-2xl text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-teal-500/20"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                tabIndex={-1}
                                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                        />
                        <Label
                            htmlFor="remember"
                            className="text-sm text-slate-600 cursor-pointer"
                        >
                            Lembrar de mim
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-lg font-semibold shadow-lg shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Entrando...
                            </>
                        ) : (
                            "Entrar"
                        )}
                    </Button>

                    <div className="text-center pt-2">
                        <p className="text-slate-500">
                            Não tem uma conta?{" "}
                            <Link href="/signup" className="font-bold text-teal-600 hover:underline">
                                Cadastre-se
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
