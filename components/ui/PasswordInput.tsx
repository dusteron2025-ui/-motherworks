"use client";

import { useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, error, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        return (
            <div className="relative">
                <Input
                    ref={ref}
                    type={showPassword ? "text" : "password"}
                    className={cn(
                        "pr-10",
                        error && "border-red-500 focus-visible:ring-red-500",
                        className
                    )}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
                {error && (
                    <p className="text-red-500 text-xs mt-1">{error}</p>
                )}
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";
