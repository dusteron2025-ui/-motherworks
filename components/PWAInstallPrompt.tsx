"use client";

import { useState, useEffect } from "react";
import { X, Smartphone } from "lucide-react";
import { useBranding } from "@/contexts/PlatformContext";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
    const branding = useBranding();
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if dismissed in this session
        const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
        if (dismissed === 'true') {
            return;
        }

        // Listen for the beforeinstallprompt event
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show banner immediately when prompt is available
            setShowBanner(true);
        };

        // Listen for app installed event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowBanner(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        // For browsers that don't fire beforeinstallprompt (iOS Safari), 
        // show the banner anyway after a delay to inform about PWA
        const timer = setTimeout(() => {
            if (!deferredPrompt && !isInstalled) {
                // Check if it's iOS
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                if (isIOS) {
                    setShowBanner(true);
                }
            }
        }, 3000);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
            clearTimeout(timer);
        };
    }, [deferredPrompt, isInstalled]);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            // iOS - show instructions
            alert(`Para instalar o ${branding.name} no iOS:\n1. Toque no ícone de compartilhar\n2. Selecione "Adicionar à Tela de Início"`);
            return;
        }

        setIsInstalling(true);

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setIsInstalled(true);
                setShowBanner(false);
            }
        } catch (error) {
            console.error('Install error:', error);
        } finally {
            setIsInstalling(false);
            setDeferredPrompt(null);
        }
    };

    const handleDismiss = () => {
        setShowBanner(false);
        // Only dismiss for this session
        sessionStorage.setItem('pwa_banner_dismissed', 'true');
    };

    // Don't render if installed or banner hidden
    if (isInstalled || !showBanner) {
        return null;
    }

    return (
        <div className="fixed bottom-16 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-500 md:left-auto md:right-4 md:max-w-sm">
            <div
                className="rounded-2xl shadow-2xl overflow-hidden"
                style={{
                    background: `linear-gradient(to right, ${branding.primaryColor}, ${branding.primaryColor}dd)`,
                    boxShadow: `0 25px 50px -12px ${branding.primaryColor}40`
                }}
            >
                <div className="flex items-center gap-3 p-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                        {branding.logo ? (
                            <img src={branding.logo} alt={branding.name} className="w-8 h-8 object-contain" />
                        ) : (
                            <Smartphone className="w-6 h-6 text-white" />
                        )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm">Instalar {branding.name}</p>
                        <p className="text-white/80 text-xs truncate">Acesso rápido na tela inicial</p>
                    </div>

                    {/* Install Button */}
                    <button
                        onClick={handleInstall}
                        disabled={isInstalling}
                        className="flex-shrink-0 bg-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50"
                        style={{ color: branding.primaryColor }}
                    >
                        {isInstalling ? (
                            <div
                                className="w-5 h-5 border-2 border-opacity-30 rounded-full animate-spin"
                                style={{
                                    borderColor: `${branding.primaryColor}30`,
                                    borderTopColor: branding.primaryColor
                                }}
                            />
                        ) : (
                            'Instalar'
                        )}
                    </button>

                    {/* Close Button */}
                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
