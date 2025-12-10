"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Key,
    Palette,
    ToggleLeft,
    Activity,
    CheckCircle,
    XCircle,
    RefreshCw,
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import { platformSettingsService, PlatformSettings } from "@/services/platformSettingsService";

export default function MasterDashboard() {
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await platformSettingsService.getSettings();
        setSettings(data);
        setLoading(false);
    };

    const apiKeys = settings ? [
        { name: 'Supabase', configured: !!settings.supabase_url },
        { name: 'Google Maps', configured: !!settings.google_maps_key },
        { name: 'Stripe', configured: !!settings.stripe_public_key },
        { name: 'Twilio', configured: !!settings.twilio_sid },
    ] : [];

    const integrations = settings ? [
        { name: 'Google OAuth', enabled: settings.enable_google_oauth },
        { name: 'SMS Verification', enabled: settings.enable_sms_verification },
        { name: 'WhatsApp', enabled: settings.enable_whatsapp },
        { name: 'Stripe Payments', enabled: settings.enable_stripe },
        { name: 'Email Notifications', enabled: settings.enable_email_notifications },
    ] : [];

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard Master</h1>
                <p className="text-slate-400">Gerencie as configurações da sua plataforma</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Branding Card */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Branding</CardTitle>
                        <Palette className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-2">{settings?.platform_name}</div>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-full border-2 border-slate-600"
                                style={{ backgroundColor: settings?.primary_color }}
                            />
                            <div
                                className="w-6 h-6 rounded-full border-2 border-slate-600"
                                style={{ backgroundColor: settings?.secondary_color }}
                            />
                            <span className="text-xs text-slate-400 ml-2">Cores da marca</span>
                        </div>
                        <Link href="/master/branding">
                            <Button variant="outline" size="sm" className="mt-4 w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                                Configurar <ExternalLink className="ml-2 h-3 w-3" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* APIs Card */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">API Keys</CardTitle>
                        <Key className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-2">
                            {apiKeys.filter(a => a.configured).length}/{apiKeys.length}
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {apiKeys.map((api) => (
                                <Badge
                                    key={api.name}
                                    variant={api.configured ? "default" : "secondary"}
                                    className={api.configured ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"}
                                >
                                    {api.name}
                                </Badge>
                            ))}
                        </div>
                        <Link href="/master/apis">
                            <Button variant="outline" size="sm" className="mt-4 w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                                Configurar <ExternalLink className="ml-2 h-3 w-3" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Integrations Card */}
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Integrações</CardTitle>
                        <ToggleLeft className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white mb-2">
                            {integrations.filter(i => i.enabled).length}/{integrations.length}
                        </div>
                        <div className="space-y-1">
                            {integrations.slice(0, 3).map((integration) => (
                                <div key={integration.name} className="flex items-center gap-2 text-xs">
                                    {integration.enabled ? (
                                        <CheckCircle className="h-3 w-3 text-green-400" />
                                    ) : (
                                        <XCircle className="h-3 w-3 text-slate-500" />
                                    )}
                                    <span className={integration.enabled ? "text-slate-300" : "text-slate-500"}>
                                        {integration.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Link href="/master/integrations">
                            <Button variant="outline" size="sm" className="mt-4 w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                                Configurar <ExternalLink className="ml-2 h-3 w-3" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Platform Info */}
            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-amber-500" />
                        Configurações da Plataforma
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-700/50 p-4 rounded-xl">
                            <p className="text-xs text-slate-400 mb-1">Moeda</p>
                            <p className="text-lg font-bold text-white">{settings?.default_currency}</p>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-xl">
                            <p className="text-xs text-slate-400 mb-1">Taxa da Plataforma</p>
                            <p className="text-lg font-bold text-white">{settings?.platform_fee_percent}%</p>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-xl">
                            <p className="text-xs text-slate-400 mb-1">Idioma Padrão</p>
                            <p className="text-lg font-bold text-white uppercase">{settings?.default_locale}</p>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-xl">
                            <p className="text-xs text-slate-400 mb-1">Última Atualização</p>
                            <p className="text-sm font-medium text-white">
                                {settings?.updated_at ? new Date(settings.updated_at).toLocaleDateString('pt-BR') : '-'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
