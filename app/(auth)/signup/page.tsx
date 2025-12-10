"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { OTPInput } from "@/components/ui/OTPInput";
import { AddressAutocomplete, PlaceDetails } from "@/components/AddressAutocomplete";
import Link from "next/link";
import {
    Heart, Loader2, User, Briefcase, ChevronRight, ChevronLeft,
    Mail, Lock, Eye, EyeOff, Phone, MapPin, CheckCircle2, AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Step = 'role' | 'credentials' | 'phone' | 'otp' | 'address' | 'profile' | 'success';

export default function SignupPage() {
    const { signup } = useAuth();
    const router = useRouter();

    // Step management
    const [step, setStep] = useState<Step>('role');
    const [role, setRole] = useState<"CLIENT" | "PROVIDER">("CLIENT");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        countryCode: "+55",
        localPhone: "",
        otp: "",
        address: "",
        lat: 0,
        lng: 0,
        neighborhood: "",
        city: "",
        state: "",
        bio: "",
        hourlyRate: 15,
        serviceRadius: 10
    });

    // Phone verification state
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError("");
    };

    const handlePhoneChange = (fullNumber: string, countryCode: string, localNumber: string) => {
        setFormData(prev => ({
            ...prev,
            phone: fullNumber,
            countryCode,
            localPhone: localNumber
        }));
    };

    const handleAddressChange = (address: string, details?: PlaceDetails) => {
        setFormData(prev => ({
            ...prev,
            address,
            lat: details?.lat || 0,
            lng: details?.lng || 0,
            neighborhood: details?.neighborhood || "",
            city: details?.city || "",
            state: details?.state || ""
        }));
    };

    const getStepNumber = (): number => {
        const steps: Step[] = ['role', 'credentials', 'phone', 'otp', 'address', 'profile', 'success'];
        return steps.indexOf(step) + 1;
    };

    const getTotalSteps = (): number => {
        return role === 'PROVIDER' ? 6 : 5;
    };

    // Send OTP
    const sendOTP = async () => {
        if (!formData.phone || formData.localPhone.length < 8) {
            setError("Digite um número de telefone válido");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('/api/sms/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formData.phone })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao enviar SMS');
            }

            setOtpSent(true);
            setStep('otp');

            // Start resend countdown (60 seconds)
            setResendCountdown(60);
            const interval = setInterval(() => {
                setResendCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao enviar SMS');
        } finally {
            setIsLoading(false);
        }
    };

    // Verify OTP
    const verifyOTP = async () => {
        if (formData.otp.length !== 6) {
            setError("Digite o código de 6 dígitos");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('/api/sms/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone: formData.phone,
                    code: formData.otp
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Código inválido');
            }

            setPhoneVerified(true);
            setStep('address');

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao verificar código');
        } finally {
            setIsLoading(false);
        }
    };

    // Validate current step
    const validateStep = (): boolean => {
        setError("");

        switch (step) {
            case 'credentials':
                if (!formData.name.trim()) {
                    setError("Digite seu nome completo");
                    return false;
                }
                if (!formData.email.includes('@')) {
                    setError("Digite um email válido");
                    return false;
                }
                if (formData.password.length < 6) {
                    setError("A senha deve ter pelo menos 6 caracteres");
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError("As senhas não coincidem");
                    return false;
                }
                return true;

            case 'phone':
                if (formData.localPhone.length < 8) {
                    setError("Digite um número de telefone válido");
                    return false;
                }
                return true;

            case 'address':
                if (!formData.address || formData.lat === 0) {
                    setError("Selecione um endereço válido da lista");
                    return false;
                }
                return true;

            case 'profile':
                if (role === 'PROVIDER') {
                    if (!formData.bio.trim()) {
                        setError("Conte um pouco sobre você");
                        return false;
                    }
                    if (formData.hourlyRate < 5) {
                        setError("O valor mínimo por hora é €5");
                        return false;
                    }
                }
                return true;

            default:
                return true;
        }
    };

    // Handle step navigation
    const nextStep = () => {
        if (!validateStep()) return;

        switch (step) {
            case 'role':
                setStep('credentials');
                break;
            case 'credentials':
                setStep('phone');
                break;
            case 'phone':
                sendOTP();
                break;
            case 'address':
                if (role === 'PROVIDER') {
                    setStep('profile');
                } else {
                    handleSubmit();
                }
                break;
            case 'profile':
                handleSubmit();
                break;
        }
    };

    const prevStep = () => {
        switch (step) {
            case 'credentials':
                setStep('role');
                break;
            case 'phone':
                setStep('credentials');
                break;
            case 'otp':
                setStep('phone');
                break;
            case 'address':
                setStep('phone');
                break;
            case 'profile':
                setStep('address');
                break;
            default:
                router.push('/login');
        }
    };

    // Submit registration
    const handleSubmit = async () => {
        setIsLoading(true);
        setError("");

        try {
            await signup({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                role: role,
                phone: formData.phone,
                location: {
                    address: formData.address,
                    lat: formData.lat,
                    lng: formData.lng,
                },
                bio: formData.bio,
                hourlyRate: Number(formData.hourlyRate),
                serviceRadiusKm: Number(formData.serviceRadius)
            });

            setStep('success');

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FE] flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex-none p-6 pt-8 flex items-center justify-between relative z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white shadow-sm"
                    onClick={prevStep}
                    disabled={step === 'success'}
                >
                    <ChevronLeft className="w-5 h-5 text-slate-700" />
                </Button>

                {/* Progress dots */}
                <div className="flex items-center gap-2">
                    {Array.from({ length: getTotalSteps() }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-2 h-2 rounded-full transition-colors",
                                i < getStepNumber() ? "bg-teal-500" : "bg-slate-200"
                            )}
                        />
                    ))}
                </div>

                <div className="w-10" />
            </div>

            {/* Title Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 -mt-10">
                <div className="w-48 h-48 bg-purple-100/50 rounded-full blur-3xl absolute top-20 right-10" />

                {step === 'success' ? (
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800">Conta criada!</h1>
                        <p className="text-slate-500 max-w-xs">
                            Enviamos um email de confirmação para <strong>{formData.email}</strong>.
                            Confirme seu email para ativar sua conta.
                        </p>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">
                            {step === 'role' && "Crie sua conta"}
                            {step === 'credentials' && "Seus dados"}
                            {step === 'phone' && "Verificação"}
                            {step === 'otp' && "Código SMS"}
                            {step === 'address' && "Seu endereço"}
                            {step === 'profile' && "Perfil profissional"}
                        </h1>
                        <p className="text-slate-500 text-center max-w-xs">
                            {step === 'role' && "Como você quer usar a plataforma?"}
                            {step === 'credentials' && "Preencha suas informações básicas"}
                            {step === 'phone' && "Vamos verificar seu telefone"}
                            {step === 'otp' && "Digite o código que enviamos"}
                            {step === 'address' && "Onde você está localizado?"}
                            {step === 'profile' && "Conte mais sobre seus serviços"}
                        </p>
                    </>
                )}
            </div>

            {/* Form Area */}
            <div className="bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] p-8 pb-12 relative z-20 animate-in slide-in-from-bottom-10 duration-500 min-h-[55vh]">
                <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />

                {/* Error message */}
                {error && (
                    <div className="max-w-md mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <div className="space-y-6 max-w-md mx-auto">

                    {/* Step: Role Selection */}
                    {step === 'role' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setRole("CLIENT")}
                                    className={cn(
                                        "cursor-pointer rounded-2xl p-6 border-2 transition-all text-center space-y-3",
                                        role === "CLIENT"
                                            ? "border-teal-500 bg-teal-50/50"
                                            : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-full mx-auto flex items-center justify-center",
                                        role === "CLIENT" ? "bg-teal-100 text-teal-600" : "bg-white text-slate-400"
                                    )}>
                                        <User className="w-6 h-6" />
                                    </div>
                                    <p className={cn(
                                        "font-semibold",
                                        role === "CLIENT" ? "text-teal-700" : "text-slate-600"
                                    )}>Cliente</p>
                                    <p className="text-xs text-slate-400">Quero contratar serviços</p>
                                </div>

                                <div
                                    onClick={() => setRole("PROVIDER")}
                                    className={cn(
                                        "cursor-pointer rounded-2xl p-6 border-2 transition-all text-center space-y-3",
                                        role === "PROVIDER"
                                            ? "border-purple-500 bg-purple-50/50"
                                            : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-full mx-auto flex items-center justify-center",
                                        role === "PROVIDER" ? "bg-purple-100 text-purple-600" : "bg-white text-slate-400"
                                    )}>
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <p className={cn(
                                        "font-semibold",
                                        role === "PROVIDER" ? "text-purple-700" : "text-slate-600"
                                    )}>Profissional</p>
                                    <p className="text-xs text-slate-400">Quero oferecer serviços</p>
                                </div>
                            </div>

                            <Button
                                onClick={nextStep}
                                className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-lg font-semibold shadow-lg shadow-teal-600/20"
                            >
                                Continuar <ChevronRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {/* Step: Credentials */}
                    {step === 'credentials' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="ml-1 text-slate-600">Nome Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="name"
                                        placeholder="Maria Silva"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="h-14 pl-12 bg-slate-50 border-none rounded-2xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="ml-1 text-slate-600">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="maria@email.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className="h-14 pl-12 bg-slate-50 border-none rounded-2xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="ml-1 text-slate-600">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Mínimo 6 caracteres"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        className="h-14 pl-12 pr-12 bg-slate-50 border-none rounded-2xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="ml-1 text-slate-600">Confirmar Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Digite a senha novamente"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        className="h-14 pl-12 pr-12 bg-slate-50 border-none rounded-2xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                onClick={nextStep}
                                className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-lg font-semibold shadow-lg shadow-teal-600/20 mt-2"
                            >
                                Continuar <ChevronRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {/* Step: Phone */}
                    {step === 'phone' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Phone className="w-8 h-8 text-teal-600" />
                                </div>
                                <p className="text-slate-500 text-sm">
                                    Enviaremos um código SMS para verificar seu número
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="ml-1 text-slate-600">Número de Telefone</Label>
                                <PhoneInput
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    defaultCountry={formData.countryCode}
                                />
                            </div>

                            <Button
                                onClick={nextStep}
                                disabled={isLoading}
                                className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-lg font-semibold shadow-lg shadow-teal-600/20"
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando...</>
                                ) : (
                                    <>Enviar Código <ChevronRight className="ml-2 w-5 h-5" /></>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Step: OTP Verification */}
                    {step === 'otp' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="text-center mb-4">
                                <p className="text-slate-500 text-sm">
                                    Enviamos um código para <strong>{formData.phone}</strong>
                                </p>
                            </div>

                            <OTPInput
                                value={formData.otp}
                                onChange={(value) => handleInputChange('otp', value)}
                                error={error.includes('código') ? error : undefined}
                            />

                            <Button
                                onClick={verifyOTP}
                                disabled={isLoading || formData.otp.length !== 6}
                                className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-lg font-semibold shadow-lg shadow-teal-600/20"
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando...</>
                                ) : (
                                    "Verificar"
                                )}
                            </Button>

                            <div className="text-center">
                                {resendCountdown > 0 ? (
                                    <p className="text-slate-400 text-sm">
                                        Reenviar código em {resendCountdown}s
                                    </p>
                                ) : (
                                    <button
                                        onClick={sendOTP}
                                        className="text-teal-600 text-sm font-semibold hover:underline"
                                    >
                                        Reenviar código
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step: Address */}
                    {step === 'address' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-8 h-8 text-teal-600" />
                                </div>
                                <p className="text-slate-500 text-sm">
                                    {role === 'PROVIDER'
                                        ? 'Este será seu endereço de trabalho principal'
                                        : 'Este será seu endereço principal para serviços'
                                    }
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="ml-1 text-slate-600">Endereço</Label>
                                <AddressAutocomplete
                                    value={formData.address}
                                    onChange={handleAddressChange}
                                    placeholder="Digite seu endereço..."
                                />
                            </div>

                            {formData.city && (
                                <div className="bg-teal-50 rounded-2xl p-4 text-sm text-teal-700">
                                    <p><strong>Bairro:</strong> {formData.neighborhood || '-'}</p>
                                    <p><strong>Cidade:</strong> {formData.city}, {formData.state}</p>
                                </div>
                            )}

                            <Button
                                onClick={nextStep}
                                disabled={isLoading}
                                className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-lg font-semibold shadow-lg shadow-teal-600/20"
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Criando conta...</>
                                ) : role === 'PROVIDER' ? (
                                    <>Continuar <ChevronRight className="ml-2 w-5 h-5" /></>
                                ) : (
                                    "Criar Conta"
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Step: Profile (Provider only) */}
                    {step === 'profile' && role === 'PROVIDER' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="bio" className="ml-1 text-slate-600">Sobre Você</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Conte sobre sua experiência, especialidades e o que te torna especial..."
                                    value={formData.bio}
                                    onChange={(e) => handleInputChange('bio', e.target.value)}
                                    className="min-h-[120px] bg-slate-50 border-none rounded-2xl resize-none p-4"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hourlyRate" className="ml-1 text-slate-600">Preço/Hora (€)</Label>
                                    <Input
                                        id="hourlyRate"
                                        type="number"
                                        min="5"
                                        value={formData.hourlyRate}
                                        onChange={(e) => handleInputChange('hourlyRate', Number(e.target.value))}
                                        className="h-14 bg-slate-50 border-none rounded-2xl text-center text-lg font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="serviceRadius" className="ml-1 text-slate-600">Raio (km)</Label>
                                    <Input
                                        id="serviceRadius"
                                        type="number"
                                        min="1"
                                        value={formData.serviceRadius}
                                        onChange={(e) => handleInputChange('serviceRadius', Number(e.target.value))}
                                        className="h-14 bg-slate-50 border-none rounded-2xl text-center text-lg font-bold"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={nextStep}
                                disabled={isLoading}
                                className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-lg font-semibold shadow-lg shadow-purple-600/20 mt-2"
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Criando conta...</>
                                ) : (
                                    "Criar Conta"
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Step: Success */}
                    {step === 'success' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <Button
                                onClick={() => router.push('/login')}
                                className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-lg font-semibold shadow-lg shadow-teal-600/20"
                            >
                                Ir para Login
                            </Button>
                        </div>
                    )}
                </div>

                {step !== 'success' && (
                    <div className="text-center pt-6">
                        <p className="text-slate-500">
                            Já tem uma conta?{" "}
                            <Link href="/login" className="font-bold text-teal-600 hover:underline">
                                Entrar
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
