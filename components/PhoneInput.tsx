"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Phone, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Common country codes
const COUNTRY_CODES = [
    { code: "+55", country: "BR", flag: "🇧🇷", name: "Brasil" },
    { code: "+351", country: "PT", flag: "🇵🇹", name: "Portugal" },
    { code: "+1", country: "US", flag: "🇺🇸", name: "EUA" },
    { code: "+34", country: "ES", flag: "🇪🇸", name: "Espanha" },
    { code: "+33", country: "FR", flag: "🇫🇷", name: "França" },
    { code: "+44", country: "GB", flag: "🇬🇧", name: "Reino Unido" },
    { code: "+49", country: "DE", flag: "🇩🇪", name: "Alemanha" },
    { code: "+39", country: "IT", flag: "🇮🇹", name: "Itália" },
    { code: "+31", country: "NL", flag: "🇳🇱", name: "Holanda" },
    { code: "+41", country: "CH", flag: "🇨🇭", name: "Suíça" },
    { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
    { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
    { code: "+57", country: "CO", flag: "🇨🇴", name: "Colômbia" },
    { code: "+52", country: "MX", flag: "🇲🇽", name: "México" },
];

interface PhoneInputProps {
    value?: string;
    onChange: (fullNumber: string, countryCode: string, number: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    error?: string;
}

export function PhoneInput({
    value,
    onChange,
    placeholder = "Número de telefone",
    disabled = false,
    className,
    error,
}: PhoneInputProps) {
    const [countryCode, setCountryCode] = useState("+55");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Parse initial value if provided
    useEffect(() => {
        if (value) {
            const found = COUNTRY_CODES.find(c => value.startsWith(c.code));
            if (found) {
                setCountryCode(found.code);
                setPhoneNumber(value.replace(found.code, "").trim());
            } else {
                setPhoneNumber(value);
            }
        }
    }, []);

    const handleCountryChange = (code: string) => {
        setCountryCode(code);
        const fullNumber = `${code}${phoneNumber.replace(/\D/g, "")}`;
        onChange(fullNumber, code, phoneNumber);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow numbers, spaces, and dashes
        const cleaned = e.target.value.replace(/[^\d\s-]/g, "");
        setPhoneNumber(cleaned);
        const fullNumber = `${countryCode}${cleaned.replace(/\D/g, "")}`;
        onChange(fullNumber, countryCode, cleaned);
    };

    const formatPhoneDisplay = (number: string) => {
        // Remove non-digits for formatting
        const digits = number.replace(/\D/g, "");

        // Brazilian format: (XX) XXXXX-XXXX
        if (countryCode === "+55" && digits.length >= 2) {
            if (digits.length <= 2) return `(${digits}`;
            if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
        }

        return number;
    };

    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode);

    return (
        <div className={cn("space-y-1", className)}>
            <div className="flex gap-2">
                <Select value={countryCode} onValueChange={handleCountryChange} disabled={disabled}>
                    <SelectTrigger className="w-[120px] h-12 bg-slate-50 border-slate-200 rounded-xl">
                        <SelectValue>
                            {selectedCountry && (
                                <span className="flex items-center gap-2">
                                    <span>{selectedCountry.flag}</span>
                                    <span className="text-sm">{selectedCountry.code}</span>
                                </span>
                            )}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {COUNTRY_CODES.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                                <span className="flex items-center gap-2">
                                    <span>{country.flag}</span>
                                    <span className="font-medium">{country.code}</span>
                                    <span className="text-slate-500 text-sm">{country.name}</span>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input
                        type="tel"
                        placeholder={placeholder}
                        value={formatPhoneDisplay(phoneNumber)}
                        onChange={handlePhoneChange}
                        disabled={disabled}
                        className={cn(
                            "h-12 pl-10 bg-slate-50 border-slate-200 rounded-xl",
                            error && "border-red-500 focus:ring-red-500"
                        )}
                        maxLength={20}
                    />
                </div>
            </div>
            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}

// Phone Verification Component
interface PhoneVerificationProps {
    phoneNumber: string;
    onVerified: () => void;
    onCancel: () => void;
}

export function PhoneVerification({ phoneNumber, onVerified, onCancel }: PhoneVerificationProps) {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [timeLeft]);

    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);
        setError("");

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            nextInput?.focus();
        }

        // Auto-submit when complete
        if (newCode.every(c => c) && newCode.join("").length === 6) {
            handleVerify(newCode.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleVerify = async (verificationCode: string) => {
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/verify-phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber, code: verificationCode }),
            });

            if (response.ok) {
                onVerified();
            } else {
                const data = await response.json();
                setError(data.error || "Código inválido");
                setCode(["", "", "", "", "", ""]);
            }
        } catch {
            setError("Erro ao verificar código");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        setError("");

        try {
            await fetch("/api/auth/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber }),
            });
            setTimeLeft(60);
            setCanResend(false);
            setCode(["", "", "", "", "", ""]);
        } catch {
            setError("Erro ao reenviar código");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 text-center">
            <div>
                <h3 className="text-xl font-bold text-slate-900">Verificar Telefone</h3>
                <p className="text-slate-500 mt-1">
                    Enviamos um código para <span className="font-medium">{phoneNumber}</span>
                </p>
            </div>

            <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                    <Input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={isLoading}
                        className={cn(
                            "w-12 h-14 text-center text-2xl font-bold bg-slate-50 border-2 rounded-xl",
                            digit ? "border-teal-500" : "border-slate-200",
                            error && "border-red-500"
                        )}
                    />
                ))}
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="space-y-3">
                {canResend ? (
                    <Button
                        variant="ghost"
                        onClick={handleResend}
                        disabled={isLoading}
                        className="text-teal-600 hover:text-teal-700"
                    >
                        Reenviar código
                    </Button>
                ) : (
                    <p className="text-sm text-slate-500">
                        Reenviar código em <span className="font-medium">{timeLeft}s</span>
                    </p>
                )}

                <div className="flex gap-3 justify-center">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="rounded-xl"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => handleVerify(code.join(""))}
                        disabled={isLoading || code.some(c => !c)}
                        className="rounded-xl bg-teal-600 hover:bg-teal-700"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Verificar
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
