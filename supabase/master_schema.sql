-- ================================================================
-- MASTER ADMIN - Platform Settings Schema
-- Execute this in Supabase SQL Editor
-- ================================================================

-- Drop existing table if needed for fresh start
DROP TABLE IF EXISTS platform_settings;

-- Main settings table (single row design)
CREATE TABLE platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    
    -- Branding
    platform_name TEXT NOT NULL DEFAULT 'MotherWorks',
    tagline TEXT DEFAULT 'Serviços domésticos de confiança',
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT DEFAULT '#14B8A6',
    secondary_color TEXT DEFAULT '#8B5CF6',
    
    -- API Keys (Note: In production, consider encrypting these)
    supabase_url TEXT,
    supabase_anon_key TEXT,
    google_maps_key TEXT,
    stripe_public_key TEXT,
    stripe_secret_key TEXT,
    twilio_sid TEXT,
    twilio_token TEXT,
    twilio_phone TEXT,
    
    -- Integration Toggles
    enable_google_oauth BOOLEAN DEFAULT true,
    enable_sms_verification BOOLEAN DEFAULT true,
    enable_whatsapp BOOLEAN DEFAULT false,
    enable_stripe BOOLEAN DEFAULT true,
    enable_email_notifications BOOLEAN DEFAULT true,
    
    -- Platform Settings
    default_currency TEXT DEFAULT 'EUR',
    default_locale TEXT DEFAULT 'pt',
    platform_fee_percent DECIMAL(5,2) DEFAULT 20.00,
    min_booking_hours INTEGER DEFAULT 2,
    max_booking_hours INTEGER DEFAULT 8,
    cancellation_window_hours INTEGER DEFAULT 24,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO platform_settings (id) VALUES ('main') ON CONFLICT (id) DO NOTHING;

-- Master admin user tracking
CREATE TABLE IF NOT EXISTS master_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_admins ENABLE ROW LEVEL SECURITY;

-- Anyone can read platform settings (for branding in UI)
CREATE POLICY "Public can read branding settings" ON platform_settings
    FOR SELECT USING (true);

-- Only master admins can update settings
CREATE POLICY "Master admins can update settings" ON platform_settings
    FOR UPDATE USING (
        auth.uid() IN (SELECT user_id FROM master_admins)
    );

-- Master admins can manage their own table
CREATE POLICY "Master admins can manage admins" ON master_admins
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM master_admins)
    );

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_platform_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS platform_settings_updated_at ON platform_settings;
CREATE TRIGGER platform_settings_updated_at
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_platform_settings_timestamp();

-- ================================================================
-- IMPORTANT: After running this, manually add yourself as master:
-- INSERT INTO master_admins (user_id, email) 
-- VALUES ('your-supabase-user-id', 'your@email.com');
-- ================================================================
