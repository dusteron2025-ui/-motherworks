"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Settings,
    Percent,
    CreditCard,
    Bell,
    Shield,
    Globe,
    Save,
    Loader2,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformSettings {
    platformFeePercent: number;
    minBookingValue: number;
    maxBookingValue: number;
    cancellationPolicy: 'FLEXIBLE' | 'MODERATE' | 'STRICT';
    autoApproveProviders: boolean;
    requirePhoneVerification: boolean;
    emailNotificationsEnabled: boolean;
    smsNotificationsEnabled: boolean;
    maintenanceMode: boolean;
    defaultLanguage: string;
    supportedCurrencies: string[];
}

const defaultSettings: PlatformSettings = {
    platformFeePercent: 20,
    minBookingValue: 20,
    maxBookingValue: 1000,
    cancellationPolicy: 'MODERATE',
    autoApproveProviders: false,
    requirePhoneVerification: true,
    emailNotificationsEnabled: true,
    smsNotificationsEnabled: true,
    maintenanceMode: false,
    defaultLanguage: 'pt',
    supportedCurrencies: ['EUR', 'BRL', 'USD'],
};

export function PlatformSettingsCard() {
    const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const updateSetting = <K extends keyof PlatformSettings>(
        key: K,
        value: PlatformSettings[K]
    ) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Fees & Pricing */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Percent className="h-5 w-5 text-emerald-600" />
                        Taxas e Preços
                    </CardTitle>
                    <CardDescription>Configure as taxas da plataforma</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="platformFee">Taxa da Plataforma (%)</Label>
                            <Input
                                id="platformFee"
                                type="number"
                                value={settings.platformFeePercent}
                                onChange={(e) => updateSetting('platformFeePercent', Number(e.target.value))}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minValue">Valor Mínimo (€)</Label>
                            <Input
                                id="minValue"
                                type="number"
                                value={settings.minBookingValue}
                                onChange={(e) => updateSetting('minBookingValue', Number(e.target.value))}
                                className="rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxValue">Valor Máximo (€)</Label>
                            <Input
                                id="maxValue"
                                type="number"
                                value={settings.maxBookingValue}
                                onChange={(e) => updateSetting('maxBookingValue', Number(e.target.value))}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Booking Policies */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                        Políticas de Reserva
                    </CardTitle>
                    <CardDescription>Configure políticas de cancelamento e aprovação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Política de Cancelamento Padrão</Label>
                        <Select
                            value={settings.cancellationPolicy}
                            onValueChange={(v) => updateSetting('cancellationPolicy', v as any)}
                        >
                            <SelectTrigger className="rounded-xl w-full md:w-64">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FLEXIBLE">Flexível (até 24h)</SelectItem>
                                <SelectItem value="MODERATE">Moderada (até 48h)</SelectItem>
                                <SelectItem value="STRICT">Rigorosa (até 72h)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Aprovação Automática de Provedores</Label>
                            <p className="text-sm text-slate-500">Aprovar novos provedores automaticamente</p>
                        </div>
                        <Switch
                            checked={settings.autoApproveProviders}
                            onCheckedChange={(v) => updateSetting('autoApproveProviders', v)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Verificação de Telefone Obrigatória</Label>
                            <p className="text-sm text-slate-500">Exigir verificação por SMS</p>
                        </div>
                        <Switch
                            checked={settings.requirePhoneVerification}
                            onCheckedChange={(v) => updateSetting('requirePhoneVerification', v)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-600" />
                        Notificações
                    </CardTitle>
                    <CardDescription>Configure canais de comunicação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Notificações por Email</Label>
                            <p className="text-sm text-slate-500">Enviar emails transacionais</p>
                        </div>
                        <Switch
                            checked={settings.emailNotificationsEnabled}
                            onCheckedChange={(v) => updateSetting('emailNotificationsEnabled', v)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Notificações por SMS</Label>
                            <p className="text-sm text-slate-500">Enviar SMS via Twilio</p>
                        </div>
                        <Switch
                            checked={settings.smsNotificationsEnabled}
                            onCheckedChange={(v) => updateSetting('smsNotificationsEnabled', v)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* System */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        Sistema
                    </CardTitle>
                    <CardDescription>Configurações avançadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Modo Manutenção</Label>
                            <p className="text-sm text-slate-500">Desativar acesso público temporariamente</p>
                        </div>
                        <Switch
                            checked={settings.maintenanceMode}
                            onCheckedChange={(v) => updateSetting('maintenanceMode', v)}
                        />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label>Idioma Padrão</Label>
                        <Select
                            value={settings.defaultLanguage}
                            onValueChange={(v) => updateSetting('defaultLanguage', v)}
                        >
                            <SelectTrigger className="rounded-xl w-full md:w-64">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pt">Português</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className={cn(
                        "rounded-xl px-8",
                        saved ? "bg-green-600 hover:bg-green-600" : "bg-slate-900 hover:bg-slate-800"
                    )}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : saved ? (
                        <Check className="h-4 w-4 mr-2" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {saved ? 'Salvo!' : 'Salvar Configurações'}
                </Button>
            </div>
        </div>
    );
}
