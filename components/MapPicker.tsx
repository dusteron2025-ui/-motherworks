"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, Navigation, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "16px",
};

const defaultCenter = {
    lat: 38.7223,
    lng: -9.1393, // Lisbon, Portugal
};

interface MapPickerProps {
    value?: {
        address: string;
        lat: number;
        lng: number;
    };
    onChange: (location: { address: string; lat: number; lng: number }) => void;
    placeholder?: string;
    className?: string;
}

export function MapPicker({ value, onChange, placeholder = "Digite o endereço...", className }: MapPickerProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
        value ? { lat: value.lat, lng: value.lng } : null
    );
    const [address, setAddress] = useState(value?.address || "");
    const [isConfirmed, setIsConfirmed] = useState(!!value);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const onAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    }, []);

    const onPlaceChanged = useCallback(() => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const formattedAddress = place.formatted_address || "";

                setMarker({ lat, lng });
                setAddress(formattedAddress);
                setIsConfirmed(false);

                if (map) {
                    map.panTo({ lat, lng });
                    map.setZoom(17);
                }
            }
        }
    }, [map]);

    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarker({ lat, lng });
            setIsConfirmed(false);

            // Reverse geocode to get address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results?.[0]) {
                    setAddress(results[0].formatted_address);
                }
            });
        }
    }, []);

    const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarker({ lat, lng });
            setIsConfirmed(false);

            // Reverse geocode
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === "OK" && results?.[0]) {
                    setAddress(results[0].formatted_address);
                }
            });
        }
    }, []);

    const handleGetCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setMarker({ lat, lng });
                    setIsConfirmed(false);

                    if (map) {
                        map.panTo({ lat, lng });
                        map.setZoom(17);
                    }

                    // Reverse geocode
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                        if (status === "OK" && results?.[0]) {
                            setAddress(results[0].formatted_address);
                        }
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, [map]);

    const handleConfirmLocation = useCallback(() => {
        if (marker && address) {
            onChange({
                address,
                lat: marker.lat,
                lng: marker.lng,
            });
            setIsConfirmed(true);
        }
    }, [marker, address, onChange]);

    if (loadError) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                Erro ao carregar o mapa. Verifique sua conexão.
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-[300px] bg-slate-100 rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Search Input */}
            <div className="relative">
                <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                        <Input
                            type="text"
                            placeholder={placeholder}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="pl-12 h-12 bg-white border-slate-200 rounded-xl pr-12"
                        />
                    </div>
                </Autocomplete>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8 text-teal-600 hover:bg-teal-50"
                    onClick={handleGetCurrentLocation}
                    title="Usar minha localização"
                >
                    <Navigation className="h-4 w-4" />
                </Button>
            </div>

            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={marker || defaultCenter}
                    zoom={marker ? 17 : 12}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={handleMapClick}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        zoomControl: true,
                        styles: [
                            {
                                featureType: "poi",
                                elementType: "labels",
                                stylers: [{ visibility: "off" }],
                            },
                        ],
                    }}
                >
                    {marker && (
                        <Marker
                            position={marker}
                            draggable
                            onDragEnd={handleMarkerDragEnd}
                            animation={google.maps.Animation.DROP}
                        />
                    )}
                </GoogleMap>

                {/* Instruction overlay */}
                {!marker && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                        <div className="bg-white px-4 py-2 rounded-full shadow-lg text-sm text-slate-600">
                            Clique no mapa ou busque um endereço
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm button */}
            {marker && (
                <div className="flex items-center gap-3">
                    <div className="flex-1 text-sm text-slate-600 truncate">
                        📍 {address || "Endereço selecionado"}
                    </div>
                    <Button
                        type="button"
                        onClick={handleConfirmLocation}
                        disabled={!address || isConfirmed}
                        className={cn(
                            "rounded-xl",
                            isConfirmed
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-teal-600 hover:bg-teal-700"
                        )}
                    >
                        {isConfirmed ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Confirmado
                            </>
                        ) : (
                            "Confirmar Local"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
