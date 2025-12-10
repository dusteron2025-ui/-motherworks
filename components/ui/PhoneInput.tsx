"use client";

import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

// Common country codes for Latin America and Europe
const COUNTRY_CODES = [
    { code: "+55", country: "BR", flag: "🇧🇷", name: "Brasil" },
    { code: "+351", country: "PT", flag: "🇵🇹", name: "Portugal" },
    { code: "+34", country: "ES", flag: "🇪🇸", name: "Espanha" },
    { code: "+33", country: "FR", flag: "🇫🇷", name: "França" },
    { code: "+39", country: "IT", flag: "🇮🇹", name: "Itália" },
    { code: "+49", country: "DE", flag: "🇩🇪", name: "Alemanha" },
    { code: "+44", country: "GB", flag: "🇬🇧", name: "Reino Unido" },
    { code: "+1", country: "US", flag: "🇺🇸", name: "EUA" },
    { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
    { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
    { code: "+57", country: "CO", flag: "🇨🇴", name: "Colômbia" },
    { code: "+52", country: "MX", flag: "🇲🇽", name: "México" },
];

interface PhoneInputProps {
    value: string;
    onChange: (fullNumber: string, countryCode: string, localNumber: string) => void;
    defaultCountry?: string;
    error?: string;
    className?: string;
    placeholder?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ value, onChange, defaultCountry = "+55", error, className, placeholder = "99 99999-9999" }, ref) => {
        const [countryCode, setCountryCode] = useState(defaultCountry);
        const [localNumber, setLocalNumber] = useState("");
        const [isOpen, setIsOpen] = useState(false);

        const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

        const formatPhoneNumber = (value: string): string => {
            // Remove non-digits
            const digits = value.replace(/\D/g, "");

            // Format for Brazilian numbers
            if (countryCode === "+55") {
                if (digits.length <= 2) return digits;
                if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
                return `${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
            }

            // Generic formatting for other countries
            if (digits.length <= 3) return digits;
            if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
            return `${digits.slice(0, 3)} ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        };

        const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const rawValue = e.target.value.replace(/\D/g, "");
            const formatted = formatPhoneNumber(rawValue);
            setLocalNumber(formatted);
            onChange(`${countryCode}${rawValue}`, countryCode, rawValue);
        };

        const handleCountryChange = (code: string) => {
            setCountryCode(code);
            setIsOpen(false);
            const rawNumber = localNumber.replace(/\D/g, "");
            onChange(`${code}${rawNumber}`, code, rawNumber);
        };

        return (
            <div className="relative">
                <div className={cn(
                    "flex h-14 rounded-2xl bg-slate-50 overflow-hidden",
                    error && "ring-2 ring-red-500",
                    className
                )}>
                    {/* Country Code Selector */}
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-1 px-3 bg-slate-100 hover:bg-slate-200 transition-colors border-r border-slate-200"
                    >
                        <span className="text-xl">{selectedCountry.flag}</span>
                        <span className="text-sm font-medium text-slate-600">{selectedCountry.code}</span>
                        <ChevronDown className={cn(
                            "w-4 h-4 text-slate-400 transition-transform",
                            isOpen && "rotate-180"
                        )} />
                    </button>

                    {/* Phone Number Input */}
                    <Input
                        ref={ref}
                        type="tel"
                        value={localNumber}
                        onChange={handleLocalChange}
                        placeholder={placeholder}
                        className="flex-1 h-full border-none bg-transparent rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-800 placeholder:text-slate-400"
                    />
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 max-h-64 overflow-y-auto">
                            {COUNTRY_CODES.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleCountryChange(country.code)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left",
                                        country.code === countryCode && "bg-teal-50"
                                    )}
                                >
                                    <span className="text-xl">{country.flag}</span>
                                    <span className="flex-1 text-sm font-medium text-slate-700">{country.name}</span>
                                    <span className="text-sm text-slate-400">{country.code}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {error && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>
                )}
            </div>
        );
    }
);

PhoneInput.displayName = "PhoneInput";
