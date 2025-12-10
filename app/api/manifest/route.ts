import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
    try {
        // Fetch platform settings from Supabase
        const { data: settings } = await supabase
            .from('platform_settings')
            .select('*')
            .eq('id', 'main')
            .maybeSingle();

        // Default values if no settings found
        const platformName = settings?.platform_name || 'MotherWorks';
        const tagline = settings?.tagline || 'Serviços domésticos de confiança';
        const primaryColor = settings?.primary_color || '#14b8a6';
        const logoUrl = settings?.logo_url || '/icons/icon-512x512.png';

        const manifest = {
            name: platformName,
            short_name: platformName,
            description: tagline,
            start_url: '/',
            display: 'standalone',
            background_color: '#0f172a',
            theme_color: primaryColor,
            orientation: 'portrait-primary',
            scope: '/',
            lang: 'pt-BR',
            categories: ['lifestyle', 'utilities', 'business'],
            icons: [
                {
                    src: settings?.favicon_url || '/icons/icon-72x72.png',
                    sizes: '72x72',
                    type: 'image/png',
                    purpose: 'maskable any'
                },
                {
                    src: settings?.favicon_url || '/icons/icon-96x96.png',
                    sizes: '96x96',
                    type: 'image/png',
                    purpose: 'maskable any'
                },
                {
                    src: settings?.favicon_url || '/icons/icon-128x128.png',
                    sizes: '128x128',
                    type: 'image/png',
                    purpose: 'maskable any'
                },
                {
                    src: settings?.favicon_url || '/icons/icon-144x144.png',
                    sizes: '144x144',
                    type: 'image/png',
                    purpose: 'maskable any'
                },
                {
                    src: settings?.favicon_url || '/icons/icon-152x152.png',
                    sizes: '152x152',
                    type: 'image/png',
                    purpose: 'maskable any'
                },
                {
                    src: logoUrl || '/icons/icon-192x192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'maskable any'
                },
                {
                    src: logoUrl || '/icons/icon-384x384.png',
                    sizes: '384x384',
                    type: 'image/png',
                    purpose: 'maskable any'
                },
                {
                    src: logoUrl || '/icons/icon-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable any'
                }
            ],
            shortcuts: [
                {
                    name: 'Agendar Serviço',
                    short_name: 'Agendar',
                    description: 'Agendar um novo serviço',
                    url: '/client/book',
                    icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
                },
                {
                    name: 'Meus Agendamentos',
                    short_name: 'Agenda',
                    description: 'Ver seus agendamentos',
                    url: '/client/bookings',
                    icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
                }
            ],
            related_applications: [],
            prefer_related_applications: false
        };

        return NextResponse.json(manifest, {
            headers: {
                'Content-Type': 'application/manifest+json',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
        });
    } catch (error) {
        console.error('Error generating manifest:', error);

        // Return default manifest on error
        return NextResponse.json({
            name: 'MotherWorks',
            short_name: 'MotherWorks',
            description: 'Serviços domésticos de confiança',
            start_url: '/',
            display: 'standalone',
            background_color: '#0f172a',
            theme_color: '#14b8a6',
            icons: [
                { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
            ]
        }, {
            headers: { 'Content-Type': 'application/manifest+json' },
        });
    }
}
