"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
    LayoutDashboard,
    Users,
    FileCheck,
    DollarSign,
    LogOut,
    Menu,
    Shield,
    Settings
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navigation = [
        { name: "Visão Geral", href: "/admin", icon: LayoutDashboard },
        { name: "Verificações", href: "/admin/verifications", icon: FileCheck },
        { name: "Usuários", href: "/admin/users", icon: Users },
        { name: "Financeiro", href: "/admin/financials", icon: DollarSign },
        { name: "Configurações", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-[#F8F9FE]">
            {/* Desktop Sidebar */}
            <aside className="hidden w-72 flex-col m-4 mr-0 bg-white rounded-[2rem] shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)] md:flex sticky top-4 h-[calc(100vh-2rem)]">
                <div className="flex h-24 items-center px-8">
                    <div className="bg-slate-900 p-2 rounded-xl mr-3">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-slate-900 block leading-none">Admin</span>
                        <span className="text-xs font-medium text-slate-400">MotherWorks</span>
                    </div>
                </div>

                <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
                    <nav className="flex-1 space-y-2">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200",
                                    pathname === item.href
                                        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon className={cn("mr-3 h-5 w-5", pathname === item.href ? "text-white" : "text-slate-400")} />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-auto pt-8">
                        <div className="bg-slate-50 p-4 rounded-3xl mb-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-900 font-bold border border-slate-100">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500">Administrador</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair do Sistema
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-6 md:hidden bg-[#F8F9FE]/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 p-2 rounded-xl">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-slate-900">Admin</span>
                    </div>
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="bg-white shadow-sm rounded-xl">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0 border-none bg-[#F8F9FE]">
                            {/* Mobile Sidebar Content (Reused Logic) */}
                            <div className="flex h-full flex-col p-4">
                                <div className="flex h-24 items-center px-4">
                                    <span className="text-xl font-bold text-slate-900">Menu</span>
                                </div>
                                <nav className="flex-1 space-y-2">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={cn(
                                                "flex items-center rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all",
                                                pathname === item.href
                                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                                                    : "text-slate-500 hover:bg-white"
                                            )}
                                        >
                                            <item.icon className="mr-3 h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
