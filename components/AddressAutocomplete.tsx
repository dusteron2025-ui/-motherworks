"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps {
    value: string;
    onChange: (address: string, placeDetails?: PlaceDetails) => void;
    placeholder?: string;
    error?: string;
    className?: string;
}

export interface PlaceDetails {
    address: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    lat: number;
    lng: number;
}

declare global {
    interface Window {
        google: typeof google;
        initGoogleMaps: () => void;
    }
}

export function AddressAutocomplete({
    value,
    onChange,
    placeholder = "Digite seu endereço",
    error,
    className
}: AddressAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Check if Google Maps is already loaded
        if (window.google?.maps?.places) {
            initAutocomplete();
            return;
        }

        // Load Google Maps script
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error('Google Maps API key not found');
            return;
        }

        // Check if script is already being loaded
        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
            // Wait for it to load
            const checkLoaded = setInterval(() => {
                if (window.google?.maps?.places) {
                    clearInterval(checkLoaded);
                    initAutocomplete();
                }
            }, 100);
            return () => clearInterval(checkLoaded);
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=pt-BR`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            initAutocomplete();
        };
        document.head.appendChild(script);

        return () => {
            // Cleanup autocomplete listener
            if (autocompleteRef.current) {
                google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, []);

    const initAutocomplete = () => {
        if (!inputRef.current || !window.google?.maps?.places) return;

        setIsLoaded(true);

        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: ['br', 'pt'] }, // Brazil and Portugal
            fields: ['address_components', 'formatted_address', 'geometry', 'name']
        });

        autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (!place?.geometry?.location) return;

            setIsLoading(true);

            const placeDetails: PlaceDetails = {
                address: place.formatted_address || '',
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            };

            // Extract address components
            place.address_components?.forEach(component => {
                const types = component.types;
                if (types.includes('street_number')) {
                    placeDetails.number = component.long_name;
                } else if (types.includes('route')) {
                    placeDetails.street = component.long_name;
                } else if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
                    placeDetails.neighborhood = component.long_name;
                } else if (types.includes('administrative_area_level_2') || types.includes('locality')) {
                    placeDetails.city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    placeDetails.state = component.short_name;
                } else if (types.includes('country')) {
                    placeDetails.country = component.long_name;
                } else if (types.includes('postal_code')) {
                    placeDetails.postalCode = component.long_name;
                }
            });

            onChange(placeDetails.address, placeDetails);
            setIsLoading(false);
        });
    };

    return (
        <div className="relative">
            <div className={cn(
                "relative",
                className
            )}>
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "h-14 pl-12 pr-10 bg-slate-50 border-none rounded-2xl text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-teal-500/20",
                        error && "ring-2 ring-red-500"
                    )}
                />
                {isLoading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500 animate-spin" />
                )}
            </div>
            {error && (
                <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>
            )}
            {!isLoaded && !error && (
                <p className="text-slate-400 text-xs mt-1 ml-1">Carregando autocompletar...</p>
            )}
        </div>
    );
}
