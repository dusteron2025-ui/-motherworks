"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import {
    LayoutDashboard,
    Key,
    Palette,
    ToggleLeft,
    LogOut,
    Shield,
    Database,
} from "lucide-react";

export default function MasterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [status, setStatus] = useState<'loading' | 'authorized' | 'denied'>('loading');
    const [userEmail, setUserEmail] = useState<string>('');
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        const checkAccess = async () => {
            try {
                // Check Supabase session
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.user) {
                    setStatus('denied');
                    return;
                }

                setUserEmail(session.user.email || '');
                setUserId(session.user.id);

                // Check if user is in master_admins
                const { data, error } = await supabase
                    .from('master_admins')
                    .select('id')
                    .eq('user_id', session.user.id);

                if (error) {
                    console.error('Master check error:', error);
                    // If table doesn't exist, allow access in dev
                    if (error.code === '42P01') {
                        setStatus('authorized');
                        return;
                    }
                    setStatus('denied');
                    return;
                }

                if (data && data.length > 0) {
                    setStatus('authorized');
                } else {
                    setStatus('denied');
                }
            } catch (err) {
                console.error('Auth error:', err);
                setStatus('denied');
            }
        };

        checkAccess();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    // Loading
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-amber-500 animate-pulse mx-auto mb-4" />
                    <p className="text-slate-400">Verificando acesso Master...</p>
                </div>
            </div>
        );
    }

    // Denied
    if (status === 'denied') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
                <div className="text-center max-w-lg">
                    <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Acesso Negado</h1>
                    <p className="text-slate-400 mb-6">Faça login com uma conta Master Admin.</p>

                    {userId && (
                        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg text-left mb-6">
                            <p className="text-amber-400 font-bold text-sm mb-2">💡 Para se adicionar como Master:</p>
                            <code className="text-xs text-amber-300 block bg-slate-800 p-2 rounded overflow-x-auto">
                                INSERT INTO master_admins (user_id, email) VALUES ('{userId}', '{userEmail}');
                            </code>
                        </div>
                    )}

                    <div className="flex gap-3 justify-center">
                        <Link href="/login" className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-amber-400">
                            Fazer Login
                        </Link>
                        <Link href="/" className="text-slate-400 px-4 py-2 rounded-lg hover:text-white">
                            Voltar ao início
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Authorized
    const navigation = [
        { name: "Dashboard", href: "/master", icon: LayoutDashboard },
        { name: "API Keys", href: "/master/apis", icon: Key },
        { name: "Branding", href: "/master/branding", icon: Palette },
        { name: "Integrações", href: "/master/integrations", icon: ToggleLeft },
        { name: "Diagnóstico", href: "/master/diagnostics", icon: Database },
    ];

    return (
        <div className="flex min-h-screen bg-slate-900">
            <aside className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
                <div className="h-20 flex items-center px-6 border-b border-slate-700">
                    <div className="bg-amber-500 p-2 rounded-xl mr-3">
                        <Shield className="h-6 w-6 text-slate-900" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-white block leading-none">Master Admin</span>
                        <span className="text-xs font-medium text-slate-400">Painel de Controle</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                                pathname === item.href
                                    ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20"
                                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("mr-3 h-5 w-5", pathname === item.href ? "text-slate-900" : "text-slate-400")} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <div className="bg-slate-700/50 p-4 rounded-xl mb-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{userEmail}</p>
                            <p className="text-xs text-slate-400">Master Admin</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
