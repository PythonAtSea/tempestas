"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation, MapPin, Loader2, ArrowLeft, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddressCandidate {
  address: string;
  location: {
    x: number;
    y: number;
  };
  score: number;
  attributes: {
    City?: string;
    Region?: string;
    Country?: string;
    PlaceName?: string;
  };
}

interface GeocodeResponse {
  candidates: AddressCandidate[];
}

export default function LocationPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AddressCandidate[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lon: number;
    name: string;
  } | null>(null);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] =
    useState(false);
  const [geolocationSupported, setGeolocationSupported] = useState<
    boolean | null
  >(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    const supported =
      typeof navigator !== "undefined" && !!navigator.geolocation;
    setGeolocationSupported(supported);
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!geolocationSupported) return;

    setIsLoadingCurrentLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const response = await fetch(
            `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${longitude},${latitude}&f=json`
          );
          const data = await response.json();

          const name =
            data?.address?.City ||
            data?.address?.SubRegion ||
            data?.address?.Region ||
            "Current Location";

          setCurrentLocation({
            lat: latitude,
            lon: longitude,
            name,
          });
        } catch {
          setCurrentLocation({
            lat: latitude,
            lon: longitude,
            name: "Current Location",
          });
        } finally {
          setIsLoadingCurrentLocation(false);
        }
      },
      (err) => {
        setLocationError(err.message);
        setIsLoadingCurrentLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [geolocationSupported]);

  useEffect(() => {
    if (geolocationSupported) {
      getCurrentLocation();
    }
  }, [geolocationSupported, getCurrentLocation]);

  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?SingleLine=${encodeURIComponent(
          query
        )}&f=json&maxLocations=10`
      );
      const data: GeocodeResponse = await response.json();

      setSearchResults(data.candidates || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchLocations]);

  const selectLocation = (lat: number, lon: number, name: string) => {
    localStorage.setItem(
      "selectedLocation",
      JSON.stringify({ lat, lon, name, isCurrentLocation: false })
    );
    router.push("/");
  };

  const selectCurrentLocation = () => {
    localStorage.setItem(
      "selectedLocation",
      JSON.stringify({ isCurrentLocation: true })
    );
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-semibold">Location</h1>
        </div>
        <div className="px-4 pb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for a city or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="size-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4 border-b border-border">
          <p className="text-xs text-muted-foreground uppercase font-bold mb-3">
            Current Location
          </p>

          {geolocationSupported === false && (
            <p className="text-sm text-red-500">
              Geolocation is not supported by your browser
            </p>
          )}

          {locationError && (
            <div className="flex  flex-col items-start justify-start">
              <p className="text-sm">
                You&apos;ve disabled location services for this site, you need
                to enable them in your browser settings (if you want to use your
                current location)
              </p>
              <Button
                onClick={getCurrentLocation}
                className="mt-4 w-full"
                variant="secondary"
              >
                Retry
              </Button>
            </div>
          )}

          {geolocationSupported && !locationError && (
            <button
              onClick={selectCurrentLocation}
              disabled={isLoadingCurrentLocation}
              className="w-full flex items-center gap-3 p-3 -mx-3 hover:bg-accent rounded-lg transition-colors text-left"
            >
              <div className="p-2">
                <Navigation className="size-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Use Current Location</p>
                {isLoadingCurrentLocation ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    <span>Getting location...</span>
                  </div>
                ) : currentLocation ? (
                  <p className="text-sm text-muted-foreground truncate">
                    {currentLocation.name}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tap to detect your location
                  </p>
                )}
              </div>
            </button>
          )}
        </div>

        <div className="p-4">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : searchResults.length > 0 && searchQuery ? (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-bold mb-3">
                Search Results
              </p>
              {searchResults.map((result, index) => (
                <button
                  key={`${result.location.x}-${result.location.y}-${index}`}
                  onClick={() =>
                    selectLocation(
                      result.location.y,
                      result.location.x,
                      result.address
                    )
                  }
                  className="w-full flex items-center gap-3 p-3 -mx-3 hover:bg-accent rounded-lg transition-colors text-left"
                >
                  <div className="p-2">
                    <MapPin className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {result.attributes.City && result.attributes.Region
                        ? `${result.attributes.City}, ${result.attributes.Region}`
                        : result.attributes.Country || ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="size-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No locations found"
                  : "You haven't typed anything!"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? (
                  <span>Try a different search term</span>
                ) : (
                  <span>
                    Try searching for something, like{" "}
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => {
                        setSearchQuery("Shelburne, VT");
                      }}
                    >
                      Shelburne, VT
                    </button>
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
