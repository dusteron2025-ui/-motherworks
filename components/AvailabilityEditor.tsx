"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Clock, Save, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
}

interface DayAvailability {
    enabled: boolean;
    slots: TimeSlot[];
}

export interface WeeklyAvailability {
    monday: DayAvailability;
    tuesday: DayAvailability;
    wednesday: DayAvailability;
    thursday: DayAvailability;
    friday: DayAvailability;
    saturday: DayAvailability;
    sunday: DayAvailability;
}

const DAYS = [
    { key: "monday", label: "Segunda-feira", short: "Seg" },
    { key: "tuesday", label: "Terça-feira", short: "Ter" },
    { key: "wednesday", label: "Quarta-feira", short: "Qua" },
    { key: "thursday", label: "Quinta-feira", short: "Qui" },
    { key: "friday", label: "Sexta-feira", short: "Sex" },
    { key: "saturday", label: "Sábado", short: "Sáb" },
    { key: "sunday", label: "Domingo", short: "Dom" },
] as const;

const DEFAULT_AVAILABILITY: WeeklyAvailability = {
    monday: { enabled: true, slots: [{ id: "1", startTime: "08:00", endTime: "18:00" }] },
    tuesday: { enabled: true, slots: [{ id: "1", startTime: "08:00", endTime: "18:00" }] },
    wednesday: { enabled: true, slots: [{ id: "1", startTime: "08:00", endTime: "18:00" }] },
    thursday: { enabled: true, slots: [{ id: "1", startTime: "08:00", endTime: "18:00" }] },
    friday: { enabled: true, slots: [{ id: "1", startTime: "08:00", endTime: "18:00" }] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
};

interface AvailabilityEditorProps {
    value?: WeeklyAvailability;
    onChange: (availability: WeeklyAvailability) => void;
    onSave?: () => Promise<void>;
}

export function AvailabilityEditor({ value, onChange, onSave }: AvailabilityEditorProps) {
    const [availability, setAvailability] = useState<WeeklyAvailability>(value || DEFAULT_AVAILABILITY);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const updateAvailability = (newAvailability: WeeklyAvailability) => {
        setAvailability(newAvailability);
        onChange(newAvailability);
        setSaved(false);
    };

    const toggleDay = (dayKey: keyof WeeklyAvailability) => {
        const newAvail = { ...availability };
        newAvail[dayKey] = {
            ...newAvail[dayKey],
            enabled: !newAvail[dayKey].enabled,
            slots: !newAvail[dayKey].enabled ? [{ id: Date.now().toString(), startTime: "08:00", endTime: "18:00" }] : [],
        };
        updateAvailability(newAvail);
    };

    const addSlot = (dayKey: keyof WeeklyAvailability) => {
        const newAvail = { ...availability };
        const lastSlot = newAvail[dayKey].slots[newAvail[dayKey].slots.length - 1];
        const newStartTime = lastSlot ? lastSlot.endTime : "08:00";

        newAvail[dayKey].slots.push({
            id: Date.now().toString(),
            startTime: newStartTime,
            endTime: incrementTime(newStartTime, 4),
        });
        updateAvailability(newAvail);
    };

    const removeSlot = (dayKey: keyof WeeklyAvailability, slotId: string) => {
        const newAvail = { ...availability };
        newAvail[dayKey].slots = newAvail[dayKey].slots.filter(s => s.id !== slotId);
        if (newAvail[dayKey].slots.length === 0) {
            newAvail[dayKey].enabled = false;
        }
        updateAvailability(newAvail);
    };

    const updateSlot = (dayKey: keyof WeeklyAvailability, slotId: string, field: 'startTime' | 'endTime', value: string) => {
        const newAvail = { ...availability };
        const slot = newAvail[dayKey].slots.find(s => s.id === slotId);
        if (slot) {
            slot[field] = value;
        }
        updateAvailability(newAvail);
    };

    const incrementTime = (time: string, hours: number): string => {
        const [h, m] = time.split(":").map(Number);
        const newH = Math.min(h + hours, 23);
        return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave();
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Error saving availability:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const calculateTotalHours = (day: DayAvailability): number => {
        if (!day.enabled) return 0;
        return day.slots.reduce((total, slot) => {
            const [startH, startM] = slot.startTime.split(":").map(Number);
            const [endH, endM] = slot.endTime.split(":").map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            return total + Math.max(0, (endMinutes - startMinutes) / 60);
        }, 0);
    };

    const totalWeeklyHours = DAYS.reduce((total, day) => {
        return total + calculateTotalHours(availability[day.key]);
    }, 0);

    return (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-600" />
                            Disponibilidade Semanal
                        </CardTitle>
                        <CardDescription>
                            Configure os horários que você está disponível para trabalhar
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{totalWeeklyHours.toFixed(0)}h</div>
                        <div className="text-xs text-slate-500">por semana</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {DAYS.map((day) => {
                    const dayData = availability[day.key];
                    const dayHours = calculateTotalHours(dayData);

                    return (
                        <div
                            key={day.key}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all",
                                dayData.enabled
                                    ? "border-purple-200 bg-purple-50/50"
                                    : "border-slate-100 bg-slate-50/50"
                            )}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={dayData.enabled}
                                        onCheckedChange={() => toggleDay(day.key)}
                                        className="data-[state=checked]:bg-purple-600"
                                    />
                                    <Label className={cn(
                                        "font-semibold",
                                        dayData.enabled ? "text-purple-700" : "text-slate-400"
                                    )}>
                                        {day.label}
                                    </Label>
                                </div>
                                {dayData.enabled && (
                                    <span className="text-sm text-purple-600 font-medium">
                                        {dayHours.toFixed(1)}h
                                    </span>
                                )}
                            </div>

                            {dayData.enabled && (
                                <div className="space-y-2 pl-12">
                                    {dayData.slots.map((slot, index) => (
                                        <div key={slot.id} className="flex items-center gap-2">
                                            <Input
                                                type="time"
                                                value={slot.startTime}
                                                onChange={(e) => updateSlot(day.key, slot.id, "startTime", e.target.value)}
                                                className="w-28 h-9 text-center bg-white border-purple-200"
                                            />
                                            <span className="text-slate-400">às</span>
                                            <Input
                                                type="time"
                                                value={slot.endTime}
                                                onChange={(e) => updateSlot(day.key, slot.id, "endTime", e.target.value)}
                                                className="w-28 h-9 text-center bg-white border-purple-200"
                                            />
                                            {dayData.slots.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => removeSlot(day.key, slot.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {index === dayData.slots.length - 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-purple-500 hover:text-purple-700 hover:bg-purple-100"
                                                    onClick={() => addSlot(day.key)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {onSave && (
                    <div className="pt-4 flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(
                                "rounded-xl px-6",
                                saved
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-purple-600 hover:bg-purple-700"
                            )}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : saved ? (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Salvo!
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Salvar Disponibilidade
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
