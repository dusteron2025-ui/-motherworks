"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Shield, Shirt, Box, Check, DollarSign, Loader2, Save } from "lucide-react";
import { ProviderProfile } from "@/types";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
    'Sparkles': Sparkles,
    'Shield': Shield,
    'Shirt': Shirt,
    'Box': Box,
};

export default function ProviderServicesPage() {
    const { user } = useAuth();
    const { services, updateUser } = useStore();
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

    if (!user || user.role !== 'PROVIDER') return <div>Acesso negado</div>;

    const provider = user as ProviderProfile;
    const offeredServices = provider.offeredServices || [];

    const handleToggleService = async (serviceId: string) => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 300));

        const updatedServices = offeredServices.includes(serviceId)
            ? offeredServices.filter(id => id !== serviceId)
            : [...offeredServices, serviceId];

        updateUser({ ...provider, offeredServices: updatedServices });
        setIsSaving(false);
    };

    const handlePriceChange = (serviceId: string, price: number) => {
        setCustomPrices(prev => ({ ...prev, [serviceId]: price }));
        setHasChanges(true);
        setSaved(false);
    };

    const getServicePrice = (serviceId: string, basePrice: number) => {
        return customPrices[serviceId] ?? provider.hourlyRate ?? basePrice;
    };

    const isServiceEnabled = (serviceId: string) => offeredServices.includes(serviceId);

    const handleSaveAll = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        // In production: save customPrices to backend
        console.log("Saving prices:", customPrices);
        setIsSaving(false);
        setSaved(true);
        setHasChanges(false);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-24">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Meus Serviços</h1>
                <p className="text-slate-500">Escolha quais serviços você deseja oferecer e defina seus preços.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{offeredServices.length}</p>
                            <p className="text-sm text-slate-500">Serviços ativos</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-teal-100 rounded-xl">
                            <DollarSign className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">€{provider.hourlyRate}</p>
                            <p className="text-sm text-slate-500">Preço padrão/hora</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Services List */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Serviços Disponíveis</h2>

                {services.map((service) => {
                    const IconComponent = iconMap[service.icon] || Sparkles;
                    const isEnabled = isServiceEnabled(service.id);
                    const price = getServicePrice(service.id, service.basePrice);

                    return (
                        <Card
                            key={service.id}
                            className={cn(
                                "border-2 transition-all duration-200",
                                isEnabled
                                    ? "border-purple-200 bg-purple-50/50 shadow-md"
                                    : "border-slate-100 bg-white shadow-sm"
                            )}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={cn(
                                        "p-3 rounded-xl transition-colors",
                                        isEnabled ? "bg-purple-100" : "bg-slate-100"
                                    )}>
                                        <IconComponent className={cn(
                                            "h-6 w-6",
                                            isEnabled ? "text-purple-600" : "text-slate-400"
                                        )} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className={cn(
                                                    "font-bold",
                                                    isEnabled ? "text-slate-900" : "text-slate-600"
                                                )}>{service.name}</h3>
                                                {isEnabled && (
                                                    <Badge className="bg-green-100 text-green-700 border-none">
                                                        <Check className="w-3 h-3 mr-1" /> Ativo
                                                    </Badge>
                                                )}
                                            </div>
                                            <Switch
                                                checked={isEnabled}
                                                onCheckedChange={() => handleToggleService(service.id)}
                                                disabled={isSaving}
                                                className="data-[state=checked]:bg-purple-500"
                                            />
                                        </div>
                                        <p className="text-sm text-slate-500 mb-3">{service.description}</p>

                                        {isEnabled && (
                                            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                                                <Label htmlFor={`price-${service.id}`} className="text-sm font-medium text-slate-600 whitespace-nowrap">
                                                    Seu preço:
                                                </Label>
                                                <div className="relative flex-1 max-w-[120px]">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                                                    <Input
                                                        id={`price-${service.id}`}
                                                        type="number"
                                                        value={price}
                                                        onChange={(e) => handlePriceChange(service.id, Number(e.target.value))}
                                                        className="pl-7 h-9 bg-slate-50 border-none rounded-lg text-right"
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-400">/hora</span>
                                                <Badge variant="outline" className="text-xs border-slate-200 text-slate-500 ml-auto">
                                                    Base: €{service.basePrice}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Tips */}
            <Card className="border-none shadow-sm bg-gradient-to-r from-purple-50 to-teal-50">
                <CardContent className="p-5">
                    <h3 className="font-bold text-slate-900 mb-2">💡 Dicas para mais trabalhos</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                        <li>• Ofereça mais serviços para aumentar suas chances de match</li>
                        <li>• Preços competitivos te colocam no topo das buscas</li>
                        <li>• Serviços especializados têm menos concorrência</li>
                    </ul>
                </CardContent>
            </Card>

            {/* Sticky Save Button */}
            {hasChanges && (
                <div className="fixed bottom-20 md:bottom-8 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
                    <div className="max-w-4xl mx-auto">
                        <Button
                            onClick={handleSaveAll}
                            disabled={isSaving}
                            className={cn(
                                "w-full h-14 rounded-2xl font-bold text-lg shadow-lg transition-all",
                                saved
                                    ? "bg-green-600 hover:bg-green-700 shadow-green-600/20"
                                    : "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
                            )}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : saved ? (
                                <>
                                    <Check className="h-5 w-5 mr-2" />
                                    Alterações Salvas!
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

