"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { updatePassword, session } = useSupabaseAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    // Check if user has a valid reset session
    const hasValidSession = !!session;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await updatePassword(password);
            if (error) {
                setError(error.message);
            } else {
                setIsSuccess(true);
            }
        } catch (err) {
            setError('Erro ao atualizar senha. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <Card className="w-full max-w-md border-none shadow-xl">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Senha Atualizada!</h2>
                        <p className="text-slate-600 mb-6">
                            Sua senha foi alterada com sucesso. Você já pode fazer login.
                        </p>
                        <Button
                            onClick={() => router.push('/login')}
                            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800"
                        >
                            Ir para Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!hasValidSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <Card className="w-full max-w-md border-none shadow-xl">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="h-8 w-8 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Link Expirado</h2>
                        <p className="text-slate-600 mb-6">
                            O link de recuperação expirou ou é inválido. Solicite um novo link.
                        </p>
                        <Button
                            onClick={() => router.push('/auth/forgot-password')}
                            className="w-full rounded-xl bg-purple-600 hover:bg-purple-700"
                        >
                            Solicitar Novo Link
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <Card className="w-full max-w-md border-none shadow-xl">
                <CardHeader className="text-center pb-2">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="h-7 w-7 text-purple-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Nova Senha</CardTitle>
                    <CardDescription>
                        Digite sua nova senha abaixo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="rounded-xl h-12 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="rounded-xl h-12"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading || !password || !confirmPassword}
                            className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Atualizar Senha'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
