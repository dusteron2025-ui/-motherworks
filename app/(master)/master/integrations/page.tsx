"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    ToggleLeft,
    Save,
    CheckCircle,
    AlertCircle,
    Loader2,
    Mail,
    MessageSquare,
    CreditCard,
    Smartphone,
    Chrome
} from "lucide-react";
import { platformSettingsService, PlatformSettings } from "@/services/platformSettingsService";

interface Integration {
    key: keyof Pick<PlatformSettings, 'enable_google_oauth' | 'enable_sms_verification' | 'enable_whatsapp' | 'enable_stripe' | 'enable_email_notifications'>;
    name: string;
    description: string;
    icon: React.ElementType;
    requiresApi?: string;
}

const INTEGRATIONS: Integration[] = [
    {
        key: 'enable_google_oauth',
        name: 'Google OAuth',
        description: 'Login com conta Google',
        icon: Chrome,
        requiresApi: 'Supabase (configuração no dashboard)'
    },
    {
        key: 'enable_sms_verification',
        name: 'Verificação SMS',
        description: 'Verificar telefone via SMS',
        icon: Smartphone,
        requiresApi: 'Twilio'
    },
    {
        key: 'enable_whatsapp',
        name: 'WhatsApp',
        description: 'Notificações via WhatsApp',
        icon: MessageSquare,
        requiresApi: 'Twilio'
    },
    {
        key: 'enable_stripe',
        name: 'Stripe Payments',
        description: 'Processamento de pagamentos',
        icon: CreditCard,
        requiresApi: 'Stripe'
    },
    {
        key: 'enable_email_notifications',
        name: 'Email Notifications',
        description: 'Notificações por email',
        icon: Mail,
        requiresApi: 'Supabase (SMTP)'
    },
];

export default function IntegrationsPage() {
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        enable_google_oauth: true,
        enable_sms_verification: true,
        enable_whatsapp: false,
        enable_stripe: true,
        enable_email_notifications: true,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await platformSettingsService.getSettings();
        setSettings(data);
        setFormData({
            enable_google_oauth: data.enable_google_oauth,
            enable_sms_verification: data.enable_sms_verification,
            enable_whatsapp: data.enable_whatsapp,
            enable_stripe: data.enable_stripe,
            enable_email_notifications: data.enable_email_notifications,
        });
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        const result = await platformSettingsService.updateIntegrations(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Integrações atualizadas com sucesso!' });
            await loadSettings();
        } else {
            setMessage({ type: 'error', text: result.error || 'Erro ao salvar' });
        }

        setSaving(false);
    };

    const toggleIntegration = (key: keyof typeof formData) => {
        setFormData(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    const enabledCount = Object.values(formData).filter(Boolean).length;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <ToggleLeft className="h-8 w-8 text-amber-500" />
                        Integrações
                    </h1>
                    <p className="text-slate-400">
                        Ative ou desative funcionalidades da plataforma •
                        <span className="text-amber-400 ml-1">{enabledCount}/{INTEGRATIONS.length} ativas</span>
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
                >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Salvar Alterações
                </Button>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    {message.text}
                </div>
            )}

            {/* Integrations List */}
            <div className="space-y-4">
                {INTEGRATIONS.map((integration) => {
                    const Icon = integration.icon;
                    const isEnabled = formData[integration.key];

                    return (
                        <Card
                            key={integration.key}
                            className={`bg-slate-800 border-slate-700 transition-all duration-200 ${isEnabled ? 'border-l-4 border-l-green-500' : ''
                                }`}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${isEnabled ? 'bg-green-500/20' : 'bg-slate-700'
                                            }`}>
                                            <Icon className={`h-6 w-6 ${isEnabled ? 'text-green-400' : 'text-slate-400'
                                                }`} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                                                <Badge
                                                    variant="outline"
                                                    className={isEnabled
                                                        ? "border-green-500 text-green-400"
                                                        : "border-slate-600 text-slate-400"
                                                    }
                                                >
                                                    {isEnabled ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-400 text-sm">{integration.description}</p>
                                            {integration.requiresApi && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Requer: <span className="text-amber-400">{integration.requiresApi}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <Switch
                                        checked={isEnabled}
                                        onCheckedChange={() => toggleIntegration(integration.key)}
                                        className="data-[state=checked]:bg-green-500"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Info */}
            <div className="mt-8 p-4 bg-slate-800 border border-slate-700 rounded-xl">
                <p className="text-slate-400 text-sm">
                    <strong className="text-white">💡 Dica:</strong> Desativar uma integração não remove a API key configurada.
                    A funcionalidade simplesmente não será exibida ou disponibilizada para os usuários.
                </p>
            </div>
        </div>
    );
}
