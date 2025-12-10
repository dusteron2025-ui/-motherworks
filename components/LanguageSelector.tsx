"use client";

import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

const LANGUAGES = [
    { code: 'pt' as const, label: 'Português', flag: '🇧🇷' },
    { code: 'en' as const, label: 'English', flag: '🇺🇸' },
    { code: 'es' as const, label: 'Español', flag: '🇪🇸' },
];

export function LanguageSelector() {
    const { locale, setLocale } = useI18n();
    const currentLang = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-2 px-3 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">{currentLang.flag} {currentLang.label}</span>
                    <span className="sm:hidden">{currentLang.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[150px]">
                {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLocale(lang.code)}
                        className="cursor-pointer flex items-center justify-between"
                    >
                        <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.label}</span>
                        </span>
                        {locale === lang.code && (
                            <Check className="h-4 w-4 text-teal-600" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
