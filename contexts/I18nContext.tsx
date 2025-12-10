"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'pt' | 'en' | 'es';

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    messages: Record<string, unknown>;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Nested key accessor
function getNestedValue(obj: Record<string, unknown>, path: string): string {
    const keys = path.split('.');
    let result: unknown = obj;

    for (const key of keys) {
        if (result && typeof result === 'object' && key in result) {
            result = (result as Record<string, unknown>)[key];
        } else {
            return path; // Return key if not found
        }
    }

    return typeof result === 'string' ? result : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('pt');
    const [messages, setMessages] = useState<Record<string, unknown>>({});

    useEffect(() => {
        // Load from localStorage
        const savedLocale = localStorage.getItem('locale') as Locale;
        if (savedLocale && ['pt', 'en', 'es'].includes(savedLocale)) {
            setLocaleState(savedLocale);
        }
    }, []);

    useEffect(() => {
        // Load messages for current locale
        import(`@/messages/${locale}.json`)
            .then((module) => setMessages(module.default))
            .catch(() => console.error(`Failed to load messages for ${locale}`));
    }, [locale]);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    const t = (key: string): string => {
        return getNestedValue(messages, key);
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, messages }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
}

export function useTranslation() {
    const { t, locale } = useI18n();
    return { t, locale };
}
