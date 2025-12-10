"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentButtonProps {
    jobId: string;
    amount: number;
    customerEmail: string;
    customerName: string;
    serviceName: string;
    disabled?: boolean;
    className?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function PaymentButton({
    jobId,
    amount,
    customerEmail,
    customerName,
    serviceName,
    disabled = false,
    className,
    onSuccess,
    onError,
}: PaymentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
        }).format(value);
    };

    const handlePayment = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/payments/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId,
                    amount,
                    customerEmail,
                    customerName,
                    serviceName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            }

            onSuccess?.();
        } catch (error) {
            console.error('Payment error:', error);
            onError?.(error instanceof Error ? error.message : 'Payment failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (isPaid) {
        return (
            <Button
                disabled
                className={cn(
                    "bg-green-600 hover:bg-green-600 text-white rounded-xl",
                    className
                )}
            >
                <Check className="h-4 w-4 mr-2" />
                Pago
            </Button>
        );
    }

    return (
        <Button
            onClick={handlePayment}
            disabled={disabled || isLoading}
            className={cn(
                "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl shadow-lg shadow-teal-500/20",
                className
            )}
        >
            {isLoading ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                </>
            ) : (
                <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pagar {formatCurrency(amount)}
                    <ExternalLink className="h-3 w-3 ml-2 opacity-60" />
                </>
            )}
        </Button>
    );
}
