"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Settings,
    DollarSign,
    Bell,
    Shield,
    Globe,
    Palette,
    Mail,
    Save,
    Loader2,
    Check,
    Building,
    Percent,
    Clock,
    MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [savedTab, setSavedTab] = useState<string | null>(null);

    // Platform Settings State
    const [platformSettings, setPlatformSettings] = useState({
        platformName: "MotherWorks",
        supportEmail: "suporte@motherworks.pt",
        supportPhone: "+351 912 345 678",
        defaultCurrency: "EUR",
        defaultLanguage: "pt-PT",
        timezone: "Europe/Lisbon",
    });

    // Fee Settings State
    const [feeSettings, setFeeSettings] = useState({
        platformFee: 20,
        minimumPayout: 50,
        payoutFrequency: "weekly",
        instantPayoutFee: 1.5,
    });

    // Notification Settings State
    const [notificationSettings, setNotificationSettings] = useState({
        emailNewBooking: true,
        emailBookingComplete: true,
        emailPayoutProcessed: true,
        pushNotifications: true,
        smsNotifications: false,
        marketingEmails: true,
    });

    // Security Settings State
    const [securitySettings, setSecuritySettings] = useState({
        requireEmailVerification: true,
        requirePhoneVerification: false,
        twoFactorAuth: false,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
    });

    // Service Area Settings State
    const [areaSettings, setAreaSettings] = useState({
        defaultRadius: 20,
        maxRadius: 50,
        coveredCities: ["Lisboa", "Porto", "Braga", "Coimbra"],
    });

    const handleSave = async (tab: string) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
        setIsSaving(false);
        setSavedTab(tab);
        setTimeout(() => setSavedTab(null), 2000);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
                    <p className="text-slate-500">Gerencie as configurações da plataforma</p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="platform" className="space-y-6">
                <TabsList className="bg-white shadow-sm rounded-2xl p-1.5 h-auto flex-wrap gap-1">
                    <TabsTrigger value="platform" className="rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
                        <Building className="w-4 h-4 mr-2" /> Plataforma
                    </TabsTrigger>
                    <TabsTrigger value="fees" className="rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
                        <Percent className="w-4 h-4 mr-2" /> Taxas
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
                        <Bell className="w-4 h-4 mr-2" /> Notificações
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
                        <Shield className="w-4 h-4 mr-2" /> Segurança
                    </TabsTrigger>
                    <TabsTrigger value="areas" className="rounded-xl data-[state=active]:shadow-sm px-4 py-2.5">
                        <MapPin className="w-4 h-4 mr-2" /> Áreas
                    </TabsTrigger>
                </TabsList>

                {/* Platform Settings */}
                <TabsContent value="platform">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="w-5 h-5 text-slate-600" />
                                Configurações da Plataforma
                            </CardTitle>
                            <CardDescription>Informações básicas e regionalização</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Nome da Plataforma</Label>
                                    <Input
                                        value={platformSettings.platformName}
                                        onChange={(e) => setPlatformSettings({ ...platformSettings, platformName: e.target.value })}
                                        className="h-11 bg-slate-50 border-none rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email de Suporte</Label>
                                    <Input
                                        type="email"
                                        value={platformSettings.supportEmail}
                                        onChange={(e) => setPlatformSettings({ ...platformSettings, supportEmail: e.target.value })}
                                        className="h-11 bg-slate-50 border-none rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefone de Suporte</Label>
                                    <Input
                                        value={platformSettings.supportPhone}
                                        onChange={(e) => setPlatformSettings({ ...platformSettings, supportPhone: e.target.value })}
                                        className="h-11 bg-slate-50 border-none rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Moeda Padrão</Label>
                                    <Input
                                        value={platformSettings.defaultCurrency}
                                        onChange={(e) => setPlatformSettings({ ...platformSettings, defaultCurrency: e.target.value })}
                                        className="h-11 bg-slate-50 border-none rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Idioma Padrão</Label>
                                    <Input
                                        value={platformSettings.defaultLanguage}
                                        onChange={(e) => setPlatformSettings({ ...platformSettings, defaultLanguage: e.target.value })}
                                        className="h-11 bg-slate-50 border-none rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fuso Horário</Label>
                                    <Input
                                        value={platformSettings.timezone}
                                        onChange={(e) => setPlatformSettings({ ...platformSettings, timezone: e.target.value })}
                                        className="h-11 bg-slate-50 border-none rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={() => handleSave("platform")}
                                    disabled={isSaving}
                                    className="rounded-xl bg-slate-900 hover:bg-slate-800"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
                                        savedTab === "platform" ? <Check className="w-4 h-4 mr-2" /> :
                                            <Save className="w-4 h-4 mr-2" />}
                                    {savedTab === "platform" ? "Salvo!" : "Salvar Alterações"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Fee Settings */}
                <TabsContent value="fees">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-slate-600" />
                                Taxas e Pagamentos
                            </CardTitle>
                            <CardDescription>Configure taxas da plataforma e regras de pagamento</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Taxa da Plataforma (%)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={feeSettings.platformFee}
                                            onChange={(e) => setFeeSettings({ ...feeSettings, platformFee: Number(e.target.value) })}
                                            className="h-11 bg-slate-50 border-none rounded-xl pr-8"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Porcentagem retida de cada serviço</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Valor Mínimo para Saque (€)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                                        <Input
                                            type="number"
                                            value={feeSettings.minimumPayout}
                                            onChange={(e) => setFeeSettings({ ...feeSettings, minimumPayout: Number(e.target.value) })}
                                            className="h-11 bg-slate-50 border-none rounded-xl pl-8"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Frequência de Pagamento</Label>
                                    <select
                                        value={feeSettings.payoutFrequency}
                                        onChange={(e) => setFeeSettings({ ...feeSettings, payoutFrequency: e.target.value })}
                                        className="w-full h-11 bg-slate-50 border-none rounded-xl px-3 text-sm"
                                    >
                                        <option value="daily">Diário</option>
                                        <option value="weekly">Semanal</option>
                                        <option value="biweekly">Quinzenal</option>
                                        <option value="monthly">Mensal</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Taxa de Saque Instantâneo (%)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={feeSettings.instantPayoutFee}
                                            onChange={(e) => setFeeSettings({ ...feeSettings, instantPayoutFee: Number(e.target.value) })}
                                            className="h-11 bg-slate-50 border-none rounded-xl pr-8"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                <p className="text-sm text-amber-800">
                                    <strong>💰 Resumo:</strong> A plataforma retém {feeSettings.platformFee}% de cada serviço.
                                    Provedoras podem sacar a partir de €{feeSettings.minimumPayout}, com pagamentos {feeSettings.payoutFrequency === "weekly" ? "semanais" : "processados conforme configurado"}.
                                </p>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={() => handleSave("fees")}
                                    disabled={isSaving}
                                    className="rounded-xl bg-slate-900 hover:bg-slate-800"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
                                        savedTab === "fees" ? <Check className="w-4 h-4 mr-2" /> :
                                            <Save className="w-4 h-4 mr-2" />}
                                    {savedTab === "fees" ? "Salvo!" : "Salvar Alterações"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-slate-600" />
                                Notificações
                            </CardTitle>
                            <CardDescription>Configure notificações por email, push e SMS</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {[
                                    { key: "emailNewBooking", label: "Email de Nova Reserva", desc: "Enviar email quando um novo serviço for agendado" },
                                    { key: "emailBookingComplete", label: "Email de Serviço Concluído", desc: "Enviar email quando um serviço for finalizado" },
                                    { key: "emailPayoutProcessed", label: "Email de Pagamento", desc: "Notificar sobre pagamentos processados" },
                                    { key: "pushNotifications", label: "Notificações Push", desc: "Permitir notificações push no navegador" },
                                    { key: "smsNotifications", label: "Notificações SMS", desc: "Enviar SMS para alertas importantes" },
                                    { key: "marketingEmails", label: "Emails de Marketing", desc: "Enviar promoções e novidades" },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="font-medium text-slate-900">{item.label}</p>
                                            <p className="text-sm text-slate-500">{item.desc}</p>
                                        </div>
                                        <Switch
                                            checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, [item.key]: checked })}
                                            className="data-[state=checked]:bg-slate-900"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={() => handleSave("notifications")}
                                    disabled={isSaving}
                                    className="rounded-xl bg-slate-900 hover:bg-slate-800"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
                                        savedTab === "notifications" ? <Check className="w-4 h-4 mr-2" /> :
                                            <Save className="w-4 h-4 mr-2" />}
                                    {savedTab === "notifications" ? "Salvo!" : "Salvar Alterações"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-slate-600" />
                                Segurança
                            </CardTitle>
                            <CardDescription>Configure políticas de segurança e autenticação</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {[
                                    { key: "requireEmailVerification", label: "Verificação de Email", desc: "Exigir verificação de email para novos cadastros" },
                                    { key: "requirePhoneVerification", label: "Verificação de Telefone", desc: "Exigir verificação de telefone (SMS)" },
                                    { key: "twoFactorAuth", label: "Autenticação 2 Fatores", desc: "Habilitar 2FA para administradores" },
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <div>
                                            <p className="font-medium text-slate-900">{item.label}</p>
                                            <p className="text-sm text-slate-500">{item.desc}</p>
                                        </div>
                                        <Switch
                                            checked={securitySettings[item.key as keyof typeof securitySettings] as boolean}
                                            onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, [item.key]: checked })}
                                            className="data-[state=checked]:bg-slate-900"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Timeout de Sessão (minutos)</Label>
                                    <Input
                                        type="number"
                                        value={securitySettings.sessionTimeout}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: Number(e.target.value) })}
                                        className="h-11 bg-slate-50 border-none rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Máximo de Tentativas de Login</Label>
                                    <Input
                                        type="number"
                                        value={securitySettings.maxLoginAttempts}
                                        onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: Number(e.target.value) })}
                                        className="h-11 bg-slate-50 border-none rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={() => handleSave("security")}
                                    disabled={isSaving}
                                    className="rounded-xl bg-slate-900 hover:bg-slate-800"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
                                        savedTab === "security" ? <Check className="w-4 h-4 mr-2" /> :
                                            <Save className="w-4 h-4 mr-2" />}
                                    {savedTab === "security" ? "Salvo!" : "Salvar Alterações"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Area Settings */}
                <TabsContent value="areas">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-slate-600" />
                                Áreas de Cobertura
                            </CardTitle>
                            <CardDescription>Configure as áreas onde a plataforma opera</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Raio Padrão de Busca (km)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={areaSettings.defaultRadius}
                                            onChange={(e) => setAreaSettings({ ...areaSettings, defaultRadius: Number(e.target.value) })}
                                            className="h-11 bg-slate-50 border-none rounded-xl pr-12"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">km</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Raio Máximo (km)</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={areaSettings.maxRadius}
                                            onChange={(e) => setAreaSettings({ ...areaSettings, maxRadius: Number(e.target.value) })}
                                            className="h-11 bg-slate-50 border-none rounded-xl pr-12"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">km</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Cidades Cobertas</Label>
                                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl">
                                    {areaSettings.coveredCities.map((city) => (
                                        <Badge key={city} variant="secondary" className="bg-white text-slate-700 rounded-lg px-3 py-1">
                                            {city}
                                            <button
                                                className="ml-2 text-slate-400 hover:text-red-500"
                                                onClick={() => setAreaSettings({
                                                    ...areaSettings,
                                                    coveredCities: areaSettings.coveredCities.filter(c => c !== city)
                                                })}
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                    <button className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 border border-dashed border-slate-300 rounded-lg hover:bg-white transition-colors">
                                        + Adicionar cidade
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={() => handleSave("areas")}
                                    disabled={isSaving}
                                    className="rounded-xl bg-slate-900 hover:bg-slate-800"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
                                        savedTab === "areas" ? <Check className="w-4 h-4 mr-2" /> :
                                            <Save className="w-4 h-4 mr-2" />}
                                    {savedTab === "areas" ? "Salvo!" : "Salvar Alterações"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
