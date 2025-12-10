"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Key,
    Eye,
    EyeOff,
    Save,
    CheckCircle,
    AlertCircle,
    Loader2
} from "lucide-react";
import { platformSettingsService, PlatformSettings } from "@/services/platformSettingsService";

export default function ApisPage() {
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        supabase_url: '',
        supabase_anon_key: '',
        google_maps_key: '',
        stripe_public_key: '',
        stripe_secret_key: '',
        twilio_sid: '',
        twilio_token: '',
        twilio_phone: '',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await platformSettingsService.getSettings();
        setSettings(data);
        setFormData({
            supabase_url: data.supabase_url || '',
            supabase_anon_key: data.supabase_anon_key || '',
            google_maps_key: data.google_maps_key || '',
            stripe_public_key: data.stripe_public_key || '',
            stripe_secret_key: data.stripe_secret_key || '',
            twilio_sid: data.twilio_sid || '',
            twilio_token: data.twilio_token || '',
            twilio_phone: data.twilio_phone || '',
        });
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        const result = await platformSettingsService.updateApiKeys(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'API Keys atualizadas com sucesso!' });
            await loadSettings();
        } else {
            setMessage({ type: 'error', text: result.error || 'Erro ao salvar' });
        }

        setSaving(false);
    };

    const toggleSecret = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const maskValue = (value: string) => {
        if (!value || value.length < 8) return value;
        return value.slice(0, 4) + '•'.repeat(value.length - 8) + value.slice(-4);
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    const apiGroups = [
        {
            title: 'Supabase',
            description: 'Banco de dados e autenticação',
            fields: [
                { key: 'supabase_url', label: 'Project URL', secret: false },
                { key: 'supabase_anon_key', label: 'Anon Key', secret: true },
            ]
        },
        {
            title: 'Google Maps',
            description: 'Mapas e geolocalização',
            fields: [
                { key: 'google_maps_key', label: 'API Key', secret: true },
            ]
        },
        {
            title: 'Stripe',
            description: 'Processamento de pagamentos',
            fields: [
                { key: 'stripe_public_key', label: 'Publishable Key', secret: false },
                { key: 'stripe_secret_key', label: 'Secret Key', secret: true },
            ]
        },
        {
            title: 'Twilio',
            description: 'SMS e WhatsApp',
            fields: [
                { key: 'twilio_sid', label: 'Account SID', secret: false },
                { key: 'twilio_token', label: 'Auth Token', secret: true },
                { key: 'twilio_phone', label: 'Phone Number', secret: false },
            ]
        },
    ];

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Key className="h-8 w-8 text-amber-500" />
                        API Keys
                    </h1>
                    <p className="text-slate-400">Configure as chaves de API das integrações</p>
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

            {/* API Groups */}
            <div className="space-y-6">
                {apiGroups.map((group) => (
                    <Card key={group.title} className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-white">{group.title}</CardTitle>
                                    <CardDescription className="text-slate-400">{group.description}</CardDescription>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={
                                        group.fields.every(f => formData[f.key as keyof typeof formData])
                                            ? "border-green-500 text-green-400"
                                            : "border-slate-600 text-slate-400"
                                    }
                                >
                                    {group.fields.every(f => formData[f.key as keyof typeof formData]) ? 'Configurado' : 'Pendente'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {group.fields.map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <Label className="text-slate-300">{field.label}</Label>
                                    <div className="relative">
                                        <Input
                                            type={field.secret && !showSecrets[field.key] ? 'password' : 'text'}
                                            value={formData[field.key as keyof typeof formData]}
                                            onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            placeholder={`Digite ${field.label}`}
                                            className="bg-slate-700 border-slate-600 text-white pr-10"
                                        />
                                        {field.secret && (
                                            <button
                                                type="button"
                                                onClick={() => toggleSecret(field.key)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                            >
                                                {showSecrets[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Warning */}
            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <p className="text-amber-400 text-sm">
                    <strong>⚠️ Importante:</strong> As chaves de API são sensíveis. Nunca compartilhe com terceiros.
                    Algumas alterações podem requerer redeploy da aplicação para terem efeito.
                </p>
            </div>
        </div>
    );
}
