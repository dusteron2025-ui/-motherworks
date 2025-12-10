"use client";

import { Job } from '@/types';

// Cancellation Policy Types
export type CancellationPolicy = 'FLEXIBLE' | 'MODERATE' | 'STRICT';

export interface CancellationResult {
    allowed: boolean;
    refundPercentage: number;
    fee: number;
    message: string;
}

// Policy definitions
const POLICIES: Record<CancellationPolicy, {
    name: string;
    rules: { hoursBeforeStart: number; refundPercentage: number }[];
}> = {
    FLEXIBLE: {
        name: 'Flexível',
        rules: [
            { hoursBeforeStart: 24, refundPercentage: 100 },
            { hoursBeforeStart: 2, refundPercentage: 50 },
            { hoursBeforeStart: 0, refundPercentage: 0 },
        ],
    },
    MODERATE: {
        name: 'Moderada',
        rules: [
            { hoursBeforeStart: 48, refundPercentage: 100 },
            { hoursBeforeStart: 24, refundPercentage: 50 },
            { hoursBeforeStart: 0, refundPercentage: 0 },
        ],
    },
    STRICT: {
        name: 'Rigorosa',
        rules: [
            { hoursBeforeStart: 72, refundPercentage: 100 },
            { hoursBeforeStart: 48, refundPercentage: 50 },
            { hoursBeforeStart: 24, refundPercentage: 25 },
            { hoursBeforeStart: 0, refundPercentage: 0 },
        ],
    },
};

/**
 * Calculate cancellation result based on policy and timing
 */
export function calculateCancellation(
    job: Job,
    policy: CancellationPolicy = 'MODERATE'
): CancellationResult {
    const jobDateTime = new Date(`${job.date}T${job.timeSlot || '09:00'}`);
    const now = new Date();
    const hoursUntilStart = (jobDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Cannot cancel if job already started or completed
    if (hoursUntilStart < 0 || job.status === 'IN_PROGRESS' || job.status === 'COMPLETED') {
        return {
            allowed: false,
            refundPercentage: 0,
            fee: job.priceTotal,
            message: 'Este serviço não pode mais ser cancelado.',
        };
    }

    const policyRules = POLICIES[policy];

    // Find applicable rule
    for (const rule of policyRules.rules) {
        if (hoursUntilStart >= rule.hoursBeforeStart) {
            const refundAmount = (job.priceTotal * rule.refundPercentage) / 100;
            const fee = job.priceTotal - refundAmount;

            if (rule.refundPercentage === 100) {
                return {
                    allowed: true,
                    refundPercentage: 100,
                    fee: 0,
                    message: 'Cancelamento gratuito! Reembolso total.',
                };
            } else if (rule.refundPercentage > 0) {
                return {
                    allowed: true,
                    refundPercentage: rule.refundPercentage,
                    fee,
                    message: `Reembolso de ${rule.refundPercentage}%. Taxa de cancelamento: €${fee.toFixed(2)}`,
                };
            } else {
                return {
                    allowed: true,
                    refundPercentage: 0,
                    fee: job.priceTotal,
                    message: 'Cancelamento sem reembolso.',
                };
            }
        }
    }

    return {
        allowed: false,
        refundPercentage: 0,
        fee: job.priceTotal,
        message: 'Cancelamento não permitido neste momento.',
    };
}

/**
 * Get policy description for display
 */
export function getPolicyDescription(policy: CancellationPolicy): string {
    switch (policy) {
        case 'FLEXIBLE':
            return 'Cancelamento gratuito até 24h antes. 50% de reembolso até 2h antes.';
        case 'MODERATE':
            return 'Cancelamento gratuito até 48h antes. 50% de reembolso até 24h antes.';
        case 'STRICT':
            return 'Cancelamento gratuito até 72h antes. 50% até 48h, 25% até 24h antes.';
    }
}

/**
 * Get policy name
 */
export function getPolicyName(policy: CancellationPolicy): string {
    return POLICIES[policy].name;
}

/**
 * Check if free cancellation is still available
 */
export function isFreeCancellationAvailable(job: Job, policy: CancellationPolicy = 'MODERATE'): boolean {
    const result = calculateCancellation(job, policy);
    return result.allowed && result.refundPercentage === 100;
}
