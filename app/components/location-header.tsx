"use client";

import { Loader2, Navigation } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LocationHeaderProps {
  coords: { lat: number; lon: number } | null;
  locError: string | null;
  locationName: string | null;
  geolocationSupported: boolean | null;
}

export default function LocationHeader({
  coords,
  locError,
  locationName,
  geolocationSupported,
}: LocationHeaderProps) {
  return (
    <>
      <div className="mt-10">
        {coords && (
          <div className="flex flex-row items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Navigation className="inline-block size-3" />
            <p>Current Location</p>
          </div>
        )}
        {geolocationSupported === null && (
          <div className="flex flex-row items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Loader2 className="inline-block size-3 animate-spin" />
            <p>Loading...</p>
          </div>
        )}
        {geolocationSupported === false && (
          <p className="mt-1 text-xs text-red-500">Geolocation not supported</p>
        )}
        {geolocationSupported && !coords && !locError && (
          <div className="flex flex-row items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Navigation className="inline-block size-3" />
            <p>Loading...</p>
          </div>
        )}
        {locError && geolocationSupported && (
          <p className="mt-1 text-xs text-red-500">{locError}</p>
        )}
      </div>
      {locationName ? (
        <p className="text-muted-foreground uppercase font-bold text-xs">
          {locationName}
        </p>
      ) : (
        <Skeleton className="h-4 w-20" />
      )}
    </>
  );
}
