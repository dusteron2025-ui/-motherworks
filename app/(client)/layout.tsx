"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
    Calendar,
    Search,
    User,
    LogOut,
    Home,
    Heart
} from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { LanguageSelector } from "@/components/LanguageSelector";
import { NotificationDropdown } from "@/components/NotificationDropdown";


export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    const navigation = [
        { name: "Início", href: "/client", icon: Home },
        { name: "Agendar", href: "/client/book", icon: Search },
        { name: "Minhas Limpezas", href: "/client/bookings", icon: Calendar },
        { name: "Perfil", href: "/client/profile", icon: User },
    ];

    const mobileNavItems = [
        { label: "Início", href: "/client", icon: Home },
        { label: "Agendar", href: "/client/book", icon: Search },
        { label: "Pedidos", href: "/client/bookings", icon: Calendar },
        { label: "Perfil", href: "/client/profile", icon: User },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-[#F8F9FE] pb-24 md:pb-0">
            {/* Mobile Header */}
            <header className="sticky top-0 z-30 flex h-20 items-center justify-between px-6 bg-[#F8F9FE]/80 backdrop-blur-md md:hidden">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-500 p-2 rounded-xl">
                        <Heart className="h-5 w-5 text-white fill-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900">MotherWorks</span>
                </div>
                <div className="flex items-center gap-2">
                    <LanguageSelector />
                    <NotificationDropdown />
                </div>
            </header>

            <div className="flex flex-1">
                {/* Desktop Sidebar */}
                <aside className="hidden w-72 flex-col m-4 mr-0 bg-white rounded-[2rem] shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)] md:flex sticky top-4 h-[calc(100vh-2rem)]">
                    <div className="flex h-24 items-center px-8">
                        <div className="bg-teal-500 p-2 rounded-xl mr-3">
                            <Heart className="h-6 w-6 text-white fill-white" />
                        </div>
                        <div>
                            <span className="text-lg font-bold text-slate-900 block leading-none">MotherWorks</span>
                            <span className="text-xs font-medium text-slate-400">Área do Cliente</span>
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
                                            ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
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
                                <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center text-teal-600 font-bold border border-slate-100">
                                    {user?.name?.charAt(0) || 'C'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                                    <p className="text-xs text-slate-500">Cliente</p>
                                </div>
                            </div>
                            <button
                                onClick={() => logout()}
                                className="flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sair
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>

            <MobileNav items={mobileNavItems} />
        </div>
    );
}
