"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    autoFocus?: boolean;
}

export function OTPInput({
    length = 6,
    value,
    onChange,
    error,
    disabled = false,
    autoFocus = true
}: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

    // Split value into array
    const valueArray = value.split('').slice(0, length);
    while (valueArray.length < length) {
        valueArray.push('');
    }

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [autoFocus]);

    const handleChange = (index: number, digit: string) => {
        if (disabled) return;

        // Only allow digits
        if (digit && !/^\d$/.test(digit)) return;

        const newValue = [...valueArray];
        newValue[index] = digit;
        onChange(newValue.join(''));

        // Move to next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (e.key === 'Backspace') {
            if (!valueArray[index] && index > 0) {
                // Move to previous input and clear it
                inputRefs.current[index - 1]?.focus();
                const newValue = [...valueArray];
                newValue[index - 1] = '';
                onChange(newValue.join(''));
            } else {
                // Clear current input
                const newValue = [...valueArray];
                newValue[index] = '';
                onChange(newValue.join(''));
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        onChange(pastedData);

        // Focus the input after the last pasted digit
        const focusIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2 justify-center">
                {valueArray.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value.slice(-1))}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(null)}
                        disabled={disabled}
                        className={cn(
                            "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200",
                            "bg-slate-50 text-slate-800 outline-none",
                            focusedIndex === index
                                ? "border-teal-500 ring-4 ring-teal-500/20"
                                : "border-slate-200 hover:border-slate-300",
                            error && "border-red-500 ring-4 ring-red-500/20",
                            disabled && "opacity-50 cursor-not-allowed",
                            digit && !error && "border-teal-400 bg-teal-50"
                        )}
                    />
                ))}
            </div>
            {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
            )}
        </div>
    );
}
