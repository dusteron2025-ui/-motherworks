"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) {
                setError(error.message);
            } else {
                setIsSuccess(true);
            }
        } catch (err) {
            setError('Erro ao enviar email. Tente novamente.');
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
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Enviado!</h2>
                        <p className="text-slate-600 mb-6">
                            Enviamos um link de recuperação para <strong>{email}</strong>.
                            Verifique sua caixa de entrada e spam.
                        </p>
                        <Button
                            onClick={() => router.push('/login')}
                            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800"
                        >
                            Voltar para Login
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
                        <Mail className="h-7 w-7 text-purple-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Esqueceu a Senha?</CardTitle>
                    <CardDescription>
                        Digite seu email e enviaremos um link para redefinir sua senha
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                            disabled={isLoading || !email}
                            className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Enviar Link de Recuperação'
                            )}
                        </Button>

                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 mt-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar para Login
                        </Link>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
