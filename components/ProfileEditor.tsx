"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Camera, Save, Loader2, Check, Edit2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhoneInput } from "@/components/PhoneInput";

interface ProfileData {
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
}

interface ProfileEditorProps {
    initialData: ProfileData;
    onSave: (data: ProfileData) => Promise<void>;
    userType: 'CLIENT' | 'PROVIDER';
}

export function ProfileEditor({ initialData, onSave, userType }: ProfileEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState<ProfileData>(initialData);
    const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ProfileData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Nome é obrigatório";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email é obrigatório";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email inválido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setIsSaving(true);
        try {
            await onSave(formData);
            setSaved(true);
            setIsEditing(false);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(initialData);
        setErrors({});
        setIsEditing(false);
    };

    const themeColor = userType === 'PROVIDER' ? 'purple' : 'teal';

    return (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <User className={`h-5 w-5 text-${themeColor}-600`} />
                        Informações Pessoais
                    </CardTitle>
                    <CardDescription>
                        Gerencie seus dados de perfil
                    </CardDescription>
                </div>
                {!isEditing ? (
                    <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="rounded-xl"
                    >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={handleCancel}
                            className="rounded-xl"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(
                                "rounded-xl",
                                saved
                                    ? "bg-green-600 hover:bg-green-700"
                                    : `bg-${themeColor}-600 hover:bg-${themeColor}-700`
                            )}
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : saved ? (
                                <Check className="h-4 w-4 mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {isSaving ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg relative",
                        `bg-gradient-to-br from-${themeColor}-400 to-${themeColor}-600`
                    )}>
                        {formData.avatarUrl ? (
                            <img
                                src={formData.avatarUrl}
                                alt={formData.name}
                                className="h-full w-full object-cover rounded-2xl"
                            />
                        ) : (
                            formData.name.charAt(0).toUpperCase()
                        )}
                        {isEditing && (
                            <button className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-slate-50">
                                <Camera className="h-4 w-4 text-slate-600" />
                            </button>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{formData.name}</h3>
                        <p className="text-sm text-slate-500">{formData.email}</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-600">Nome completo</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={!isEditing}
                                className={cn(
                                    "pl-10 h-12 rounded-xl",
                                    !isEditing ? "bg-slate-50 border-none" : "bg-white border-slate-200",
                                    errors.name && "border-red-500"
                                )}
                            />
                        </div>
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-600">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={!isEditing}
                                className={cn(
                                    "pl-10 h-12 rounded-xl",
                                    !isEditing ? "bg-slate-50 border-none" : "bg-white border-slate-200",
                                    errors.email && "border-red-500"
                                )}
                            />
                        </div>
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-slate-600">Telefone</Label>
                        {isEditing ? (
                            <PhoneInput
                                value={formData.phone}
                                onChange={(fullNumber) => setFormData({ ...formData, phone: fullNumber })}
                                disabled={!isEditing}
                            />
                        ) : (
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                <Input
                                    value={formData.phone || "Não informado"}
                                    disabled
                                    className="pl-10 h-12 rounded-xl bg-slate-50 border-none"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
