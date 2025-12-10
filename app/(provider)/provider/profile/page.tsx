"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Shield, MapPin, Trophy, Zap, CheckCircle2, AlertCircle, Clock, Settings, ChevronRight, Building2 } from "lucide-react";
import { ProviderProfile, ServiceLocationType, SERVICE_LOCATION_LABELS } from "@/types";
import { cn } from "@/lib/utils";

export default function ProviderProfilePage() {
    const { user } = useAuth();
    const { updateUser } = useStore();

    if (!user || user.role !== 'PROVIDER') return <div>Acesso negado</div>;

    const provider = user as ProviderProfile;

    const handleSubscriptionToggle = (checked: boolean) => {
        updateUser({ ...provider, acceptsSubscriptions: checked });
    };

    const handleLocationTypeToggle = (type: ServiceLocationType, checked: boolean) => {
        const currentTypes = provider.acceptedLocationTypes || [];
        const newTypes = checked
            ? [...currentTypes, type]
            : currentTypes.filter(t => t !== type);
        updateUser({ ...provider, acceptedLocationTypes: newTypes });
    };

    // Profile Score breakdown
    const scoreBreakdown = [
        { label: "Foto de Perfil", value: provider.avatarUrl ? 15 : 0, max: 15, complete: !!provider.avatarUrl },
        { label: "Biografia", value: provider.bio && provider.bio.length > 50 ? 20 : provider.bio ? 10 : 0, max: 20, complete: !!provider.bio && provider.bio.length > 50 },
        { label: "Verificação", value: provider.verifiedStatus ? 25 : 0, max: 25, complete: provider.verifiedStatus },
        { label: "Avaliações (5+)", value: provider.reviewCount >= 5 ? 20 : (provider.reviewCount * 4), max: 20, complete: provider.reviewCount >= 5 },
        { label: "Serviços (10+)", value: provider.serviceCount >= 10 ? 20 : (provider.serviceCount * 2), max: 20, complete: provider.serviceCount >= 10 },
    ];

    const calculatedScore = scoreBreakdown.reduce((acc, item) => acc + item.value, 0);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 50) return "text-amber-600";
        return "text-red-600";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return "Excelente";
        if (score >= 70) return "Muito Bom";
        if (score >= 50) return "Bom";
        return "Iniciante";
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-8">
            {/* Header Profile */}
            <div className="relative">
                <div className="h-36 bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 rounded-3xl shadow-lg shadow-purple-500/20"></div>
                <div className="absolute -bottom-12 left-6 flex items-end gap-5">
                    <img
                        src={provider.avatarUrl}
                        alt={provider.name}
                        className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl bg-white object-cover"
                    />
                    <div className="mb-2">
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            {provider.name}
                            {provider.verifiedStatus && <Shield className="h-5 w-5 text-teal-500 fill-teal-500" />}
                        </h1>
                        <p className="text-slate-500 flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" /> {provider.location?.address}
                        </p>
                    </div>
                </div>
                <div className="absolute right-6 bottom-4">
                    <Button variant="secondary" className="rounded-xl bg-white/90 hover:bg-white shadow-sm">
                        <Settings className="h-4 w-4 mr-2" /> Editar
                    </Button>
                </div>
            </div>

            <div className="pt-16 grid gap-6 md:grid-cols-3">
                {/* Left Column - Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="border-none shadow-sm bg-white">
                            <CardContent className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                                    <span className="text-2xl font-bold text-slate-900">{provider.rating}</span>
                                </div>
                                <p className="text-xs text-slate-500">{provider.reviewCount} avaliações</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-white">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">{provider.serviceCount}</div>
                                <p className="text-xs text-slate-500">Serviços</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm bg-white">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-teal-600">€{provider.hourlyRate}</div>
                                <p className="text-xs text-slate-500">Por Hora</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Score Card */}
                    <Card className="border-none shadow-md bg-white overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Score do Perfil</CardTitle>
                                <div className={cn("text-3xl font-bold", getScoreColor(calculatedScore))}>
                                    {calculatedScore}%
                                </div>
                            </div>
                            <CardDescription>
                                {getScoreLabel(calculatedScore)} - Perfis mais completos aparecem primeiro nas buscas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Progress value={calculatedScore} className="h-2" />

                            <div className="space-y-3">
                                {scoreBreakdown.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {item.complete ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <div className="h-4 w-4 rounded-full border-2 border-slate-200" />
                                            )}
                                            <span className={cn(
                                                "text-sm",
                                                item.complete ? "text-slate-900" : "text-slate-500"
                                            )}>{item.label}</span>
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            item.complete ? "text-green-600" : "text-slate-400"
                                        )}>
                                            +{item.value}/{item.max}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bio */}
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Sobre Mim</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 leading-relaxed">{provider.bio}</p>
                        </CardContent>
                    </Card>

                    {/* Subscription Toggle */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/20 rounded-xl">
                                        <Zap className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Aceitar Assinaturas</h3>
                                        <p className="text-sm text-slate-400">Receba pedidos recorrentes</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={provider.acceptsSubscriptions}
                                    onCheckedChange={handleSubscriptionToggle}
                                    className="data-[state=checked]:bg-purple-500"
                                />
                            </div>
                            {provider.acceptsSubscriptions && (
                                <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-purple-400" />
                                    <p className="text-xs text-purple-100">Seu perfil agora é exibido para clientes de assinatura!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Badges */}
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Conquistas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {provider.badges.map((badge) => (
                                    <Badge key={badge} variant="secondary" className="bg-purple-50 text-purple-700 rounded-lg py-1 px-3">
                                        {badge}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Habilidades</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {provider.skills.map((skill) => (
                                    <Badge key={skill} variant="outline" className="border-slate-200 text-slate-600 rounded-lg">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Accepted Location Types */}
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-purple-600" />
                                <CardTitle className="text-lg">Tipos de Local Aceitos</CardTitle>
                            </div>
                            <CardDescription>
                                Selecione os tipos de local onde você trabalha.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(Object.keys(SERVICE_LOCATION_LABELS) as ServiceLocationType[]).map((type) => {
                                    const isChecked = provider.acceptedLocationTypes?.includes(type) || false;
                                    return (
                                        <label
                                            key={type}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm",
                                                isChecked
                                                    ? "border-purple-500 bg-purple-50"
                                                    : "border-slate-100 bg-white hover:border-purple-200"
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => handleLocationTypeToggle(type, e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <span className={cn(
                                                "text-sm font-medium",
                                                isChecked ? "text-purple-700" : "text-slate-700"
                                            )}>
                                                {SERVICE_LOCATION_LABELS[type]}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Settings */}
                    <Card className="border-none shadow-sm bg-white">
                        <CardContent className="p-2">
                            <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <span className="text-sm font-medium text-slate-700">Raio de Atuação</span>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <span className="text-sm">{provider.serviceRadiusKm} km</span>
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </button>
                            <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <span className="text-sm font-medium text-slate-700">Preço/Hora</span>
                                <div className="flex items-center gap-2 text-slate-500">
                                    <span className="text-sm">€{provider.hourlyRate}</span>
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
