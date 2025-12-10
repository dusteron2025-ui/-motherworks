"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, Star, Loader2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceLocationType, SERVICE_LOCATION_LABELS } from "@/types";
import { MapPicker } from "@/components/MapPicker";

interface Address {
    id: string;
    label: string;
    address: string;
    lat: number;
    lng: number;
    locationType?: ServiceLocationType;
}

interface AddressManagerProps {
    addresses: Address[];
    maxAddresses?: number;
    onAdd: (address: Address) => void;
    onEdit: (address: Address) => void;
    onDelete: (id: string) => void;
    onSetDefault?: (id: string) => void;
    defaultAddressId?: string;
}

export function AddressManager({
    addresses,
    maxAddresses = 5,
    onAdd,
    onEdit,
    onDelete,
    onSetDefault,
    defaultAddressId
}: AddressManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        label: "",
        address: "",
        lat: 0,
        lng: 0,
        locationType: "CASA_PARTICULAR" as ServiceLocationType,
    });

    const iconsByLabel: Record<string, React.ElementType> = {
        "Casa": Home,
        "Escritório": Briefcase,
        "Trabalho": Briefcase,
    };

    const handleOpenDialog = (address?: Address) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                label: address.label,
                address: address.address,
                lat: address.lat,
                lng: address.lng,
                locationType: address.locationType || "CASA_PARTICULAR"
            });
        } else {
            setEditingAddress(null);
            setFormData({ label: "", address: "", lat: 0, lng: 0, locationType: "CASA_PARTICULAR" });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.label || !formData.address) return;

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API

        const newAddress: Address = {
            id: editingAddress?.id || `addr_${Date.now()}`,
            label: formData.label,
            address: formData.address,
            lat: formData.lat || 38.7223,
            lng: formData.lng || -9.1393,
            locationType: formData.locationType,
        };

        if (editingAddress) {
            onEdit(newAddress);
        } else {
            onAdd(newAddress);
        }

        setIsLoading(false);
        setIsDialogOpen(false);
        setFormData({ label: "", address: "", lat: 0, lng: 0, locationType: "CASA_PARTICULAR" });
        setEditingAddress(null);
    };

    const canAddMore = addresses.length < maxAddresses;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900">Endereços Salvos</h3>
                    <p className="text-sm text-slate-500">{addresses.length} de {maxAddresses} endereços</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!canAddMore}
                            onClick={() => handleOpenDialog()}
                            className="rounded-xl border-teal-200 text-teal-600 hover:bg-teal-50"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingAddress ? "Editar Endereço" : "Novo Endereço"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingAddress ? "Atualize os dados do endereço." : "Adicione um novo endereço para agendamentos."}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="label" className="text-slate-600">Nome do Endereço</Label>
                                <Input
                                    id="label"
                                    placeholder="Ex: Casa, Escritório, Casa da Avó..."
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="h-12 bg-slate-50 border-none rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-600">Localização no Mapa</Label>
                                <MapPicker
                                    value={formData.lat && formData.lng ? {
                                        address: formData.address,
                                        lat: formData.lat,
                                        lng: formData.lng
                                    } : undefined}
                                    onChange={(location) => setFormData({
                                        ...formData,
                                        address: location.address,
                                        lat: location.lat,
                                        lng: location.lng
                                    })}
                                    placeholder="Busque seu endereço..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="locationType" className="text-slate-600">Tipo de Local</Label>
                                <Select
                                    value={formData.locationType}
                                    onValueChange={(value) => setFormData({ ...formData, locationType: value as ServiceLocationType })}
                                >
                                    <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl">
                                        <SelectValue placeholder="Selecione o tipo de local" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(Object.keys(SERVICE_LOCATION_LABELS) as ServiceLocationType[]).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {SERVICE_LOCATION_LABELS[type]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!formData.label || !formData.address || isLoading}
                                className="rounded-xl bg-teal-600 hover:bg-teal-700"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {editingAddress ? "Salvar" : "Adicionar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-3">
                {addresses.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500">Nenhum endereço salvo.</p>
                        <p className="text-sm text-slate-400">Adicione até {maxAddresses} endereços.</p>
                    </div>
                ) : (
                    addresses.map((addr) => {
                        const IconComponent = iconsByLabel[addr.label] || MapPin;
                        const isDefault = addr.id === defaultAddressId;

                        return (
                            <div
                                key={addr.id}
                                className={cn(
                                    "p-4 bg-white rounded-2xl border transition-all hover:shadow-md group",
                                    isDefault ? "border-teal-200 bg-teal-50/50" : "border-slate-100"
                                )}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "p-2 rounded-xl",
                                        isDefault ? "bg-teal-100 text-teal-600" : "bg-slate-100 text-slate-500"
                                    )}>
                                        <IconComponent className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-slate-900">{addr.label}</p>
                                            {isDefault && (
                                                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                                                    Principal
                                                </span>
                                            )}
                                            {addr.locationType && (
                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />
                                                    {SERVICE_LOCATION_LABELS[addr.locationType]}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 truncate">{addr.address}</p>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {onSetDefault && !isDefault && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600"
                                                onClick={() => onSetDefault(addr.id)}
                                            >
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                            onClick={() => handleOpenDialog(addr)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                                            onClick={() => onDelete(addr.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {!canAddMore && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg text-center">
                    Limite de {maxAddresses} endereços atingido. Remova um para adicionar outro.
                </p>
            )}
        </div>
    );
}
