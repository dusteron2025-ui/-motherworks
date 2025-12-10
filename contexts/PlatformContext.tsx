"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlatformSettings, platformSettingsService } from '@/services/platformSettingsService';

interface PlatformContextType {
    settings: PlatformSettings | null;
    loading: boolean;
    error: string | null;
    refreshSettings: () => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

const DEFAULT_SETTINGS: PlatformSettings = {
    id: 'main',
    platform_name: 'MotherWorks',
    tagline: 'Serviços domésticos de confiança',
    logo_url: null,
    favicon_url: null,
    primary_color: '#14B8A6',
    secondary_color: '#8B5CF6',
    supabase_url: null,
    supabase_anon_key: null,
    google_maps_key: null,
    stripe_public_key: null,
    stripe_secret_key: null,
    twilio_sid: null,
    twilio_token: null,
    twilio_phone: null,
    enable_google_oauth: true,
    enable_sms_verification: true,
    enable_whatsapp: false,
    enable_stripe: true,
    enable_email_notifications: true,
    default_currency: 'EUR',
    default_locale: 'pt',
    platform_fee_percent: 20,
    min_booking_hours: 2,
    max_booking_hours: 8,
    cancellation_window_hours: 24,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

export function PlatformProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<PlatformSettings | null>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await platformSettingsService.getSettings();
            setSettings(data);
        } catch (err) {
            console.error('Failed to fetch platform settings:', err);
            setError('Failed to load settings');
            setSettings(DEFAULT_SETTINGS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const refreshSettings = async () => {
        await fetchSettings();
    };

    return (
        <PlatformContext.Provider value={{ settings, loading, error, refreshSettings }}>
            {children}
        </PlatformContext.Provider>
    );
}

export function usePlatform() {
    const context = useContext(PlatformContext);
    if (context === undefined) {
        throw new Error('usePlatform must be used within a PlatformProvider');
    }
    return context;
}

// Hook to get specific branding values
export function useBranding() {
    const { settings } = usePlatform();
    return {
        name: settings?.platform_name || 'MotherWorks',
        tagline: settings?.tagline || '',
        logo: settings?.logo_url,
        favicon: settings?.favicon_url,
        primaryColor: settings?.primary_color || '#14B8A6',
        secondaryColor: settings?.secondary_color || '#8B5CF6',
    };
}

// Hook to check if integration is enabled
export function useIntegration(integration: 'google_oauth' | 'sms' | 'whatsapp' | 'stripe' | 'email') {
    const { settings } = usePlatform();
    if (!settings) return false;

    switch (integration) {
        case 'google_oauth': return settings.enable_google_oauth;
        case 'sms': return settings.enable_sms_verification;
        case 'whatsapp': return settings.enable_whatsapp;
        case 'stripe': return settings.enable_stripe;
        case 'email': return settings.enable_email_notifications;
        default: return false;
    }
}
