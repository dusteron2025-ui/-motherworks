"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import {
    CheckCircle,
    XCircle,
    Loader2,
    Database,
    Key,
    User,
    RefreshCw
} from "lucide-react";

interface TestResult {
    name: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    duration?: number;
}

export default function DiagnosticsPage() {
    const [tests, setTests] = useState<TestResult[]>([]);
    const [running, setRunning] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginResult, setLoginResult] = useState<string | null>(null);

    const updateTest = (name: string, status: TestResult['status'], message: string, duration?: number) => {
        setTests(prev => prev.map(t => t.name === name ? { ...t, status, message, duration } : t));
    };

    const runDiagnostics = async () => {
        setRunning(true);
        setTests([
            { name: 'Supabase URL', status: 'pending', message: 'Verificando...' },
            { name: 'Supabase Key', status: 'pending', message: 'Verificando...' },
            { name: 'Connection Test', status: 'pending', message: 'Testando conexão...' },
            { name: 'Auth Session', status: 'pending', message: 'Verificando sessão...' },
            { name: 'Database Read', status: 'pending', message: 'Testando leitura...' },
        ]);

        // Test 1: Check URL
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (url && url.includes('supabase.co')) {
            updateTest('Supabase URL', 'success', url);
        } else {
            updateTest('Supabase URL', 'error', url || 'URL não configurada');
        }

        // Test 2: Check Key
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (key && key.length > 50) {
            updateTest('Supabase Key', 'success', `${key.substring(0, 20)}...`);
        } else {
            updateTest('Supabase Key', 'error', key ? 'Key inválida' : 'Key não configurada');
        }

        // Test 3: Connection Test with timeout
        const connStart = Date.now();
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout após 5s')), 5000)
            );

            const connPromise = supabase.from('platform_settings').select('id').limit(1);

            const result = await Promise.race([connPromise, timeoutPromise]) as any;
            const connDuration = Date.now() - connStart;

            if (result.error) {
                if (result.error.code === '42P01') {
                    updateTest('Connection Test', 'success', `Conectado! Tabela não existe ainda. (${connDuration}ms)`, connDuration);
                } else {
                    updateTest('Connection Test', 'error', `Erro: ${result.error.message}`, connDuration);
                }
            } else {
                updateTest('Connection Test', 'success', `Conectado! (${connDuration}ms)`, connDuration);
            }
        } catch (err: any) {
            const connDuration = Date.now() - connStart;
            updateTest('Connection Test', 'error', err.message || 'Falha na conexão', connDuration);
        }

        // Test 4: Auth Session with timeout
        const authStart = Date.now();
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout após 5s')), 5000)
            );

            const sessionPromise = supabase.auth.getSession();

            const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
            const authDuration = Date.now() - authStart;

            if (result.error) {
                updateTest('Auth Session', 'error', result.error.message, authDuration);
            } else if (result.data?.session) {
                updateTest('Auth Session', 'success', `Logado como ${result.data.session.user.email}`, authDuration);
            } else {
                updateTest('Auth Session', 'success', `Nenhuma sessão ativa (${authDuration}ms)`, authDuration);
            }
        } catch (err: any) {
            const authDuration = Date.now() - authStart;
            updateTest('Auth Session', 'error', err.message || 'Falha', authDuration);
        }

        // Test 5: Database read
        const dbStart = Date.now();
        try {
            const { data, error } = await supabase.from('master_admins').select('count').limit(1);
            const dbDuration = Date.now() - dbStart;

            if (error) {
                if (error.code === '42P01') {
                    updateTest('Database Read', 'error', `Tabela master_admins não existe - execute master_schema.sql`, dbDuration);
                } else {
                    updateTest('Database Read', 'error', error.message, dbDuration);
                }
            } else {
                updateTest('Database Read', 'success', `OK (${dbDuration}ms)`, dbDuration);
            }
        } catch (err: any) {
            const dbDuration = Date.now() - dbStart;
            updateTest('Database Read', 'error', err.message, dbDuration);
        }

        setRunning(false);
    };

    const handleLogin = async () => {
        setLoginResult('Fazendo login...');
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });

            if (error) {
                setLoginResult(`❌ Erro: ${error.message}`);
            } else if (data.user) {
                setLoginResult(`✅ Login bem sucedido! User ID: ${data.user.id}`);
            }
        } catch (err: any) {
            setLoginResult(`❌ Exceção: ${err.message}`);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setLoginResult('Deslogado!');
    };

    useEffect(() => {
        runDiagnostics();
    }, []);

    return (
        <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Database className="h-8 w-8 text-amber-500" />
                        Diagnóstico Supabase
                    </h1>
                    <p className="text-slate-400">Verificar conexão e autenticação</p>
                </div>
                <Button
                    onClick={runDiagnostics}
                    disabled={running}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                    {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    Executar Testes
                </Button>
            </div>

            {/* Test Results */}
            <Card className="bg-slate-800 border-slate-700 mb-6">
                <CardHeader>
                    <CardTitle className="text-white">Resultados dos Testes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {tests.map((test) => (
                        <div key={test.name} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                            {test.status === 'pending' && <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />}
                            {test.status === 'success' && <CheckCircle className="h-5 w-5 text-green-400" />}
                            {test.status === 'error' && <XCircle className="h-5 w-5 text-red-400" />}
                            <div className="flex-1">
                                <p className="font-medium text-white">{test.name}</p>
                                <p className={`text-xs ${test.status === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                                    {test.message}
                                </p>
                            </div>
                            {test.duration && (
                                <span className="text-xs text-slate-500">{test.duration}ms</span>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Login Test */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-amber-500" />
                        Teste de Login
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-slate-300">Email</Label>
                            <Input
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                        <div>
                            <Label className="text-slate-300">Senha</Label>
                            <Input
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleLogin} className="bg-green-600 hover:bg-green-700">
                            Fazer Login
                        </Button>
                        <Button onClick={handleLogout} variant="outline" className="border-slate-600 text-slate-300">
                            Fazer Logout
                        </Button>
                    </div>
                    {loginResult && (
                        <div className={`p-3 rounded-lg ${loginResult.includes('✅') ? 'bg-green-500/20 text-green-400' : loginResult.includes('❌') ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                            {loginResult}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
