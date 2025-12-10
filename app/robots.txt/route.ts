import { NextResponse } from 'next/server';

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://motherworks.com';

    const robots = `# Robots.txt for MotherWorks
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/*
Disallow: /master/*
Disallow: /api/*
Disallow: /provider/wallet
Disallow: /client/settings

# Allow search engines to index main pages
Allow: /
Allow: /login
Allow: /signup
Allow: /about
`;

    return new NextResponse(robots, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
    });
}
