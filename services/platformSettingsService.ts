import { supabase } from '@/lib/supabase';

export interface PlatformSettings {
    id: string;
    // Branding
    platform_name: string;
    tagline: string;
    logo_url: string | null;
    favicon_url: string | null;
    primary_color: string;
    secondary_color: string;
    // APIs
    supabase_url: string | null;
    supabase_anon_key: string | null;
    google_maps_key: string | null;
    stripe_public_key: string | null;
    stripe_secret_key: string | null;
    twilio_sid: string | null;
    twilio_token: string | null;
    twilio_phone: string | null;
    // Integrations
    enable_google_oauth: boolean;
    enable_sms_verification: boolean;
    enable_whatsapp: boolean;
    enable_stripe: boolean;
    enable_email_notifications: boolean;
    // Platform
    default_currency: string;
    default_locale: string;
    platform_fee_percent: number;
    min_booking_hours: number;
    max_booking_hours: number;
    cancellation_window_hours: number;
    // Meta
    created_at: string;
    updated_at: string;
}

export interface MasterAdmin {
    id: string;
    user_id: string;
    email: string;
    created_at: string;
    last_login: string | null;
}

const DEFAULT_SETTINGS: Partial<PlatformSettings> = {
    platform_name: 'MotherWorks',
    tagline: 'Serviços domésticos de confiança',
    primary_color: '#14B8A6',
    secondary_color: '#8B5CF6',
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
};

export const platformSettingsService = {
    /**
     * Get platform settings (public - for branding)
     */
    async getSettings(): Promise<PlatformSettings> {
        const { data, error } = await supabase
            .from('platform_settings')
            .select('*')
            .eq('id', 'main')
            .single();

        if (error) {
            console.error('Error fetching platform settings:', error);
            return DEFAULT_SETTINGS as PlatformSettings;
        }

        return data as PlatformSettings;
    },

    /**
     * Update platform settings (master only)
     */
    async updateSettings(updates: Partial<PlatformSettings>): Promise<{ success: boolean; error?: string }> {
        const { error } = await supabase
            .from('platform_settings')
            .update(updates)
            .eq('id', 'main');

        if (error) {
            console.error('Error updating platform settings:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    },

    /**
     * Update branding settings
     */
    async updateBranding(branding: {
        platform_name?: string;
        tagline?: string;
        logo_url?: string;
        favicon_url?: string;
        primary_color?: string;
        secondary_color?: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.updateSettings(branding);
    },

    /**
     * Update API keys
     */
    async updateApiKeys(apis: {
        supabase_url?: string;
        supabase_anon_key?: string;
        google_maps_key?: string;
        stripe_public_key?: string;
        stripe_secret_key?: string;
        twilio_sid?: string;
        twilio_token?: string;
        twilio_phone?: string;
    }): Promise<{ success: boolean; error?: string }> {
        return this.updateSettings(apis);
    },

    /**
     * Update integration toggles
     */
    async updateIntegrations(integrations: {
        enable_google_oauth?: boolean;
        enable_sms_verification?: boolean;
        enable_whatsapp?: boolean;
        enable_stripe?: boolean;
        enable_email_notifications?: boolean;
    }): Promise<{ success: boolean; error?: string }> {
        return this.updateSettings(integrations);
    },

    /**
     * Check if user is master admin
     */
    async isMasterAdmin(userId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('master_admins')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return false;
        }

        return true;
    },

    /**
     * Update master admin last login
     */
    async updateLastLogin(userId: string): Promise<void> {
        await supabase
            .from('master_admins')
            .update({ last_login: new Date().toISOString() })
            .eq('user_id', userId);
    },

    /**
     * Upload logo/favicon to Supabase Storage
     */
    async uploadBrandingImage(
        file: File,
        type: 'logo' | 'favicon'
    ): Promise<{ url: string | null; error?: string }> {
        const fileName = `${type}_${Date.now()}.${file.name.split('.').pop()}`;
        const filePath = `branding/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('public')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            return { url: null, error: uploadError.message };
        }

        const { data: urlData } = supabase.storage
            .from('public')
            .getPublicUrl(filePath);

        // Update settings with new URL
        const updateField = type === 'logo' ? 'logo_url' : 'favicon_url';
        await this.updateSettings({ [updateField]: urlData.publicUrl });

        return { url: urlData.publicUrl };
    },
};
