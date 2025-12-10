"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, ChevronRight, ChevronLeft, Star, Shield, CreditCard, Sparkles, Home, Calendar as CalendarIcon, User, MapPin, Search, Filter, Clock } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calculateDistance, formatCurrency } from "@/lib/utils/location";
import { ProviderProfile, Job, ClientProfile, ServiceLocationType, SERVICE_LOCATION_LABELS } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STEPS = [
    { id: 0, title: "Serviço", icon: Sparkles },
    { id: 1, title: "Data", icon: CalendarIcon },
    { id: 2, title: "Profissional", icon: User },
    { id: 3, title: "Pagamento", icon: CreditCard },
];

export default function BookingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { users, addJob, services } = useStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [serviceId, setServiceId] = useState<string>("");
    const [homeSize, setHomeSize] = useState(80);
    const [frequency, setFrequency] = useState<"ONCE" | "WEEKLY" | "BIWEEKLY" | "MONTHLY">("ONCE");
    const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
    const [timeSlot, setTimeSlot] = useState("09:00");
    const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [locationType, setLocationType] = useState<ServiceLocationType>("CASA_PARTICULAR");

    // Initialize address when user loads
    if (user && !selectedAddressId && (user as ClientProfile).savedAddresses?.length > 0) {
        setSelectedAddressId((user as ClientProfile).savedAddresses[0].id);
    }

    // Derived State
    const selectedService = (services || []).find(s => s.id === serviceId);
    const duration = homeSize < 60 ? 2 : homeSize < 100 ? 3 : 4;
    const basePrice = selectedService?.basePrice || 12;
    const totalPrice = duration * basePrice;

    // Filter Providers
    const availableProviders = (users || []).filter((u): u is ProviderProfile => {
        if (u.role !== "PROVIDER") return false;
        if (serviceId && !u.offeredServices?.includes(serviceId)) return false;

        // Location Type Check
        if (locationType && !u.acceptedLocationTypes?.includes(locationType)) return false;

        // Location Check (Mock)
        const clientUser = user as ClientProfile;
        const savedAddresses = clientUser?.savedAddresses || [];
        const targetAddress = savedAddresses.find(a => a.id === selectedAddressId) || user?.location;
        if (!targetAddress || !u.location) return true;
        const dist = calculateDistance(targetAddress.lat, targetAddress.lng, u.location.lat, u.location.lng);

        // Schedule Check (Mock)
        const dayOfWeek = date ? date.getDay() : 0;
        const hour = parseInt(timeSlot.split(':')[0]);
        const isBusy = u.scheduleConstraints.some(c => c.dayOfWeek === dayOfWeek && hour >= c.startHour && hour < c.endHour);

        return dist <= u.serviceRadiusKm && !isBusy;
    }).sort((a, b) => b.profileScore - a.profileScore);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
        else handleBooking();
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const handleBooking = async () => {
        if (!user || !selectedProvider || !date || !selectedService) return;
        setIsLoading(true);

        const clientUser = user as ClientProfile;
        const targetAddress = clientUser.savedAddresses?.find(a => a.id === selectedAddressId) || user.location!;

        const newJob: Job = {
            id: `job-${Date.now()}`,
            clientId: user.id,
            providerId: selectedProvider.id,
            status: 'OPEN',
            serviceType: selectedService.id,
            homeSize,
            frequency,
            date: format(date, 'yyyy-MM-dd'),
            timeSlot,
            durationHours: duration,
            priceTotal: totalPrice,
            agencyFee: totalPrice * 0.2,
            providerPayout: totalPrice * 0.8,
            location: targetAddress,
            locationType,
            createdAt: new Date().toISOString()
        };

        await addJob(newJob);
        setTimeout(() => {
            setIsLoading(false);
            router.push('/client');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-teal-600 to-slate-50 -z-10"></div>
            <div className="absolute top-20 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute top-40 left-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl -z-10"></div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="text-center text-white mb-12">
                    <h1 className="text-3xl font-bold mb-2">Agende sua Limpeza</h1>
                    <p className="text-teal-100">Em poucos passos, sua casa estará brilhando.</p>
                </div>

                {/* Steps Indicator */}
                <div className="flex justify-between items-center mb-8 relative px-4 md:px-12">
                    <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-200/30 -z-10 rounded-full"></div>
                    <div
                        className="absolute left-0 top-1/2 h-1 bg-teal-300 transition-all duration-500 rounded-full -z-10"
                        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    ></div>

                    {STEPS.map((step) => (
                        <div key={step.id} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                                currentStep >= step.id
                                    ? "bg-white text-teal-600 border-teal-300 shadow-lg scale-110"
                                    : "bg-slate-200/50 text-slate-400 border-transparent backdrop-blur-sm"
                            )}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-xs font-medium transition-colors duration-300",
                                currentStep >= step.id ? "text-white" : "text-slate-400/70"
                            )}>{step.title}</span>
                        </div>
                    ))}
                </div>

                {/* Main Card */}
                <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden min-h-[500px] flex flex-col">
                    <CardContent className="p-6 md:p-8 flex-1">

                        {/* STEP 1: SERVICE */}
                        {currentStep === 0 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Qual serviço você precisa?</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {services.map((service) => (
                                        <div
                                            key={service.id}
                                            onClick={() => setServiceId(service.id)}
                                            className={cn(
                                                "p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] flex items-start gap-4",
                                                serviceId === service.id
                                                    ? "border-teal-500 bg-teal-50/50 shadow-lg shadow-teal-500/10"
                                                    : "border-slate-100 bg-white hover:border-teal-200 hover:shadow-md"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-3 rounded-xl",
                                                serviceId === service.id ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {service.id === 'REGULAR' ? <Sparkles className="w-6 h-6" /> :
                                                    service.id === 'DEEP' ? <Shield className="w-6 h-6" /> :
                                                        <Home className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">{service.name}</h3>
                                                <p className="text-slate-500 text-sm mt-1">{service.description}</p>
                                                <p className="text-teal-600 font-bold mt-2">A partir de €{service.basePrice}/h</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <Label className="text-base font-semibold mb-4 block">Tamanho da Casa (m²)</Label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="30"
                                            max="300"
                                            step="10"
                                            value={homeSize}
                                            onChange={(e) => setHomeSize(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                        />
                                        <span className="font-bold text-slate-700 min-w-[60px]">{homeSize} m²</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Duração estimada: <span className="font-bold text-slate-700">{duration} horas</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: DATE */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Quando podemos ir?</h2>
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-1">
                                        <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                className="rounded-xl border-none w-full"
                                                classNames={{
                                                    head_cell: "text-teal-600 font-bold pt-1",
                                                    cell: "text-center p-0 relative [&:has([aria-selected])]:bg-teal-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-teal-50 rounded-full transition-all",
                                                    day_selected: "bg-teal-600 text-white hover:bg-teal-600 hover:text-white focus:bg-teal-600 focus:text-white shadow-md shadow-teal-500/30",
                                                    day_today: "bg-slate-100 text-slate-900",
                                                }}
                                                disabled={(date) => date < new Date()}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-8">
                                        <div>
                                            <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-teal-600" /> Horário de Início
                                            </Label>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                                {["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"].map((time) => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setTimeSlot(time)}
                                                        className={cn(
                                                            "py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 border",
                                                            timeSlot === time
                                                                ? "bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/20 scale-105"
                                                                : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50"
                                                        )}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-base font-semibold mb-4 block">Frequência</Label>
                                            <RadioGroup value={frequency} onValueChange={(v: any) => setFrequency(v)} className="grid grid-cols-1 gap-3">
                                                <div className={cn(
                                                    "flex items-center justify-between border rounded-xl p-4 cursor-pointer transition-all group",
                                                    frequency === 'ONCE' ? "border-teal-500 bg-teal-50/50 shadow-sm" : "border-slate-200 hover:bg-white hover:border-teal-200 hover:shadow-sm"
                                                )}>
                                                    <div className="flex items-center space-x-3">
                                                        <RadioGroupItem value="ONCE" id="once" className="text-teal-600 border-slate-300" />
                                                        <Label htmlFor="once" className="cursor-pointer font-medium text-slate-700">Uma vez</Label>
                                                    </div>
                                                </div>

                                                <div className={cn(
                                                    "flex items-center justify-between border rounded-xl p-4 cursor-pointer transition-all group",
                                                    frequency === 'WEEKLY' ? "border-teal-500 bg-teal-50/50 shadow-sm" : "border-slate-200 hover:bg-white hover:border-teal-200 hover:shadow-sm"
                                                )}>
                                                    <div className="flex items-center space-x-3">
                                                        <RadioGroupItem value="WEEKLY" id="weekly" className="text-teal-600 border-slate-300" />
                                                        <Label htmlFor="weekly" className="cursor-pointer font-medium text-slate-700">Semanal</Label>
                                                    </div>
                                                    <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-1 rounded-full">-15% OFF</span>
                                                </div>

                                                <div className={cn(
                                                    "flex items-center justify-between border rounded-xl p-4 cursor-pointer transition-all group",
                                                    frequency === 'BIWEEKLY' ? "border-teal-500 bg-teal-50/50 shadow-sm" : "border-slate-200 hover:bg-white hover:border-teal-200 hover:shadow-sm"
                                                )}>
                                                    <div className="flex items-center space-x-3">
                                                        <RadioGroupItem value="BIWEEKLY" id="biweekly" className="text-teal-600 border-slate-300" />
                                                        <Label htmlFor="biweekly" className="cursor-pointer font-medium text-slate-700">Quinzenal</Label>
                                                    </div>
                                                    <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-1 rounded-full">-10% OFF</span>
                                                </div>

                                                <div className={cn(
                                                    "flex items-center justify-between border rounded-xl p-4 cursor-pointer transition-all group",
                                                    frequency === 'MONTHLY' ? "border-teal-500 bg-teal-50/50 shadow-sm" : "border-slate-200 hover:bg-white hover:border-teal-200 hover:shadow-sm"
                                                )}>
                                                    <div className="flex items-center space-x-3">
                                                        <RadioGroupItem value="MONTHLY" id="monthly" className="text-teal-600 border-slate-300" />
                                                        <Label htmlFor="monthly" className="cursor-pointer font-medium text-slate-700">Mensal</Label>
                                                    </div>
                                                    <span className="text-xs font-bold text-teal-600 bg-teal-100 px-2 py-1 rounded-full">-5% OFF</span>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: PROVIDER SELECTION */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800">Escolha sua Profissional</h2>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="h-8 gap-2 rounded-full">
                                            <Filter className="w-3 h-3" /> Filtros
                                        </Button>
                                    </div>
                                </div>

                                {availableProviders.length === 0 ? (
                                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500">Nenhum profissional disponível para estes critérios.</p>
                                        <Button variant="link" onClick={handleBack} className="text-teal-600">Tente outro horário</Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {availableProviders.map((provider) => (
                                            <div
                                                key={provider.id}
                                                onClick={() => setSelectedProvider(provider)}
                                                className={cn(
                                                    "relative group p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col md:flex-row gap-6 items-start md:items-center",
                                                    selectedProvider?.id === provider.id
                                                        ? "border-teal-500 bg-teal-50/50 shadow-lg ring-1 ring-teal-500"
                                                        : "border-slate-100 bg-white hover:border-teal-200 hover:shadow-md"
                                                )}
                                            >
                                                {/* Selection Indicator */}
                                                <div className={cn(
                                                    "absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                    selectedProvider?.id === provider.id
                                                        ? "bg-teal-500 border-teal-500"
                                                        : "border-slate-300"
                                                )}>
                                                    {selectedProvider?.id === provider.id && <Check className="w-4 h-4 text-white" />}
                                                </div>

                                                {/* Avatar & Score */}
                                                <div className="relative">
                                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                                                        <img src={provider.avatarUrl || "https://github.com/shadcn.png"} alt={provider.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 bg-white px-1.5 py-0.5 rounded-full shadow-sm border flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-xs font-bold text-slate-700">{provider.rating}</span>
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-lg text-slate-900">{provider.name}</h3>
                                                        {provider.verifiedStatus && (
                                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1 h-5 px-1.5">
                                                                <Shield className="w-3 h-3" /> Verificada
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-500 line-clamp-1 mb-2">{provider.bio}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {provider.badges.map(badge => (
                                                            <span key={badge} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                                                                {badge}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right min-w-[100px]">
                                                    <p className="text-xs text-slate-400 mb-1">Total estimado</p>
                                                    <p className="text-2xl font-bold text-teal-700">€{(provider.hourlyRate * duration).toFixed(0)}</p>
                                                    <p className="text-xs text-slate-500">€{provider.hourlyRate}/hora</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 4: CONFIRMATION */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                        <Check className="w-8 h-8 text-teal-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800">Quase lá!</h2>
                                    <p className="text-slate-500">Revise os detalhes antes de confirmar.</p>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <CalendarIcon className="w-5 h-5 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : 'Data não selecionada'}</p>
                                                <p className="text-sm text-slate-500">às {timeSlot}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)} className="text-teal-600">Alterar</Button>
                                    </div>

                                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <User className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{selectedProvider?.name || 'Profissional não selecionado'}</p>
                                                <p className="text-sm text-slate-500">{selectedService?.name || 'Serviço'} • {duration}h</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)} className="text-teal-600">Alterar</Button>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <p className="font-bold text-lg text-slate-900">Total a Pagar</p>
                                        <p className="font-bold text-2xl text-teal-700">€{(selectedProvider ? selectedProvider.hourlyRate * duration : 0).toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3">
                                    <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                    <p className="text-sm text-yellow-800">
                                        Pagamento seguro. O valor só é liberado para a profissional após a conclusão do serviço.
                                    </p>
                                </div>
                            </div>
                        )}

                    </CardContent>

                    <CardFooter className="bg-slate-50/50 border-t p-6 flex justify-between">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 0 || isLoading}
                            className="h-12 px-6 rounded-xl border-slate-200 hover:bg-white hover:text-slate-900"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                        </Button>

                        <Button
                            onClick={handleNext}
                            disabled={
                                (currentStep === 0 && !serviceId) ||
                                (currentStep === 2 && !selectedProvider) ||
                                isLoading
                            }
                            className="h-12 px-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-600/20 transition-all hover:scale-105"
                        >
                            {isLoading ? "Processando..." : currentStep === STEPS.length - 1 ? "Confirmar e Pagar" : "Continuar"}
                            {!isLoading && <ChevronRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
