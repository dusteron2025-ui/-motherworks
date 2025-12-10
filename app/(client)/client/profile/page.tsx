"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Star, CreditCard, Package, Settings, ChevronRight, Bell, Shield, User, Gift, Home } from "lucide-react";
import { ClientProfile } from "@/types";
import { AddressManager } from "@/components/AddressManager";
import { ProfileEditor } from "@/components/ProfileEditor";
import { ReferralSystem } from "@/components/ReferralSystem";

interface Address {
    id: string;
    label: string;
    address: string;
    lat: number;
    lng: number;
}

export default function ClientProfilePage() {
    const { user } = useAuth();
    const { updateUser } = useStore();
    const [defaultAddressId, setDefaultAddressId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (user && user.role === 'CLIENT') {
            const client = user as ClientProfile;
            if (client.savedAddresses && client.savedAddresses.length > 0 && !defaultAddressId) {
                setDefaultAddressId(client.savedAddresses[0].id);
            }
        }
    }, [user, defaultAddressId]);

    if (!user || user.role !== 'CLIENT') return <div>Acesso negado</div>;

    const client = user as ClientProfile;

    const getPlanDetails = (plan?: string) => {
        switch (plan) {
            case 'WEEKLY': return { label: 'Plano Semanal', color: 'bg-purple-100 text-purple-700', price: '€400/mês', icon: '🏆' };
            case 'BIWEEKLY': return { label: 'Plano Quinzenal', color: 'bg-teal-100 text-teal-700', price: '€220/mês', icon: '⭐' };
            case 'MONTHLY': return { label: 'Plano Mensal', color: 'bg-blue-100 text-blue-700', price: '€120/mês', icon: '✨' };
            default: return null;
        }
    };

    const planDetails = getPlanDetails(client.subscription);

    const handleAddAddress = (address: Address) => {
        const updatedAddresses = [...(client.savedAddresses || []), address];
        updateUser({ ...client, savedAddresses: updatedAddresses });
        if (!defaultAddressId) setDefaultAddressId(address.id);
    };

    const handleEditAddress = (address: Address) => {
        const updatedAddresses = (client.savedAddresses || []).map(a =>
            a.id === address.id ? address : a
        );
        updateUser({ ...client, savedAddresses: updatedAddresses });
    };

    const handleDeleteAddress = (id: string) => {
        const updatedAddresses = (client.savedAddresses || []).filter(a => a.id !== id);
        updateUser({ ...client, savedAddresses: updatedAddresses });
        if (defaultAddressId === id && updatedAddresses.length > 0) {
            setDefaultAddressId(updatedAddresses[0].id);
        }
    };

    const handleSetDefaultAddress = (id: string) => {
        setDefaultAddressId(id);
    };

    const handleSaveProfile = async (data: { name: string; email: string; phone?: string }) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        updateUser({ ...client, name: data.name, email: data.email });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-8">
            {/* Header */}
            <div className="flex items-center gap-5 bg-white p-6 rounded-3xl shadow-sm">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-teal-500/20">
                    {client.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
                    <p className="text-slate-500 text-sm">{client.email}</p>
                    <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-lg">
                            {client.serviceCount || 0} serviços
                        </Badge>
                        {client.averageRating && (
                            <Badge variant="secondary" className="bg-amber-50 text-amber-700 rounded-lg">
                                <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                                {client.averageRating}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white rounded-xl p-1 shadow-sm">
                    <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                        <User className="h-4 w-4 mr-2" />
                        Perfil
                    </TabsTrigger>
                    <TabsTrigger value="addresses" className="rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                        <Home className="h-4 w-4 mr-2" />
                        Endereços
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pagamentos
                    </TabsTrigger>
                    <TabsTrigger value="referrals" className="rounded-lg data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                        <Gift className="h-4 w-4 mr-2" />
                        Indicações
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-6 space-y-6">
                    <ProfileEditor
                        initialData={{
                            name: client.name,
                            email: client.email,
                            phone: undefined,
                            avatarUrl: client.avatarUrl
                        }}
                        onSave={handleSaveProfile}
                        userType="CLIENT"
                    />

                    {/* Subscription Card */}
                    <Card className="border-none shadow-md bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <CardContent className="p-6 relative z-10">
                            {planDetails ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">{planDetails.icon}</div>
                                        <div>
                                            <Badge className={`${planDetails.color} border-none mb-1`}>
                                                {planDetails.label}
                                            </Badge>
                                            <p className="text-2xl font-bold">{planDetails.price}</p>
                                        </div>
                                    </div>
                                    <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 rounded-xl">
                                        Gerenciar <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                            <Package className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">Sem Assinatura</p>
                                            <p className="text-sm text-slate-400">Economize até 20% com um plano</p>
                                        </div>
                                    </div>
                                    <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl">
                                        Ver Planos
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Addresses Tab */}
                <TabsContent value="addresses" className="mt-6">
                    <Card className="border-none shadow-sm bg-white">
                        <CardContent className="pt-6">
                            <AddressManager
                                addresses={client.savedAddresses || []}
                                maxAddresses={5}
                                onAdd={handleAddAddress}
                                onEdit={handleEditAddress}
                                onDelete={handleDeleteAddress}
                                onSetDefault={handleSetDefaultAddress}
                                defaultAddressId={defaultAddressId}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments" className="mt-6 space-y-4">
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Métodos de Pagamento</CardTitle>
                                <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg">
                                    + Adicionar
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-7 bg-slate-800 rounded flex items-center justify-center text-white text-xs font-bold">
                                        VISA
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">•••• 4242</p>
                                        <p className="text-xs text-slate-500">Expira 12/25</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="border-teal-200 text-teal-700 bg-teal-50 rounded-lg text-xs">
                                    Principal
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Referrals Tab */}
                <TabsContent value="referrals" className="mt-6">
                    <ReferralSystem
                        userId={client.id}
                        userName={client.name}
                        stats={{
                            totalReferrals: 3,
                            pendingReferrals: 1,
                            completedReferrals: 2,
                            totalEarned: 30
                        }}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

