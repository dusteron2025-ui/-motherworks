"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

interface MobileNavProps {
    items: NavItem[];
}

export function MobileNav({ items }: MobileNavProps) {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 md:hidden safe-area-bottom">
            <div className="flex justify-around items-center h-20 px-2">
                {items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/client' && item.href !== '/provider' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-200 rounded-2xl mx-1",
                                isActive
                                    ? "text-teal-600 bg-teal-50"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-6 w-6 transition-all duration-200",
                                    isActive && "scale-110"
                                )}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={cn(
                                "text-[10px] font-semibold",
                                isActive ? "text-teal-700" : "text-slate-500"
                            )}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
