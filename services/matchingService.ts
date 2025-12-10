"use client";

import { ProviderProfile, ClientProfile, Job, GeoLocation } from '@/types';
import { calculateDistance } from '@/lib/utils/location';

export interface MatchScore {
    providerId: string;
    provider: ProviderProfile;
    score: number;
    distance: number;
    matchReasons: string[];
}

/**
 * Calculate match score between a job request and available providers
 */
export function findBestProviders(
    providers: ProviderProfile[],
    client: ClientProfile,
    jobRequest: {
        serviceId: string;
        date: string;
        timeSlot: string;
        locationType?: string;
        targetLocation?: GeoLocation;
    },
    limit: number = 10
): MatchScore[] {
    const targetLocation = jobRequest.targetLocation || client.location;
    const dayOfWeek = new Date(jobRequest.date).getDay();
    const hour = parseInt(jobRequest.timeSlot.split(':')[0]);

    const scores: MatchScore[] = [];

    for (const provider of providers) {
        if (!isProviderEligible(provider, jobRequest)) continue;

        let score = 0;
        const matchReasons: string[] = [];
        let distance = Infinity;

        // 1. Distance Score (max 30 points)
        if (targetLocation && provider.location) {
            distance = calculateDistance(
                targetLocation.lat,
                targetLocation.lng,
                provider.location.lat,
                provider.location.lng
            );

            if (distance <= provider.serviceRadiusKm) {
                const distanceScore = Math.max(0, 30 - (distance / provider.serviceRadiusKm) * 30);
                score += distanceScore;
                if (distance < 2) matchReasons.push('Muito próximo(a)');
                else if (distance < 5) matchReasons.push('Próximo(a)');
            } else {
                continue; // Skip providers outside their service radius
            }
        }

        // 2. Rating Score (max 25 points)
        const ratingScore = (provider.rating / 5) * 25;
        score += ratingScore;
        if (provider.rating >= 4.5) matchReasons.push('Top avaliado');

        // 3. Profile Completeness (max 15 points)
        const profileScore = (provider.profileScore / 100) * 15;
        score += profileScore;
        if (provider.profileScore >= 90) matchReasons.push('Perfil completo');

        // 4. Experience (max 10 points)
        const experienceScore = Math.min(10, provider.serviceCount * 0.5);
        score += experienceScore;
        if (provider.serviceCount >= 50) matchReasons.push('Experiente');

        // 5. Availability Match (max 10 points)
        const isAvailable = !provider.scheduleConstraints.some(
            c => c.dayOfWeek === dayOfWeek && hour >= c.startHour && hour < c.endHour
        );
        if (isAvailable) {
            score += 10;
            matchReasons.push('Disponível');
        }

        // 6. Verified Status (5 points)
        if (provider.verifiedStatus) {
            score += 5;
            matchReasons.push('Verificado(a)');
        }

        // 7. Accepts Subscriptions bonus (5 points if client has subscription)
        if (client.subscription && provider.acceptsSubscriptions) {
            score += 5;
            matchReasons.push('Aceita assinatura');
        }

        scores.push({
            providerId: provider.id,
            provider,
            score: Math.round(score),
            distance: Math.round(distance * 10) / 10,
            matchReasons,
        });
    }

    // Sort by score descending
    return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

/**
 * Check if provider is eligible for the job
 */
function isProviderEligible(
    provider: ProviderProfile,
    jobRequest: {
        serviceId: string;
        locationType?: string;
    }
): boolean {
    // Must offer the requested service
    if (!provider.offeredServices?.includes(jobRequest.serviceId)) {
        return false;
    }

    // Must accept the location type
    if (jobRequest.locationType &&
        !provider.acceptedLocationTypes?.includes(jobRequest.locationType as any)) {
        return false;
    }

    return true;
}

/**
 * Get recommended provider (best match)
 */
export function getRecommendedProvider(
    providers: ProviderProfile[],
    client: ClientProfile,
    jobRequest: {
        serviceId: string;
        date: string;
        timeSlot: string;
        locationType?: string;
        targetLocation?: GeoLocation;
    }
): MatchScore | null {
    const matches = findBestProviders(providers, client, jobRequest, 1);
    return matches.length > 0 ? matches[0] : null;
}

/**
 * Calculate match percentage for display
 */
export function getMatchPercentage(score: number): number {
    // Max possible score is 100
    return Math.min(100, Math.round(score));
}
