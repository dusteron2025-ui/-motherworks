"use client";

import { useEffect } from "react";
import { usePlatform } from "@/contexts/PlatformContext";

export function DynamicHead() {
    const { settings } = usePlatform();

    useEffect(() => {
        if (!settings) return;

        // Update document title
        if (settings.platform_name) {
            document.title = settings.platform_name;
        }

        // Update favicon dynamically
        if (settings.favicon_url) {
            const existingFavicon = document.querySelector('link[rel="icon"]');
            if (existingFavicon) {
                existingFavicon.setAttribute('href', settings.favicon_url);
            } else {
                const favicon = document.createElement('link');
                favicon.rel = 'icon';
                favicon.href = settings.favicon_url;
                document.head.appendChild(favicon);
            }

            // Update apple-touch-icon
            const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
            if (appleIcon) {
                appleIcon.setAttribute('href', settings.logo_url || settings.favicon_url);
            }
        }

        // Update theme color
        if (settings.primary_color) {
            const themeColor = document.querySelector('meta[name="theme-color"]');
            if (themeColor) {
                themeColor.setAttribute('content', settings.primary_color);
            } else {
                const meta = document.createElement('meta');
                meta.name = 'theme-color';
                meta.content = settings.primary_color;
                document.head.appendChild(meta);
            }

            // Apply CSS custom property for dynamic theming
            document.documentElement.style.setProperty('--color-primary', settings.primary_color);
        }

        if (settings.secondary_color) {
            document.documentElement.style.setProperty('--color-secondary', settings.secondary_color);
        }

        // Update apple-mobile-web-app-title
        if (settings.platform_name) {
            const appTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
            if (appTitle) {
                appTitle.setAttribute('content', settings.platform_name);
            } else {
                const meta = document.createElement('meta');
                meta.name = 'apple-mobile-web-app-title';
                meta.content = settings.platform_name;
                document.head.appendChild(meta);
            }
        }

        // Update description meta tag
        if (settings.tagline) {
            const description = document.querySelector('meta[name="description"]');
            if (description) {
                description.setAttribute('content', settings.tagline);
            }
        }

    }, [settings]);

    // This component doesn't render anything visible
    return null;
}
