"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";
import { ProviderProfile } from "@/types";
import { AvailabilityEditor, WeeklyAvailability } from "@/components/AvailabilityEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Info } from "lucide-react";

export default function AvailabilityPage() {
    const { user } = useAuth();
    const { updateUser } = useStore();
    const [isSaving, setIsSaving] = useState(false);

    if (!user || user.role !== 'PROVIDER') return <div>Acesso negado</div>;

    const providerProfile = user as ProviderProfile;

    // Convert old format constraints to new weekly format (for initial load)
    const buildInitialAvailability = (): WeeklyAvailability | undefined => {
        // For now, return undefined to use defaults
        // In a real app, you'd convert from providerProfile.scheduleConstraints
        return undefined;
    };

    const handleAvailabilityChange = (availability: WeeklyAvailability) => {
        // Convert to the old format for backwards compatibility if needed
        console.log("Availability changed:", availability);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        // In production: save to backend
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                    Minha Disponibilidade
                </h1>
                <p className="text-lg text-slate-600">
                    Configure os horários em que você está disponível para trabalhar.
                </p>
            </div>

            {/* Info Card */}
            <Card className="border-purple-200 bg-purple-50/50">
                <CardContent className="flex items-start gap-3 py-4">
                    <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-purple-800">
                        <p className="font-medium mb-1">Como funciona:</p>
                        <ul className="space-y-1 text-purple-700">
                            <li>• Configure os horários em que você pode atender clientes</li>
                            <li>• Adicione múltiplos blocos por dia se tiver intervalos</li>
                            <li>• Você só aparecerá nas buscas nos horários configurados</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Availability Editor */}
            <AvailabilityEditor
                value={buildInitialAvailability()}
                onChange={handleAvailabilityChange}
                onSave={handleSave}
            />
        </div>
    );
}
