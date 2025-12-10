import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { PlatformProvider } from "@/contexts/PlatformContext";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { DynamicHead } from "@/components/DynamicHead";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

// Default metadata (will be enhanced by DynamicHead component)
export const metadata: Metadata = {
  title: {
    default: "MotherWorks",
    template: "%s | MotherWorks",
  },
  description: "Serviços domésticos de confiança - Conectando famílias a profissionais qualificados",
  manifest: "/api/manifest", // Dynamic manifest from API
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MotherWorks",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "MotherWorks",
    title: "MotherWorks",
    description: "Serviços domésticos de confiança",
  },
  twitter: {
    card: "summary_large_image",
    title: "MotherWorks",
    description: "Serviços domésticos de confiança",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#14b8a6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Static fallback icons - will be overridden by DynamicHead when settings load */}
        <link rel="icon" href="/icons/icon-72x72.png" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <StoreProvider>
          <AuthProvider>
            <PlatformProvider>
              <I18nProvider>
                {/* Dynamic head for branding from Master Admin */}
                <DynamicHead />
                {children}
                <PWAInstallPrompt />
              </I18nProvider>
            </PlatformProvider>
          </AuthProvider>
        </StoreProvider>

        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('[PWA] Service Worker registered:', registration.scope);
                  })
                  .catch(function(error) {
                    console.log('[PWA] Service Worker registration failed:', error);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
